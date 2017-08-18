/**
 * Migrate DB command
 * @module commands/migrate
 */
const path = require('path');
const fs = require('fs');
const argvParser = require('argv');

/**
 * Command class
 */
class Migrate {
    /**
     * Create the service
     * @param {App} app                 The application
     * @param {object} config           Configuration
     * @param {Runner} runner           Runner service
     * @param {Postgres} postgres       Postgres service
     */
    constructor(app, config, runner, postgres) {
        this._app = app;
        this._config = config;
        this._runner = runner;
        this._postgres = postgres;
    }

    /**
     * Service name is 'commands.migrate'
     * @type {string}
     */
    static get provides() {
        return 'commands.migrate';
    }

    /**
     * Dependencies as constructor arguments
     * @type {string[]}
     */
    static get requires() {
        return [ 'app', 'config', 'runner', 'postgres' ];
    }

    /**
     * Run the command
     * @param {string[]} argv           Arguments
     * @return {Promise}
     */
    async run(argv) {
        argvParser
            .option({
                name: 'help',
                short: 'h',
                type: 'boolean',
            })
            .run(argv);

        const instance = 'main';
        const latestVersion = 1;

        try {
            let client = await this._postgres.connect(instance);
            let currentVersion = 0;
            try {
                let result = await client.query(
                    `SELECT value 
                       FROM _info
                      WHERE name = 'schema_version'`
                );
                currentVersion = result.rowCount ? parseInt(result.rows[0].value) : 0;
            } catch (error) {
                // do nothing
            }
            client.done();

            let deltas = [];
            for (let i = currentVersion; i < latestVersion; i++)
                deltas.push(i ? `schema.${i}-${i + 1}.sql` : `schema.1.sql`);

            await deltas.reduce(
                async (prev, cur) => {
                    await prev;

                    let filename = path.join(__dirname, '..', 'database', cur);
                    try {
                        fs.accessSync(filename, fs.constants.F_OK);
                    } catch (error) {
                        return; // skip
                    }

                    await this._app.info(`==> ${path.basename(filename)}\n`);
                    return this.psqlExec(filename, instance);
                },
                Promise.resolve()
            );

            process.exit(0);
        } catch (error) {
            await this.error(error);
        }
    }

    /**
     * Log error and terminate
     * @param {Array} args
     * @return {Promise}
     */
    async error(args) {
        try {
            await args.reduce(
                async (prev, cur) => {
                    await prev;
                    return this._app.error(cur.fullStack || cur.stack || cur.message || cur);
                },
                Promise.resolve()
            );
        } catch (error) {
            // do nothing
        }
        process.exit(1);
    }

    /**
     * Run psql
     * @param {string} filename
     * @param {string} instance
     * @return {Promise}
     */
    async psqlExec(filename, instance) {
        let expect = new Map();
        expect.set(/assword.*:/, this._config.get(`postgres.${instance}.password`));

        let proc = this._runner.spawn(
            'psql',
            [
                '-U', this._config.get(`postgres.${instance}.user`),
                '-d', this._config.get(`postgres.${instance}.db_name`),
                '-h', this._config.get(`postgres.${instance}.host`),
                '-p', this._config.get(`postgres.${instance}.port`),
                '-W',
                '-f', filename,
            ],
            {
                env: {
                    'LANGUAGE': 'C',
                    'LANG': 'C',
                    'LC_ALL': 'C',
                    'PATH': '/bin:/sbin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin',
                },
            },
            expect
        );
        proc.cmd.on('data', data => {
            process.stdout.write(data);
        });
        return proc.promise;
    }
}

module.exports = Migrate;
