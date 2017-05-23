/**
 * Login route
 * @module index/routes/login
 */
const express = require('express');
const WError = require('verror').WError;

/**
 * Login route class
 */
class LoginRoute {
    /**
     * Create service
     * @param {object} config               Config service
     * @param {Session} session             Session service
     * @param {Util} util                   Util service
     * @param {ErrorHelper} error           Error helper service
     * @param {Map} middleware              Middleware store
     * @param {UserRepository} userRepo     User repository
     * @param {LoginForm} loginForm         Login form
     */
    constructor(config, session, util, error, middleware, userRepo, loginForm) {
        this._config = config;
        this._session = session;
        this._util = util;
        this._error = error;
        this._i18n = middleware.get('middleware.i18n');
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
            'error',
            'middleware',
            'repositories.user',
            'modules.index.forms.login'
        ];
    }

    /**
     * Authorize a user
     * @param {object} req          Express request
     * @param {object} res          Express response
     * @param {function} next       Express next middleware function
     */
    postLogin(req, res, next) {
        this._loginForm.validate(req.body)
            .then(form => {
                let password = form.getField('password');
                form.setField('password', '');

                if (!form.success || req.body._validate)
                    return res.json(form.toJSON());

                return this._userRepo.findByEmail(form.getField('email'))
                    .then(users => {
                        let user = users.length && users[0];
                        if (!user || !user.confirmedAt || !this._util.checkPassword(password, user.password)) {
                            form.addMessage('error', this._i18n.translate('sign_in_invalid_credentials'));
                            return res.json(form.toJSON());
                        }

                        return this._session.start(user, req)
                            .then(session => {
                                let lifetime = this._config.get('session.expire_timeout');
                                if (lifetime)
                                    lifetime *= 1000;

                                res.json({
                                    success: true,
                                    cookie: {
                                        name: this._session.cookieName,
                                        value: this._session.encodeJwt(session),
                                        lifetime: lifetime || null,
                                    }
                                });
                            });
                    });
            })
            .catch(error => {
                next(new WError(error, 'postLogin()'));
            });
    }
}

module.exports = LoginRoute;