/**
 * RoleRepository.findByUser()
 */
'use strict';

const NError = require('nerror');

/**
 * Find roles by user
 * @method findByUser
 * @memberOf module:repositories/role~RoleRepository
 * @param {UserModel|number} user           User to search by
 * @param {PostgresClient|string} [pg]      Will reuse the Postgres client provided, or if string then will connect to
 *                                          this instance of Postgres.
 * @return {Promise}                        Resolves to array of models
 */
module.exports = function (user, pg) {
    let key = `sql:${this.constructor.table}-by-user-id:${typeof user === 'object' ? user.id : user}`;

    return Promise.resolve()
        .then(() => {
            if (this._enableCache)
                return this._cacher.get(key);
        })
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
                            `    SELECT r.*
                                   FROM roles r
                             INNER JOIN user_roles ur
                                     ON r.id = ur.role_id
                                  WHERE ur.user_id = $1`,
                            [ typeof user === 'object' ? user.id : user ]
                        )
                        .then(result => {
                            let rows = result.rowCount ? result.rows : [];
                            if (!rows.length || !this._enableCache)
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
                        let model = this.getModel();
                        model._unserialize(row);
                        models.push(model);
                    }

                    return models;
                });
        })
        .catch(error => {
            throw new NError(error, 'RoleRepository.findByUser()');
        });
};
