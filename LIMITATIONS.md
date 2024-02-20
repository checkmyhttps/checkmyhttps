## LIMITATIONS:

- Can't check some CDNs (Google, Amazon...). Explanation : our API handles the fact that some FQDN could have several @ip. However we can't perform the check action when multiple @IP of a FQDN have multiple certificates. We put these few FQDN in a whitelist.
- CMH don't check external links in a webpage (only its URL). It's in the "todo list". When implemented, this capability will be enabled as an option.
- Chrome extension (aka edge & chromium) needs the Python script "checkmyhttps.py" to run. It's not as user-friendly as the Firefox extension or the mobile App. Explanation : Chrome's native webext API doesn't expose the minimum certificate information need by CMH. We'll keep an eye on the chrome webext develpper forum to react to any changes (https://bugs.chromium.org/p/chromium/issues/detail?id=628819)
- The mobile app will not work with custom CheckMyHTTPS server if its certificate is self-signed or not signed by a mozilla-registered Root CA.
