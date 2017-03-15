/**
 * @file Main file of the add-on.
 * @author CheckMyHTTPS's team
 * @license GPLv3
 */

const CMH = {
	ui:      require('./ui'),
	updater: require('./updater')
};

exports.main = function (options, callbacks) {
	// Register interface at load
	CMH.ui.register();
};
exports.onUnload = function (reason) {
	// Unregister interface at unload
	CMH.ui.unregister();
};

// Check update at start (+ check SSL of the CheckMyHTTPS server)
CMH.updater.checkUpdate();
