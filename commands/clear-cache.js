/**
 * Clear cache command
 * @module commands/clear-cache
 */
const path = require('path');
const fs = require('fs');
const argvParser = require('argv');

/**
 * Command to clear Redis cache
 */
class ClearCache {
    /**
     * Create the service
     * @param {App} app                 The application
     * @param {object} config           Configuration
     * @param {Redis} redis             Redis service
     */
    constructor(app, config, redis) {
        this._app = app;
        this._config = config;
        this._redis = redis;
    }

    /**
     * Service name is 'commands.clearCache'
     * @type {string}
     */
    static get provides() {
        return 'commands.clearCache';
    }

    /**
     * Dependencies as constructor arguments
     * @type {string[]}
     */
    static get requires() {
        return [ 'app', 'config', 'redis' ];
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

        return this._redis.connect(this._config.get('cache.redis'))
            .then(client => {
                return client.query('FLUSHDB')
                    .then(() => {
                        client.done();
                    });
            })
            .then(() => {
                process.exit(0);
            })
            .catch(error => {
                return this.error(error);
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

module.exports = ClearCache;