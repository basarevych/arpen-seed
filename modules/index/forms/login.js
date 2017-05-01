/**
 * Login form
 * @module index/forms/login
 */
const validator = require('validator');

/**
 * Login form class
 */
class LoginForm {
    /**
     * Create service
     * @param {App} app                     The application
     * @param {Map} middleware              Middleware store
     */
    constructor(app, middleware) {
        this._app = app;
        this._i18n = middleware.get('middleware.i18n');
    }

    /**
     * Service name is 'modules.index.forms.login'
     * @type {string}
     */
    static get provides() {
        return 'modules.index.forms.login';
    }

    /**
     * Dependencies as constructor arguments
     * @type {string[]}
     */
    static get requires() {
        return [ 'app', 'middleware' ];
    }

    /**
     * Create new instance of the form
     * @param {object} vars                 Fields of the form
     * @return {Promise}                    Resolves to Fieldset
     */
    create(vars) {
        let form = this._app.get('fieldset');
        form.addField('email', vars.email, { required: true });
        form.addField('password', vars.password, { required: true });
        return Promise.resolve(form);
    }

    /**
     * Validate the form
     * @param {object} vars                 Fields of the form
     * @return {Promise}                    Resolves to Fieldset
     */
    validate(vars) {
        return this.create(vars)
            .then(form => {
                if (!validator.isEmail(form.getField('email')))
                    form.addError('email', this._i18n.translate('form_email_invalid'));
                if (!validator.isLength(form.getField('password'), { min: 6 }))
                    form.addError('password', this._i18n.translate('form_min_length', { min: 6 }));

                return form;
            });
    }
}

module.exports = LoginForm;