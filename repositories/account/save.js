/**
 * AccountRepository.save()
 */
'use strict';

const WError = require('verror').WError;

/**
 * Save account
 * @method save
 * @memberOf module:repositories/account~AccountRepository
 * @param {AccountModel} account            Account model
 * @param {PostgresClient|string} [pg]      Will reuse the Postgres client provided, or if string then will connect to
 *                                          this instance of Postgres.
 * @return {Promise}                        Resolves to record ID
 */
module.exports = function (account, pg) {
    return Promise.resolve()
        .then(() => {
            if (typeof pg === 'object')
                return pg;

            return this._postgres.connect(pg);
        })
        .then(client => {
            return Promise.resolve()
                .then(() => {
                    let data = account._serialize();
                    let fields = Object.keys(data)
                        .filter(field => {
                            return field !== 'id';
                        });

                    let query, params = [];
                    if (account.id) {
                        query = 'UPDATE accounts SET ';
                        query += fields
                            .map(field => {
                                params.push(data[field]);
                                return `${field} = $${params.length}`;
                            })
                            .join(', ');
                        params.push(data.id);
                        query += ` WHERE id = $${params.length}`;
                    } else {
                        query = 'INSERT INTO accounts(';
                        query += fields.join(', ');
                        query += ') VALUES (';
                        query += fields
                            .map(field => {
                                params.push(data[field]);
                                return `$${params.length}`;
                            })
                            .join(', ');
                        query += ') RETURNING id';
                    }
                    return client.query(query, params);
                })
                .then(result => {
                    if (result.rowCount !== 1)
                        throw new Error('Failed to ' + (account.id ? 'UPDATE' : 'INSERT') + ' row');

                    if (!account.id) {
                        account.id = result.rows[0].id;
                        account._dirty = false;
                    }

                    return account.id;
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
        .catch(error => {
            throw new WError(error, 'AccountRepository.save()');
        });
};
