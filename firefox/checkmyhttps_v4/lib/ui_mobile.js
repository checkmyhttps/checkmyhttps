/**
 * @file UI on mobile.
 * @author CheckMyHTTPS's team
 * @license GPLv3
 */

const _             = require('sdk/l10n').get;
const tabs          = require('sdk/tabs');
const { Services }  = require('resource://gre/modules/Services.jsm');
const { Snackbars } = require('resource://gre/modules/Snackbars.jsm');

const CMH = {
    certificatesChecker: require('./certificatesChecker'),
    common:              require('./common')
};

const mainWindow = Services.wm.getMostRecentWindow('navigator:browser');

/**
 * @type {number}
 * Action button id.
 */
let actionButtonId;

/**
 * @name register
 * @function
 * Load interface.
 */
exports.register = function () {
    actionButtonId = mainWindow.NativeWindow.menu.add({
        name: 'CheckMyHTTPS (' + _('l_'+CMH.common.statusCode[CMH.common.status.UNKNOWN]) + ')',
        callback: function (state) {
            mainWindow.console.log('clicked');
            console.log('clicked');
            CMH.certificatesChecker.checkTab(mainWindow.BrowserApp.selectedTab, true);
        }
    });
}
/**
 * @name unregister
 * @function
 * Unload interface.
 */
exports.unregister = function () {
    mainWindow.NativeWindow.menu.remove(actionButtonId);
}

/**
 * @namespace button
 */
exports.button = {
    /**
     * @name setStatus
     * @function
     * @param {number} status - Check status
     * Set status of the action button.
     */
    setStatus: function (status) {
        mainWindow.NativeWindow.menu.update(actionButtonId, {
            name: 'CheckMyHTTPS (' + _('l_'+CMH.common.statusCode[status]) + ')'
        });
    }
};

/**
 * @namespace notification
 */
exports.notification = {
    /**
     * @name show
     * @function
     * @param {string}   content    - Content
     * @param {string}   actionText - Text of action
     * @param {function} action     - Callback on click
     * Show a notification.
     */
    show: function (content, actionText, action) {
        Snackbars.show(content, Snackbars.LENGTH_LONG, {
            action: {
                label: actionText,
                callback: action
            }
        });
    }
};
