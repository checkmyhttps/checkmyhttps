# CheckMyHTTPS API server installation

### Requirements
* You need an HTTPS server with PHP and php-filter module
* You also need a TMPFS partition for the cache. Here is the process (Linux):
1. Create the cache directory: `mkdir /mnt/cmh_cache`
2. Create the mount point: `mount -t tmpfs -o size=256M tmpfs /mnt/cmh_cache`
3. Add the following line to /etc/fstab so the mount point will remain after reboot: `tmpfs /mnt/cmh_cache tmpfs defaults,size=256M 0 0`

You can set the size you want for the cache. Here, we chose 256MB to store 64,000 records at the most.

The cache is enabled by default, but you can turn it off by setting $use_cache variable to false in `api.php`.

### Installation

1. Copy the content of the `www` folder to your webroot.
2. Install dependencies with composer: `composer install` inside your webroot (else you can extract `vendor-static.tar.gz`).
3. Then configure your clients to use your own check server.

### Testing with Docker

1. Put your certificate in `confs/cert` folder (with names: `cert.cer`, `privkey.key` and `chain.cer`).
2. Build the Docker image: `docker build -t checkmyhttps/cmh_server .`.
3. Run the docker container: `docker run -it --rm -p 443:443 checkmyhttps/cmh_server`.
