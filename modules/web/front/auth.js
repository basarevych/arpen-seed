/**
 * Front authentication module
 * @module front/auth
 */
'use strict';

import { Form } from 'arpen-express/front/jquery/bootstrap-form';

let signInModal;
let signInForm = new Form();

/**
 * Install handlers
 */
$(() => {
    signInModal = $('#signInModal');
    signInForm.init(
        signInModal,
        {
            url: '/sign-in',
            success: data => {
                if (data.success)
                    window.location.reload();
            },
        },
        {
            url: '/sign-in',
        }
    );

    $('.btn-sign-in').on('click', () => {
        signInModal.modal('show');
    });
    $('.btn-sign-out').on('click', () => {
        $.post('/sign-out', () => {
            window.location.reload();
        });
    });
});
