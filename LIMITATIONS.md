## LIMITATIONS:

- Can't check some CDNs (Google, Amazon...). Explanation : our API handles the fact that some FQDN could have several @ip. However we can't perform the check action when multiple @IP of a FQDN have multiple certificates. We put these few FQDN in a whitelist.
- CMH don't check external links in a webpage (only its URL). It's in the "todo list". When implemented, this capability will be enabled as an option.
- Chrome extension (aka edge & chromium) needs the Python script "checkmyhttps.py" to work. This is not as user-friendly as the Firefox extension or mobile app. Explanation : the native webext API of chromium doesn't expose the minimum certificate informations need by CMH. We stay tune with chrome webext develppers forum to react if something change (https://bugs.chromium.org/p/chromium/issues/detail?id=628819)
- Mobile app don't work with custom "check server" if its certificate is self-signed or not signed by an CA Root registered by mozilla.
