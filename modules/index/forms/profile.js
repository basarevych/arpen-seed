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
     * @param {Map} middleware              Middleware store
     */
    constructor(app, middleware) {
        this._app = app;
        this._i18n = middleware.get('middleware.i18n');
    }

    /**
     * Service name is 'modules.index.forms.profile'
     * @type {string}
     */
    static get provides() {
        return 'modules.index.forms.profile';
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
        let form = this._app.get('form');
        form.addField('name', vars.name);
        form.addField('cur_password', vars.cur_password);
        form.addField('new_password1', vars.new_password1);
        form.addField('new_password2', vars.new_password2);
        return Promise.resolve(form);
    }

    /**
     * Validate the form
     * @param {object} vars                 Fields of the form
     * @return {Promise}                    Resolves to Form
     */
    validate(vars) {
        return this.create(vars)
            .then(form => {
                let curPassword = form.getField('cur_password');
                if (curPassword && !validator.isLength(curPassword, { min: 6 }))
                    form.addError('cur_password', this._i18n.translate('form_min_length', { min: 6 }));

                let newPassword1 = form.getField('new_password1');
                if (newPassword1 && !validator.isLength(newPassword1, { min: 6 }))
                    form.addError('new_password1', this._i18n.translate('form_min_length', { min: 6 }));
                if (newPassword1 && !curPassword)
                    form.addError('cur_password', this._i18n.translate('form_field_required'));

                let newPassword2 = form.getField('new_password2');
                if (newPassword2 && !validator.isLength(newPassword2, { min: 6 }))
                    form.addError('new_password2', this._i18n.translate('form_min_length', { min: 6 }));
                if (newPassword2 && newPassword2 !== newPassword1)
                    form.addError('new_password2', this._i18n.translate('profile_passwords_mismatch'));

                return form;
            });
    }
}

module.exports = ProfileForm;