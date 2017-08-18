/**
 * UserRepository.addRole()
 */
'use strict';

const NError = require('nerror');

/**
 * Add role to the user
 * @instance
 * @method addRole
 * @memberOf module:repositories/user~UserRepository
 * @param {UserModel|number} user           User model or ID
 * @param {RoleModel|number} role           Role model or ID
 * @param {PostgresClient|string} [pg]      Will reuse the Postgres client provided, or if string then will connect to
 *                                          this instance of Postgres.
 * @return {Promise}                        Resolves to a number of new records
 */
module.exports = async function (user, role, pg) {
    let client;

    try {
        client = typeof pg === 'object' ? pg : await this._postgres.connect(pg);
        let value = await client.transaction({ name: 'user_add_role' }, async () => {
            let result = await client.query(
                `SELECT *
                   FROM user_roles
                  WHERE user_id = $1
                    AND role_id = $2`,
                [
                    typeof user === 'object' ? user.id : user,
                    typeof role === 'object' ? role.id : role,
                ]
            );
            if (result.rowCount)
                return 0;

            result = await client.query(
                `INSERT 
                   INTO user_roles(user_id, role_id)
                 VALUES ($1, $2)`,
                [
                    typeof user === 'object' ? user.id : user,
                    typeof role === 'object' ? role.id : role,
                ]
            );
            return result.rowCount;
        });

        if (typeof pg !== 'object')
            client.done();

        return value;
    } catch (error) {
        if (client && typeof pg !== 'object')
            client.done();

        throw new NError(error, { user, role }, 'UserRepository.addRole()');
    }
};
