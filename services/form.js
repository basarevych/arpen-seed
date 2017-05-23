/**
 * Form
 * @module services/form
 */

/**
 * Form class
 */
class Form {
    /**
     * Create service
     * @param {Util} util                   Util service
     * @param {Map} middleware              Middleware store
     */
    constructor(util, middleware) {
        this.success = true;
        this.messages = [];
        this.fields = new Map();

        this._util = util;
        this._i18n = middleware.get('middleware.i18n');
    }

    /**
     * Service name is 'form'
     * @type {string}
     */
    static get provides() {
        return 'form';
    }

    /**
     * Dependencies as constructor arguments
     * @type {string[]}
     */
    static get requires() {
        return [ 'util', 'middleware' ];
    }

    /**
     * Add message
     * @param {string} type                             'error' or 'info'
     * @param {string} message                          Message text
     */
    addMessage(type, message) {
        if (type === 'error')
            this.success = false;

        for (let msg of this.messages) {
            if (msg.message === message) {
                msg.type = type;
                return;
            }
        }

        this.messages.push({ type, message });
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

        if (required && !field.value.length)
            this.addError(name, this._i18n.translate('form_field_required'));
    }

    /**
     * Set field value
     * @param {string} name                             Field name
     * @param {*} value                                 Field value
     * @retun {string}
     */
    setField(name, value) {
        let field = this.fields.get(name);
        if (!field)
            throw new Error(`Unknown field ${name}`);
        field.value = value;
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
     * Mark field as invalid
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
    toJSON() {
        let json = {
            success: this.success,
            messages: this.messages,
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

module.exports = Form;