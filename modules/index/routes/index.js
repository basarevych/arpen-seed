/**
 * Index route
 * @module index/routes/index
 */
const express = require('arpen-express').Express;

/**
 * Index route class
 */
class IndexRoute {
    /**
     * Create service
     */
    constructor() {
        this.router = express.Router();
        this.router.get('/', this.getIndex.bind(this));
    }

    /**
     * Service name is 'modules.index.routes.index'
     * @type {string}
     */
    static get provides() {
        return 'modules.index.routes.index';
    }

    /**
     * Dependencies as constructor arguments
     * @type {string[]}
     */
    static get requires() {
        return [];
    }

    /**
     * Main route
     * @param {object} req          Express request
     * @param {object} res          Express response
     * @param {function} next       Express next middleware function
     */
    getIndex(req, res, next) {
        res.render('index');
    }
}

module.exports = IndexRoute;
