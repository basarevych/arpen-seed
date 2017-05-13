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
     * @param {Util} util                       Util service
     * @param {SessionRepository} sessionRepo   Session repository
     * @param {UserRepository} userRepo         User repository
     */
    constructor(app, config, logger, util, sessionRepo, userRepo) {
        this.cache = new Map();

        this._app = app;
        this._config = config;
        this._logger = logger;
        this._util = util;
        this._sessionRepo = sessionRepo;
        this._userRepo = userRepo;
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
        return [ 'app', 'config', 'logger', 'util', 'repositories.session', 'repositories.user' ];
    }

    /**
     * This service is a singleton
     * @type {string}
     */
    static get lifecycle() {
        return 'singleton';
    }

    /**
     * Update session in the DB interval
     */
    static get saveInterval() {
        return 60 * 1000; // ms
    }

    /**
     * Cookie name
     * @return {string}
     */
    get cookieName() {
        return `${this._config.project}sid`;
    }

    /**
     * Encode JWT
     * @param {SessionModel} session            Session model
     * @return {string}                         Returns JWT
     */
    encodeJwt(session) {
        return jwt.sign({ token: session.token }, this._config.get('session.secret'));
    }

    /**
     * Start session of a user
     * @param {UserModel} user                  User model
     * @param {object} req                      Request data
     * @return {Promise}                        Resolves to session model
     */
    start(user, req) {
        let session = this._app.get('models.session');
        session.token = this._util.getRandomString(32, { lower: true, upper: true, digits: true, special: true });
        session.userId = user.id;
        session.payload = {};
        session.info = this._getInfo(req);
        session.createdAt = moment();
        session.updatedAt = session.createdAt;

        return this._sessionRepo.save(session)
            .then(() => {
                return session;
            });
    }

    /**
     * Load session by JWT
     * @param {string} token                    JWT
     * @param {object} req                      Request data
     * @return {Promise}                        Resolves to session model
     */
    load(token, req) {
        if (typeof token !== 'string' || !token.length)
            return Promise.resolve(null);

        return new Promise(resolve => {
                jwt.verify(token, this._config.get('session.secret'), (error, payload) => {
                    if (error)
                        this._logger.debug('session', error.message);

                    if (error || !payload || !payload.token)
                        return resolve(null);

                    resolve(payload);
                });
            })
            .then(payload => {
                if (!payload)
                    return [ null, null ];

                return this._sessionRepo.findByToken(payload.token)
                    .then(sessions => {
                        let session = sessions.length && sessions[0];
                        if (!session)
                            return null;

                        let cached = this.cache.get(session.id);
                        if (cached && cached.updatedAt.isAfter(session.updatedAt))
                            return cached;

                        return session;
                    })
                    .then(session => {
                        if (!session)
                            return [ null, null ];

                        session.info = this._getInfo(req);
                        this.update(session);

                        if (!session.userId)
                            return [ session, null ];

                        return this._userRepo.find(session.userId)
                            .then(users => {
                                let user = users.length && users[0];
                                return [ session, user || null ];
                            });
                    });
            });
    }


    /**
     * Update session in the DB
     * @param {SessionModel} session            The session
     */
    update(session) {
        let id = session.id;
        if (!this.cache.has(id)) {
            let schedule = session.updatedAt.add(this.constructor.saveInterval, 'milliseconds').valueOf() - moment().valueOf();
            setTimeout(
                () => {
                    let session = this.cache.get(id);
                    if (!session)
                        return;

                    this.cache.delete(id);

                    this._sessionRepo.save(session)
                        .catch(error => {
                            this._logger.error(new WError(error, 'Session._update()'));
                        });
                },
                schedule > 0 ? schedule : 0
            );
            console.log(`scheduled for ${schedule / 1000}`)
        }

        session.updatedAt = moment();
        this.cache.set(id, session);
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
