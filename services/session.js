/**
 * User session service
 * @module services/session
 */
const moment = require('moment-timezone');
const jwt = require('jsonwebtoken');
const geoip = require('geoip-lite');

class Session {
    /**
     * Create the service
     * @param {App} app                         The application
     * @param {object} config                   Configuration
     * @param {Logger} logger                   Logger service
     * @param {SessionRepository} sessionRepo   Session repository
     */
    constructor(app, config, logger, sessionRepo) {
        this.sessions = new Map();

        this._app = app;
        this._config = config;
        this._logger = logger;
        this._sessionRepo = sessionRepo;
    }

    /**
     * Service name is 'session'
     * @type {string}
     */
    static get provides() {
        return 'session';
    }

    /**
     * Dependencies as constructor arguments
     * @type {string[]}
     */
    static get requires() {
        return [ 'app', 'config', 'logger', 'repositories.session' ];
    }

    /**
     * This service is a singleton
     * @type {string}
     */
    static get lifecycle() {
        return 'singleton';
    }

    /**
     * Encode JWT
     * @param {SessionModel} session            Session model
     * @return {string}                         Returns JWT
     */
    encodeJwt(session) {
        return jwt.sign({ sid: session.id }, this._config.get('session.secret'));
    }

    /**
     * Start session of a user
     * @param {UserModel} user                  User model
     * @param {object} req                      Request data
     * @return {Promise}                        Resolves to session model
     */
    start(user, req) {
        let session = this._app.get('models.session');
        session.userId = user.id;
        session.payload = {};
        session.info = this._getInfo(req);
        session.createdAt = moment();
        session.updatedAt = session.createdAt;

        return this._sessionRepo.save(session)
            .then(() => {
                this.sessions.set(session.id, session);
                return session;
            });
    }

    /**
     * Prepare info object
     * @param {object} req                      Request data
     * @return {object}
     */
    _getInfo(req) {
        let ip, ipHeader = this._config.get('session.ip_header');
        if (ipHeader)
            ip = req.headers[ipHeader] && req.headers[ipHeader].trim();
        if (!ip)
            ip = req.ip;

        let forwarded = req.headers['x-forwarded-for'] && req.headers['x-forwarded-for'].trim();
        let agent = req.headers['user-agent'] && req.headers['user-agent'].trim();

        return {
            ip: ip,
            forwarded_for: forwarded || null,
            user_agent: agent || null,
            geoip: geoip.lookup(ip),
        }
    }
}

module.exports = Session;
