const {
  createLighthouseConfig,
} = require("./lighthouserc.shared.cjs");

module.exports = createLighthouseConfig({
  outputDirectory: "./lighthouse-reports/mobile",
  settings: {
    formFactor: "mobile",
    screenEmulation: {
      deviceScaleFactor: 2,
      disabled: false,
      height: 844,
      mobile: true,
      width: 390,
    },
  },
});
