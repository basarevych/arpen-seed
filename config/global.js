/**
 * Repo-saved application configuration
 */
module.exports = {
    // Project name (alphanumeric)
    project: 'arpen',

    // Load base classes and services, path names
    autoload: [
        '!arpen/src/services',
        '!arpen/src/servers',
        '!arpen/src/middleware',
        'services',
        'middleware',
        'models',
        'repositories',
        'commands',
    ],
};
