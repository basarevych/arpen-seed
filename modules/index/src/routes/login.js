/**
 * Login route
 * @module index/routes/login
 */
const express = require('express');
const NError = require('nerror');

/**
 * Login route class
 */
class LoginRoute {
    /**
     * Create service
     * @param {object} config               Config service
     * @param {Util} util                   Util service
     * @param {UserRepository} userRepo     User repository
     * @param {LoginForm} loginForm         Login form
     */
    constructor(config, util, userRepo, loginForm) {
        this._config = config;
        this._util = util;
        this._userRepo = userRepo;
        this._loginForm = loginForm;

        this.priority = 0;
        this.router = express.Router();
        this.router.post('/login', this.postLogin.bind(this));
        this.router.post('/logout', this.postLogout.bind(this));
    }

    /**
     * Service name is 'routes.login'
     * @type {string}
     */
    static get provides() {
        return 'routes.login';
    }

    /**
     * Dependencies as constructor arguments
     * @type {string[]}
     */
    static get requires() {
        return [
            'config',
            'util',
            'repositories.user',
            'forms.login'
        ];
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
            let form = await this._loginForm.validate(res.locals.locale, req.body);
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

            req.user = user;
            res.json({ success: true });
        } catch (error) {
            next(new NError(error, 'postLogin()'));
        }
    }

    /**
     * Process logout request
     * @param {object} req          Express request
     * @param {object} res          Express response
     * @param {function} next       Express next middleware function
     * @return {Promise}
     */
    async postLogout(req, res, next) {
        try {
            req.user = null;
            for (let key of Object.keys(req.session))
                delete req.session[key];

            res.json({ success: true });
        } catch (error) {
            next(new NError(error, 'postLogout()'));
        }
    }
}

module.exports = LoginRoute;
