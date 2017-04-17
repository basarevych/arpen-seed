/**
 * UserRepository.removeRole()
 */
'use strict';

const WError = require('verror').WError;

/**
 * Remove role from a user
 * @method removeRole
 * @memberOf module:repositories/user~UserRepository
 * @param {UserModel|number} user           User model or ID
 * @param {RoleModel|number} role           Role model or ID
 * @param {PostgresClient|string} [pg]      Will reuse the Postgres client provided, or if string then will connect to
 *                                          this instance of Postgres.
 * @return {Promise}                        Resolves to number of deleted records
 */
module.exports = function (user, role, pg) {
    return Promise.resolve()
        .then(() => {
            if (typeof pg === 'object')
                return pg;

            return this._postgres.connect(pg);
        })
        .then(client => {
            return client.query(
                    'DELETE ' +
                    '  FROM user_roles ' +
                    ' WHERE user_id = $1 ' +
                    '   AND role_id = $2 ',
                    [
                        typeof user === 'object' ? user.id : user,
                        typeof role === 'object' ? role.id : role
                    ]
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
            throw new WError(error, 'UserRepository.removeRole()');
        });
};
