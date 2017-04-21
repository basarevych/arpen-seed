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
     * @param {Util} util                   Util service
     * @param {Map} middleware              Middleware store
     */
    constructor(util, middleware) {
        this._util = util;
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
        return [ 'util', 'middleware' ];
    }

    /**
     * Validate the form
     * @param {object} vars                 Fields of the form
     * @return {Promise}
     */
    validate(vars) {
        return Promise.resolve()
            .then(() => {
                let result = {
                    email: {
                        value: this._util.trim(vars.email),
                        valid: true,
                        errors: [],
                    },
                    password: {
                        value: this._util.trim(vars.password),
                        valid: true,
                        errors: [],
                    }
                };

                if (!validator.isEmail(result.email.value)) {
                    result.email.valid = false;
                    result.email.errors.push(this._i18n.translate('form_email_invalid'));
                }
                if (!validator.isLength(result.password.value, { min: 6 })) {
                    result.password.valid = false;
                    result.password.errors.push(this._i18n.translate('form_min_length', { min: 6 }));
                }

                result.password.value = '';

                return result;
            });
    }
}

module.exports = LoginForm;