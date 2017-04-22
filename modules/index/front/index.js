import 'styles/index.scss';

export function loginSubmit() {
    'use strict';

    $.post('/login', $('#signInModal').find('form').serialize(), data => {
        console.log(data);
    });

    return false;
}