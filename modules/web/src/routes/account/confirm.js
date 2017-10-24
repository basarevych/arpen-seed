/**
 * Confirm account route
 * @module web/routes/account/confirm
 */
const express = require('express');
const moment = require('moment-timezone');
const NError = require('nerror');

/**
 * Confirm account route class
 */
class ConfirmAccountRoute {
    /**
     * Create service
     * @param {object} config                   Configuration
     * @param {UserRepository} userRepo         User repository
     */
    constructor(config, userRepo) {
        this._config = config;
        this._userRepo = userRepo;

        this.priority = 1000;
        this.router = express.Router();
        this.router.get('/account/confirm', this.getConfirm.bind(this));
        this.router.post('/account/confirm', this.postConfirm.bind(this));
    }

    /**
     * Service name is 'web.routes.account.confirm'
     * @type {string}
     */
    static get provides() {
        return 'web.routes.account.confirm';
    }

    /**
     * Dependencies as constructor arguments
     * @type {string[]}
     */
    static get requires() {
        return [
            'config',
            'repositories.user',
        ];
    }

    /**
     * Display confirm page
     * @param {object} req          Express request
     * @param {object} res          Express response
     * @param {function} next       Express next middleware function
     */
    getConfirm(req, res, next) {
        return res.render('account/confirm', { project: res.locals.i18n('project_title') });
    }

    /**
     * Confirm account
     * @param {object} req          Express request
     * @param {object} res          Express response
     * @param {function} next       Express next middleware function
     * @return {Promise}
     */
    async postConfirm(req, res, next) {
        try {
            let token = String(req.body.secret);
            let users = await this._userRepo.findBySecret(token);
            let user = users.length && users[0];
            if (!user || user.confirmedAt || user.blockedAt)
                return res.json({ success: false });

            user.confirmedAt = moment();
            await this._userRepo.save(user);

            req.user = user;
            res.json({ success: true });
        } catch (error) {
            next(new NError(error, 'postConfirm()'));
        }
    }
}

module.exports = ConfirmAccountRoute;
