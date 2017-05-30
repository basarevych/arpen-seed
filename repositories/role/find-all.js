/**
 * RoleRepository.findAll()
 */
'use strict';

const NError = require('nerror');

/**
 * Find all roles
 * @method findAll
 * @memberOf module:repositories/role~RoleRepository
 * @param {PostgresClient|string} [pg]      Will reuse the Postgres client provided, or if string then will connect to
 *                                          this instance of Postgres.
 * @return {Promise}                        Resolves to array of models
 */
module.exports = function (pg) {
    return Promise.resolve()
        .then(() => {
            if (typeof pg === 'object')
                return pg;

            return this._postgres.connect(pg);
        })
        .then(client => {
            return client.query(
                    'SELECT * ' +
                    '  FROM roles ',
                    []
                )
                .then(result => {
                    return result.rowCount ? result.rows : [];
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
                let model = this.getModel('role');
                model._unserialize(row);
                models.push(model);
            }

            return models;
        })
        .catch(error => {
            throw new NError(error, 'RoleRepository.findAll()');
        });
};
