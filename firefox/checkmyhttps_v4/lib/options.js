/**
 * @file Options manager.
 * @author CheckMyHTTPS's team
 * @license GPL-3.0
 */

const preferences     = require('sdk/simple-prefs');
const sysPreferences  = require('sdk/preferences/service');
const { PrefsTarget } = require('sdk/preferences/event-target');

/**
 * @type {object}
 * Cache of add-on options.
 */
const prefs = {
    checkOnPageLoad:              false,
    alertOnUnicodeIDNDomainNames: true
};

/**
 * @type {object}
 * Cache of system options.
 */
const sysPrefs = {
    'network.IDN_show_punycode': false
};

/**
 * @name onPreferenceChange
 * @function
 * @param {string} prefName - Name of the preference
 * Refresh option in cache on change.
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

/**
 * @name onSysPreferenceChange
 * @function
 * @param {string} prefName - Name of the preference
 * Refresh system option in cache on change.
 */
const onSysPreferenceChange = function (prefName) {
    prefName = 'network.IDN_show_punycode' + prefName;
    sysPrefs[prefName] = sysPreferences.get(prefName);
};
PrefsTarget({branchName: 'network.IDN_show_punycode'}).on('', onSysPreferenceChange);

// Reload all options in cache
onPreferenceChange('');
onSysPreferenceChange('');

exports.prefs    = prefs;
exports.sysPrefs = sysPrefs;
