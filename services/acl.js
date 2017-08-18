/**
 * ACL
 * @module services/acl
 */
const NError = require('nerror');

/**
 * ACL class
 */
class Acl {
    /**
     * Create service
     * @param {RoleRepository} roleRepo                 Role repository
     * @param {PermissionRepository} permRepo           Permission repository
     */
    constructor(roleRepo, permRepo) {
        this._roleRepo = roleRepo;
        this._permRepo = permRepo;
    }

    /**
     * Service name is 'acl'
     * @type {string}
     */
    static get provides() {
        return 'acl';
    }

    /**
     * Dependencies as constructor arguments
     * @type {string[]}
     */
    static get requires() {
        return [ 'repositories.role', 'repositories.permission' ];
    }

    /**
     * Check action is allowed
     * @param {UserModel} user                          User
     * @param {string} resource                         Resource
     * @param {string} action                           Action
     * @return {Promise}                                Resolves if allowed
     */
    async check(user, resource, action) {
        if (!user || !user.id)
            throw new NError({ httpStatus: 401 }, 'Not Authorized');

        // All user permissions
        let allPermissions = [];

        /**
         * Recursively load role permissions
         * @param {RoleModel} role
         * @return {Promise}
         */
        let loadRolePermissions = async role => {
            let permissions = await this._permRepo.findByRole(role);
            allPermissions = allPermissions.concat(permissions);

            if (!role.parentId)
                return;

            let roles = await this._roleRepo.find(role.parentId);
            let parentRole = roles.length && roles[0];
            if (parentRole)
                return loadRolePermissions(parentRole);
        };

        let roles = await this._roleRepo.findByUser(user);
        if (!roles.length)
            throw new NError({ httpStatus: 403 }, 'Forbidden');

        let promises = [];
        for (let role of roles)
            promises.push(loadRolePermissions(role));

        await Promise.all(promises);

        if (!allPermissions.length)
            throw new NError({ httpStatus: 403 }, 'Forbidden');

        let allowed = allPermissions.some(permission => {
            let resourceAllowed = (permission.resource === null) || (permission.resource === resource);
            let actionAllowed = (permission.action === null) || (permission.action === action);
            return resourceAllowed && actionAllowed;
        });

        if (!allowed)
            throw new NError({ httpStatus: 403 }, 'Forbidden');
    }
}

module.exports = Acl;
