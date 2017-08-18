/**
 * Invalidate cache service
 * @module services/invalidate-cache
 */
const EventEmitter = require('events');

/**
 * Postgres PUBSUB subscriber to invalidate local cache when needed
 */
class InvalidateCache extends EventEmitter {
    /**
     * Create the service
     * @param {object} config                   Configuration
     * @param {PubSub} pubsub                   PostgresPubSub service
     * @param {Cacher} cacher                   Cacher service
     * @param {Logger} logger                   Logger service
     */
    constructor(config, pubsub, cacher, logger) {
        super();

        this._config = config;
        this._started = false;
        this._pubsub = pubsub;
        this._cacher = cacher;
        this._logger = logger;
    }

    /**
     * Service name is 'invalidateCache'
     * @type {string}
     */
    static get provides() {
        return 'invalidateCache';
    }

    /**
     * Dependencies as constructor arguments
     * @type {string[]}
     */
    static get requires() {
        return [ 'config', 'postgresPubSub', 'cacher', 'logger' ];
    }

    /**
     * This service is a singleton
     * @type {string}
     */
    static get lifecycle() {
        return 'singleton';
    }

    /**
     * Initialize the subscriber
     * @return {Promise}
     */
    async register() {
        if (this._started || !this._config.get('cache.enable'))
            return;

        this._started = true;
        let client = await this._pubsub.connect('main', 'InvalidateCache');
        return client.subscribe('invalidate_cache', this.onMessage.bind(this));
    }

    /**
     * PUBSUB message handler
     * @param {*} message                       Body of the message
     * @return {Promise}
     */
    async onMessage(message) {
        if (typeof message !== 'object' || typeof message.key !== 'string')
            this._logger.error('Received invalid cache invalidation message', message);

        try {
            await this._cacher.unset('sql:' + message.key);
            let parts = message.key.split(':');
            let name = parts.shift();
            this.emit(name, parts.join(':'));
        } catch (error) {
            this._logger.error('Invalidation of the cache failed', error);
        }
    }
}

module.exports = InvalidateCache;
