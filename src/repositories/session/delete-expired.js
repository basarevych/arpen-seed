/**
 * SessionRepository.deleteExpired()
 */
'use strict';

const moment = require('moment-timezone');
const NError = require('nerror');

/**
 * Delete expired models
 * @instance
 * @method deleteExpired
 * @memberOf module:repositories/session~SessionRepository
 * @param {number} expiration               Number of seconds
 * @param {PostgresClient|string} [pg]      Will reuse the Postgres client provided, or if string then will connect to
 *                                          this instance of Postgres.
 * @return {Promise}                        Resolves to number of deleted records
 */
module.exports = async function (expiration, pg) {
    let client;

    try {
        let exp = this.getModel();
        exp.updatedAt = moment().subtract(expiration, 'seconds');

        client = typeof pg === 'object' ? pg : await this._postgres.connect(pg || this.constructor.instance);
        let result = await client.query(
            `DELETE 
               FROM ${this.constructor.table}
              WHERE updated_at < $1`,
            [ exp._serialize({ timeZone: this.constructor.timeZone }).updated_at ]
        );

        if (typeof pg !== 'object')
            client.done();

        return result.rowCount;
    } catch (error) {
        if (client && typeof pg !== 'object')
            client.done();

        throw new NError(error, { expiration }, 'SessionRepository.deleteExpired()');
    }
};
