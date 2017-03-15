/**
 * @file Options manager.
 * @author CheckMyHTTPS's team
 * @license GPL-3.0
 */

const preferences  = require('sdk/simple-prefs');

/**
 * @type {object}
 * Cache of add-on options.
 */
const prefs = {
    checkOnPageLoad: false
};

/**
 * @name onPreferenceChange
 * @function
 * @param {string} prefName - Name of the option
 * Load option in cache on change.
 */
const onPreferenceChange = function (prefName) {
    if (prefName === '') { // Reload all options.
        for (let name in prefs) {
            prefs[name] = preferences.prefs[name];
        }
    } else {
        prefs[prefName] = preferences.prefs[prefName];
    }
};
preferences.on('', onPreferenceChange);

// Reload all options in cache
onPreferenceChange('');

exports.prefs = prefs;
