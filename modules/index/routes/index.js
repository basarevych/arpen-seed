/**
 * Index route
 * @module index/routes/index
 */
const express = require('express');

/**
 * Index route class
 */
class IndexRoute {
    /**
     * Create service
     */
    constructor() {
        this.priority = 0;
        this.router = express.Router();
        this.router.get('/', this.getIndex.bind(this));
    }

    /**
     * Service name is 'routes.index'
     * @type {string}
     */
    static get provides() {
        return 'routes.index';
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
