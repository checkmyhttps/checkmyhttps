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
  browser.action.setTitle({ title: browser.i18n.getMessage('__clickToCheck__') })

  CMH.ui.setStatus(CMH.common.status.UNKNOWN)

  browser.action.onClicked.addListener((tab) => {
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
    let details = { path: `./icons/${CMH.common.statusCode[status]}.png` }
    if ((typeof tabId !== 'undefined') && (tabId !== null)) {
      details.tabId = tabId
    }
    browser.action.setIcon(details)
    browser.action.setTitle({title: browser.i18n.getMessage(`__${CMH.common.statusCode[status]}__`)})
  } else {
    let details = { title: 'CheckMyHTTPS (' + browser.i18n.getMessage(`__${CMH.common.statusCode[status]}__`) + ')' }
    if ((typeof tabId !== 'undefined') && (tabId !== null)) {
      details.tabId = tabId
    }
    browser.action.setTitle(details)
  }
}

/**
 * @name openOptionsPageListener
 * @function
 * Open the options page if the user clicks on a notification concerned with it.
 * For now, only the "Invalid Public Key" notification redirects to this page.
 */
CMH.ui.openOptionsPageListener = () => {
  if (CMH.ui.openOptionsPage === 1) {
    browser.runtime.openOptionsPage()
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
  CMH.ui.openOptionsPage = 0
  let notificationOptions = {
    type:     'basic',
    iconUrl:  browser.runtime.getURL('./icons/icon.png'),
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
    if (options.hasOwnProperty('openOptionsPage') && options['openOptionsPage'] === 1)
      CMH.ui.openOptionsPage = 1
  }

  browser.notifications.create('cakeNotification', notificationOptions)

  // Listener to open the options page, if the user clicks on a corresponding notification (Ex: "Invalid Public Key")
  browser.notifications.onClicked.addListener(CMH.ui.openOptionsPageListener)
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
