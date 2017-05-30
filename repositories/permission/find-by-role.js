/**
 * PermissionRepository.findByRole()
 */
'use strict';

const NError = require('nerror');

/**
 * Find permissions by role
 * @method findByRole
 * @memberOf module:repositories/permission~PermissionRepository
 * @param {RoleModel|number} role           Role to search by
 * @param {PostgresClient|string} [pg]      Will reuse the Postgres client provided, or if string then will connect to
 *                                          this instance of Postgres.
 * @return {Promise}                        Resolves to array of models
 */
module.exports = function (role, pg) {
    let key = `sql:permissions-by-role-id:${typeof role === 'object' ? role.id : role}`;

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
                            '    SELECT * ' +
                            '      FROM permissions ' +
                            '     WHERE role_id = $1 ',
                            [ typeof role === 'object' ? role.id : role ]
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
                })
                .then(rows => {
                    let models = [];
                    for (let row of rows) {
                        let model = this.getModel('permission');
                        model._unserialize(row);
                        models.push(model);
                    }

                    return models;
                });
        })
        .catch(error => {
            throw new NError(error, 'PermissionRepository.findByRole()');
        });
};
