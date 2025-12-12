# CheckMyHTTPS API server Changelog

## 1.7.0 - 2025-12-12
- Removed SHA-1 fingerprint usage
- Removed API body response 'cmh_sha256'. The RSA-SHA256 signature verification on clients side is enough to guarantee that CMH will detect a MITM
- Removed API query parameter 'sign'. Now, every request is signed, no need to specify this parameter.
- Renamed API query parameter 'host_raw' to 'host_ip'
- Removed whitelist related code as a workaround has been found by transmitting the host_ip
- Added user query parameter sanitizing
- Changed SOCKET_TIMEOUT from 60 seconds to 6 seconds
- Removed unused code

## 1.6.0 - 2024-01-24
- Add the possibility to handle POST requests
- Delete the dependance to composer

## 1.6.0 - 2022-09-30
- Add server response signature option

## 1.5.1 - 2022-01-27
- Add the possibility to specify an IP in the query

## 1.5.0 - 2022-01-17
- The cache is now a directory in TMPFS (no more SQL server running).
- Add the option to use the cache or not.

## 1.4.0 - 2021-10-18
- Add DNS & fingerprints cache: divided response time by ~1000.

## 1.3.0 - 2019-08-31
- New private IP/host protection.

## 1.2.1 - 2019-03-04
- Fix a deprecated flag in PHP 7.3.

## 1.2.0 - 2018-05-06
- Disallow to check private IP/host (can be disabled).
- Add regex rules support for whitelisted domains.

## 1.1.0 - 2018-01-08
- Code rewrite.
- Release code to community.
 
