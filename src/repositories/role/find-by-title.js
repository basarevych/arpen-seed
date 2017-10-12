/**
 * RoleRepository.findByTitle()
 */
'use strict';

const NError = require('nerror');

/**
 * Find roles by title
 * @instance
 * @method findByTitle
 * @memberOf module:repositories/role~RoleRepository
 * @param {string} title                    Title to search by
 * @param {PostgresClient|string} [pg]      Will reuse the Postgres client provided, or if string then will connect to
 *                                          this instance of Postgres.
 * @return {Promise}                        Resolves to array of models
 */
module.exports = async function (title, pg) {
    let client;

    try {
        client = typeof pg === 'object' ? pg : await this._postgres.connect(pg);
        let result = await client.query(
            `SELECT *
               FROM roles
              WHERE title = $1`,
            [ title ]
        );
        let rows = result.rowCount ? result.rows : [];

        if (typeof pg !== 'object')
            client.done();

        return this.getModel(rows);
    } catch (error) {
        if (client && typeof pg !== 'object')
            client.done();

        throw new NError(error, { title }, 'RoleRepository.findByTitle()');
    }
};
