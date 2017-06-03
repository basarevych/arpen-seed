'use strict';

import 'bootstrap';
import 'styles/index.scss';
import 'auth';
import 'account';

/**
 * Hide loader
 */
$(() => {
    $('#loaderWrapper').hide();
    $('#contentWrapper').show();
});