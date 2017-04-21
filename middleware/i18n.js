/**
 * I18N middleware
 * @module middleware/i18n
 */
const fs = require('fs');
const path = require('path');
const merge = require('merge');

/**
 * Internationalization
 */
class I18n {
    /**
     * Create the service
     * @param {object} config           Configuration
     */
    constructor(config) {
        this.locale = 'en';
        this.translations = {};
        this.formatters = new Map();

        this._config = config;
        this._loaded = false;
    }

    /**
     * Service name is 'middleware.i18n'
     * @type {string}
     */
    static get provides() {
        return 'middleware.i18n';
    }

    /**
     * Dependencies as constructor arguments
     * @type {string[]}
     */
    static get requires() {
        return [ 'config' ];
    }

    /**
     * Register middleware
     * @param {Express} server          The server
     * @return {Promise}
     */
    register(server) {
        return Promise.resolve()
            .then(() => {
                if (this._loaded)
                    return;

                this._loaded = true;
                return new Promise((resolve, reject) => {
                    try {
                        for (let [ moduleName, moduleConfig ] of this._config.modules) {
                            for (let dir of moduleConfig.i18n || []) {
                                let filename = dir[0] === '/' ?
                                    dir :
                                    path.join(this._config.base_path, 'modules', moduleName, dir);

                                for (let file of fs.readdirSync(filename)) {
                                    if (!file.endsWith('.json'))
                                        continue;

                                    let locale = path.basename(file, '.json');
                                    if (!this.translations[locale])
                                        this.translations[locale] = {};

                                    merge.recursive(this.translations[locale], require(path.join(filename, file)));
                                }
                            }
                        }

                        for (let locale of Object.keys(this.translations)) {
                            let formatMessage = require('format-message');
                            formatMessage.setup({
                                locale: locale,
                                translations: this.translations,
                            });
                            this.formatters.set(locale, formatMessage);
                        }

                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                });
            })
            .then(() => {
                server.express.use((req, res, next) => {
                    res.locals.i18n = this.translate.bind(this);
                    next();
                });
            });
    }

    /**
     * Translate message
     * @param {string} id
     * @param {object} [options]
     * @param {string} [locale]
     */
    translate(id, ...args) {
        let options = {}, locale = this.locale;
        if (args.length >= 2) {
            options = args[0];
            locale = args[1];
        } else if (args.length === 1) {
            if (typeof args[0] === 'object')
                options = args[0];
            else
                locale = args[0];
        }

        let formatter = this.formatters.get(locale);
        if (!formatter)
            throw new Error(`Locale ${locale} not found`);

        return formatter(id, options);
    }
}

module.exports = I18n;