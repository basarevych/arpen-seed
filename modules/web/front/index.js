/**
 * Front index module
 * @module front/index
 */
'use strict';

import 'bootstrap';
import 'auth';
import 'account';

/**
 * Hide loader on start
 */
$(window).on('load', () => {
    $('#loaderWrapper').hide();
    $('#contentWrapper').show();
});
