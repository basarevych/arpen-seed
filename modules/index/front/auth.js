'use strict';

import { Form } from 'form';
import { Cookie } from 'cookie';

let signInModal;

$(() => { // Document loaded - find elements, set event handlers
    signInModal = $('#signInModal');
    signInModal.on('show.bs.modal', () => {
        console.log('xx');
        Form.reset(signInModal);
        Form.unlock(signInModal);
    });
    signInModal.on('shown.bs.modal', () => {
        Form.focus(signInModal);
    });
    signInModal.find('form').on('submit', signInSubmit);
    signInModal.find('[validate]').on('focusout', event => {
        $.post('/login', Object.assign({ _validate: true }, Form.extract(signInModal)), data => {
            let form = new Form(data);
            form.check($(event.target).prop('name'), signInModal);
        });
    });

    $('.btn-sign-in').on('click', () => {
        signInModal.modal('show');
    });
    $('.btn-sign-out').on('click', signOut);
});

/**
 * Sign in modal handler
 * @return {boolean}
 */
function signInSubmit() {
    $.post('/login', Form.extract(signInModal), data => {
        Form.reset(signInModal);
        if (data.success) {
            localStorage.setItem('sidName', data.cookie.name);
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

/**
 * Sign out
 */
function signOut() {
    Cookie.del(localStorage.getItem('sidName'));
    window.location.reload();
}
