import KatalonDriver = require('../core/KatalonDriver');

declare class DriverManager {
    static drivers: Set<KatalonDriver>;

    static activeDriver: KatalonDriver;

    static active(driver: KatalonDriver): KatalonDriver;
}

export = DriverManager;
