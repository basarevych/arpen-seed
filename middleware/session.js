/**
 * Session middleware
 * @module middleware/session
 */

/**
 * User session
 */
class Session {
    /**
     * Create the service
     * @param {object} config                   Configuration
     * @param {Logger} logger                   Logger service
     * @param {Session} session                 Session service
     */
    constructor(config, logger, session) {
        this._config = config;
        this._logger = logger;
        this._session = session;
    }

    /**
     * Service name is 'express.session'
     * @type {string}
     */
    static get provides() {
        return 'express.session';
    }

    /**
     * Dependencies as constructor arguments
     * @type {string[]}
     */
    static get requires() {
        return [ 'config', 'logger', 'session' ];
    }

    /**
     * Register middleware
     * @param {Express} server          The server
     * @return {Promise}
     */
    async register(server) {
        server.express.use(async (req, res, next) => {
            res.locals.session = null;
            res.locals.user = null;

            try {
                let [session, user] = await this._session.load(req.cookies && req.cookies[this._session.cookieName], req);
                if (session)
                    res.locals.session = session;
                if (user)
                    res.locals.user = user;
            } catch (error) {
                this._logger.error(error);
            }

            next();
        });
    }
}

module.exports = Session;
