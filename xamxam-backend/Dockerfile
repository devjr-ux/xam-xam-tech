FROM php:8.2-fpm-alpine

# ── Dépendances système ───────────────────────────────────
RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    libpng-dev \
    libxml2-dev \
    postgresql-dev \
    oniguruma-dev \
    zip \
    unzip \
    git

# ── Extensions PHP ────────────────────────────────────────
RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    pdo_mysql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    xml \
    opcache

# ── Composer ──────────────────────────────────────────────
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# ── Code source ───────────────────────────────────────────
WORKDIR /var/www

COPY . .

# Installer les dépendances (sans dev)
RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

# Créer le lien storage
RUN php artisan storage:link || true

# Permissions
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache && \
    chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# ── Configs Docker ────────────────────────────────────────
COPY docker/nginx.conf      /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/start.sh        /start.sh
RUN chmod +x /start.sh

EXPOSE 10000

CMD ["/start.sh"]
