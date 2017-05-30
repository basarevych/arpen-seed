/**
 * RoleRepository.delete()
 */
'use strict';

const NError = require('nerror');

/**
 * Delete a role
 * @method delete
 * @memberOf module:repositories/role~RoleRepository
 * @param {RoleModel|number} role           Role model or ID
 * @param {PostgresClient|string} [pg]      Will reuse the Postgres client provided, or if string then will connect to
 *                                          this instance of Postgres.
 * @return {Promise}                        Resolves to number of deleted records
 */
module.exports = function (role, pg) {
    return Promise.resolve()
        .then(() => {
            if (typeof pg === 'object')
                return pg;

            return this._postgres.connect(pg);
        })
        .then(client => {
            return client.query(
                    'DELETE ' +
                    '  FROM roles ' +
                    ' WHERE id = $1 ',
                    [ typeof role === 'object' ? role.id : role ]
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
            throw new NError(error, 'RoleRepository.delete()');
        });
};
