'use strict';

import 'bootstrap';
import 'styles/index.scss';
import 'auth';
import 'account';

/**
 * Hide loader
 */
$(window).on('load', () => {
    $('#loaderWrapper').hide();
    $('#contentWrapper').show();
});