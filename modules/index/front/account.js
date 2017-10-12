/**
 * Front account functionality module
 * @module front/login
 */
'use strict';

import { Form } from 'form';
import { startSession } from 'auth';

let signUpWrapper;
let signUpForm = new Form();
let profileWrapper;
let profileForm = new Form();

/**
 * Register user
 */
function signUp() {
    let timestamp = Date.now();
    $.post('/account/create', Form.extract(signUpWrapper), data => {
        Form.reset(signUpWrapper);
        Form.unlock(signUpWrapper);
        if (signUpForm.timestamp <= timestamp) {
            signUpForm.update(signUpWrapper, data, true);
            signUpForm.checkForm(signUpWrapper);
        }
    });
    signUpForm.timestamp = timestamp;
    Form.lock(signUpWrapper);
}

/**
 * Update profile
 */
function updateProfile() {
    let timestamp = Date.now();
    $.post('/account/profile', Form.extract(profileWrapper), data => {
        Form.reset(profileWrapper);
        Form.unlock(profileWrapper);
        if (profileForm.timestamp <= timestamp) {
            profileForm.update(profileWrapper, data, true);
            profileForm.checkForm(profileWrapper);
        }
    });
    profileForm.timestamp = timestamp;
    Form.lock(profileWrapper);
}

/**
 * Install handlers
 */
$(() => {
    if (window.location.pathname === '/account/profile') {
        profileWrapper = $('#profileWrapper');
        Form.focus(profileWrapper);

        profileWrapper.find('[name]').on('input', event => {
            Form.reset(profileWrapper, $(event.target));
        });
        profileWrapper.find('[validate]').on('focusout', event => {
            if (Form.isLocked(profileWrapper))
                return;

            let timestamp = Date.now();
            setTimeout(() => {
                if (!Form.isLocked(profileWrapper) && profileForm.timestamp < timestamp) {
                    Form.reset(profileWrapper, $(event.target));
                    $.post('/account/profile', Object.assign({_validate: true}, Form.extract(profileWrapper)), data => {
                        if (!Form.isLocked(profileWrapper) && profileForm.timestamp < timestamp) {
                            profileForm.update(profileWrapper, data, false);
                            profileForm.checkField(profileWrapper, $(event.target).prop('name'));
                            profileForm.timestamp = timestamp;
                        }
                    });
                }
            }, 250);
        });
        profileWrapper.find('[type="submit"]').on('click', updateProfile);
    }

    if (window.location.pathname === '/account/create') {
        signUpWrapper = $('#signUpWrapper');
        Form.focus(signUpWrapper);

        signUpWrapper.find('[name]').on('input', event => {
            Form.reset(signUpWrapper, $(event.target));
        });
        signUpWrapper.find('[validate]').on('focusout', event => {
            if (Form.isLocked(signUpWrapper))
                return;

            let timestamp = Date.now();
            setTimeout(() => {
                if (!Form.isLocked(signUpWrapper) && signUpForm.timestamp < timestamp) {
                    Form.reset(signUpWrapper, $(event.target));
                    $.post('/account/create', Object.assign({_validate: true}, Form.extract(signUpWrapper)), data => {
                        if (!Form.isLocked(signUpWrapper) && signUpForm.timestamp < timestamp) {
                            signUpForm.update(signUpWrapper, data, false);
                            signUpForm.checkField(signUpWrapper, $(event.target).prop('name'));
                            signUpForm.timestamp = timestamp;
                        }
                    });
                }
            }, 250);
        });
        signUpWrapper.find('[type="submit"]').on('click', signUp);
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
                        startSession(data.cookie);
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
