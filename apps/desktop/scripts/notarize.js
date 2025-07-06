const { notarize } = require("@electron/notarize");

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;

  // Only notarize for macOS platform
  if (electronPlatformName !== "darwin") {
    return;
  }

  // Check if required environment variables are set
  if (!process.env.APPLE_ID || !process.env.APPLE_ID_PASSWORD) {
    console.log(
      "⚠️  Skipping notarization: APPLE_ID or APPLE_ID_PASSWORD not set"
    );
    console.log("   For CI/CD, set these environment variables:");
    console.log("   - APPLE_ID: Your Apple ID email");
    console.log("   - APPLE_ID_PASSWORD: App-specific password");
    console.log("   - APPLE_TEAM_ID: Your team ID (optional but recommended)");
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  const appPath = `${appOutDir}/${appName}.app`;

  console.log(`🍎 Notarizing ${appName} at ${appPath}...`);

  try {
    await notarize({
      appBundleId: "com.planforge.desktop",
      appPath: appPath,
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_ID_PASSWORD,
      teamId: process.env.APPLE_TEAM_ID, // Optional but recommended
    });

    console.log("✅ Notarization completed successfully!");
  } catch (error) {
    console.error("❌ Notarization failed:", error);
    throw error;
  }
};
