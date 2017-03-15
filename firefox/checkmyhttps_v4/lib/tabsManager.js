/**
 * @file Tabs manager.
 * @author CheckMyHTTPS's team
 * @license GPLv3
 */

const tabs          = require('sdk/tabs');
const tabsUtils     = require('sdk/tabs/utils');
const urls          = require('sdk/url');
const { Services }  = require('resource://gre/modules/Services.jsm');

const mainWindow = Services.wm.getMostRecentWindow('navigator:browser');

const CMH = {
    certificatesChecker: require('./certificatesChecker'),
    common:              require('./common'),
    options:             require('./options'),
    ui:                  require('./ui')
};

/**
 * @type {object}
 * Check status of tabs.
 */
const tabsStatus = {};

/**
 * @name getTabUrl
 * @function
 * @param {object} tab - Tab
 * @returns {string} - URL
 * Get the specified tab's URL.
 */
let getTabUrl;
if (CMH.common.isPlatform('desktop')) {
    getTabUrl = function (tab) {
        return tab.url;
    }
} else if (CMH.common.isPlatform('mobile')) {
    getTabUrl = function (tab) {
        return tabsUtils.getTabURL(tab);
    }
}

/**
 * @name setTabStatus
 * @function
 * @param {object} tab    - Tab
 * @param {number} status - Check status
 * Set the status of a tab.
 */
const setTabStatus = function (tab, status) {
    tabsStatus[tab.id] = {
        status: status,
        host:   urls.URL(getTabUrl(tab)).host
    };
    if (tab.id === tabs.activeTab.id) {
        CMH.ui.button.setStatus(status);
    }
};

/**
 * @name deleteTabStatus
 * @function
 * @param {object} tab - Tab
 * Delete the status of a tab.
 */
const deleteTabStatus = function (tab) {
    if (typeof tabsStatus[tab.id] !== 'undefined') {
        delete tabsStatus[tab.id];
    }
    if (tab.id === tabs.activeTab.id) {
        CMH.ui.button.setStatus(CMH.common.status.UNKNOWN);
    }
};

/**
 * @name onTabReady
 * @function
 * @param {object} tab - Tab
 * Event on page loaded.
 */
const onTabReady = function (tab) {
    if (CMH.options.prefs.checkOnPageLoad === true) {
        // Check on page load
        CMH.certificatesChecker.checkTab(tab, false);
    } else if ((typeof tabsStatus[tab.id] !== 'undefined') && (tabsStatus[tab.id].host !== urls.URL(getTabUrl(tab)).host)) {
        // Host has changed
        deleteTabStatus(tab);
    }
};

/**
 * @name onTabActivate
 * @function
 * @param {object} tab - Tab
 * Event on tab switch.
 */
const onTabActivate = function (tab) {
    if (typeof tabsStatus[tab.id] !== 'undefined') {
        CMH.ui.button.setStatus(tabsStatus[tab.id].status);
    } else {
        CMH.ui.button.setStatus(CMH.common.status.UNKNOWN);
    }
};

/**
 * @name onTabClose
 * @function
 * @param {object} tab - Tab
 * Event on tab close.
 */
const onTabClose = function (tab) {
    deleteTabStatus(tab);
};

tabs.on('activate', onTabActivate);
tabs.on('close',    onTabClose);
if (CMH.common.isPlatform('desktop')) {
    tabs.on('ready', onTabReady);
} else if (CMH.common.isPlatform('mobile')) {
    mainWindow.BrowserApp.deck.addEventListener('load', function (aEvent) {
        const doc     = aEvent.originalTarget;
        const browser = mainWindow.BrowserApp.getBrowserForDocument(doc);
        const tab     = mainWindow.BrowserApp.getTabForBrowser(browser);
        onTabReady(tabsUtils.getTabForId(tab.id));
    }, true);
}

exports.getTabUrl    = getTabUrl;
exports.setTabStatus = setTabStatus;
