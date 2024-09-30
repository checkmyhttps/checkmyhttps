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

6. Create the RSA private key (PEM format) to sign the server's answers: `openssl genrsa -out private_key 4096`.
7. Create the associated public key for the clients to check the server's signature: `openssl rsa -in private_key -pubout -out public_key`.
8. Store your private key **outside the web server folder**, and put the public key accessible from the web at `download/public_key`.
9. Edit `api.php` with the right path to your private key (replace `/path/to/your/private/key`).
10. Edit `api.php` with the **uppercase** SHA256 fingerprint of your HTTPS certificate (replace `SHA256_FINGERPRINT_OF_YOUR_SERVER_S_HTTPS_CERTIFICATE` in `$response->cmh_sha256`). You can use this command to retrieve the SHA256 fingerprint: ` openssl x509 -in your_certificate.crt -inform PEM -out /dev/stdout -outform DER | sha256sum | tr a-z A-Z`
11. Edit `api.php` and replace `['checkmyhttps.net','www.checkmyhttps.net','185.235.207.57']` with all your server's FQDN and ip addresses.

### Installation

1. Copy the content of the `www` folder to your webroot.
2. Install dependencies with composer: `composer install` inside your webroot (else you can extract `vendor-static.tar.gz`).
3. Then configure your clients to use your own check server.

### Scripted installation
1. Prepare the directory layout
- sources
```
$HOME/checkmyhttps
```
- wwwdir 
```
/opt/checkmyhttps/www
```
- private key dir
```
/opt/checkmyhttps/key
```
- tmpdir
```
/opt/checkmyhttps/tmp
```
- locate the server's https certificate
```
/etc/ssl/my.crt
```
- locate the webserver or php user
```
www-data
```

2. installation
```
# add this line in `/etc/fstab`: 
tmpfs /opt/checkmyhttps/tmp tmpfs mand,noatime,size=256m,nosuid,noexec,uid=www-data,gid=www-data,mode=770 0 0
mount /opt/checkmyhttps/tmp

./install.sh /opt/checkmyhttps/www /opt/checkmyhttps/key /etc/ssl/my.crt  mydomain.com
```
3. You will be asked to generate a new app ssl certificate

### Testing with Docker

1. Put your certificate in `confs/cert` folder (with names: `cert.cer`, `privkey.key` and `chain.cer`).
2. Build the Docker image: `docker build -t checkmyhttps/cmh_server .`.
3. Run the docker container: `docker run -it --rm -p 443:443 checkmyhttps/cmh_server`.

### More information

This server does not store clients data.

It only stores files containing the DNS resolution of checked hostnames and their certificates fingerprints, for a defined amount of time (default = 6 hours).
