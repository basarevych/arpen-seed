'use strict';

/**
 * Form helper
 */
export class Form {
    /**
     * Create a form
     */
    constructor() {
        this.data = { success: true, messages: {}, form: {} };
        this.timestamp = Date.now();
    }

    /**
     * Extract field values
     * @param {object} el                       jQuery element
     * @return {object}
     */
    static extract(el) {
        let result = {};
        el.find('[name]').each((index, item) => {
            let input = $(item);
            result[input.prop('name')] = input.val();
        });
        return result;
    }

    /**
     * Remove error messages
     * @param {object} el                       jQuery element
     * @param {object} [input]                  Reset this input or all inputs if not set
     */
    static reset(el, input) {
        el.find('.messages').empty().hide();
        if (input) {
            input.removeClass('form-control-danger');
            let groupEl = el.parents('.form-group');
            groupEl.removeClass('has-danger').find('.errors').empty();
        } else {
            el.find('.form-group').removeClass('has-danger');
            el.find('.form-control').removeClass('form-control-danger');
            el.find('.errors').empty();
        }
    }

    /**
     * Prevent user interaction
     * @param {object} el                       jQuery element
     */
    static lock(el) {
        el.find('.form-control').prop('disabled', true);
        el.find('[type="submit"]').prop('disabled', true);
    }

    /**
     * Allow user interaction
     * @param {object} el                       jQuery element
     */
    static unlock(el) {
        el.find('.form-control').prop('disabled', false);
        el.find('[type="submit"]').prop('disabled', false);
    }

    /**
     * Is the form locked
     * @param {object} el                       jQuery element
     */
    static isLocked(el) {
        return el.find('[type="submit"]').prop('disabled');
    }

    /**
     * Focus first available input
     * @param {object} el                       jQuery element
     */
    static focus(el) {
        el.find('[name]').each((index, item) => {
            let input = $(item);
            if (!input.prop('readonly') && !input.prop('disabled')) {
                input.focus();
                return false;
            }
        });
    }

    /**
     * Update data
     * @param {object} el                       jQuery element
     * @param {object} data                     The data
     * @param {boolean} [updateValues=false]    Update field values
     */
    update(el, data, updateValues = false) {
        this.data = data;

        if (updateValues) {
            for (let field of Object.keys(this.data.form)) {
                let fieldEl = el.find(`[name="${field}"]`);
                fieldEl.val(this.data.form[field].value);
            }
        }
    }

    /**
     * Check field
     * @param {object} el                       jQuery element
     * @param {string} name                     Field name
     */
    checkField(el, name) {
        let groupEl = el.find(`[name="${name}"]`).parents('.form-group');
        let errorsEl = groupEl.find('.errors');
        groupEl.removeClass('has-danger');
        groupEl.find('.form-control').removeClass('form-control-danger');
        errorsEl.empty();

        if (this.data.form[name] && !this.data.form[name].valid) {
            groupEl.addClass('has-danger');
            for (let key of Object.keys(this.data.form[name].errors))
                errorsEl.append($('<div class="form-control-feedback"></div>').text(this.data.form[name].errors[key].message))
        }
    }

    /**
     * Check form field errors, set focus to first error
     * @param {object} el                       jQuery element
     */
    checkForm(el) {
        let messagesEl = el.find('.messages'), hasMessages = false;
        for (let key of Object.keys(this.data.messages || {})) {
            hasMessages = true;
            let msg = this.data.messages[key];
            let msgEl = $(`<div class="alert ${msg.type === 'error' ? 'alert-danger' : 'alert-success'}"></div>`).html(msg.message);
            let colEl = $('<div class="col-sm-12"></div>').append(msgEl);
            let rowEl = $('<div class="row"></div>').append(colEl);
            messagesEl.append(rowEl);
        }
        if (hasMessages)
            messagesEl.show('slow');

        let first, focused = false;
        for (let field of Object.keys(this.data.form) || {}) {
            let fieldEl = el.find(`[name="${field}"]`);
            if (!fieldEl.length)
                continue;

            if (!first && !fieldEl.prop('readonly') && !fieldEl.prop('disabled'))
                first = fieldEl;

            if (!this.data.form[field].valid) {
                fieldEl.addClass('form-control-danger');

                let groupEl = fieldEl.parents('.form-group');
                groupEl.addClass('has-danger');

                let errorsEl = groupEl.find('.errors');
                for (let key of Object.keys(this.data.form[field].errors))
                    errorsEl.append($('<div class="form-control-feedback"></div>').text(this.data.form[field].errors[key].message))

                if (!focused && !fieldEl.prop('readonly') && !fieldEl.prop('disabled')) {
                    fieldEl.focus();
                    focused = true;
                }
            }
        }

        if (!focused && first)
            first.focus();
    }
}