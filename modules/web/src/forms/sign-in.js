/**
 * Sign in form
 * @module web/forms/sign-in
 */
const validator = require('validator');

/**
 * SignIn form class
 */
class SignInForm {
    /**
     * Create service
     * @param {App} app                     The application
     */
    constructor(app) {
        this._app = app;
    }

    /**
     * Service name is 'web.forms.signIn'
     * @type {string}
     */
    static get provides() {
        return 'web.forms.signIn';
    }

    /**
     * Dependencies as constructor arguments
     * @type {string[]}
     */
    static get requires() {
        return [ 'app' ];
    }

    /**
     * Create new instance of the form
     * @param {string} locale               Locale
     * @param {object} vars                 Fields of the form
     * @return {Promise}                    Resolves to Fieldset
     */
    async create(locale, vars) {
        let form = this._app.get('form');
        form.locale = locale;
        form.addField('email', vars.email, { required: true });
        form.addField('password', vars.password, { required: true });
        return form;
    }

    /**
     * Validate the form
     * @param {string} locale               Locale
     * @param {object} vars                 Fields of the form
     * @return {Promise}                    Resolves to Form
     */
    async validate(locale, vars) {
        let form = await this.create(locale, vars);
        if (!validator.isEmail(form.getField('email')))
            form.addError('email', 'form_email_invalid');
        if (!validator.isLength(form.getField('password'), { min: 6 }))
            form.addError('password', 'form_min_length', { min: 6 });

        return form;
    }
}

module.exports = SignInForm;
