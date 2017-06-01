'use strict';

import { Form } from 'form';

let signUpWrapper, signUpForm = new Form();
let profileWrapper, profileForm = new Form();

/**
 * Register user
 */
function signUp() {
    let timestamp = Date.now();
    $.post('/account/create', Form.extract(signUpWrapper), data => {
        Form.reset(signUpWrapper);
        Form.unlock(signUpWrapper);
        if (signUpForm.timestamp < timestamp) {
            signUpForm.update(signUpWrapper, data, true);
            signUpForm.checkForm(signUpWrapper);
            signUpForm.timestamp = timestamp;
        }
    });
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
        if (profileForm.timestamp < timestamp) {
            profileForm.update(profileWrapper, data, true);
            profileForm.checkForm(profileWrapper);
            profileForm.timestamp = timestamp;
        }
    });
    Form.lock(profileWrapper);
}

/**
 * Install handlers
 */
$(() => {
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
                $.post('/account/create', Object.assign({ _validate: true }, Form.extract(signUpWrapper)), data => {
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
                $.post('/account/profile', Object.assign({ _validate: true }, Form.extract(profileWrapper)), data => {
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
});
