const fs = require("fs");
const path = require("path");

function copyPrismaFiles() {
  console.log("Copying Prisma files for production build...");

  const sourceDir = path.join(__dirname, "..", "node_modules", ".prisma");
  const targetDir = path.join(__dirname, "..", "dist-electron", ".prisma");

  if (fs.existsSync(sourceDir)) {
    // 确保目标目录存在
    fs.mkdirSync(targetDir, { recursive: true });

    // 复制 .prisma 目录
    copyDirectory(sourceDir, targetDir);
    console.log("✅ Prisma files copied successfully");
  } else {
    console.log("❌ Prisma source directory not found");
  }
}

function copyDirectory(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyPrismaFiles();
