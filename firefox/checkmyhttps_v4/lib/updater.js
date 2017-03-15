/**
 * @file Updater.
 * @author CheckMyHTTPS's team
 * @license GPLv3
 */

const _    = require('sdk/l10n').get;
const self = require('sdk/self');
const tabs = require('sdk/tabs');

const CMH = {
    certificatesManager: require('./certificatesManager'),
    common:              require('./common'),
    ui:                  require('./ui')
};

/**
 * @name compareVersion
 * @function
 * @param {string} remoteVersion  - Last version of add-on
 * @param {string} currentVersion - Current version of add-on
 * @returns {number} - 1 (R>C), 0 (R=C) or -1 (R<C)
 * Compare two version numbers.
 */
const compareVersion = function (remoteVersion, currentVersion) {
    if (remoteVersion === currentVersion) {
        return 0;
    }

    const remoteVersionArray  = remoteVersion.split('.');
    const currentVersionArray = currentVersion.split('.');

    const versionLength = Math.min(remoteVersionArray.length, currentVersionArray.length);

    for (let i = 0; i < versionLength; i++) {
        if (parseInt(remoteVersionArray[i]) > parseInt(currentVersionArray[i])) {
            return 1;
        }
        if (parseInt(remoteVersionArray[i]) < parseInt(currentVersionArray[i])) {
            return -1;
        }
    }

    if (remoteVersionArray.length > currentVersionArray.length) {
        return 1;
    }
    if (remoteVersionArray.length < currentVersionArray.length) {
        return -1;
    }

    return 0;
};

/**
 * @name checkUpdate
 * @function
 * Check update from the CheckMyHTTPS server.
 */
const checkUpdate = function () {
    CMH.certificatesManager.getCertUrl('https://checkmyhttps.net/version_addon.txt', function (datas_url) {
        if (datas_url.xhr.status !== 200) {
            CMH.ui.button.setStatus(CMH.common.status.UNKNOWN);
            CMH.ui.notification.show(_('l_serverUnreachable'));
            return;
        }

        // Check new version
        const version_addon = self.version;
        const lastVersion   = datas_url.response;
        if (compareVersion(lastVersion, version_addon) > 0) {
            // New version available
            CMH.ui.button.setStatus(CMH.common.status.WARNING);
            CMH.ui.notification.show(_('l_clickToUpdate'), _('l_update'), function (data) {
                tabs.open('https://addons.mozilla.org/firefox/addon/checkmyhttps/');
            });
        }
    });
}

exports.checkUpdate = checkUpdate;
