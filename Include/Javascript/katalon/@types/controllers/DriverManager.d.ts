export = DriverManager;
declare class DriverManager {
    static drivers: Set<any>;
    static activeDriver: any;
    static active(driver: any): any;
}
