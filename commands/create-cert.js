/**
 * CreateCert command
 * @module commands/create-cert
 */
const path = require('path');
const fs = require('fs');
const argvParser = require('argv');

/**
 * Command class
 */
class CreateCert {
    /**
     * Create the service
     * @param {App} app                 The application
     * @param {object} config           Configuration
     * @param {ErrorHelper} error       Error service
     * @param {Runner} runner           Runner service
     * @param {Help} help               Help command
     */
    constructor(app, config, error, runner, help) {
        this._app = app;
        this._config = config;
        this._error = error;
        this._runner = runner;
        this._help = help;
    }

    /**
     * Service name is 'commands.createCert'
     * @type {string}
     */
    static get provides() {
        return 'commands.createCert';
    }

    /**
     * Dependencies as constructor arguments
     * @type {string[]}
     */
    static get requires() {
        return [ 'app', 'config', 'error', 'runner', 'commands.help' ];
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
            .run(argv);

        if (args.targets.length < 2)
            return this._help.helpCreateCert(argv);

        let hostname = args.targets[1];

        return Promise.resolve()
            .then(() => {
                this._app.debug('Creating temporary openssl config');
                let type = (/^\d+\.\d+\.\d+\.\d+$/.test(hostname) ? 'IP' : 'DNS');
                let sslConfig = fs.readFileSync('/etc/ssl/openssl.cnf', { encoding: 'utf8' });
                sslConfig += `\n[SAN]\nsubjectAltName=${type}:${hostname}\n`;
                fs.writeFileSync('/tmp/arpen.openssl.cnf', sslConfig, { mode: 0o644 });

                this._app.debug('Creating self-signed certificate');
                return this._runner.exec(
                        'openssl',
                        [
                            'req',
                            '-new',
                            '-newkey', 'rsa:2048',
                            '-days', '3650',
                            '-nodes',
                            '-x509',
                            '-subj', '/C=/ST=/L=/O=/CN=' + hostname,
                            '-reqexts', 'SAN',
                            '-extensions', 'SAN',
                            '-config', '/tmp/arpen.openssl.cnf',
                            '-keyout', path.join(__dirname, '..', 'certs', hostname + '.key'),
                            '-out', path.join(__dirname, '..', 'certs', hostname + '.cert')
                        ]
                    )
                    .then(result => {
                        try {
                            fs.unlinkSync('/tmp/arpen.openssl.cnf');
                            fs.unlinkSync('.rnd');
                        } catch (error) {
                            // do nothing
                        }

                        if (result.code !== 0)
                            throw new Error('Could not create self-signed certificate');
                    });
            })
            .then(() => {
                return this._app.debug('done')
                    .then(() => {
                        process.exit(0);
                    });
            })
            .catch(error => {
                return this.error(this._error.flatten(error));
            });
    }

    /**
     * Log error and terminate
     * @param {Array} args
     */
    error(args) {
        return args.reduce(
            (prev, cur) => {
                return prev.then(() => {
                    return this._app.error(cur.stack || cur.message || cur);
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

module.exports = CreateCert;