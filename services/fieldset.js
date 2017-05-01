/**
 * Form fieldset
 * @module services/fieldset
 */

/**
 * Form fieldset class
 */
class Fieldset {
    /**
     * Create service
     * @param {Util} util                   Util service
     * @param {Map} middleware              Middleware store
     */
    constructor(util, middleware) {
        this.success = true;
        this.fields = new Map();

        this._util = util;
        this._i18n = middleware.get('middleware.i18n');
    }

    /**
     * Service name is 'fieldset'
     * @type {string}
     */
    static get provides() {
        return 'fieldset';
    }

    /**
     * Dependencies as constructor arguments
     * @type {string[]}
     */
    static get requires() {
        return [ 'util', 'middleware' ];
    }

    /**
     * Add field to the form
     * @param {string} name                             Field name
     * @param {*} value                                 Field value
     * @param {object} [options]                        Field options
     * @param {boolean} [options.required]              Field is required
     */
    addField(name, value, { required = false } = {}) {
        if (this.fields.has(name))
            throw new Error(`Form already has field ${name}`);

        let field = {
            valid: true,
            value: this._util.trim(value),
            errors: [],
        };
        this.fields.set(name, field);

        if (required && !value.length)
            this.addError(name, this._i18n.translate('form_field_required'));
    }

    /**
     * Get field value
     * @param {string} name                             Field name
     * @retun {string}
     */
    getField(name) {
        let field = this.fields.get(name);
        if (!field)
            throw new Error(`Unknown field ${name}`);
        return field.value;
    }

    /**
     * Add field to the form
     * @param {string} name                             Field name
     * @param {string} error                            Field error
     */
    addError(name, error) {
        let field = this.fields.get(name);
        if (!field)
            throw new Error(`Unknown field ${name}`);

        if (field.errors.indexOf(error) === -1)
            field.errors.push(error);

        this.success = field.valid = false;
    }

    /**
     * Get field errors
     * @param {string} name                             Field name
     * @retun {string[]}
     */
    getErrors(name) {
        let field = this.fields.get(name);
        if (!field)
            throw new Error(`Unknown field ${name}`);
        return field.errors;
    }

    /**
     * Convert this instance to an object
     * @return {object}
     */
    toJson() {
        let json = {
            success: this.success,
            form: {},
        };

        for (let [ name, field ] of this.fields) {
            json.form[name] = {
                valid: field.valid,
                value: field.value,
                errors: field.errors,
            };
        }

        return json;
    }
}

module.exports = Fieldset;