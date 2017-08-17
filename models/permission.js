/**
 * Permission model
 * @module models/permission
 */
const BaseModel = require('arpen/src/models/base');

/**
 * Permission model class
 */
class PermissionModel extends BaseModel {
    /**
     * Create model
     * @param {Postgres} postgres       Postgres service
     * @param {Util} util               Util service
     */
    constructor(postgres, util) {
        super(postgres, util);

        this.roleId = undefined;
        this.resource = undefined;
        this.action = undefined;
    }

    /**
     * Service name is 'models.permission'
     * @type {string}
     */
    static get provides() {
        return 'models.permission';
    }

    /**
     * Role ID setter
     * @type {undefined|number}
     */
    set roleId(id) {
        return this._setField('role_id', id);
    }

    /**
     * Role ID getter
     * @type {undefined|number}
     */
    get roleId() {
        return this._getField('role_id');
    }

    /**
     * Resource setter
     * @type {undefined|string|null}
     */
    set resource(resource) {
        return this._setField('resource', resource);
    }

    /**
     * Resource getter
     * @type {undefined|string|null}
     */
    get resource() {
        return this._getField('resource');
    }

    /**
     * Action setter
     * @type {undefined|string|null}
     */
    set action(action) {
        return this._setField('action', action);
    }

    /**
     * Action getter
     * @type {undefined|string|null}
     */
    get action() {
        return this._getField('action');
    }
}

module.exports = PermissionModel;
