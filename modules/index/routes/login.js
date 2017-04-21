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
     * @param {ErrorHelper} error       Error helper service
     * @param {LoginForm} loginForm     Login form
     */
    constructor(error, loginForm) {
        this._error = error;
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
        return [ 'error', 'modules.index.forms.login' ];
    }

    /**
     * Main route
     * @param {object} req          Express request
     * @param {object} res          Express response
     * @param {function} next       Express next middleware function
     */
    postLogin(req, res, next) {
        this._loginForm.validate(req.body)
            .then(result => {
                res.json(result);
            })
            .catch(error => {
                next(new WError(error, 'postLogin()'));
            });
    }
}

module.exports = LoginRoute;