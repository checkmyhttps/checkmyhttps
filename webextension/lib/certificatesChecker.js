/**
 * @file Certificates checker.
 * @author CheckMyHTTPS's team
 * @license GPL-3.0
 */

CMH.certificatesChecker = {}

/**
 * @name isPublicIP
 * @function
 * @param {string} ip- IP address to check
 * @returns {boolean}
 * Returns true if the IP address is public and globally routable.
 */
function isPublicIP(ip) {
  // Basic validation and normalization
  if ( (typeof ip !== 'string') || (ip === undefined ) || (ip === "" ) ) return false;
  ip = ip.trim();

  // IPv6: remove surrounding brackets if present
  if (ip.startsWith('[') && ip.endsWith(']')) {
      ip = ip.slice(1, -1);
  }

  // ==================== IPv4 ====================
  if (ip.includes('.')) {
      const parts = ip.split('.').map(Number);

      // Invalid IPv4 format
      if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
          return false;
      }

      // Reserved / private ranges according to RFC 6890
      if (
          parts[0] === 0 ||                              // 0.0.0.0/8
          parts[0] === 10 ||                             // 10.0.0.0/8            (private)
          parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127 || // 100.64.0.0/10 (CGNAT)
          parts[0] === 127 ||                            // 127.0.0.0/8           (loopback)
          parts[0] === 169 && parts[1] === 254 ||        // 169.254.0.0/16        (link-local)
          parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31 || // 172.16.0.0/12 (private)
          parts[0] === 192 && parts[1] === 0 && parts[2] === 0 ||  // 192.0.0.0/24 (reserved)
          parts[0] === 192 && parts[1] === 0 && parts[2] === 2 ||  // 192.0.2.0/24 (TEST-NET-1)
          parts[0] === 192 && parts[1] === 88 && parts[2] === 99 || // 192.88.99.0/24 (6to4 relay)
          parts[0] === 192 && parts[1] === 168 ||        // 192.168.0.0/16        (private)
          parts[0] === 198 && parts[1] === 18 ||         // 198.18.0.0/15         (benchmark testing)
          parts[0] === 198 && parts[1] === 51 && parts[2] === 100 || // 198.51.100.0/24 (TEST-NET-2)
          parts[0] === 203 && parts[1] === 0 && parts[2] === 113 || // 203.0.113.0/24 (TEST-NET-3)
          (parts[0] >= 224 && parts[0] <= 239) ||     // 224.0.0.0/4           (multicast)
          parts[0] >= 240                                // 240.0.0.0/4           (reserved for future use)
      ) {
          return false;
      }
      return true;
  }

  // ==================== IPv6 ====================
  // Use the browser's built-in URL parser
  try {
      // Constructing a URL with the IPv6 forces strict parsing
      new URL(`http://[${ip}]/`);

      const lower = ip.toLowerCase();

      // Loopback
      if (lower === '::1' || lower === '0:0:0:0:0:0:0:1') return false;

      // Unspecified / undefined
      if (lower === '::' || lower === '0:0:0:0:0:0:0:0') return false;

      // Unique Local Addresses (ULA) – fc00::/7
      if (lower.startsWith('fc') || lower.startsWith('fd')) return false;

      // Link-local addresses – fe80::/10
      if (lower.startsWith('fe8') || lower.startsWith('fe9') ||
          lower.startsWith('fea') || lower.startsWith('feb')) return false;

      // Documentation / reserved ranges
      if (lower.startsWith('2001:db8') || lower.startsWith('2001:10:')) return false;

      // 6to4 addresses
      if (lower.startsWith('2002:')) return false;

      // Teredo addresses (2001:0::/32)
      if (lower.startsWith('2001:0:')) return false;

      // All other IPv6 addresses not listed above are considered globally routable
      return true;
  } catch (e) {
      return false; // Invalid IPv6 syntax
  }
}


/**
 * @name isCheckableUrl
 * @function
 * @param {string}  urlTested         - URL to check
 * @param {string}  ip                - IP address to check
 * @param {boolean} showNotifications - Show notifications
 * @returns {boolean}
 * Check if an URL is checkable.
 */
CMH.certificatesChecker.isCheckableUrl = (urlTested, ip, showNotifications) => {
  let protocol, host, tld
  try {
    const url = new URL(urlTested)
    protocol = url.protocol.slice(0, -1)
    host     = url.hostname
    parts = host.split('.');
    tld = parts[parts.length - 1]
  } catch (e) {
    if (e instanceof TypeError) {
      if (showNotifications) {
        CMH.ui.showNotification(browser.i18n.getMessage('__wrongUrl__'))
      }
      return false
    }
  }

  if (protocol !== 'https') {
    if (showNotifications) {
      CMH.ui.showNotification(browser.i18n.getMessage('__noHttps__'))
    }
    return false
  }
  
  if (host.match("addons.mozilla.org")) {
    if (showNotifications) {
      CMH.ui.showNotification(browser.i18n.getMessage('__firefoxRestriction__'))
    }
    return false
  }

  if ( !isPublicIP(ip) ) {
    if (showNotifications) {
      CMH.ui.showNotification(browser.i18n.getMessage('__privateHost__'))
    }
    return false
  }

  //(RFC 2606)
  tldList1 = ["test", "example", "invalid", "localhost"]

  //(RFC 6762)
  tldList2 = ["local", "intranet", "internal", "private", "corp", "home", "lan"]
  
  //(RFC 9476)
  tldList3 = ["alt"]

  if (tldList1.concat(tldList2, tldList3).includes(tld)) {
    if (showNotifications) {
      CMH.ui.showNotification(browser.i18n.getMessage('__privateHost__'))
    }
    return false
  }
  
  return true
}


/**
 * @name checkTab
 * @function
 * @param {object}  tab               - Tab to check
 * @param {boolean} showNotifications - Show notifications
 * Check a tab.
 */
CMH.certificatesChecker.checkTab = async (tab, showNotifications) => {
  let ip = CMH.tabsManager.getTabIp(tab.id)
  if (!CMH.certificatesChecker.isCheckableUrl(tab.url, ip, showNotifications)) {
    return
  }

  CMH.tabsManager.setTabStatus(tab.id, CMH.common.status.WORKING)

  // Get the certificate of tab.url from user's view
  let userCert = await CMH.certificatesManager.getCertTab(tab)
  if (userCert === null || userCert.error !== undefined) {
    CMH.tabsManager.setTabStatus(tab.id, CMH.common.status.UNKNOWN)
    if (showNotifications) {
      CMH.ui.showNotification(browser.i18n.getMessage('__webServerToCheckUnreachable__'))
    }

    return
  }
  
  // Get the certificate of tab.url from check server's view
  data_api = await CMH.api.getCertFromCheckServer(tab.url, ip)

  if (data_api.error) {
    if (data_api.error === 'PUBLIC_KEY') {
      CMH.tabsManager.setTabStatus(tab.id, CMH.common.status.UNKNOWN)
      if (showNotifications) {
        CMH.ui.showNotification(browser.i18n.getMessage('__invalidPublicKey__'), { openOptionsPage: 1 })
      } 
    } else if (data_api.error === 'CHECK_SERVER_UNREACHABLE') {
      CMH.tabsManager.setTabStatus(tab.id, CMH.common.status.UNKNOWN)
      if (showNotifications) {
        CMH.ui.showNotification(browser.i18n.getMessage('__checkServerUnreachable__'))
      }
    } else if (data_api.error.includes('CHECK_SERVER_ERROR')) {
      CMH.tabsManager.setTabStatus(tab.id, CMH.common.status.UNKNOWN)
      if (showNotifications) {
        parts = data_api.error.split('.')
        error = parts[parts.length - 1]
        CMH.ui.showNotification(browser.i18n.getMessage('__checkServerError__', error))
      }
    } else if (data_api.error === 'SIGNATURE') {
        CMH.tabsManager.setTabStatus(tab.id, CMH.common.status.INVALID)
        if (showNotifications) {
          CMH.ui.showNotification(browser.i18n.getMessage('__invalidServerSignature__'), { priority: 2 })
        }
    } else {
      CMH.tabsManager.setTabStatus(tab.id, CMH.common.status.UNKNOWN)
      if (showNotifications) {
        CMH.ui.showNotification(browser.i18n.getMessage('__unknownIssue__'))
      }
    }

    return
  }

  // Compare certificates from user's view and from check server's view
  const verificationRes = CMH.certificatesChecker.verifyCertificate(userCert, data_api.data)
  CMH.certificatesChecker.handleVerificationResult(verificationRes, tab.url, tab.id, showNotifications)
}


/**
 * @name extract_sha256s
 * @function
 * @param {object} source - Certificate in the format of CMH.certificatesManager.formatCertificate
 * @returns {object} - list of sha256
 * Get all sha256 fingerprints from the source.
 */
CMH.certificatesChecker.extract_sha256s = (source) => {
  const sha256s = [source.fingerprints.sha256];

  obj = source

  while(obj.issuer)
  {
    sha256s.push(obj.issuer.fingerprints.sha256)
    obj = obj.issuer
  }

  return sha256s
}


/**
 * @name verifyCertificate
 * @function
 * @param {object}  userCertificate - Certificate from the user
 * @param {object}  cmhCertificate  - Certificate from the CheckMyHTTPS server
 * @returns {string} - verification result
 * Check if the user's certificate is valid.
 */
CMH.certificatesChecker.verifyCertificate = (userCertificate, cmhCertificate) => {
  const userCertificate_sha256s = CMH.certificatesChecker.extract_sha256s(userCertificate)
  const cmhCertificate_sha256s = CMH.certificatesChecker.extract_sha256s(cmhCertificate)
 
  let len = Math.min( (userCertificate_sha256s && userCertificate_sha256s.length) || 1, (cmhCertificate_sha256s && cmhCertificate_sha256s.length) || 1 )
  if (len >= 3) {
    len = 2 // Only the two first sha256 are viable for comparison
  }
  let everySha256IsEqual = true
  for (i = 0; i < len; i++) { 
    everySha256IsEqual = everySha256IsEqual && CMH.certificatesChecker.compareCertificateFingerprints(userCertificate_sha256s[i], cmhCertificate_sha256s[i])
  }

  if (everySha256IsEqual) {
    if (CMH.options.settings.alertOnUnicodeIDNDomainNames) {
      // Check if the domain name is an IDN (Internationalized Domain Name) e.g. примеры.рф
      const domainName = cmhCertificate.host.split(':')[0]
      const names = domainName.split('.')
      for (let name of names) {
        if (name.startsWith('xn--')) {
          return 'IDN'
        }
      }
    }
    return 'OK'
  } else {
    return 'KO'
  }
}


/**
 * @name handleVerificationResult
 * @function
 * @param {string} result            - Verification result
 * @param {object} url               - URL to check
 * @param {object} [tabId]           - Tab to check
 * @param {boolean} showNotifications - Show notifications
 * Check if the user's certificate is valid.
 */
CMH.certificatesChecker.handleVerificationResult = (result, url, tabId, showNotifications) => {
  if (result === 'OK') {
    if (tabId !== null) {
      CMH.tabsManager.setTabStatus(tabId, CMH.common.status.VALID)
    }
  } else if (result === 'IDN') {
    if (tabId !== null) {
      CMH.tabsManager.setTabStatus(tabId, CMH.common.status.VALID)
    }
    if (CMH.options.settings.alertOnUnicodeIDNDomainNames) {
      if (showNotifications) {
        CMH.ui.showNotification(browser.i18n.getMessage('__IDNwarning__', url), { openIDNInfoLinkPage: 1 })
      }
    }
  } else if (result === 'KO') {
    if (tabId !== null) {
      CMH.tabsManager.setTabStatus(tabId, CMH.common.status.INVALID)
    }
    if (showNotifications) {
      CMH.ui.showNotification(browser.i18n.getMessage('__danger__'), { priority: 2 })
    }
  } else {
    if (tabId !== null) {
      CMH.tabsManager.setTabStatus(tabId, CMH.common.status.UNKNOWN)
    }
    if (showNotifications) {
      CMH.ui.showNotification(browser.i18n.getMessage('__unknownIssue__'))
    }
  }
}


/**
 * @name compareCertificateFingerprints
 * @function
 * @param {object} userCertificateFingerprint - SHA256 fingerprint of certificate from the user
 * @param {object} cmhCertificateFingerprint  - SHA256 fingerprint of certificate from the check server
 * @returns {boolean}
 * Compare fingerprints of two certificates.
 */
CMH.certificatesChecker.compareCertificateFingerprints = (userCertificateFingerprint, cmhCertificateFingerprint) => {
  //console.log(userCertificateFingerprint + " VS " + cmhCertificateFingerprint)
  return (userCertificateFingerprint === cmhCertificateFingerprint)
}