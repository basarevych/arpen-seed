/**
 * User command
 * @module commands/user
 */
const path = require('path');
const fs = require('fs');
const argvParser = require('argv');
const moment = require('moment-timezone');

/**
 * Command class
 */
class User {
    /**
     * Create the service
     * @param {App} app                     The application
     * @param {object} config               Configuration
     * @param {ErrorHelper} error           Error service
     * @param {Util} util                   Util service
     * @param {Help} help                   Help command
     * @param {UserRepository} userRepo     User repository
     * @param {RoleRepository} roleRepo     Role repository
     */
    constructor(app, config, error, util, help, userRepo, roleRepo) {
        this._app = app;
        this._config = config;
        this._error = error;
        this._util = util;
        this._help = help;
        this._userRepo = userRepo;
        this._roleRepo = roleRepo;
    }

    /**
     * Service name is 'commands.user'
     * @type {string}
     */
    static get provides() {
        return 'commands.user';
    }

    /**
     * Dependencies as constructor arguments
     * @type {string[]}
     */
    static get requires() {
        return [ 'app', 'config', 'error', 'util', 'commands.help', 'repositories.user', 'repositories.role' ];
    }

    /**
     * Run the command
     * @param {string[]} argv           Arguments
     * @return {Promise}
     */
    run(argv) {
        let args = argvParser
            .option({
                name: 'help',
                short: 'h',
                type: 'boolean',
            })
            .option({
                name: 'name',
                short: 'n',
                type: 'string',
            })
            .option({
                name: 'password',
                short: 'p',
                type: 'string',
            })
            .option({
                name: 'add-role',
                short: 'a',
                type: 'list,string',
            })
            .option({
                name: 'remove-role',
                short: 'r',
                type: 'list,string',
            })
            .run(argv);

        if (args.targets.length < 2)
            return this._help.helpUser(argv);

        let email = args.targets[1];

        let user;
        return this._userRepo.findByEmail(email)
            .then(users => {
                user = users.length && users[0];
                if (!user) {
                    user = this._userRepo.getModel('user');
                    user.email = email;
                    user.displayName = null;
                    user.password = null;
                    user.secret = null;
                    user.createdAt = moment();
                    user.confirmedAt = user.createdAt;
                    user.blockedAt = null;
                }
                
                if (args.options['name'])
                    user.displayName = args.options['name'];
                if (args.options['password'])
                    user.password = this._util.encryptPassword(args.options['password']);

                if (user._dirty)
                    return this._userRepo.save(user);
            })
            .then(() => {
                return (args.options['add-role'] || []).reduce(
                    (prev, cur) => {
                        return prev.then(() => {
                            return this._roleRepo.findByTitle(cur)
                                .then(roles => {
                                    let role = roles.length && roles[0];
                                    if (role)
                                        return this._userRepo.addRole(user, role);

                                    return this._app.error(`Role ${cur} not found`);
                                })
                        });
                    },
                    Promise.resolve()
                );
            })
            .then(() => {
                return (args.options['remove-role'] || []).reduce(
                    (prev, cur) => {
                        return prev.then(() => {
                            return this._roleRepo.findByTitle(cur)
                                .then(roles => {
                                    let role = roles.length && roles[0];
                                    if (role)
                                        return this._userRepo.removeRole(user, role);

                                    return this._app.error(`Role ${cur} not found`);
                                })
                        });
                    },
                    Promise.resolve()
                );
            })
            .then(() => {
                process.exit(0);
            })
            .catch(error => {
                return this.error(this._error.flatten(error));
            });
    }

    /**
     * Log error and terminate
     * @param {Array} args
     */
    error(args) {
        return args.reduce(
            (prev, cur) => {
                return prev.then(() => {
                    return this._app.error(cur.stack || cur.message || cur);
                });
            },
            Promise.resolve()
            )
            .then(
                () => {
                    process.exit(1);
                },
                () => {
                    process.exit(1);
                }
            );
    }
}

module.exports = User;