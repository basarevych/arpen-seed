/**
 * Create DB command
 * @module commands/create-db
 */
const os = require('os');
const argvParser = require('argv');

/**
 * Command class
 */
class CreateDb {
    /**
     * Create the service
     * @param {App} app                 The application
     * @param {object} config           Configuration
     * @param {Runner} runner           Runner service
     */
    constructor(app, config, runner) {
        this._app = app;
        this._config = config;
        this._runner = runner;
    }

    /**
     * Service name is 'commands.createDb'
     * @type {string}
     */
    static get provides() {
        return 'commands.createDb';
    }

    /**
     * Dependencies as constructor arguments
     * @type {string[]}
     */
    static get requires() {
        return [ 'app', 'config', 'runner' ];
    }

    /**
     * Run the command
     * @param {string[]} argv           Arguments
     * @return {Promise}
     */
    run(argv) {
        let args = argvParser
            .option({
                name: 'help',
                short: 'h',
                type: 'boolean',
            })
            .option({
                name: 'user',
                short: 'u',
                type: 'string',
            })
            .run(argv);

        const instance = 'main';

        return Promise.resolve()
            .then(() => {
                if (process.getuid())
                    throw new Error('Run this command as root');
            })
            .then(() => {
                let suOptions;
                if (os.platform() === 'freebsd') {
                    suOptions = [
                        '-m', args.options.user || 'pgsql',
                        '-c', `psql -h ${this._config.get(`postgres.${instance}.host`)} -d postgres -f -`
                    ];
                } else {
                    suOptions = [
                        '-c',
                        `psql -h ${this._config.get(`postgres.${instance}.host`)} -d postgres -f -`,
                        args.options.user || 'postgres'
                    ];
                }

                let sql = `create user ${this._config.get(`postgres.${instance}.user`)} with password '${this._config.get(`postgres.${instance}.password`)}';
                           create database ${this._config.get(`postgres.${instance}.db_name`)};
                           grant all privileges on database ${this._config.get(`postgres.${instance}.db_name`)} to ${this._config.get(`postgres.${instance}.user`)};
                           \\q`;

                let promise = this._runner.exec('su', suOptions, { pipe: process });
                process.stdin.emit('data', sql + '\n');
                return promise;
            })
            .then(result => {
                process.exit(result.code);
            })
            .catch(error => {
                return this.error(error);
            });
    }

    /**
     * Log error and terminate
     * @param {...*} args
     */
    error(...args) {
        return args.reduce(
            (prev, cur) => {
                return prev.then(() => {
                    return this._app.error(cur.fullStack || cur.stack || cur.message || cur);
                });
            },
            Promise.resolve()
            )
            .then(
                () => {
                    process.exit(1);
                },
                () => {
                    process.exit(1);
                }
            );
    }
}

module.exports = CreateDb;