/**
 * @file Options manager.
 * @author CheckMyHTTPS's team
 * @license GPL-3.0
 */

CMH.options = {}

/**
 * @name getCertUrl
 * @function
 * @param {string} url - URL to check
 * @returns {object} - fingerprints
 * Get the certificate fingerprints of an URL.
 */
CMH.options.getCertUrl = async (url) => {
    const { cert } = await CMH.certificatesManager.getCertUrl(url, true);
    return cert;
}

//Get the default checkserver's fingerprints
CMH.options.getCertUrl('https://checkmyhttps.net/').then((response) => {
  if(response != null){
        if(CMH.options.defaultCheckServer.fingerprints.sha256 != response.fingerprints.sha256){
          CMH.ui.showNotification(browser.i18n.getMessage('__availableUpdates__'));
        }
  }
  else{
    CMH.ui.showNotification(browser.i18n.getMessage('__defaultServerUnreachable__'));
  }
});

/**
 * @type {object}
 * Cache of extension options.
 */
CMH.options.settings = {
  checkOnPageLoad:               false,
  alertOnUnicodeIDNDomainNames:  true,
  disableNotifications:          false, 
  checkServerUrl:                'https://checkmyhttps.net/',
  checkServerFingerprintsSha256: 'C8F129A6D02194583A6B205B27AB7A246651A9915857E8DB24C1909D6F54F324'
}

/**
 * @type {object}
 * Default check server (CheckMyHTTPS project server).
 */
CMH.options.defaultCheckServer = {
  url: 'https://checkmyhttps.net/',
  fingerprints: {
    sha256: 'C8F129A6D02194583A6B205B27AB7A246651A9915857E8DB24C1909D6F54F324'
  }
}

// Get settings values
browser.storage.local.get(['checkOnPageLoad', 'alertOnUnicodeIDNDomainNames', 'disableNotifications', 'checkServerUrl', 'checkServerFingerprintsSha256']).then((settings) => {
  const settingsItems = Object.keys(settings)

  for (let item of settingsItems) {
    CMH.options.settings[item] = settings[item]
  }
}, (error) => { console.error(error) })

// Listen for settings changes
browser.storage.onChanged.addListener((changes, area) => {
  const changedItems = Object.keys(changes)

  for (let item of changedItems)
    CMH.options.settings[item] = changes[item].newValue
})
