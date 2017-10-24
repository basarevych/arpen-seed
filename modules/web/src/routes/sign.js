/**
 * Sign route
 * @module web/routes/sign
 */
const express = require('express');
const NError = require('nerror');

/**
 * Sign route class
 */
class SignRoute {
    /**
     * Create service
     * @param {object} config               Config service
     * @param {Util} util                   Util service
     * @param {UserRepository} userRepo     User repository
     * @param {SignInForm} signInForm       SignIn form
     */
    constructor(config, util, userRepo, signInForm) {
        this._config = config;
        this._util = util;
        this._userRepo = userRepo;
        this._signInForm = signInForm;

        this.priority = 0;
        this.router = express.Router();
        this.router.post('/sign-in', this.postSignIn.bind(this));
        this.router.post('/sign-out', this.postSignOut.bind(this));
    }

    /**
     * Service name is 'web.routes.sign'
     * @type {string}
     */
    static get provides() {
        return 'web.routes.sign';
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
            'web.forms.signIn'
        ];
    }

    /**
     * Authorize a user
     * @param {object} req          Express request
     * @param {object} res          Express response
     * @param {function} next       Express next middleware function
     * @return {Promise}
     */
    async postSignIn(req, res, next) {
        try {
            let form = await this._signInForm.validate(res.locals.locale, req.body);
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
            next(new NError(error, 'postSignIn()'));
        }
    }

    /**
     * Process logout request
     * @param {object} req          Express request
     * @param {object} res          Express response
     * @param {function} next       Express next middleware function
     * @return {Promise}
     */
    async postSignOut(req, res, next) {
        try {
            req.user = null;
            for (let key of Object.keys(req.session))
                delete req.session[key];

            res.json({ success: true });
        } catch (error) {
            next(new NError(error, 'postSignOut()'));
        }
    }
}

module.exports = SignRoute;
