/**
 * Help command
 * @module commands/help
 */
const argvParser = require('argv');

/**
 * Command to print usage
 */
class Help {
    /**
     * Create the service
     * @param {App} app                 The application
     * @param {object} config           Configuration
     * @param {Util} util               Utility service
     */
    constructor(app, config, util) {
        this._app = app;
        this._config = config;
        this._util = util;
    }

    /**
     * Service name is 'commands.help'
     * @type {string}
     */
    static get provides() {
        return 'commands.help';
    }

    /**
     * Dependencies as constructor arguments
     * @type {string[]}
     */
    static get requires() {
        return [ 'app', 'config', 'util' ];
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
            return this.usage();

        let method = this[`help${this._util.dashedToCamel(args.targets[1], true)}`];
        if (typeof method !== 'function')
            return this.usage();

        return method.call(this, argv);
    }

    /**
     * General help
     */
    usage() {
        return this._app.info(
                'Usage:\tcmd <command> [<parameters]\n\n' +
                'Commands:\n' +
                '\thelp\t\tPrint help about any other command\n' +
                '\tcreate-cert\tCreate self-signed certificates\n' +
                '\tcreate-db\tCreate the database schema\n' +
                '\tuser\t\tManage users\n' +
                '\tclear-cache\tClear the cache'

            )
            .then(() => {
                process.exit(0);
            });
    }

    /**
     * Help command
     */
    helpHelp(argv) {
        return this._app.info(
                'Usage:\tcmd help <command>\n\n' +
                '\tPrint help for the given command'
            )
            .then(() => {
                process.exit(0);
            });
    }

    /**
     * Cert command
     */
    helpCreateCert(argv) {
        return this._app.info(
                'Usage:\tcmd create-cert <address>\n\n' +
                '\tThis command will create self-signed certificates in the certs/ subdirectory\n' +
                '\t<address> is either hostname or IP address to use in the certificate'
            )
            .then(() => {
                process.exit(0);
            });
    }

    /**
     * Create DB command
     */
    helpCreateDb(argv) {
        return this._app.info(
                'Usage:\tcmd create-db\n\n' +
                '\tDrop if present and recreate all the database tables'
            )
            .then(() => {
                process.exit(0);
            });
    }

    /**
     * User command
     */
    helpUser(argv) {
        return this._app.info(
                'Usage:\tcmd user <email> [-n <name> ] [-p <password>] [-a <role>] [-r <role>]\n\n' +
                '\tManage users (user is created on first operation):\n' +
                '\t-n sets display name\n' +
                '\t-p sets password\n' +
                '\t-a adds role\n' +
                '\t-r removes role'
            )
            .then(() => {
                process.exit(0);
            });
    }

    /**
     * Clear Cache command
     */
    helpClearCache(argv) {
        return this._app.info(
                'Usage:\tcmd clear-cache\n\n' +
                '\tDrop Redis cache'
            )
            .then(() => {
                process.exit(0);
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

module.exports = Help;