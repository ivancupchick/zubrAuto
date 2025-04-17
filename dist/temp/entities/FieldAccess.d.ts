export declare namespace FieldAccess {
    enum AccessBits {
        noAccess = 1,
        writable = 2
    }
    function isNoAccess(access: number): boolean;
    function writable(access: number): boolean;
}
