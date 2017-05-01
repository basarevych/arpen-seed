import 'bootstrap';
import 'styles/index.scss';
import { Form } from 'form';

'use strict';

let signInModal;

$(() => {
    signInModal = $('#signInModal');
    signInModal.on('hidden.bs.modal', () => {
        Form.reset(signInModal);
    });
});

export function loginSubmit() {
    'use strict';

    $.post('/login', signInModal.find('form').serialize(), data => {
        let form = new Form(data.form);
        form.update(signInModal);
    });

    return false;
}