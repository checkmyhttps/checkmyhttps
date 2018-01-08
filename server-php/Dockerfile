FROM php:apache

RUN sed -i 's/^ServerTokens .*/ServerTokens Prod/g' /etc/apache2/conf-available/security.conf
RUN sed -i 's/^ServerSignature .*/ServerSignature Off/g' /etc/apache2/conf-available/security.conf
RUN echo 'expose_php = Off' > /usr/local/etc/php/php.ini

RUN a2enmod ssl && service apache2 restart

COPY ./confs/apache-site.conf /etc/apache2/sites-available/cmh_api.conf
COPY ./confs/cert /usr/local/etc/cmh_cert
RUN a2dissite * && a2ensite cmh_api

COPY ./www /var/www/cmh_api/

COPY ./vendor-static.tar.gz /tmp/
RUN tar -xzf /tmp/vendor-static.tar.gz -C /var/www/cmh_api/ && rm -f /tmp/vendor.tar.gz
