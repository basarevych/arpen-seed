/**
 * AccountRepository.delete()
 */
'use strict';

const WError = require('verror').WError;

/**
 * Delete a account
 * @method delete
 * @memberOf module:repositories/account~AccountRepository
 * @param {AccountModel|number} account     Account model or ID
 * @param {PostgresClient|string} [pg]      Will reuse the Postgres client provided, or if string then will connect to
 *                                          this instance of Postgres.
 * @return {Promise}                        Resolves to number of deleted records
 */
module.exports = function (account, pg) {
    return Promise.resolve()
        .then(() => {
            if (typeof pg === 'object')
                return pg;

            return this._postgres.connect(pg);
        })
        .then(client => {
            return client.query(
                    'DELETE ' +
                    '  FROM accounts ' +
                    ' WHERE id = $1 ',
                    [ typeof account === 'object' ? account.id : account ]
                )
                .then(result => {
                    return result.rowCount;
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
            throw new WError(error, 'AccountRepository.delete()');
        });
};
