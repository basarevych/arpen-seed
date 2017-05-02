'use strict';

export class Cookie {
    static set(name, value, lifetime) {
        let expires = '';
        if (lifetime) {
            let date = new Date();
            date.setTime(date.getTime() + lifetime);
            expires = "; expires=" + date.toGMTString();
        }

        document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + "; path=/";
    }

    static get(name) {
        for (let cookie of document.cookie.split(';')) {
            let [ thisName, thisValue ] = cookie.trim().split('=');
            if (decodeURIComponent(thisName) === name)
                return decodeURIComponent(thisValue);
        }

        return null;
    }

    static del(name) {
        return this.set(name, '', -1 * 24 * 60 * 60 * 1000);
    }
}
