/**
 * ACL
 * @module services/acl
 */

/**
 * ACL class
 */
class Acl {
    /**
     * Create service
     * @param {ErrorHelper} error                       Error service
     * @param {RoleRepository} roleRepo                 Role repository
     * @param {PermissionRepository} permRepo           Permission repository
     */
    constructor(error, roleRepo, permRepo) {
        this._error = error;
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
        return [ 'error', 'repositories.role', 'repositories.permission' ];
    }

    /**
     * Check action is allowed
     * @param {UserModel} user                          User
     * @param {string} resource                         Resource
     * @param {string} action                           Action
     * @return {Promise}                                Resolves if allowed
     */
    check(user, resource, action) {
        if (!user || !user.id)
            return Promise.reject(this._error.newUnauthorized());

        // All user permissions
        let allPermissions = [];

        /**
         * Recursively load role permissions
         * @param {RoleModel} role
         * @return {Promise}
         */
        let loadRolePermissions = role => {
            return this._permRepo.findByRole(role)
                .then(permissions => {
                    allPermissions = allPermissions.concat(permissions);

                    if (!role.parentId)
                        return;

                    return this._roleRepo.find(role.parentId)
                        .then(roles => {
                            let parentRole = roles.length && roles[0];
                            if (parentRole)
                                return loadRolePermissions(parentRole);
                        });
                });
        };

        return this._roleRepo.findByUser(user)
            .then(roles => {
                if (!roles.length)
                    throw this._error.newForbidden();

                let promises = [];
                for (let role of roles)
                    promises.push(loadRolePermissions(role));

                return Promise.all(promises)
                    .then(() => {
                        if (!allPermissions.length)
                            throw this._error.newForbidden();

                        let allowed = allPermissions.some(permission => {
                            let resourceAllowed = (permission.resource === null) || (permission.resource === resource);
                            let actionAllowed = (permission.action === null) || (permission.action === action);
                            return resourceAllowed && actionAllowed;
                        });

                        if (!allowed)
                            throw this._error.newForbidden();
                    });
            });
    }
}

module.exports = Acl;