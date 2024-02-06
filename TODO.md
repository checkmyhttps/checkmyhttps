## TODO:

- Whitelist : The goal is to reduce the list of whitelisted websites. Here are the steps:
  - Server: Improve regex to avoid false positives (done);
  - Client & server: Improve API in order to add IP@ of the website. We must keep the fqdn in case of virtual hosting (= several web servers for only one IP@).
- External webpage URLs:
  - Check every external URLs in a webpage;
  - A client side cache should also be implemented. Useful when there are many recurring calls to well known dependencies (jquery, vuejs...), especially as some websites use a lot of external dependencies
- Security:
  - Implement an alternative to the current SSL Pinning. Indeed, this method implies to update every client when the server certificate changes (approximately each year).
  - Change the "Get/Head" method with "Post" (to avoid log records on server)
- Usability:
  - Add the option to set a custom certificate on the flutter app if the server certificate doesn't work.
