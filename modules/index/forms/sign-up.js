/**
 * Sign up form
 * @module index/forms/signUp
 */
const validator = require('validator');

/**
 * Sign up form class
 */
class SignUpForm {
    /**
     * Create service
     * @param {App} app                     The application
     */
    constructor(app) {
        this._app = app;
    }

    /**
     * Service name is 'forms.signUp'
     * @type {string}
     */
    static get provides() {
        return 'forms.signUp';
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
        form.addField('name', vars.name);
        form.addField('password1', vars.password1, { required: true });
        form.addField('password2', vars.password2, { required: true });
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
        let password1 = form.getField('password1');
        if (password1 && !validator.isLength(password1, { min: 6 }))
            form.addError('password1', 'form_min_length', { min: 6 });

        let password2 = form.getField('password2');
        if (password2 && !validator.isLength(password2, { min: 6 }))
            form.addError('password2', 'form_min_length', { min: 6 });
        if (password2 && password2 !== password1)
            form.addError('password2', 'sign_up_passwords_mismatch');

        return form;
    }
}

module.exports = SignUpForm;
