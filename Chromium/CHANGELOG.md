# CheckMyHTTPS Chromium Changelog

## 5.7.3 - 2025-09-28
- Added a list of private Top Level Domains so that the extension does not check (e.g. .localhost)
- Added a list of reserved IP addresses so that the extension does not check (e.g. 100.64.0.0/10)
- Added an informative button on Options page about IDN
- Added error handling of malformed URLs to check
- Added error handling for errors from check server API
- Removed SHA-1 fingerprint usage
- Removed hardcoded SHA256 of check server's certicate (cmh_sha256). If there is a MITM with a valid signature, checkMITM() won't return any error because the RSA-SHA256 signature verification would OK but the signed body response will still contain the (right) SHA256 of the requested's website certificate. Hence, that last hash will be different from the (wrong) SHA256 of the certificate on client side and CMH status will be invalid
- Removed API query parameter 'sign'. Now, every request is signed, no need to specify this parameter
- Renamed API query parameter 'host_raw' to 'host_ip'

## 5.7.2 - 2025-09-21
- Visual improvement of Main and Options pages
- UX improvement: added possibility for the user to hide steps explaining how to send the certificate fingerprint
- Hardcoded default server settings refactored. Check server public key was defined in 4 different parts; now it is defined in 1 part for easier maintainability
- Notifications now automatically close
- Removed parts of code linked to former version using Python script
- Removed part of code linked to whitelist
- Completed documentation of some functions
- IP address of checked url is now sent to check server to avoid certificate conflicts with websites using CDNs
- Refactored part of getCertUrl function used to get the certificate of an URL from check server's view by function getCertFromCheckServer
- getCertUrl function was used to get only the body response (data) to retrieve the check server's public key, now sendRequest function does it
- Created checkMITM function in order to regroup code from verifyServerAtStartup and getCertFromCheckServer (formerly requestFromUrl)
- Improved error handling messages
- Reorganized and improved localization messages
- Removed severalCertificates 'SC' case handling. It is now considered invalid.
- Checking an IDN (Internationalized Domain Name) website is now considered valid (as long as both certificate fingerprints are equal).
- Made the IDN warning notification clickable to redirect the user to wikipedia's IDN homograph attack page
- Removed Warning status as severalCertificates and IDN cases are no longer considered warning