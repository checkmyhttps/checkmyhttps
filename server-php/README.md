# CheckMyHTTPS API server installation

*Requirements: You just need an HTTPS server with PHP & php-filter module*

1. Copy the content of the `www` folder to your webroot.
2. Install dependencies with composer: `composer install` inside your webroot (else you can extract `vendor-static.tar.gz`).
3. Then configure your clients to use your own check server.

## Testing with Docker

1. Put your certificate in `confs/cert` folder (with names: `cert.cer`, `privkey.key` and `chain.cer`).
2. Build the Docker image: `docker build -t checkmyhttps/cmh_server .`.
3. Run the docker container: `docker run -it --rm -p 443:443 checkmyhttps/cmh_server`.
