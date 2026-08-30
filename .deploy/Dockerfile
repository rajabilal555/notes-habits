ARG PHP_VERSION=php-8.5

FROM ghcr.io/rajabilal555/php-base:${PHP_VERSION} AS app-setup

ARG NON_ROOT_UID=1000
ARG NON_ROOT_GID=1000
ARG NON_ROOT_GROUP=app
ARG NON_ROOT_USER=app

ENV LARAVEL_PATH=/srv/app
ENV SERVER_NAME=:80
WORKDIR $LARAVEL_PATH

COPY composer.json composer.lock ./
RUN chown -R $NON_ROOT_USER:$NON_ROOT_GROUP $LARAVEL_PATH
COPY package.json package-lock.json ./
RUN chown -R $NON_ROOT_USER:$NON_ROOT_GROUP $LARAVEL_PATH
USER $NON_ROOT_USER

ARG APP_ENV=${APP_ENV:-production}
RUN if [ "$APP_ENV" = "local" ]; then \
        composer install --prefer-dist --no-scripts --no-autoloader --no-interaction; \
    else \
        composer install --prefer-dist --no-scripts --no-dev --no-autoloader --no-interaction; \
    fi
RUN rm -rf /home/$NON_ROOT_USER/.composer

RUN npm ci

COPY --chown=$NON_ROOT_USER:$NON_ROOT_GROUP . $LARAVEL_PATH/
COPY ./.deploy/config/php/local.ini /usr/local/etc/php/conf.d/local.ini

RUN composer dump-autoload --no-interaction --optimize \
    && cp .env.example .env \
    && php artisan key:generate --force --no-interaction \
    && mkdir -p \
        bootstrap/cache \
        storage/app \
        storage/framework/cache/data \
        storage/framework/sessions \
        storage/framework/views \
        storage/logs \
    && touch storage/app/database.sqlite \
    && php artisan wayfinder:generate --with-form --no-interaction \
    && npm run build \
    && rm -rf node_modules .env

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -sf http://localhost/up || exit 1

COPY ./.deploy/entrypoint.sh /entrypoint.sh

ENTRYPOINT ["sh", "/entrypoint.sh"]
