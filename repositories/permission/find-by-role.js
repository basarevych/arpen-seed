/**
 * PermissionRepository.findByRole()
 */
'use strict';

const NError = require('nerror');

/**
 * Find permissions by role
 * @instance
 * @method findByRole
 * @memberOf module:repositories/permission~PermissionRepository
 * @param {RoleModel|number} role           Role to search by
 * @param {PostgresClient|string} [pg]      Will reuse the Postgres client provided, or if string then will connect to
 *                                          this instance of Postgres.
 * @return {Promise}                        Resolves to array of models
 */
module.exports = async function (role, pg) {
    let key = `sql:${this.constructor.table}-by-role-id:${typeof role === 'object' ? role.id : role}`;
    let client;

    try {
        if (this._enableCache) {
            let value = await this._cacher.get(key);
            if (value)
                return value;
        }

        client = typeof pg === 'object' ? pg : await this._postgres.connect(pg);
        let result = await client.query(
            `SELECT *
               FROM permissions
              WHERE role_id = $1`,
            [ typeof role === 'object' ? role.id : role ]
        );
        let rows = result.rowCount ? result.rows : [];

        if (this._enableCache)
            await this._cacher.set(key, rows);

        let models = [];
        for (let row of rows) {
            let model = this.getModel();
            model._unserialize(row);
            models.push(model);
        }

        if (typeof pg !== 'object')
            client.done();

        return models;
    } catch (error) {
        if (client && typeof pg !== 'object')
            client.done();

        throw new NError(error, { role }, 'PermissionRepository.findByRole()');
    }
};
