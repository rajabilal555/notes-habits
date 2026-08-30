#!/bin/sh
set -e

echo "🎬 entrypoint.sh: [$(whoami)] [PHP $(php -r 'echo phpversion();')]"

composer dump-autoload --no-interaction --optimize

mkdir -p \
    "$LARAVEL_PATH/storage/framework/cache/data" \
    "$LARAVEL_PATH/storage/framework/sessions" \
    "$LARAVEL_PATH/storage/framework/views" \
    "$LARAVEL_PATH/storage/app/public" \
    "$LARAVEL_PATH/storage/app/private" \
    "$LARAVEL_PATH/storage/logs" \
    "$LARAVEL_PATH/bootstrap/cache"

LOG_FILE="$LARAVEL_PATH/storage/logs/laravel.log"
LOG_MAX_LINES="${LOG_MAX_LINES:-1000}"
echo "🎬 Trimming log file ($LOG_MAX_LINES lines)"
touch "$LOG_FILE"
tail -n "$LOG_MAX_LINES" "$LOG_FILE" > "${LOG_FILE}.tmp" && mv "${LOG_FILE}.tmp" "$LOG_FILE"

if [ "${DB_CONNECTION:-sqlite}" = "sqlite" ]; then
    db_path="${DB_DATABASE:-$LARAVEL_PATH/storage/app/database.sqlite}"
    mkdir -p "$(dirname "$db_path")"
    touch "$db_path"
fi

echo "🎬 Migrating"
php artisan migrate --no-interaction --force

echo "🎬 Linking storage"
php artisan storage:link --no-interaction

echo "🎬 optimize"
php artisan optimize --no-interaction

export SERVER_ROOT="${LARAVEL_PATH}/public"

echo "🎬 start supervisord"
exec supervisord -c "$LARAVEL_PATH/.deploy/config/supervisor.conf"
