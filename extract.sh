#!/bin/bash

echo "🚀 Извлекаем icon.zip..."

# Проверяем наличие zip файла
if [ ! -f "icon.zip" ]; then
    echo "❌ Файл icon.zip не найден!"
    exit 1
fi

# Создаем временную папку
mkdir -p temp-extract

# Извлекаем zip
echo "📦 Извлекаем содержимое..."
unzip -o icon.zip -d temp-extract/

# Показываем что извлекли
echo ""
echo "📋 Содержимое архива:"
ls -la temp-extract/

# Копируем в public
echo ""
echo "📁 Копируем файлы в public/..."
cp temp-extract/* public/ 2>/dev/null

# Показываем что получилось
echo ""
echo "✅ Файлы в public/:"
ls -la public/ | grep -E "\.(png|ico|svg|webmanifest|json)$"

# Удаляем временную папку
rm -rf temp-extract/

echo ""
echo "🎉 Готово!"