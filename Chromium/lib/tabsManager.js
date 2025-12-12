/**
 * @file Tabs manager.
 * @author CheckMyHTTPS's team
 * @license GPL-3.0
 */

CMH.tabsManager = {}

/**
 * @type {object}
 * Check status of tabs.
 */
CMH.tabsManager.tabsStatus = {}


/**
 * @name setTabStatus
 * @function
 * @param {number} tabId  - Tab ID
 * @param {number} status - Check status
 * Set the status of a tab.
 */
CMH.tabsManager.setTabStatus = (tabId, status) => {
  if (typeof CMH.tabsManager.tabsStatus[tabId] === 'undefined') {
    CMH.tabsManager.tabsStatus[tabId] = {}
  }

  CMH.tabsManager.tabsStatus[tabId].status = status
  CMH.ui.setStatus(status, tabId)
}


/**
 * @name setTabIp
 * @function
 * @param {number} tabId    - Tab ID
 * @param {string} ip       - Current IP address
 * @param {string} [url]    - Tab URL
 * Set the IP address of a tab.
 */
CMH.tabsManager.setTabIp = (tabId, ip) => {
  if (typeof CMH.tabsManager.tabsStatus[tabId] === 'undefined') {
    CMH.tabsManager.tabsStatus[tabId] = {}
  }

  CMH.tabsManager.tabsStatus[tabId].ip = ip
}


/**
 * @name getTabIp
 * @function
 * @param {number} tabId - Tab ID
 * @returns {string} - IP address
 * Get the IP address of a tab.
 */
CMH.tabsManager.getTabIp = (tabId) => {
  if ((typeof CMH.tabsManager.tabsStatus[tabId] === 'undefined') || (typeof CMH.tabsManager.tabsStatus[tabId].ip === 'undefined') || CMH.tabsManager.tabsStatus[tabId].ip == null) {
    return ""
  }
  return CMH.tabsManager.tabsStatus[tabId].ip
}


/**
 * @name onCompleted
 * @function
 * @param {object} requestDetails - Request data
 * Store ip of each request received from main frame.
 */
CMH.tabsManager.onCompleted = (requestDetails) => {
  CMH.tabsManager.setTabIp(requestDetails.tabId, requestDetails.ip)
}
chrome.webRequest.onCompleted.addListener(CMH.tabsManager.onCompleted,
  { urls: ['https://*/*'], types: ['main_frame'] }
)