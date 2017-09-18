/**
 * Login route
 * @module index/routes/login
 */
const express = require('arpen-express').Express;
const NError = require('nerror');

/**
 * Login route class
 */
class LoginRoute {
    /**
     * Create service
     * @param {object} config               Config service
     * @param {Session} session             Session service
     * @param {Util} util                   Util service
     * @param {UserRepository} userRepo     User repository
     * @param {LoginForm} loginForm         Login form
     */
    constructor(config, session, util, userRepo, loginForm) {
        this._config = config;
        this._session = session;
        this._util = util;
        this._userRepo = userRepo;
        this._loginForm = loginForm;

        this.router = express.Router();
        this.router.post('/login', this.postLogin.bind(this));
    }

    /**
     * Service name is 'modules.index.routes.login'
     * @type {string}
     */
    static get provides() {
        return 'modules.index.routes.login';
    }

    /**
     * Dependencies as constructor arguments
     * @type {string[]}
     */
    static get requires() {
        return [
            'config',
            'session',
            'util',
            'repositories.user',
            'modules.index.forms.login'
        ];
    }

    /**
     * Start user session
     * @param {UserModel} user      The user
     * @param {object} req          Request info
     * @return {Promise}
     */
    async startSession(user, req) {
        let session = await this._session.start(user, req);
        let lifetime = this._config.get('session.expire_timeout');
        if (lifetime)
            lifetime *= 1000;

        return {
            success: true,
            cookie: {
                name: this._session.cookieName,
                value: this._session.encodeJwt(session),
                lifetime: lifetime || null,
            }
        };
    }

    /**
     * Authorize a user
     * @param {object} req          Express request
     * @param {object} res          Express response
     * @param {function} next       Express next middleware function
     * @return {Promise}
     */
    async postLogin(req, res, next) {
        try {
            let form = await this._loginForm.validate(req.body);
            let password = form.getField('password');
            form.setField('password', '');

            if (!form.success || req.body._validate)
                return res.json(form.toJSON());

            let users = await this._userRepo.findByEmail(form.getField('email'));
            let user = users.length && users[0];
            if (!user || !user.confirmedAt || !this._util.checkPassword(password, user.password)) {
                form.addMessage('error', 'sign_in_invalid_credentials');
                return res.json(form.toJSON());
            }

            let info = await this.startSession(user, req);
            res.json(info);
        } catch (error) {
            next(new NError(error, 'postLogin()'));
        }
    }
}

module.exports = LoginRoute;
