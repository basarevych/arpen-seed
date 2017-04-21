function loginSubmit() {
    'use strict';

    $.post('/login', $('#signInModal').find('form').serialize(), function (data) {
        console.log(data);
    });

    return false;
}

exports.default = {
    loginSubmit: loginSubmit,
};