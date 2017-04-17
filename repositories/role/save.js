/**
 * RoleRepository.save()
 */
'use strict';

const WError = require('verror').WError;

/**
 * Save role
 * @method save
 * @memberOf module:repositories/role~RoleRepository
 * @param {RoleModel} role                  Role model
 * @param {PostgresClient|string} [pg]      Will reuse the Postgres client provided, or if string then will connect to
 *                                          this instance of Postgres.
 * @return {Promise}                        Resolves to record ID
 */
module.exports = function (role, pg) {
    return Promise.resolve()
        .then(() => {
            if (typeof pg === 'object')
                return pg;

            return this._postgres.connect(pg);
        })
        .then(client => {
            return Promise.resolve()
                .then(() => {
                    let data = this._postgres.constructor.serializeModel(role);
                    let fields = Object.keys(data)
                        .filter(field => {
                            return field !== 'id';
                        });

                    let query, params = [];
                    if (role.id) {
                        query = 'UPDATE roles SET ';
                        query += fields
                            .map(field => {
                                params.push(data[field]);
                                return `${field} = $${params.length}`;
                            })
                            .join(', ');
                        params.push(data.id);
                        query += ` WHERE id = $${params.length}`;
                    } else {
                        query = 'INSERT INTO roles(';
                        query += fields.join(', ');
                        query += ') VALUES (';
                        query += fields
                            .map(field => {
                                params.push(data[field]);
                                return `$${params.length}`;
                            })
                            .join(', ');
                        query += ') RETURNING id';
                    }
                    return client.query(query, params);
                })
                .then(result => {
                    if (result.rowCount !== 1)
                        throw new Error('Failed to ' + (role.id ? 'UPDATE' : 'INSERT') + ' row');

                    if (!role.id) {
                        role.id = result.rows[0].id;
                        role._dirty = false;
                    }

                    return role.id;
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
            throw new WError(error, 'RoleRepository.save()');
        });
};
