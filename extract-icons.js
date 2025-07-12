const fs = require("fs");
const path = require("path");
const unzipper = require("unzipper");

async function extractIcons() {
  console.log("🚀 Извлекаем иконки из icon.zip...");

  try {
    // Создаем поток для чтения zip файла
    const archive = fs
      .createReadStream("icon.zip")
      .pipe(unzipper.Parse({ forceStream: true }));

    const extractedFiles = [];

    for await (const entry of archive) {
      const fileName = entry.path;
      const type = entry.type;

      if (type === "File") {
        console.log(`📄 Найден файл: ${fileName}`);

        // Сохраняем файл в public/
        const outputPath = path.join("public", path.basename(fileName));
        entry.pipe(fs.createWriteStream(outputPath));

        extractedFiles.push({
          original: fileName,
          saved: outputPath,
          basename: path.basename(fileName),
        });
      } else {
        entry.autodrain();
      }
    }

    console.log("\n✅ Извлечение завершено!");
    console.log("\n📋 Извлеченные файлы:");
    extractedFiles.forEach((file) => {
      const stats = fs.statSync(file.saved);
      console.log(`   ${file.basename} (${Math.round(stats.size / 1024)}KB)`);
    });

    // Проверяем содержимое public/
    console.log("\n📁 Содержимое public/:");
    const publicFiles = fs
      .readdirSync("public")
      .filter((file) => file.match(/\.(png|ico|svg|webmanifest|json)$/i));

    publicFiles.forEach((file) => {
      const stats = fs.statSync(path.join("public", file));
      console.log(`   ${file} (${Math.round(stats.size / 1024)}KB)`);
    });

    return extractedFiles;
  } catch (error) {
    console.error("❌ Ошибка при извлечении:", error.message);
    throw error;
  }
}

// Запускаем извлечение
extractIcons()
  .then(() => {
    console.log("\n🎉 Готово! Теперь можно обновлять HTML.");
  })
  .catch((error) => {
    console.error("💥 Ошибка:", error);
  });
