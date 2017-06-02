/**
 * Index module
 * @module index/module
 */


/**
 * Module main class
 */
class Index {
    /**
     * Create the module
     * @param {App} app                                     The application
     * @param {object} config                               Configuration
     * @param {IndexRoute} indexRoute                       Index route
     * @param {LoginRoute} loginRoute                       Login route
     * @param {SignUpRoute} signUpRoute                     Create Account route
     * @param {ProfileRoute} profileRoute                   Profile route
     */
    constructor(app, config, indexRoute, loginRoute, signUpRoute, profileRoute) {
        this._app = app;
        this._config = config;
        this._indexRoute = indexRoute;
        this._loginRoute = loginRoute;
        this._signUpRoute = signUpRoute;
        this._profileRoute = profileRoute;
    }

    /**
     * Service name is 'modules.index'
     * @type {string}
     */
    static get provides() {
        return 'modules.index';
    }

    /**
     * Dependencies as constructor arguments
     * @type {string[]}
     */
    static get requires() {
        return [
            'app',
            'config',
            'modules.index.routes.index',
            'modules.index.routes.login',
            'modules.index.routes.account.create',
            'modules.index.routes.account.profile',
        ];
    }

    /**
     * Bootstrap the module
     * @return {Promise}
     */
    bootstrap() {
        return this._app.get('invalidateCache').register();
    }

    /**
     * Register routes with the server
     * @return {Array}
     */
    routers() {
        return [
            this._indexRoute.router,
            this._loginRoute.router,
            this._signUpRoute.router,
            this._profileRoute.router,
        ];
    }
}

module.exports = Index;
