/**
 * Profile form
 * @module index/forms/profile
 */
const validator = require('validator');

/**
 * Profile form class
 */
class ProfileForm {
    /**
     * Create service
     * @param {App} app                     The application
     */
    constructor(app) {
        this._app = app;
    }

    /**
     * Service name is 'forms.profile'
     * @type {string}
     */
    static get provides() {
        return 'forms.profile';
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
        form.addField('name', vars.name);
        form.addField('cur_password', vars.cur_password);
        form.addField('new_password1', vars.new_password1);
        form.addField('new_password2', vars.new_password2);
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
        let curPassword = form.getField('cur_password');
        if (curPassword && !validator.isLength(curPassword, { min: 6 }))
            form.addError('cur_password', 'form_min_length', { min: 6 });

        let newPassword1 = form.getField('new_password1');
        if (newPassword1 && !validator.isLength(newPassword1, { min: 6 }))
            form.addError('new_password1', 'form_min_length', { min: 6 });

        let newPassword2 = form.getField('new_password2');
        if (newPassword2 && !validator.isLength(newPassword2, { min: 6 }))
            form.addError('new_password2', 'form_min_length', { min: 6 });
        if (newPassword2 && newPassword2 !== newPassword1)
            form.addError('new_password2', 'profile_passwords_mismatch');

        if ((newPassword1 || newPassword2) && !curPassword)
            form.addError('cur_password', 'form_field_required');
        if (newPassword1 && !newPassword2)
            form.addError('new_password2', 'form_field_required');
        if (newPassword2 && !newPassword1)
            form.addError('new_password1', 'form_field_required');

        return form;
    }
}

module.exports = ProfileForm;
