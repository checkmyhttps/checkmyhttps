/**
 * @file UI adapter.
 * @author CheckMyHTTPS's team
 * @license GPLv3
 */

const CMH = {
	common: require('./common')
};

let uiPlatform;
if (CMH.common.isPlatform('desktop')) {
    uiPlatform = require('./ui_desktop');
} else if (CMH.common.isPlatform('mobile')) {
    uiPlatform = require('./ui_mobile');
}

exports.register     = uiPlatform.register;
exports.unregister   = uiPlatform.unregister;
exports.button       = uiPlatform.button;
exports.notification = uiPlatform.notification;
