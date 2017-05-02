import 'bootstrap';
import 'styles/index.scss';
import { Form } from 'form';
import { Cookie } from 'cookie';

'use strict';

let signInModal;

$(() => {
    signInModal = $('#signInModal');
    signInModal.on('show.bs.modal', () => {
        Form.reset(signInModal);
        Form.unlock(signInModal);
    });
});

export function loginSubmit() {
    $.post('/login', signInModal.find('form').serialize(), data => {
        Form.reset(signInModal);
        if (data.success) {
            Cookie.set(data.cookie.name, data.cookie.value, data.cookie.lifetime);
            signInModal.find('[data-dismiss="modal"]').click();
            window.location.reload();
        } else {
            let form = new Form(data);
            form.update(signInModal);
            Form.unlock(signInModal);
        }
    });
    Form.lock(signInModal);

    return false;
}