/**
 * UserRepository.removeRole()
 */
'use strict';

const NError = require('nerror');

/**
 * Remove role from a user
 * @instance
 * @method removeRole
 * @memberOf module:repositories/user~UserRepository
 * @param {UserModel|number} user           User model or ID
 * @param {RoleModel|number} role           Role model or ID
 * @param {PostgresClient|string} [pg]      Will reuse the Postgres client provided, or if string then will connect to
 *                                          this instance of Postgres.
 * @return {Promise}                        Resolves to number of deleted records
 */
module.exports = async function (user, role, pg) {
    let client;

    try {
        client = typeof pg === 'object' ? pg : await this._postgres.connect(pg);
        let result = await client.query(
            `DELETE
               FROM user_roles
              WHERE user_id = $1
                AND role_id = $2`,
            [
                typeof user === 'object' ? user.id : user,
                typeof role === 'object' ? role.id : role
            ]
        );

        if (typeof pg !== 'object')
            client.done();

        return result.rowCount;
    } catch (error) {
        if (client && typeof pg !== 'object')
            client.done();

        throw new NError(error, { user, role }, 'UserRepository.removeRole()');
    }
};
