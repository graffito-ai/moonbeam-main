/**
 * Calculate CRC32 unsigned for 0x04C11DB7 polynomial.
 * Browser and NodeJS compatible version.
 */
export declare class CRC32 {
    /**
     * Lookup table calculated for 0xEDB88320 divisor
     */
    protected lookupTable: number[];
    calculate(input: string): number;
    protected strToBytes(input: string): Uint8Array;
    protected toUint32(num: number): number;
}
