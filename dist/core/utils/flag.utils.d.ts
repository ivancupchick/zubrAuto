export declare namespace FlagField {
    enum Flags {
        System = 1,
        Virtual = 2
    }
    function setFlagOn(v: {
        flags: number;
    }, bit: Flags): void;
    function setFlagOff(v: {
        flags: number;
    }, bit: Flags): void;
    function Is(v: {
        flags: number;
    } | number, bit: Flags): boolean;
}
