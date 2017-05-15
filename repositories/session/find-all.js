/**
 * SessionRepository.findAll()
 */
'use strict';

const WError = require('verror').WError;

/**
 * Find all sessions
 * @method findAll
 * @memberOf module:repositories/session~SessionRepository
 * @param {PostgresClient|string} [pg]      Will reuse the Postgres client provided, or if string then will connect to
 *                                          this instance of Postgres.
 * @return {Promise}                        Resolves to array of models
 */
module.exports = function (pg) {
    return Promise.resolve()
        .then(() => {
            if (typeof pg === 'object')
                return pg;

            return this._postgres.connect(pg);
        })
        .then(client => {
            return client.query(
                    'SELECT * ' +
                    '  FROM sessions ',
                    []
                )
                .then(result => {
                    return result.rowCount ? result.rows : [];
                })
                .then(
                    value => {
                        if (typeof pg !== 'object')
                            client.done();
                        return value;
                    },
                    error => {
                        if (typeof pg !== 'object')
                            client.done();
                        throw error;
                    }
                );
        })
        .then(rows => {
            let models = [];
            for (let row of rows) {
                let model = this.getModel('session');
                model._unserialize(row);
                models.push(model);
            }

            return models;
        })
        .catch(error => {
            throw new WError(error, 'SessionRepository.findAll()');
        });
};
