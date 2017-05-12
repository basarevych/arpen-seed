import 'bootstrap';
import 'styles/index.scss';
import { Form } from 'form';
import { Cookie } from 'cookie';

'use strict';

let signInModal;

$(() => { // Document loaded - find elements, set event handlers
    signInModal = $('#signInModal');
    signInModal.on('show.bs.modal', () => {
        Form.reset(signInModal);
        Form.unlock(signInModal);
    });
    signInModal.on('shown.bs.modal', () => {
        Form.focus(signInModal);
    });
    signInModal.find('[validate]').on('focusout', event => {
        $.post('/login', Object.assign({ _validate: true }, Form.extract(signInModal)), data => {
            let form = new Form(data);
            form.check($(event.target).prop('name'), signInModal);
        });
    });
});

/**
 * Sign in modal handler
 * @return {boolean}
 */
export function loginSubmit() {
    $.post('/login', Form.extract(signInModal), data => {
        Form.reset(signInModal);
        if (data.success) {
            Cookie.set(data.cookie.name, data.cookie.value, data.cookie.lifetime);
            signInModal.find('[data-dismiss="modal"]').click();
            window.location.reload();
        } else {
            let form = new Form(data);
            Form.unlock(signInModal);
            form.update(signInModal);
        }
    });
    Form.lock(signInModal);

    return false;
}