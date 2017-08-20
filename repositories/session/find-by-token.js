/**
 * SessionRepository.findByToken()
 */
'use strict';

const NError = require('nerror');

/**
 * Find sessions by token
 * @instance
 * @method findByToken
 * @memberOf module:repositories/session~SessionRepository
 * @param {string} token                    Token to search by
 * @param {PostgresClient|string} [pg]      Will reuse the Postgres client provided, or if string then will connect to
 *                                          this instance of Postgres.
 * @return {Promise}                        Resolves to array of models
 */
module.exports = async function (token, pg) {
    let key = `sql:${this.constructor.table}-by-token:${token}`;
    let client;

    try {
        if (this._enableCache) {
            let value = await this._cacher.get(key);
            if (value)
                return this.getModel(value);
        }

        client = typeof pg === 'object' ? pg : await this._postgres.connect(pg);
        let result = await client.query(
            `SELECT *
               FROM sessions
              WHERE token = $1`,
            [ token ]
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

        throw new NError(error, { token }, 'SessionRepository.findByToken()');
    }
};
