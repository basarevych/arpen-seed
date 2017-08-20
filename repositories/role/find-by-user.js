/**
 * RoleRepository.findByUser()
 */
'use strict';

const NError = require('nerror');

/**
 * Find roles by user
 * @instance
 * @method findByUser
 * @memberOf module:repositories/role~RoleRepository
 * @param {UserModel|number} user           User to search by
 * @param {PostgresClient|string} [pg]      Will reuse the Postgres client provided, or if string then will connect to
 *                                          this instance of Postgres.
 * @return {Promise}                        Resolves to array of models
 */
module.exports = async function (user, pg) {
    let key = `sql:${this.constructor.table}-by-user-id:${typeof user === 'object' ? user.id : user}`;
    let client;

    try {
        if (this._enableCache) {
            let value = await this._cacher.get(key);
            if (value)
                return this.getModel(value);
        }

        client = typeof pg === 'object' ? pg : await this._postgres.connect(pg);
        let result = await client.query(
            `    SELECT r.*
                   FROM roles r
             INNER JOIN user_roles ur
                     ON r.id = ur.role_id
                  WHERE ur.user_id = $1`,
            [ typeof user === 'object' ? user.id : user ]
        );
        let rows = result.rowCount ? result.rows : [];

        if (this._enableCache)
            await this._cacher.set(key, rows);

        if (typeof pg !== 'object')
            client.done();

        return this.getModel(rows);
    } catch (error) {
        if (client && typeof pg !== 'object')
            client.done();

        throw new NError(error, { user }, 'RoleRepository.findByUser()');
    }
};
