FROM php:8.2-cli

# System dependencies (swoole needs libssl-dev + libcurl4-openssl-dev)
RUN apt-get update && apt-get install -y \
    git curl zip unzip \
    libpq-dev libzip-dev libpng-dev libonig-dev \
    libssl-dev libcurl4-openssl-dev \
    && docker-php-ext-install pdo pdo_pgsql zip mbstring gd pcntl \
    && pecl install swoole --configureoptions 'enable-sockets="no" enable-openssl="yes" enable-http2="no" enable-mysqlnd="no"' \
    && docker-php-ext-enable swoole \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .

RUN composer install --no-dev --optimize-autoloader --no-interaction

RUN chown -R www-data:www-data storage bootstrap/cache

EXPOSE 8000

CMD ["sh", "-c", "php artisan config:cache && php artisan route:cache && php artisan view:cache && php artisan octane:start --server=swoole --host=0.0.0.0 --port=8000 --workers=auto"]
