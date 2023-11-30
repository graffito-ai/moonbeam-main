"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CRC32 = void 0;
/**
 * Calculate CRC32 unsigned for 0x04C11DB7 polynomial.
 * Browser and NodeJS compatible version.
 */
class CRC32 {
    /**
     * Lookup table calculated for 0xEDB88320 divisor
     */
    lookupTable = [0, 1996959894, 3993919788, 2567524794, 124634137, 1886057615, 3915621685, 2657392035, 249268274, 2044508324, 3772115230, 2547177864, 162941995, 2125561021, 3887607047, 2428444049, 498536548, 1789927666, 4089016648, 2227061214, 450548861, 1843258603, 4107580753, 2211677639, 325883990, 1684777152, 4251122042, 2321926636, 335633487, 1661365465, 4195302755, 2366115317, 997073096, 1281953886, 3579855332, 2724688242, 1006888145, 1258607687, 3524101629, 2768942443, 901097722, 1119000684, 3686517206, 2898065728, 853044451, 1172266101, 3705015759, 2882616665, 651767980, 1373503546, 3369554304, 3218104598, 565507253, 1454621731, 3485111705, 3099436303, 671266974, 1594198024, 3322730930, 2970347812, 795835527, 1483230225, 3244367275, 3060149565, 1994146192, 31158534, 2563907772, 4023717930, 1907459465, 112637215, 2680153253, 3904427059, 2013776290, 251722036, 2517215374, 3775830040, 2137656763, 141376813, 2439277719, 3865271297, 1802195444, 476864866, 2238001368, 4066508878, 1812370925, 453092731, 2181625025, 4111451223, 1706088902, 314042704, 2344532202, 4240017532, 1658658271, 366619977, 2362670323, 4224994405, 1303535960, 984961486, 2747007092, 3569037538, 1256170817, 1037604311, 2765210733, 3554079995, 1131014506, 879679996, 2909243462, 3663771856, 1141124467, 855842277, 2852801631, 3708648649, 1342533948, 654459306, 3188396048, 3373015174, 1466479909, 544179635, 3110523913, 3462522015, 1591671054, 702138776, 2966460450, 3352799412, 1504918807, 783551873, 3082640443, 3233442989, 3988292384, 2596254646, 62317068, 1957810842, 3939845945, 2647816111, 81470997, 1943803523, 3814918930, 2489596804, 225274430, 2053790376, 3826175755, 2466906013, 167816743, 2097651377, 4027552580, 2265490386, 503444072, 1762050814, 4150417245, 2154129355, 426522225, 1852507879, 4275313526, 2312317920, 282753626, 1742555852, 4189708143, 2394877945, 397917763, 1622183637, 3604390888, 2714866558, 953729732, 1340076626, 3518719985, 2797360999, 1068828381, 1219638859, 3624741850, 2936675148, 906185462, 1090812512, 3747672003, 2825379669, 829329135, 1181335161, 3412177804, 3160834842, 628085408, 1382605366, 3423369109, 3138078467, 570562233, 1426400815, 3317316542, 2998733608, 733239954, 1555261956, 3268935591, 3050360625, 752459403, 1541320221, 2607071920, 3965973030, 1969922972, 40735498, 2617837225, 3943577151, 1913087877, 83908371, 2512341634, 3803740692, 2075208622, 213261112, 2463272603, 3855990285, 2094854071, 198958881, 2262029012, 4057260610, 1759359992, 534414190, 2176718541, 4139329115, 1873836001, 414664567, 2282248934, 4279200368, 1711684554, 285281116, 2405801727, 4167216745, 1634467795, 376229701, 2685067896, 3608007406, 1308918612, 956543938, 2808555105, 3495958263, 1231636301, 1047427035, 2932959818, 3654703836, 1088359270, 936918000, 2847714899, 3736837829, 1202900863, 817233897, 3183342108, 3401237130, 1404277552, 615818150, 3134207493, 3453421203, 1423857449, 601450431, 3009837614, 3294710456, 1567103746, 711928724, 3020668471, 3272380065, 1510334235, 755167117];
    calculate(input) {
        const bytes = this.strToBytes(input);
        let crc = 0xFFFFFFFF;
        for (const byte of bytes) {
            const tableIndex = (crc ^ byte) & 0xFF;
            const tableVal = this.lookupTable?.[tableIndex];
            if (tableVal === undefined)
                throw new Error('tableIndex out of range 0-255');
            crc = (crc >>> 8) ^ tableVal;
        }
        return this.toUint32(crc ^ 0xFFFFFFFF);
    }
    strToBytes(input) {
        const encoder = new TextEncoder();
        return encoder.encode(input);
    }
    toUint32(num) {
        if (num >= 0) {
            return num;
        }
        const a = new Uint32Array(1);
        a[0] = num;
        return a[0];
    }
}
exports.CRC32 = CRC32;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ1JDMzIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tbW9uL0NSQzMyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBOzs7R0FHRztBQUNILE1BQWEsS0FBSztJQUNkOztPQUVHO0lBQ08sV0FBVyxHQUFHLENBQUMsQ0FBQyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFFejhGLFNBQVMsQ0FBQyxLQUFhO1FBQzFCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDckMsSUFBSSxHQUFHLEdBQUcsVUFBVSxDQUFDO1FBQ3JCLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFO1lBQ3RCLE1BQU0sVUFBVSxHQUFHLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQztZQUN2QyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDaEQsSUFBSSxRQUFRLEtBQUssU0FBUztnQkFBRSxNQUFNLElBQUksS0FBSyxDQUFDLCtCQUErQixDQUFDLENBQUM7WUFDN0UsR0FBRyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQztTQUNoQztRQUVELE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEdBQUcsVUFBVSxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUVTLFVBQVUsQ0FBQyxLQUFhO1FBQzlCLE1BQU0sT0FBTyxHQUFHLElBQUksV0FBVyxFQUFFLENBQUM7UUFDbEMsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFFUyxRQUFRLENBQUMsR0FBVztRQUMxQixJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUU7WUFDVixPQUFPLEdBQUcsQ0FBQztTQUNkO1FBQ0QsTUFBTSxDQUFDLEdBQUcsSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztRQUNYLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2hCLENBQUM7Q0FDSjtBQWhDRCxzQkFnQ0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENhbGN1bGF0ZSBDUkMzMiB1bnNpZ25lZCBmb3IgMHgwNEMxMURCNyBwb2x5bm9taWFsLlxuICogQnJvd3NlciBhbmQgTm9kZUpTIGNvbXBhdGlibGUgdmVyc2lvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIENSQzMyIHtcbiAgICAvKipcbiAgICAgKiBMb29rdXAgdGFibGUgY2FsY3VsYXRlZCBmb3IgMHhFREI4ODMyMCBkaXZpc29yXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGxvb2t1cFRhYmxlID0gWzAsIDE5OTY5NTk4OTQsIDM5OTM5MTk3ODgsIDI1Njc1MjQ3OTQsIDEyNDYzNDEzNywgMTg4NjA1NzYxNSwgMzkxNTYyMTY4NSwgMjY1NzM5MjAzNSwgMjQ5MjY4Mjc0LCAyMDQ0NTA4MzI0LCAzNzcyMTE1MjMwLCAyNTQ3MTc3ODY0LCAxNjI5NDE5OTUsIDIxMjU1NjEwMjEsIDM4ODc2MDcwNDcsIDI0Mjg0NDQwNDksIDQ5ODUzNjU0OCwgMTc4OTkyNzY2NiwgNDA4OTAxNjY0OCwgMjIyNzA2MTIxNCwgNDUwNTQ4ODYxLCAxODQzMjU4NjAzLCA0MTA3NTgwNzUzLCAyMjExNjc3NjM5LCAzMjU4ODM5OTAsIDE2ODQ3NzcxNTIsIDQyNTExMjIwNDIsIDIzMjE5MjY2MzYsIDMzNTYzMzQ4NywgMTY2MTM2NTQ2NSwgNDE5NTMwMjc1NSwgMjM2NjExNTMxNywgOTk3MDczMDk2LCAxMjgxOTUzODg2LCAzNTc5ODU1MzMyLCAyNzI0Njg4MjQyLCAxMDA2ODg4MTQ1LCAxMjU4NjA3Njg3LCAzNTI0MTAxNjI5LCAyNzY4OTQyNDQzLCA5MDEwOTc3MjIsIDExMTkwMDA2ODQsIDM2ODY1MTcyMDYsIDI4OTgwNjU3MjgsIDg1MzA0NDQ1MSwgMTE3MjI2NjEwMSwgMzcwNTAxNTc1OSwgMjg4MjYxNjY2NSwgNjUxNzY3OTgwLCAxMzczNTAzNTQ2LCAzMzY5NTU0MzA0LCAzMjE4MTA0NTk4LCA1NjU1MDcyNTMsIDE0NTQ2MjE3MzEsIDM0ODUxMTE3MDUsIDMwOTk0MzYzMDMsIDY3MTI2Njk3NCwgMTU5NDE5ODAyNCwgMzMyMjczMDkzMCwgMjk3MDM0NzgxMiwgNzk1ODM1NTI3LCAxNDgzMjMwMjI1LCAzMjQ0MzY3Mjc1LCAzMDYwMTQ5NTY1LCAxOTk0MTQ2MTkyLCAzMTE1ODUzNCwgMjU2MzkwNzc3MiwgNDAyMzcxNzkzMCwgMTkwNzQ1OTQ2NSwgMTEyNjM3MjE1LCAyNjgwMTUzMjUzLCAzOTA0NDI3MDU5LCAyMDEzNzc2MjkwLCAyNTE3MjIwMzYsIDI1MTcyMTUzNzQsIDM3NzU4MzAwNDAsIDIxMzc2NTY3NjMsIDE0MTM3NjgxMywgMjQzOTI3NzcxOSwgMzg2NTI3MTI5NywgMTgwMjE5NTQ0NCwgNDc2ODY0ODY2LCAyMjM4MDAxMzY4LCA0MDY2NTA4ODc4LCAxODEyMzcwOTI1LCA0NTMwOTI3MzEsIDIxODE2MjUwMjUsIDQxMTE0NTEyMjMsIDE3MDYwODg5MDIsIDMxNDA0MjcwNCwgMjM0NDUzMjIwMiwgNDI0MDAxNzUzMiwgMTY1ODY1ODI3MSwgMzY2NjE5OTc3LCAyMzYyNjcwMzIzLCA0MjI0OTk0NDA1LCAxMzAzNTM1OTYwLCA5ODQ5NjE0ODYsIDI3NDcwMDcwOTIsIDM1NjkwMzc1MzgsIDEyNTYxNzA4MTcsIDEwMzc2MDQzMTEsIDI3NjUyMTA3MzMsIDM1NTQwNzk5OTUsIDExMzEwMTQ1MDYsIDg3OTY3OTk5NiwgMjkwOTI0MzQ2MiwgMzY2Mzc3MTg1NiwgMTE0MTEyNDQ2NywgODU1ODQyMjc3LCAyODUyODAxNjMxLCAzNzA4NjQ4NjQ5LCAxMzQyNTMzOTQ4LCA2NTQ0NTkzMDYsIDMxODgzOTYwNDgsIDMzNzMwMTUxNzQsIDE0NjY0Nzk5MDksIDU0NDE3OTYzNSwgMzExMDUyMzkxMywgMzQ2MjUyMjAxNSwgMTU5MTY3MTA1NCwgNzAyMTM4Nzc2LCAyOTY2NDYwNDUwLCAzMzUyNzk5NDEyLCAxNTA0OTE4ODA3LCA3ODM1NTE4NzMsIDMwODI2NDA0NDMsIDMyMzM0NDI5ODksIDM5ODgyOTIzODQsIDI1OTYyNTQ2NDYsIDYyMzE3MDY4LCAxOTU3ODEwODQyLCAzOTM5ODQ1OTQ1LCAyNjQ3ODE2MTExLCA4MTQ3MDk5NywgMTk0MzgwMzUyMywgMzgxNDkxODkzMCwgMjQ4OTU5NjgwNCwgMjI1Mjc0NDMwLCAyMDUzNzkwMzc2LCAzODI2MTc1NzU1LCAyNDY2OTA2MDEzLCAxNjc4MTY3NDMsIDIwOTc2NTEzNzcsIDQwMjc1NTI1ODAsIDIyNjU0OTAzODYsIDUwMzQ0NDA3MiwgMTc2MjA1MDgxNCwgNDE1MDQxNzI0NSwgMjE1NDEyOTM1NSwgNDI2NTIyMjI1LCAxODUyNTA3ODc5LCA0Mjc1MzEzNTI2LCAyMzEyMzE3OTIwLCAyODI3NTM2MjYsIDE3NDI1NTU4NTIsIDQxODk3MDgxNDMsIDIzOTQ4Nzc5NDUsIDM5NzkxNzc2MywgMTYyMjE4MzYzNywgMzYwNDM5MDg4OCwgMjcxNDg2NjU1OCwgOTUzNzI5NzMyLCAxMzQwMDc2NjI2LCAzNTE4NzE5OTg1LCAyNzk3MzYwOTk5LCAxMDY4ODI4MzgxLCAxMjE5NjM4ODU5LCAzNjI0NzQxODUwLCAyOTM2Njc1MTQ4LCA5MDYxODU0NjIsIDEwOTA4MTI1MTIsIDM3NDc2NzIwMDMsIDI4MjUzNzk2NjksIDgyOTMyOTEzNSwgMTE4MTMzNTE2MSwgMzQxMjE3NzgwNCwgMzE2MDgzNDg0MiwgNjI4MDg1NDA4LCAxMzgyNjA1MzY2LCAzNDIzMzY5MTA5LCAzMTM4MDc4NDY3LCA1NzA1NjIyMzMsIDE0MjY0MDA4MTUsIDMzMTczMTY1NDIsIDI5OTg3MzM2MDgsIDczMzIzOTk1NCwgMTU1NTI2MTk1NiwgMzI2ODkzNTU5MSwgMzA1MDM2MDYyNSwgNzUyNDU5NDAzLCAxNTQxMzIwMjIxLCAyNjA3MDcxOTIwLCAzOTY1OTczMDMwLCAxOTY5OTIyOTcyLCA0MDczNTQ5OCwgMjYxNzgzNzIyNSwgMzk0MzU3NzE1MSwgMTkxMzA4Nzg3NywgODM5MDgzNzEsIDI1MTIzNDE2MzQsIDM4MDM3NDA2OTIsIDIwNzUyMDg2MjIsIDIxMzI2MTExMiwgMjQ2MzI3MjYwMywgMzg1NTk5MDI4NSwgMjA5NDg1NDA3MSwgMTk4OTU4ODgxLCAyMjYyMDI5MDEyLCA0MDU3MjYwNjEwLCAxNzU5MzU5OTkyLCA1MzQ0MTQxOTAsIDIxNzY3MTg1NDEsIDQxMzkzMjkxMTUsIDE4NzM4MzYwMDEsIDQxNDY2NDU2NywgMjI4MjI0ODkzNCwgNDI3OTIwMDM2OCwgMTcxMTY4NDU1NCwgMjg1MjgxMTE2LCAyNDA1ODAxNzI3LCA0MTY3MjE2NzQ1LCAxNjM0NDY3Nzk1LCAzNzYyMjk3MDEsIDI2ODUwNjc4OTYsIDM2MDgwMDc0MDYsIDEzMDg5MTg2MTIsIDk1NjU0MzkzOCwgMjgwODU1NTEwNSwgMzQ5NTk1ODI2MywgMTIzMTYzNjMwMSwgMTA0NzQyNzAzNSwgMjkzMjk1OTgxOCwgMzY1NDcwMzgzNiwgMTA4ODM1OTI3MCwgOTM2OTE4MDAwLCAyODQ3NzE0ODk5LCAzNzM2ODM3ODI5LCAxMjAyOTAwODYzLCA4MTcyMzM4OTcsIDMxODMzNDIxMDgsIDM0MDEyMzcxMzAsIDE0MDQyNzc1NTIsIDYxNTgxODE1MCwgMzEzNDIwNzQ5MywgMzQ1MzQyMTIwMywgMTQyMzg1NzQ0OSwgNjAxNDUwNDMxLCAzMDA5ODM3NjE0LCAzMjk0NzEwNDU2LCAxNTY3MTAzNzQ2LCA3MTE5Mjg3MjQsIDMwMjA2Njg0NzEsIDMyNzIzODAwNjUsIDE1MTAzMzQyMzUsIDc1NTE2NzExN107XG5cbiAgICBwdWJsaWMgY2FsY3VsYXRlKGlucHV0OiBzdHJpbmcpOiBudW1iZXIge1xuICAgICAgICBjb25zdCBieXRlcyA9IHRoaXMuc3RyVG9CeXRlcyhpbnB1dCk7XG4gICAgICAgIGxldCBjcmMgPSAweEZGRkZGRkZGO1xuICAgICAgICBmb3IgKGNvbnN0IGJ5dGUgb2YgYnl0ZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHRhYmxlSW5kZXggPSAoY3JjIF4gYnl0ZSkgJiAweEZGO1xuICAgICAgICAgICAgY29uc3QgdGFibGVWYWwgPSB0aGlzLmxvb2t1cFRhYmxlPy5bdGFibGVJbmRleF07XG4gICAgICAgICAgICBpZiAodGFibGVWYWwgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKCd0YWJsZUluZGV4IG91dCBvZiByYW5nZSAwLTI1NScpO1xuICAgICAgICAgICAgY3JjID0gKGNyYyA+Pj4gOCkgXiB0YWJsZVZhbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLnRvVWludDMyKGNyYyBeIDB4RkZGRkZGRkYpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBzdHJUb0J5dGVzKGlucHV0OiBzdHJpbmcpOiBVaW50OEFycmF5IHtcbiAgICAgICAgY29uc3QgZW5jb2RlciA9IG5ldyBUZXh0RW5jb2RlcigpO1xuICAgICAgICByZXR1cm4gZW5jb2Rlci5lbmNvZGUoaW5wdXQpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCB0b1VpbnQzMihudW06IG51bWJlcik6IG51bWJlciB7XG4gICAgICAgIGlmIChudW0gPj0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBhID0gbmV3IFVpbnQzMkFycmF5KDEpO1xuICAgICAgICBhWzBdID0gbnVtO1xuICAgICAgICByZXR1cm4gYVswXTtcbiAgICB9XG59XG4iXX0=