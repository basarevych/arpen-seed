/**
 * User command
 * @module commands/user
 */
const argvParser = require('argv');
const moment = require('moment-timezone');

/**
 * Command to manage users
 */
class User {
    /**
     * Create the service
     * @param {App} app                     The application
     * @param {object} config               Configuration
     * @param {Util} util                   Util service
     * @param {Help} help                   Help command
     * @param {UserRepository} userRepo     User repository
     * @param {RoleRepository} roleRepo     Role repository
     */
    constructor(app, config, util, help, userRepo, roleRepo) {
        this._app = app;
        this._config = config;
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
        return [ 'app', 'config', 'util', 'commands.help', 'repositories.user', 'repositories.role' ];
    }

    /**
     * Run the command
     * @param {string[]} argv           Arguments
     * @return {Promise}
     */
    async run(argv) {
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

        try {
            let users = await this._userRepo.findByEmail(email);
            let user = users.length && users[0];
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

            if (args.options.name)
                user.displayName = args.options.name;
            if (args.options.password)
                user.password = this._util.encryptPassword(args.options.password);

            if (user._dirty)
                await this._userRepo.save(user);

            await (args.options['add-role'] || []).reduce(
                async (prev, cur) => {
                    await prev;
                    let roles = await this._roleRepo.findByTitle(cur);
                    let role = roles.length && roles[0];
                    if (role)
                        await this._userRepo.addRole(user, role);
                    else
                        await this._app.error(`Role ${cur} not found`);
                },
                Promise.resolve()
            );

            await (args.options['remove-role'] || []).reduce(
                async (prev, cur) => {
                    await prev;
                    let roles = await this._roleRepo.findByTitle(cur);
                    let role = roles.length && roles[0];
                    if (role)
                        await this._userRepo.removeRole(user, role);
                    else
                        await this._app.error(`Role ${cur} not found`);
                },
                Promise.resolve()
            );

            process.exit(0);
        } catch (error) {
            await this.error(error);
        }
    }

    /**
     * Log error and terminate
     * @param {...*} args
     * @return {Promise}
     */
    async error(...args) {
        try {
            await args.reduce(
                async (prev, cur) => {
                    await prev;
                    return this._app.error(cur.fullStack || cur.stack || cur.message || cur);
                },
                Promise.resolve()
            );
        } catch (error) {
            // do nothing
        }
        process.exit(1);
    }
}

module.exports = User;
