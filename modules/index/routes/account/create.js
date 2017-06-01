/**
 * Sign up route
 * @module index/routes/account/create
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
     * @param {Emailer} emailer                 Emailer service
     * @param {Util} util                       Util service
     * @param {Map} servers                     Running servers
     * @param {UserRepository} userRepo         User repository
     * @param {SignUpForm} signUpForm           Sign up form
     */
    constructor(config, emailer, util, servers, userRepo, signUpForm) {
        this._config = config;
        this._emailer = emailer;
        this._util = util;
        this._express = servers.get(servers.has('https') ? 'https' : 'http').express;
        this._userRepo = userRepo;
        this._signUpForm = signUpForm;

        this.router = express.Router();
        this.router.get('/account/create', this.getSignUp.bind(this));
        this.router.post('/account/create', this.postSignUp.bind(this));
    }

    /**
     * Service name is 'modules.index.routes.account.create'
     * @type {string}
     */
    static get provides() {
        return 'modules.index.routes.account.create';
    }

    /**
     * Dependencies as constructor arguments
     * @type {string[]}
     */
    static get requires() {
        return [
            'config',
            'emailer',
            'util',
            'servers',
            'repositories.user',
            'modules.index.forms.signUp'
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
     */
    postSignUp(req, res, next) {
        return this._signUpForm.validate(req.body)
            .then(form => {
                let password = form.getField('password1');
                form.setField('password1', '');
                form.setField('password2', '');

                return this._userRepo.findByEmail(form.getField('email'))
                    .then(users => {
                        if (users.length)
                            form.addError('email', 'sign_up_email_exists');

                        if (!form.success || req.body._validate)
                            return res.json(form.toJSON());

                        let user = this._userRepo.getModel('user');
                        user.email = form.getField('email');
                        user.displayName = form.getField('name') || null;
                        user.password = this._util.encryptPassword(password);
                        user.secret = this._util.getRandomString(32, { lower: true, upper: true, digits: true, special: false });
                        user.createdAt = moment();
                        user.confirmedAt = null;
                        user.blockedAt = null;

                        let project = this._config.get('project');
                        let link = this._config.get('official_url') + '/account/confirm?secret=' + user.secret;

                        return this._userRepo.save(user)
                            .then(
                                () => {
                                    return new Promise((resolve, reject) => {
                                            let calls = 0, text, html;
                                            let commit = () => {
                                                if (++calls >= 2)
                                                    resolve([ text, html ]);
                                            };
                                            try {
                                                this._express.render('email/sign-up-html.pug', { i18n: res.locals.i18n, project, link }, (error, view) => {
                                                    if (error)
                                                        return reject(error);

                                                    html = view;
                                                    commit();
                                                });
                                                this._express.render('email/sign-up-text.pug', { i18n: res.locals.i18n, project, link }, (error, view) => {
                                                    if (error)
                                                        return reject(error);

                                                    text = view;
                                                    commit();
                                                });
                                            } catch (error) {
                                                reject(error);
                                            }
                                        })
                                        .then(([ text, html ]) => {
                                            return this._emailer.send({
                                                    from: this._config.get('email.from'),
                                                    to: form.getField('email'),
                                                    subject: res.locals.i18n('account_activation_subject', { project }),
                                                    text: text,
                                                    html: html
                                                })
                                                .then(
                                                    () => {
                                                        form.addMessage('info', 'sign_up_success');
                                                        res.json(form.toJSON());
                                                    },
                                                    error => {
                                                        return this._userRepo.delete(user)
                                                            .then(() => {
                                                                form.addMessage('error', 'sign_up_email_failure');
                                                                res.json(form.toJSON());
                                                            });
                                                    }
                                                );
                                        });
                                },
                                error => {
                                    if (!error.info || error.info.sql_state !== '23505')
                                        throw error;

                                    form.addMessage('error', 'sign_up_user_failure');
                                    res.json(form.toJSON());
                                }
                            );
                    });
            })
            .catch(error => {
                next(new NError(error, 'postSignUp()'));
            });
    }
}

module.exports = SignUpRoute;