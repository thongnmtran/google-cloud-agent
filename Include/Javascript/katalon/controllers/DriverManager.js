
module.exports = class DriverManager {
  static drivers = new Set();

  static activeDriver;

  static active(driver) {
    this.drivers.add(driver);
    this.activeDriver = driver;
    return driver;
  }
};
