# CheckMyHTTPS API server Changelog

## 1.5.2 - 2024-01-24
- Add the possibility to handle POST requests
- Delete the dependance to composer

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
 
