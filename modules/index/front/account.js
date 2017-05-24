'use strict';

import { Form } from 'form';

let profileWrapper, profileForm = new Form();

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
