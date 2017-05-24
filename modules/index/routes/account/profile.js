/**
 * Profile route
 * @module index/routes/index/account/profile
 */
const express = require('express');
const WError = require('verror').WError;

/**
 * Profile route class
 */
class ProfileRoute {
    /**
     * Create service
     * @param {Util} util                       Util service
     * @param {ErrorHelper} error               Error helper service
     * @param {SessionRepository} sessionRepo   Session repository
     * @param {UserRepository} userRepo         User repository
     * @param {ProfileForm} profileForm         Profile form
     */
    constructor(util, error, sessionRepo, userRepo, profileForm) {
        this._util = util;
        this._error = error;
        this._sessionRepo = sessionRepo;
        this._userRepo = userRepo;
        this._profileForm = profileForm;

        this.router = express.Router();
        this.router.get('/account/profile', this.getProfile.bind(this));
        this.router.post('/account/profile', this.postProfile.bind(this));
    }

    /**
     * Service name is 'modules.index.routes.account.profile'
     * @type {string}
     */
    static get provides() {
        return 'modules.index.routes.account.profile';
    }

    /**
     * Dependencies as constructor arguments
     * @type {string[]}
     */
    static get requires() {
        return [
            'util',
            'error',
            'repositories.session',
            'repositories.user',
            'modules.index.forms.profile'
        ];
    }

    /**
     * Display profile
     * @param {object} req          Express request
     * @param {object} res          Express response
     * @param {function} next       Express next middleware function
     */
    getProfile(req, res, next) {
        if (!res.locals.user)
            return next(this._error.newUnauthorized());

        res.render('account/profile');
    }

    /**
     * Update profile
     * @param {object} req          Express request
     * @param {object} res          Express response
     * @param {function} next       Express next middleware function
     */
    postProfile(req, res, next) {
        if (!res.locals.user)
            return next(this._error.newUnauthorized());

        this._profileForm.validate(req.body)
            .then(form => {
                let curPassword = form.getField('cur_password');
                form.setField('cur_password', '');
                let newPassword = form.getField('new_password1');
                form.setField('new_password1', '');
                form.setField('new_password2', '');

                if (curPassword && !this._util.checkPassword(curPassword, res.locals.user.password))
                    form.addError('cur_password', 'profile_password_invalid');

                if (!form.success || req.body._validate)
                    return res.json(form.toJSON());

                res.locals.user.displayName = form.getField('name') || null;
                if (newPassword)
                    res.locals.password = this._util.encryptPassword(newPassword);

                return this._userRepo.save(res.locals.user)
                    .then(() => {
                        form.addMessage('info', 'profile_success');
                        res.json(form.toJSON());
                    });
            })
            .catch(error => {
                next(new WError(error, 'postProfile()'));
            });
    }
}

module.exports = ProfileRoute;