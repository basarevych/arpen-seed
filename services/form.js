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
        this.messages = new Map();
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
     * @param {string} key                              Translation key
     * @param {object} [params]                         Translation parameters
     */
    addMessage(type, key, params) {
        let message = this.messages.get(key);
        if (!message) {
            message = {};
            this.messages.set(key, message);
        }

        message.type = type;
        message.message = this._translate(key, params);

        if (type === 'error')
            this.success = false;
    }

    /**
     * Add field to the form
     * @param {string} name                             Field name
     * @param {*} value                                 Field value
     * @param {object} [options]                        Field options
     * @param {boolean} [options.required]              Field is required
     */
    addField(name, value, options = {}) {
        let { required = false } = options;

        if (this.fields.has(name))
            throw new Error(`Form already has field ${name}`);

        let field = {
            valid: true,
            value: this._util.trim(value),
            errors: new Map(),
        };
        this.fields.set(name, field);

        if (required && !field.value.length)
            this.addError(name, 'form_field_required');
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
     * @param {string} key                              Translation key
     * @param {object} [params]                         Translation parameters
     */
    addError(name, key, params) {
        let field = this.fields.get(name);
        if (!field)
            throw new Error(`Unknown field ${name}`);

        let error = field.errors.get(key);
        if (!error) {
            error = {};
            field.errors.set(key, error);
        }

        error.message = this._translate(key, params);

        this.success = field.valid = false;
    }

    /**
     * Get field errors
     * @param {string} name                             Field name
     * @retun {Map}
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
            messages: {},
            form: {},
        };

        for (let [ key, msg ] of this.messages)
            json.messages[key] = msg;

        for (let [ name, field ] of this.fields) {
            json.form[name] = {
                valid: field.valid,
                value: field.value,
                errors: {},
            };

            for (let [ key, msg ] of field.errors)
                json.form[name].errors[key] = msg;
        }

        return json;
    }

    /**
     * Translate message
     * @param {string} key                              Translation key
     * @param {object} [params]                         Translation parameters
     * @return {string}
     */
    _translate(key, params) {
        let args = [ key ];
        if (params)
            args.push(params);
        return this._i18n.translate.apply(this._i18n, args);
    }
}

module.exports = Form;