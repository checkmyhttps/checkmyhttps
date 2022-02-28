/**
 * @file UI manager.
 * @author CheckMyHTTPS's team
 * @license GPL-3.0
 */

CMH.ui = {}

/**
 * @name init
 * @function
 * Initialize user interface.
 */
CMH.ui.init = () => {
  browser.browserAction.setTitle({ title: browser.i18n.getMessage('__clickToCheck__') })

  CMH.ui.setStatus(CMH.common.status.UNKNOWN)

  browser.browserAction.onClicked.addListener((tab) => {
    CMH.certificatesChecker.checkTab(tab, !CMH.options.settings.disableNotifications)
  })
}

/**
 * @name setStatus
 * @function
 * @param {number} status - Tab check status
 * @param {number} tabId  - Tab ID
 * Set status of the action button.
 */
CMH.ui.setStatus = (status, tabId) => {
  if (CMH.common.isDesktopPlatform()) {
    let details = { path: `./images/${CMH.common.statusCode[status]}.png` }
    if ((typeof tabId !== 'undefined') && (tabId !== null)) {
      details.tabId = tabId
    }
    browser.browserAction.setIcon(details)
  } else {
    let details = { title: 'CheckMyHTTPS (' + browser.i18n.getMessage(`__${CMH.common.statusCode[status]}__`) + ')' }
    if ((typeof tabId !== 'undefined') && (tabId !== null)) {
      details.tabId = tabId
    }
    browser.browserAction.setTitle(details)
  }
}

/**
 * @name showNotification
 * @function
 * @param {string} message - Message
 * @param {object} options - Options
 * Show a notification.
 */
CMH.ui.showNotification = (message, options) => {
  let notificationOptions = {
    type:     'basic',
    iconUrl:  browser.runtime.getURL('./images/icon.png'),
    title:    browser.i18n.getMessage('__alertTitle__'),
    message:  message,
    priority: 1
  }
  if (typeof options !== 'undefined') {
    for (option of ['title', 'message', 'priority']) {
      if (options.hasOwnProperty(option)) {
        notificationOptions[option] = options[option]
      }
    }
  }
  browser.notifications.create('cakeNotification', notificationOptions)
}

// Initialize UI when the current platform is detected
(() => {
  interval = setInterval(() => {
    if (typeof CMH.common.isDesktopPlatform() !== 'undefined') {
      clearInterval(interval)

      CMH.ui.init()
    }
  }, 10)
})()
