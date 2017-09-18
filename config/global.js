/**
 * Repo-saved application configuration
 */
module.exports = {
    // Project name (alphanumeric)
    project: 'arpen',

    // Load base classes and services, path names
    autoload: [
        '!arpen/src',
        'models',
        'repositories',
        'services',
        'middleware',
        'commands',
    ],
};
