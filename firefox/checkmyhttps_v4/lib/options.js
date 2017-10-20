/**
 * @file Options manager.
 * @author CheckMyHTTPS's team
 * @license GPL-3.0
 */

const _               = require('sdk/l10n').get;
const preferences     = require('sdk/simple-prefs');
const sysPreferences  = require('sdk/preferences/service');
const { PrefsTarget } = require('sdk/preferences/event-target');
const urls            = require('sdk/url');

const CMH = {
    common:              require('./common'),
    certificatesManager: require('./certificatesManager'),
    ui:                  require('./ui')
};

/**
 * @type {object}
 * Default check server (CheckMyHTTPS project server).
 */
const defaultCheckServer = {
    url: 'https://checkmyhttps.net/',
    fingerprints: {
        sha1:   'FF33641253DAA21E6C5CADEBF15430B2B7E498E6',
        sha256: '889F63E8E7F98F67E35750591CD66BC32A17A4B4FA2A44763DBEF8D756156165'
    }
};

/**
 * @type {object}
 * Cache of add-on options.
 */
const prefs = {
    checkOnPageLoad:               false,
    alertOnUnicodeIDNDomainNames:  true,
    checkServerUrl:                'https://checkmyhttps.net/',
    checkServerFingerprintsSha1:   'FF33641253DAA21E6C5CADEBF15430B2B7E498E6',
    checkServerFingerprintsSha256: '889F63E8E7F98F67E35750591CD66BC32A17A4B4FA2A44763DBEF8D756156165'
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
 * @name onCheckServerSettingsPageReady
 * @function
 * @param {object} port - Port object
 * Event when check server settings page is ready
 */
const onCheckServerSettingsPageReady = function (port) {
    port.emit('init', {
        locale: {
            checkServerSettings: _('l_checkServerSettings'),
            checkServerAddress:  _('l_checkServerAddress'),
            checkServerSha1:     _('l_checkServerSha1'),
            checkServerSha256:   _('l_checkServerSha256'),
            save:                _('l_save'),
            restoreDefault:      _('l_restoreDefault'),
            getFingerprints:     _('l_getFingerprints')
        },
        defaultCheckServer: defaultCheckServer,
        values: {
            server: prefs.checkServerUrl,
            sha1:   prefs.checkServerFingerprintsSha1,
            sha256: prefs.checkServerFingerprintsSha256
        }
    });

    port.on('save', function (data) {
        const res = checkCMHServerApi(data, function (datas) {
            if (datas.result === true) {
                preferences.prefs.checkServerUrl                = data.server;
                preferences.prefs.checkServerFingerprintsSha1   = data.sha1;
                preferences.prefs.checkServerFingerprintsSha256 = data.sha256;
                prefs.checkServerUrl                = preferences.prefs.checkServerUrl;
                prefs.checkServerFingerprintsSha1   = preferences.prefs.checkServerFingerprintsSha1;
                prefs.checkServerFingerprintsSha256 = preferences.prefs.checkServerFingerprintsSha256;

                if (CMH.common.isPlatform('desktop')) {
                    text_entry.hide();
                    return;
                }
            }

            port.emit('result', {
                result: datas.result
            });
        });
    });

    port.on('getFingerprints', function (data) {
        CMH.certificatesManager.getCertUrl(data.server+'success.txt', function (datas) {
            if (datas.xhr.status !== 200) {
                datas.cert = null;
            }

            if (datas.response.trim() !== 'success') {
                datas.cert = null;
            }

            port.emit('fingerprints', {
                fingerprints: ((datas.cert !== null) ? datas.cert.fingerprints : null)
            });
        });
    });
}

if (CMH.common.isPlatform('desktop')) {
    var text_entry = require('sdk/panel').Panel({
        width: 720,
        height: 320,
        contentURL: './pages/setting.html',
        contentScriptFile: './pages/setting.js'
    });
    text_entry.on('show', function () {
        onCheckServerSettingsPageReady(text_entry.port);
    });
    text_entry.on('hide', function () {
        text_entry.port.emit('onHide');
    });
} else if (CMH.common.isPlatform('mobile')) {
    const pageMod = require('sdk/page-mod');
    pageMod.PageMod({
        include: require('sdk/self').data.url('./pages/setting.html'),
        contentScriptFile: './pages/setting.js',
        onAttach: function(worker) {
            onCheckServerSettingsPageReady(worker.port);
        }
    });
}

preferences.on('configureCheckServer', function () {
    // On check server settings page open
    if (CMH.common.isPlatform('desktop')) {
        text_entry.show();
    } else if (CMH.common.isPlatform('mobile')) {
        require('sdk/tabs').open('./pages/setting.html');
    }
});

/**
 * @name checkCMHServerApi
 * @function
 * @param {object} checkServer - Check server to check
 * @param {function} callback  - Callback on resul
 * Check if a check server API is valid
 */
const checkCMHServerApi = function (checkServer, callback) {
    if (!urls.isValidURI(checkServer.server)) {
        callback({result: false});
        return;
    }

    CMH.certificatesManager.getCertUrl(checkServer.server+'api.php?host=checkmyhttps.net&port=443', function (datas) {
        if (datas.xhr.status !== 200) {
            CMH.ui.button.setStatus(CMH.common.status.UNKNOWN);
            CMH.ui.notification.show(_('l_serverUnreachable'));
            callback({result: false});
            return;
        }

        if ((datas.cert !== null) && (!CMH.certificatesManager.compareCertificateFingerprints(datas.cert, { fingerprints: { sha1: checkServer.sha1, sha256: checkServer.sha256 } }))) {
            callback({result: false});
            return;
        }

        const response_cert = JSON.parse(datas.response);
        if ((response_cert !== null) && (!CMH.certificatesManager.compareCertificateFingerprints(response_cert, defaultCheckServer))) {
            callback({result: false});
            return;
        }

        callback({result: true});
    });
}

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
