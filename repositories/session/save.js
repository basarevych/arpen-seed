/**
 * SessionRepository.save()
 */
'use strict';

const NError = require('nerror');

/**
 * Save session
 * @method save
 * @memberOf module:repositories/session~SessionRepository
 * @param {SessionModel} session            Session model
 * @param {PostgresClient|string} [pg]      Will reuse the Postgres client provided, or if string then will connect to
 *                                          this instance of Postgres.
 * @return {Promise}                        Resolves to record ID
 */
module.exports = function (session, pg) {
    return Promise.resolve()
        .then(() => {
            if (typeof pg === 'object')
                return pg;

            return this._postgres.connect(pg);
        })
        .then(client => {
            return Promise.resolve()
                .then(() => {
                    let data = session._serialize();
                    let fields = Object.keys(data)
                        .filter(field => {
                            return field !== 'id';
                        });

                    let query, params = [];
                    if (session.id) {
                        query = 'UPDATE sessions SET ';
                        query += fields
                            .map(field => {
                                params.push(data[field]);
                                return `${field} = $${params.length}`;
                            })
                            .join(', ');
                        params.push(data.id);
                        query += ` WHERE id = $${params.length}`;
                    } else {
                        query = 'INSERT INTO sessions(';
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
                        throw new Error('Failed to ' + (session.id ? 'UPDATE' : 'INSERT') + ' row');

                    if (!session.id) {
                        session.id = result.rows[0].id;
                        session._dirty = false;
                    }

                    return session.id;
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
            throw new NError(error, 'SessionRepository.save()');
        });
};
