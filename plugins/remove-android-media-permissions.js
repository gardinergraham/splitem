const { withAndroidManifest } = require("expo/config-plugins");

const blockedMediaPermissions = new Set([
  "android.permission.READ_MEDIA_IMAGES",
  "android.permission.READ_MEDIA_VIDEO",
  "android.permission.READ_MEDIA_AUDIO"
]);

module.exports = function removeAndroidMediaPermissions(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    const permissions = manifest["uses-permission"] || [];

    manifest["uses-permission"] = permissions.filter((permission) => {
      return !blockedMediaPermissions.has(permission.$?.["android:name"]);
    });

    return config;
  });
};
