'use strict';

export class Form {
    constructor(data) {
        this.data = data;
    }

    static reset(el) {
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

    update(el) {
        this.constructor.reset(el);

        for (let field of Object.keys(this.data)) {
            let fieldEl = el.find(`[name="${field}"]`);
            if (!fieldEl.length)
                continue;

            fieldEl.val(this.data[field].value);

            if (!this.data[field].valid) {
                fieldEl.addClass('form-control-danger');

                let groupEl = fieldEl.parents('.form-group');
                groupEl.addClass('has-danger');

                let errorsEl = groupEl.find('.errors');
                for (let error of this.data[field].errors)
                    errorsEl.append($('<div class="form-control-feedback"></div>').text(error))
            }
        }
    }
}