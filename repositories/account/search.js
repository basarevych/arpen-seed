/**
 * AccountRepository.search()
 */
'use strict';

const moment = require('moment-timezone');

/**
 * Find accounts by query
 * @method search
 * @memberOf module:repositories/account~AccountRepository
 * @param {object} [options]                Base Repository.search() options
 * @param {PostgresClient|string} [pg]      Will reuse the Postgres client provided, or if string then will connect to
 *                                          this instance of Postgres.
 * @return {Promise}                        Resolves to sanitized base Repository.search() result (dates are converted
 *                                          to a number of milliseconds since Epoch)
 */
module.exports = function (options, pg) {
    return this.prototype.search(
            'accounts',
            [
                'id',
                'user_id',
                'source',
                'confirmed',
                'created_at',
            ],
            options,
            pg
        )
        .then(result => {
            for (let row of result.data) {
                for (let field of Object.keys(row)) {
                    let value = row[field];
                    if (value instanceof Date) {
                        let utcMoment = moment(value); // db field is in UTC
                        row[field] = moment.tz(utcMoment.format(this._postgres.constructor.datetimeFormat), 'UTC').valueOf();
                    }
                }
            }
            return result;
        });
};
