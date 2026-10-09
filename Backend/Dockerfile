# ─── base : système, extensions PHP, Node, Composer (change rarement) ─────────
FROM php:8.2-cli AS base

# System dependencies (swoole needs libssl-dev + libcurl4-openssl-dev)
RUN apt-get update && apt-get install -y \
    git curl zip unzip \
    libpq-dev libzip-dev libpng-dev libonig-dev \
    libjpeg62-turbo-dev libwebp-dev \
    libssl-dev libcurl4-openssl-dev \
    && docker-php-ext-configure gd --with-jpeg --with-webp \
    && docker-php-ext-install pdo pdo_pgsql zip mbstring gd exif pcntl \
    && pecl install swoole --configureoptions 'enable-sockets="no" enable-openssl="yes" enable-http2="no" enable-mysqlnd="no"' \
    && docker-php-ext-enable swoole \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Node (for building Vite assets)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# ─── build : dépendances (en cache tant que les lockfiles ne changent pas) ─────
FROM base AS build

# Seuls les manifestes sont copiés ici : modifier du code PHP/Blade ne
# relance ni composer install ni npm ci.
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --no-interaction

COPY package.json package-lock.json ./
RUN npm ci

# Code de l'application : seules les étapes suivantes sont rejouées à chaque modif
COPY . .

RUN composer dump-autoload --optimize --no-dev \
    && npm run build \
    && rm -rf node_modules

# ─── final : image d'exécution, sans node_modules ─────────────────────────────
FROM base

COPY --from=build --chown=www-data:www-data /var/www /var/www

# Redimensionner une photo de téléphone (12–24 Mpx) la décompresse entièrement
# en mémoire (~4 octets/pixel) : 128M (défaut) fait planter l'upload (Media.php).
RUN echo "memory_limit=512M" > /usr/local/etc/php/conf.d/zz-evadia.ini

EXPOSE 8000

CMD ["sh", "-c", "php artisan config:cache && php artisan route:cache && php artisan view:cache && php artisan octane:start --server=swoole --host=0.0.0.0 --port=8000 --workers=auto"]
