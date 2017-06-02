/**
 * Create DB command
 * @module commands/create-db
 */
const path = require('path');
const fs = require('fs');
const read = require('read');
const argvParser = require('argv');

/**
 * Command class
 */
class CreateDb {
    /**
     * Create the service
     * @param {App} app                         The application
     * @param {object} config                   Configuration
     * @param {Runner} runner                   Runner service
     * @param {RoleRepository} roleRepo         Role repository
     * @param {PermissionRepository} permRepo   Permission repository
     */
    constructor(app, config, runner, roleRepo, permRepo) {
        this._app = app;
        this._config = config;
        this._runner = runner;
        this._roleRepo = roleRepo;
        this._permRepo = permRepo;
    }

    /**
     * Service name is 'commands.createDb'
     * @type {string}
     */
    static get provides() {
        return 'commands.createDb';
    }

    /**
     * Dependencies as constructor arguments
     * @type {string[]}
     */
    static get requires() {
        return [ 'app', 'config', 'runner', 'repositories.role', 'repositories.permission' ];
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
            .run(argv);

        let member, user, admin;

        return new Promise((resolve, reject) => {
                read({ prompt: 'Destroy the data and recreate the schema? (yes/no): ' }, (error, answer) => {
                    if (error)
                        return this.error(error.message);

                    if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y')
                        process.exit(0);

                    let expect = new Map();
                    expect.set(/assword.*:/, this._config.get('postgres.main.password'));

                    let proc = this._runner.spawn(
                        'psql',
                        [
                            '-U', this._config.get('postgres.main.user'),
                            '-d', this._config.get('postgres.main.db_name'),
                            '-h', this._config.get('postgres.main.host'),
                            '-p', this._config.get('postgres.main.port'),
                            '-W',
                            '-f', path.join(__dirname, '..', 'database', 'schema.sql'),
                        ],
                        {},
                        expect
                    );
                    proc.cmd.on('data', data => {
                        process.stdout.write(data);
                    });
                    proc.promise
                        .then(() => {
                            resolve();
                        })
                        .catch(error => {
                            reject(error);
                        });
                });
            })
            .then(() => {
                member = this._roleRepo.getModel('role');
                member.parentId = null;
                member.title = 'Member';
                return this._roleRepo.save(member);
            })
            .then(() => {
                admin = this._roleRepo.getModel('role');
                admin.parentId = member.id;
                admin.title = 'Admin';
                return this._roleRepo.save(admin);
            })
            .then(() => {
                user = this._roleRepo.getModel('role');
                user.parentId = member.id;
                user.title = 'User';
                return this._roleRepo.save(user);
            })
            .then(() => {
                let perm = this._permRepo.getModel('permission');
                perm.roleId = member.id;
                perm.resource = 'account.profile';
                perm.action = null;
                return this._permRepo.save(perm);
            })
            .then(() => {
                let perm = this._permRepo.getModel('permission');
                perm.roleId = admin.id;
                perm.resource = null;
                perm.action = null;
                return this._permRepo.save(perm);
            })
            .then(() => {
                process.exit(0);
            })
            .catch(error => {
                return this.error(error);
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
                    return this._app.error(cur.fullStack || cur.stack || cur.message || cur);
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

module.exports = CreateDb;