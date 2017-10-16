/**
 * Front authentication module
 * @module front/auth
 */
'use strict';

import { Form } from 'form';

let signInModal;
let signInForm = new Form();

/**
 * Sign in
 */
function signIn() {
    let timestamp = Date.now();
    $.post('/login', Form.extract(signInModal), data => {
        Form.reset(signInModal);
        if (data.success) {
            window.location.reload();
        } else {
            Form.unlock(signInModal);
            if (signInForm.timestamp <= timestamp) {
                signInForm.update(signInModal, data, true);
                signInForm.checkForm(signInModal);
            }
        }
    });
    signInForm.timestamp = timestamp;
    Form.lock(signInModal);
}

/**
 * Sign out
 */
function signOut() {
    $.post('/logout', () => {
        window.location.reload();
    });
}

/**
 * Install handlers
 */
$(() => {
    signInModal = $('#signInModal');

    signInModal.on('show.bs.modal', () => {
        Form.reset(signInModal);
        Form.unlock(signInModal);
    });
    signInModal.on('shown.bs.modal', () => {
        Form.focus(signInModal);
    });

    signInModal.find('[name]').on('input', event => {
        Form.reset(signInModal, $(event.target));
    });
    signInModal.find('[validate]').on('focusout', event => {
        if (Form.isLocked(signInModal))
            return;

        let timestamp = Date.now();
        setTimeout(() => {
            if (!Form.isLocked(signInModal) && signInForm.timestamp < timestamp) {
                Form.reset(signInModal, $(event.target));
                $.post('/login', Object.assign({_validate: true}, Form.extract(signInModal)), data => {
                    if (!Form.isLocked(signInModal) && signInForm.timestamp < timestamp) {
                        signInForm.update(signInModal, data, false);
                        signInForm.checkField(signInModal, $(event.target).prop('name'));
                        signInForm.timestamp = timestamp;
                    }
                });
            }
        }, 250);
    });
    signInModal.find('[type="submit"]').on('click', signIn);

    $('.btn-sign-in').on('click', () => {
        signInModal.modal('show');
    });
    $('.btn-sign-out').on('click', signOut);
});
