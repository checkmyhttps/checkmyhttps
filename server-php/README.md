# CheckMyHTTPS API server installation

### Requirements

* You need an HTTPS server with PHP and php-filter module
* You also need a TMPFS partition for the cache. Here is the process (Linux):
1. Add your administrator user to the group of your server. Example with an Apache server: `[root]# usermod -a -G apache administrator`
2. Change the gid of the administrator (valid during this session only): `[administrator]$ newgrp apache`
3. Create the cache directory: `[administrator]$ mkdir /var/tmp/cmh_cache`

**IMPORTANT**: In the next 2 steps, you will need to replace **960** and **955** by the uid and the gid of your server (with Apache: `id apache`).

4. Mount it with the good rights (apache:apache only): `[root]# mount -t tmpfs -o mand,noatime,size=256m,nosuid,noexec,uid=`**960**`,gid=`**955**`,mode=770 tmpfs /var/tmp/cmh_cache`
5. Make it permanent (reboot-safe): add this line in `/etc/fstab`: `tmpfs /var/tmp/cmh_cache tmpfs mand,noatime,size=256m,nosuid,noexec,uid=`**960**`,gid=`**955**`,mode=770 0 0`

You can set the size you want for the cache. Here, we chose 256MB to store 64,000 records at the most.

The cache is enabled by default, but you can turn it off by setting the variable `$use_cache` to false in `api.php`.

### Installation

1. Copy the content of the `www` folder to your webroot.
2. Install dependencies with composer: `composer install` inside your webroot (else you can extract `vendor-static.tar.gz`).
3. Then configure your clients to use your own check server.

### Testing with Docker

1. Put your certificate in `confs/cert` folder (with names: `cert.cer`, `privkey.key` and `chain.cer`).
2. Build the Docker image: `docker build -t checkmyhttps/cmh_server .`.
3. Run the docker container: `docker run -it --rm -p 443:443 checkmyhttps/cmh_server`.

### More information

This server does not store clients data.

It only stores files containing the DNS resolution of checked hostnames and their certificates fingerprints, for a defined amount of time (default = 6 hours).
