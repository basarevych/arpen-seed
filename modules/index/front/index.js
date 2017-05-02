import 'bootstrap';
import 'styles/index.scss';
import { Form } from 'form';

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
    'use strict';

    $.post('/login', signInModal.find('form').serialize(), data => {
        let form = new Form(data.form);
        form.update(signInModal);
        Form.unlock(signInModal);
    });
    Form.lock(signInModal);

    return false;
}