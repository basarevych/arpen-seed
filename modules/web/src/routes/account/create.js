/**
 * Sign up route
 * @module web/routes/account/create
 */
const express = require('express');
const moment = require('moment-timezone');
const NError = require('nerror');

/**
 * Sign up route class
 */
class SignUpRoute {
    /**
     * Create service
     * @param {object} config                   Configuration
     * @param {Logger} logger                   Logger service
     * @param {Emailer} emailer                 Emailer service
     * @param {Util} util                       Util service
     * @param {UserRepository} userRepo         User repository
     * @param {RoleRepository} roleRepo         Role repository
     * @param {SignUpForm} signUpForm           Sign up form
     */
    constructor(config, logger, emailer, util, userRepo, roleRepo, signUpForm) {
        this._config = config;
        this._logger = logger;
        this._emailer = emailer;
        this._util = util;
        this._userRepo = userRepo;
        this._roleRepo = roleRepo;
        this._signUpForm = signUpForm;

        this.priority = 1000;
        this.router = express.Router();
        this.router.get('/account/create', this.getSignUp.bind(this));
        this.router.post('/account/create', this.postSignUp.bind(this));
    }

    /**
     * Service name is 'web.routes.account.create'
     * @type {string}
     */
    static get provides() {
        return 'web.routes.account.create';
    }

    /**
     * Dependencies as constructor arguments
     * @type {string[]}
     */
    static get requires() {
        return [
            'config',
            'logger',
            'emailer',
            'util',
            'repositories.user',
            'repositories.role',
            'web.forms.signUp'
        ];
    }

    /**
     * Display form
     * @param {object} req          Express request
     * @param {object} res          Express response
     * @param {function} next       Express next middleware function
     */
    getSignUp(req, res, next) {
        res.render('account/create');
    }

    /**
     * Process form
     * @param {object} req          Express request
     * @param {object} res          Express response
     * @param {function} next       Express next middleware function
     * @return {Promise}
     */
    async postSignUp(req, res, next) {
        let form, user;

        try {
            form = await this._signUpForm.validate(res.locals.locale, req.body);

            let password = form.getField('password1');
            form.setField('password1', '');
            form.setField('password2', '');

            let users = await this._userRepo.findByEmail(form.getField('email'));
            if (users.length)
                form.addError('email', 'sign_up_email_exists');

            if (!form.success || req.body._validate)
                return res.json(form.toJSON());

            user = this._userRepo.getModel('user');
            user.email = form.getField('email');
            user.displayName = form.getField('name') || null;
            user.password = this._util.encryptPassword(password);
            user.secret = this._util.getRandomString(32, {lower: true, upper: true, digits: true, special: false});
            user.createdAt = moment();
            user.confirmedAt = null;
            user.blockedAt = null;
        } catch (error) {
            return next(new NError(error, 'postSignUp()'));
        }

        try {
            await this._userRepo.save(user);
        } catch (error) {
            if (error.info && error.info.sqlState === '23505') { // duplicate email
                form.addMessage('error', 'sign_up_user_failure');
                return res.json(form.toJSON());
            }

            return next(new NError(error, 'postSignUp()'));
        }

        try {
            let roles = await this._roleRepo.findByTitle('User');
            let role = roles.length && roles[0];
            if (!role)
                throw new Error('Role "User" not found');

            await this._userRepo.addRole(user, role);

            let project = res.locals.i18n('project_title');
            let link = this._config.get('official_url') + '/account/confirm#' + user.secret;
            let [text, html] = await new Promise((resolve, reject) => {
                let text, html;
                let calls = 0;
                let commit = () => {
                    if (++calls >= 2)
                        resolve([text, html]);
                };
                try {
                    req.app.render(
                        'email/sign-up-html.pug',
                        {
                            i18n: res.locals.i18n,
                            project,
                            link
                        },
                        (error, view) => {
                            if (error)
                                return reject(error);

                            html = view;
                            commit();
                        }
                    );
                    req.app.render(
                        'email/sign-up-text.pug',
                        {
                            i18n: res.locals.i18n,
                            project,
                            link
                        },
                        (error, view) => {
                            if (error)
                                return reject(error);

                            text = view;
                            commit();
                        }
                    );
                } catch (error) {
                    reject(error);
                }
            });

            await this._emailer.send({
                from: this._config.get('email.from'),
                to: form.getField('email'),
                subject: res.locals.i18n('account_activation_subject', {project}),
                text: text,
                html: html
            });

            form.addMessage('info', 'sign_up_success');
            res.json(form.toJSON());
        } catch (error) {
            this._logger.error(error, 'postSignUp()');

            await this._userRepo.delete(user);

            form.addMessage('error', 'sign_up_email_failure');
            res.json(form.toJSON());
        }
    }
}

module.exports = SignUpRoute;
