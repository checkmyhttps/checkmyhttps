## TODO:

- Whitelist - the goal is to delete it in the end, but here are the steps:
  - Server: Improve regex to avoid false positives
  - Client & server: Improve API in order to be able to query CMH server with one more manner: domain name + port + IP@ (for CDNs) and implement it client side -> We must indeed keep the domain name in case of virtual hosting (= several web servers for only one IP@)
- Server side memory cache in order reduce the CMH server responce time (this improvment is a prerequisite for the next todo item)
- External dependencies:
  - Check every external dependency of websites. A client side cache could also be implemented, useful when there are many recurring calls to well known dependencies (jquery, vuejs...), especially as some websites use a lot of external dependencies
