'use strict';

export class Form {
    constructor(data) {
        this.data = data;
    }

    static reset(el) {
        el.find('.messages').empty().hide();
        el.find('.form-group').removeClass('has-danger');
        el.find('.form-control').removeClass('form-control-danger');
        el.find('.errors').empty();
    }

    static lock(el) {
        el.find('.form-control').prop('disabled', true);
        el.find('[type="submit"]').prop('disabled', true);
    }

    static unlock(el) {
        el.find('.form-control').prop('disabled', false);
        el.find('[type="submit"]').prop('disabled', false);
    }

    static focus(el) {
        el.find('[name]').each((index, item) => {
            let input = $(item);
            if (!input.prop('readonly') && !input.prop('disabled')) {
                input.focus();
                return false;
            }
        });
    }

    update(el) {
        let messagesEl = el.find('.messages');
        for (let msg of this.data.messages) {
            let msgEl = $(`<div class="alert ${msg.type === 'error' ? 'alert-danger' : 'alert-success'}"></div>`).html(msg.message);
            let colEl = $('<div class="col-sm-12"></div>').append(msgEl);
            let rowEl = $('<div class="row"></div>').append(colEl);
            messagesEl.append(rowEl);
        }
        if (this.data.messages.length)
            messagesEl.show('slow');

        let first, focused = false;
        for (let field of Object.keys(this.data.form)) {
            let fieldEl = el.find(`[name="${field}"]`);
            if (!fieldEl.length)
                continue;

            fieldEl.val(this.data.form[field].value);
            if (!first && !fieldEl.prop('readonly') && !fieldEl.prop('disabled'))
                first = fieldEl;

            if (!this.data.form[field].valid) {
                fieldEl.addClass('form-control-danger');

                let groupEl = fieldEl.parents('.form-group');
                groupEl.addClass('has-danger');

                let errorsEl = groupEl.find('.errors');
                for (let error of this.data.form[field].errors)
                    errorsEl.append($('<div class="form-control-feedback"></div>').text(error))

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