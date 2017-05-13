/**
 * Role model
 * @module models/role
 */
const BaseModel = require('./base');

/**
 * Role model class
 */
class RoleModel extends BaseModel {
    /**
     * Create model
     * @param {Postgres} postgres       Postgres service
     * @param {Util} util               Util service
     */
    constructor(postgres, util) {
        super(postgres, util);

        this.id = undefined;
        this.parentId = undefined;
        this.title = undefined;
    }

    /**
     * Service name is 'models.role'
     * @type {string}
     */
    static get provides() {
        return 'models.role';
    }

    /**
     * Dependencies as constructor arguments
     * @type {string[]}
     */
    static get requires() {
        return [ 'postgres', 'util' ];
    }

    /**
     * ID setter
     * @type {undefined|number}
     */
    set id(id) {
        return this._setField('id', id);
    }

    /**
     * ID getter
     * @type {undefined|number}
     */
    get id() {
        return this._getField('id');
    }

    /**
     * Parent ID setter
     * @type {undefined|number|null}
     */
    set parentId(id) {
        return this._setField('parent_id', id);
    }

    /**
     * Parent ID getter
     * @type {undefined|number|null}
     */
    get parentId() {
        return this._getField('parent_id');
    }

    /**
     * Title setter
     * @type {undefined|string}
     */
    set title(name) {
        return this._setField('title', name);
    }

    /**
     * Title getter
     * @type {undefined|string}
     */
    get title() {
        return this._getField('title');
    }
}

module.exports = RoleModel;
