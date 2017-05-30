/**
 * UserRepository.addRole()
 */
'use strict';

const NError = require('nerror');

/**
 * Add role to the user
 * @method addRole
 * @memberOf module:repositories/user~UserRepository
 * @param {UserModel|number} user           User model or ID
 * @param {RoleModel|number} role           Role model or ID
 * @param {PostgresClient|string} [pg]      Will reuse the Postgres client provided, or if string then will connect to
 *                                          this instance of Postgres.
 * @return {Promise}                        Resolves to a number of new records
 */
module.exports = function (user, role, pg) {
    return Promise.resolve()
        .then(() => {
            if (typeof pg === 'object')
                return pg;

            return this._postgres.connect(pg);
        })
        .then(client => {
            return client.transaction({ name: 'user_add_role' }, rollback => {
                    return client.query(
                            'SELECT * ' +
                            '  FROM user_roles ' +
                            ' WHERE user_id = $1 ' +
                            '   AND role_id = $2 ',
                            [
                                typeof user === 'object' ? user.id : user,
                                typeof role === 'object' ? role.id : role,
                            ]
                        )
                        .then(result => {
                            if (result.rowCount)
                                return 0;

                            return client.query(
                                    'INSERT ' +
                                    '  INTO user_roles(user_id, role_id) ' +
                                    'VALUES ($1, $2) ',
                                    [
                                        typeof user === 'object' ? user.id : user,
                                        typeof role === 'object' ? role.id : role,
                                    ]
                                )
                                .then(() => {
                                    return 1;
                                });
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
        })
        .catch(error => {
            throw new NError(error, 'UserRepository.addRole()');
        });
};
