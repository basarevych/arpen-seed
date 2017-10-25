/**
 * SessionRepository.save()
 */
'use strict';

const NError = require('nerror');

/**
 * Save model
 * @instance
 * @method save
 * @memberOf module:repositories/session~SessionRepository
 * @param {BaseModel} model                 The model
 * @param {PostgresClient|string} [pg]      Will reuse the Postgres client provided, or if string then will connect to
 *                                          this instance of Postgres.
 * @return {Promise}                        Resolves to record ID
 */
module.exports = async function (model, pg) {
    let client;

    try {
        client = typeof pg === 'object' ? pg : await this._mysql.connect(pg || this.constructor.instance);

        let result = await client.transaction({ name: 'session_save' }, async rollback => {
            if (!model.id)
                return this.__save(model, client);

            let sessions = await this.find(model.id, client);
            let old = sessions.length && sessions[0];
            if (!old)
                return this.__save(model, client);

            if (old.updatedAt.isBefore(model.updatedAt))
                return this.__save(model, client);

            return rollback(model.id);
        });

        if (typeof pg !== 'object')
            client.done();

        return result;
    } catch (error) {
        if (client && typeof pg !== 'object')
            client.done();

        throw new NError(error, { model }, 'SessionRepository.save()');
    }
};
