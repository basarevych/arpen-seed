/**
 * SessionRepository.findByToken()
 */
'use strict';

const WError = require('verror').WError;

/**
 * Find sessions by token
 * @method findByToken
 * @memberOf module:repositories/session~SessionRepository
 * @param {string} token                    Token to search by
 * @param {PostgresClient|string} [pg]      Will reuse the Postgres client provided, or if string then will connect to
 *                                          this instance of Postgres.
 * @return {Promise}                        Resolves to array of models
 */
module.exports = function (token, pg) {
    let key = `sql:sessions-by-token:${token}`;

    return this._cacher.get(key)
        .then(value => {
            if (value)
                return value;

            return Promise.resolve()
                .then(() => {
                    if (typeof pg === 'object')
                        return pg;

                    return this._postgres.connect(pg);
                })
                .then(client => {
                    return client.query(
                            'SELECT * ' +
                            '  FROM sessions ' +
                            ' WHERE token = $1 ',
                            [ token ]
                        )
                        .then(result => {
                            let rows = result.rowCount ? result.rows : [];
                            if (!rows.length)
                                return rows;

                            return this._cacher.set(key, rows)
                                .then(() => {
                                    return rows;
                                });
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
                });
        })
        .then(rows => {
            let models = [];
            for (let row of rows) {
                let model = this.create();
                this._postgres.constructor.unserializeModel(model, row);
                models.push(model);
            }

            return models;
        })
        .catch(error => {
            throw new WError(error, 'SessionRepository.findByToken()');
        });
};
