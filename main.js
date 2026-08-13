'use strict';

// Insomnia loads this stable entry point from package.json
const { templateTags, responseHooks } = require('./index');

module.exports = { templateTags, responseHooks };
