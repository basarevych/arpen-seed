/**
 * Repo-saved application configuration
 */
module.exports = {
    // Project name (alphanumeric)
    project: 'arpen',

    // Load base classes and services, path names
    autoload: [
        '!arpen/src/models',
        '!arpen/src/repositories',
        '!arpen/src/services',
        '!arpen/src/servers',
        '!arpen/src/middleware',
        'models',
        'repositories',
        'services',
        'middleware',
        'commands',
    ],
};
