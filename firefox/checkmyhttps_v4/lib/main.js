/**
 * @file Main file of the add-on.
 * @author CheckMyHTTPS's team
 * @license GPL-3.0
 */

const _ = require('sdk/l10n').get;

const CMH = {
    common:              require('./common'),
    certificatesManager: require('./certificatesManager'),
    ui:                  require('./ui')
};

exports.main = function (options, callbacks) {
    // Register interface at load
    CMH.ui.register();
};
exports.onUnload = function (reason) {
    // Unregister interface at unload
    CMH.ui.unregister();
};

// Check SSL connection with the CheckMyHTTPS server
CMH.certificatesManager.getCertUrl('https://checkmyhttps.net/success.txt', function (datas) {
    if (datas.xhr.status !== 200) {
        CMH.ui.button.setStatus(CMH.common.status.UNKNOWN);
        CMH.ui.notification.show(_('l_serverUnreachable'));
        return;
    }

    if (datas.response.trim() !== 'success') {
        CMH.ui.button.setStatus(CMH.common.status.INVALID);
        CMH.ui.notification.show(_('l_danger'));
    }
});
