/**
 * Front account functionality module
 * @module front/login
 */
'use strict';

import { Form } from 'arpen-express/front/jquery/bootstrap-form';

let signUpWrapper;
let signUpForm = new Form();
let profileWrapper;
let profileForm = new Form();

/**
 * Install handlers
 */
$(() => {
    if (window.location.pathname === '/account/profile') {
        profileWrapper = $('#profileWrapper');
        profileForm.init(
            profileWrapper,
            {
                url: '/account/profile',
            },
            {
                url: '/account/profile',
            }
        );
        Form.focus(profileWrapper);
    }

    if (window.location.pathname === '/account/create') {
        signUpWrapper = $('#signUpWrapper');
        signUpForm.init(
            signUpWrapper,
            {
                url: '/account/create',
            },
            {
                url: '/account/create',
            }
        );
        Form.focus(signUpWrapper);
    }

    if (window.location.pathname === '/account/confirm') {
        $('#confirmAccountButton').on('click', () => {
            $(this).prop('disabled', true);
            $.post('/account/confirm', { secret: window.location.hash.slice(1) }, data => {
                $('#confirmWrapperStart').hide();
                $('#confirmWrapper' + (data.success ? 'Success' : 'Failure')).show();

                if (!data.success)
                    return;

                let seconds = 5;
                let timerEl = $('#confirmTimer');
                let update = () => {
                    if (--seconds <= 0) {
                        window.location = '/';
                        return;
                    }

                    timerEl.find('p').hide();
                    timerEl.find('#second' + seconds).show();
                    setTimeout(update, 1000);
                };

                update();
            });
        });
    }
});
