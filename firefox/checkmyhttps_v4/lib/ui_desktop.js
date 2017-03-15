/**
 * @file UI on desktop.
 * @author CheckMyHTTPS's team
 * @license GPLv3
 */

const _             = require('sdk/l10n').get;
const notifications = require('sdk/notifications');
const tabs          = require('sdk/tabs');
const buttons       = require('sdk/ui/button/action');

const CMH = {
	certificatesChecker: require('./certificatesChecker'),
	common:              require('./common')
};

/**
 * @type {object}
 * Action button.
 */
let actionButton;

/**
 * @name register
 * @function
 * Load interface.
 */
exports.register = function () {
	actionButton = buttons.ActionButton({
	    id: 'checkmyhttps-icon',
	    label: _('l_clickToCheck'),
	    icon: './' + CMH.common.statusCode[CMH.common.status.UNKNOWN] + '.png',
	    onClick: function (state) {
			// Check active tab
	        CMH.certificatesChecker.checkTab(tabs.activeTab, true);
	    }
	});
}
/**
 * @name unregister
 * @function
 * Unload interface.
 */
exports.unregister = function () {
	actionButton.destroy();
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
        actionButton.icon = './' + CMH.common.statusCode[status] + '.png';
    }
};

/**
 * @namespace notification
 */
exports.notification = {
	/**
	 * @name show
	 * @function
	 * @param {string}   content      - Content
	 * @param {string}   [actionText] - Text of action (unused on desktop version)
	 * @param {function} action       - Callback on click
	 * Show a notification.
	 */
	show: function (content, actionText, action) {
	    notifications.notify({
	        title: _('l_alert'),
	        text:  content,
	        onClick: action
	    });
	}
};
