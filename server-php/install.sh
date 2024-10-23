#!/bin/bash

BASE=$(readlink -f $(dirname $0))
IN="$BASE"

if [ $# -lt 4 ]; then
  echo "Usage: $0 <pub_dir> <key_dir> <server_ssl_cert> <trusted_hosts> [<tmp_dir>]"
  exit 3
fi
OUT="$1"
KEYDIR="$2"
CRT="$3"
THOSTS="$4"
TMPDIR="$5"


set -e

( [ -d $OUT ] && [ -f $CRT ] && [ -d "$KEYDIR" ]) || {
  echo "missing directories"
  exit 2
}
( [ ! -f "$KEYDIR/private_key" ] ) && {
    echo "private key not found. Create a new one ?"
    read A
    if [[ "$A" =~ y|Y ]]; then
      openssl genrsa -out $KEYDIR/private_key 4096
      openssl rsa -in $KEYDIR/private_key -pubout -out $KEYDIR/public_key
      echo "generated server key. Pulic key"
      cat $KEYDIR/public_key
    fi
}

( [ -f "$KEYDIR/private_key" ] && [ -f "$KEYDIR/public_key"  ]) || {
    echo "Key not found"
    exit 2
}

set +x

rsync -av --delete $IN/www/ $OUT/

ln -sTf $KEYDIR/public_key $OUT/download/public_key

echo "Config"
CERT_SHA=`openssl x509 -in $CRT -inform PEM -out /dev/stdout -outform DER | sha256sum | tr a-z A-Z | cut -d ' ' -f 1`
sed 's/SHA256_FINGERPRINT_OF_YOUR_SERVER_S_HTTPS_CERTIFICATE/'$CERT_SHA'/' -i $OUT/config.php
sed 's#/path/to/your/private/key#'"$KEYDIR"'/private_key#' -i $OUT/config.php
TH=`tr ',' '\n' <<<"$THOSTS" | awk '{ aa = "'"'"'" $0 "'"'"'" ; if (a) { a=a "," aa } else a=aa} END {print "["a"]"}'`
sed -r -i 's#(\$TRUSTED_HOSTS=).*#\1'$TH';#' $OUT/config.php
if [ -n "$TMPDIR" ]; then
  sed -i 's#/var/tmp/cmh_cache/#'${TMPDIR%%}/'#' $OUT/config.php
fi


(

    cd $OUT;
    COM=composer
    composer || {
        echo "installing composer"
        php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
        php -r "if (hash_file('sha384', 'composer-setup.php') === 'dac665fdc30fdd8ec78b38b9800061b4150413ff2e3b6f88543c636f7cd84f6db9189d43a81e5503cda447da73c7e5b6') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;"
        php composer-setup.php
        php -r "unlink('composer-setup.php');"
        COM='php composer.phar'
    
    }
    echo "Installing composer deps"
    $COM install
)

echo "All done"
