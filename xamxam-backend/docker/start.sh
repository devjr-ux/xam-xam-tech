#!/bin/sh
set -e

echo "=== XamXam Tech — Démarrage ==="

# Attendre que la base de données soit prête
echo "Attente de la base de données..."
until php artisan db:show --no-interaction 2>/dev/null || php -r "new PDO(getenv('DATABASE_URL') ?: ('pgsql:host=' . getenv('DB_HOST') . ';port=' . getenv('DB_PORT', '5432') . ';dbname=' . getenv('DB_DATABASE')), getenv('DB_USERNAME'), getenv('DB_PASSWORD'));" 2>/dev/null; do
    echo "Base de données non disponible — attente 3s..."
    sleep 3
done
echo "Base de données connectée !"

# Générer la clé si manquante
if [ -z "$APP_KEY" ]; then
    php artisan key:generate --force
fi

# Optimisations production
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Migrations
echo "Lancement des migrations..."
php artisan migrate --force --no-interaction

# Seed si premier déploiement (table users vide)
USER_COUNT=$(php artisan tinker --execute="echo App\Models\User::count();" 2>/dev/null || echo "0")
if [ "$USER_COUNT" = "0" ]; then
    echo "Première installation — création des données de base..."
    php artisan db:seed --force --no-interaction
fi

# Cache production
php artisan config:cache
php artisan route:cache

echo "=== Démarrage des services ==="
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
