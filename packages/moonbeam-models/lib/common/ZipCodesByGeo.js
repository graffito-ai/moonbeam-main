"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZipCodesByGeo = void 0;
/**
 * Constant used in order to retrieve Zip Codes, given a particular
 * city/metro area.
 */
exports.ZipCodesByGeo = new Map([
    [
        "San Antonio", [
            "78201",
            "78202",
            "78203",
            "78204",
            "78205",
            "78206",
            "78207",
            "78208",
            "78209",
            "78210",
            "78211",
            "78212",
            "78213",
            "78214",
            "78215",
            "78216",
            "78217",
            "78218",
            "78219",
            "78220",
            "78221",
            "78222",
            "78223",
            "78224",
            "78225",
            "78226",
            "78227",
            "78228",
            "78229",
            "78230",
            "78231",
            "78232",
            "78233",
            "78234",
            "78235",
            "78236",
            "78237",
            "78238",
            "78239",
            "78240",
            "78241",
            "78242",
            "78243",
            "78244",
            "78245",
            "78246",
            "78247",
            "78248",
            "78249",
            "78250",
            "78251",
            "78252",
            "78253",
            "78254",
            "78255",
            "78256",
            "78257",
            "78258",
            "78259",
            "78260",
            "78261",
            "78262",
            "78263",
            "78264",
            "78265",
            "78266",
            "78268",
            "78269",
            "78270",
            "78275",
            "78278",
            "78279",
            "78280",
            "78283",
            "78284",
            "78285",
            "78286",
            "78287",
            "78288",
            "78289",
            "78291",
            "78292",
            "78293",
            "78294",
            "78295",
            "78296",
            "78297",
            "78298",
            "78299"
        ]
    ]
]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiWmlwQ29kZXNCeUdlby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tb24vWmlwQ29kZXNCeUdlby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQTs7O0dBR0c7QUFDVSxRQUFBLGFBQWEsR0FBMEIsSUFBSSxHQUFHLENBQW1CO0lBQzFFO1FBQ0ksYUFBYSxFQUFFO1lBQ2YsT0FBTztZQUNQLE9BQU87WUFDUCxPQUFPO1lBQ1AsT0FBTztZQUNQLE9BQU87WUFDUCxPQUFPO1lBQ1AsT0FBTztZQUNQLE9BQU87WUFDUCxPQUFPO1lBQ1AsT0FBTztZQUNQLE9BQU87WUFDUCxPQUFPO1lBQ1AsT0FBTztZQUNQLE9BQU87WUFDUCxPQUFPO1lBQ1AsT0FBTztZQUNQLE9BQU87WUFDUCxPQUFPO1lBQ1AsT0FBTztZQUNQLE9BQU87WUFDUCxPQUFPO1lBQ1AsT0FBTztZQUNQLE9BQU87WUFDUCxPQUFPO1lBQ1AsT0FBTztZQUNQLE9BQU87WUFDUCxPQUFPO1lBQ1AsT0FBTztZQUNQLE9BQU87WUFDUCxPQUFPO1lBQ1AsT0FBTztZQUNQLE9BQU87WUFDUCxPQUFPO1lBQ1AsT0FBTztZQUNQLE9BQU87WUFDUCxPQUFPO1lBQ1AsT0FBTztZQUNQLE9BQU87WUFDUCxPQUFPO1lBQ1AsT0FBTztZQUNQLE9BQU87WUFDUCxPQUFPO1lBQ1AsT0FBTztZQUNQLE9BQU87WUFDUCxPQUFPO1lBQ1AsT0FBTztZQUNQLE9BQU87WUFDUCxPQUFPO1lBQ1AsT0FBTztZQUNQLE9BQU87WUFDUCxPQUFPO1lBQ1AsT0FBTztZQUNQLE9BQU87WUFDUCxPQUFPO1lBQ1AsT0FBTztZQUNQLE9BQU87WUFDUCxPQUFPO1lBQ1AsT0FBTztZQUNQLE9BQU87WUFDUCxPQUFPO1lBQ1AsT0FBTztZQUNQLE9BQU87WUFDUCxPQUFPO1lBQ1AsT0FBTztZQUNQLE9BQU87WUFDUCxPQUFPO1lBQ1AsT0FBTztZQUNQLE9BQU87WUFDUCxPQUFPO1lBQ1AsT0FBTztZQUNQLE9BQU87WUFDUCxPQUFPO1lBQ1AsT0FBTztZQUNQLE9BQU87WUFDUCxPQUFPO1lBQ1AsT0FBTztZQUNQLE9BQU87WUFDUCxPQUFPO1lBQ1AsT0FBTztZQUNQLE9BQU87WUFDUCxPQUFPO1lBQ1AsT0FBTztZQUNQLE9BQU87WUFDUCxPQUFPO1lBQ1AsT0FBTztZQUNQLE9BQU87WUFDUCxPQUFPO1lBQ1AsT0FBTztZQUNQLE9BQU87U0FDVjtLQUNBO0NBQ0osQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb25zdGFudCB1c2VkIGluIG9yZGVyIHRvIHJldHJpZXZlIFppcCBDb2RlcywgZ2l2ZW4gYSBwYXJ0aWN1bGFyXG4gKiBjaXR5L21ldHJvIGFyZWEuXG4gKi9cbmV4cG9ydCBjb25zdCBaaXBDb2Rlc0J5R2VvOiBNYXA8c3RyaW5nLCBzdHJpbmdbXT4gPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nW10+KFtcbiAgICBbXG4gICAgICAgIFwiU2FuIEFudG9uaW9cIiwgW1xuICAgICAgICBcIjc4MjAxXCIsXG4gICAgICAgIFwiNzgyMDJcIixcbiAgICAgICAgXCI3ODIwM1wiLFxuICAgICAgICBcIjc4MjA0XCIsXG4gICAgICAgIFwiNzgyMDVcIixcbiAgICAgICAgXCI3ODIwNlwiLFxuICAgICAgICBcIjc4MjA3XCIsXG4gICAgICAgIFwiNzgyMDhcIixcbiAgICAgICAgXCI3ODIwOVwiLFxuICAgICAgICBcIjc4MjEwXCIsXG4gICAgICAgIFwiNzgyMTFcIixcbiAgICAgICAgXCI3ODIxMlwiLFxuICAgICAgICBcIjc4MjEzXCIsXG4gICAgICAgIFwiNzgyMTRcIixcbiAgICAgICAgXCI3ODIxNVwiLFxuICAgICAgICBcIjc4MjE2XCIsXG4gICAgICAgIFwiNzgyMTdcIixcbiAgICAgICAgXCI3ODIxOFwiLFxuICAgICAgICBcIjc4MjE5XCIsXG4gICAgICAgIFwiNzgyMjBcIixcbiAgICAgICAgXCI3ODIyMVwiLFxuICAgICAgICBcIjc4MjIyXCIsXG4gICAgICAgIFwiNzgyMjNcIixcbiAgICAgICAgXCI3ODIyNFwiLFxuICAgICAgICBcIjc4MjI1XCIsXG4gICAgICAgIFwiNzgyMjZcIixcbiAgICAgICAgXCI3ODIyN1wiLFxuICAgICAgICBcIjc4MjI4XCIsXG4gICAgICAgIFwiNzgyMjlcIixcbiAgICAgICAgXCI3ODIzMFwiLFxuICAgICAgICBcIjc4MjMxXCIsXG4gICAgICAgIFwiNzgyMzJcIixcbiAgICAgICAgXCI3ODIzM1wiLFxuICAgICAgICBcIjc4MjM0XCIsXG4gICAgICAgIFwiNzgyMzVcIixcbiAgICAgICAgXCI3ODIzNlwiLFxuICAgICAgICBcIjc4MjM3XCIsXG4gICAgICAgIFwiNzgyMzhcIixcbiAgICAgICAgXCI3ODIzOVwiLFxuICAgICAgICBcIjc4MjQwXCIsXG4gICAgICAgIFwiNzgyNDFcIixcbiAgICAgICAgXCI3ODI0MlwiLFxuICAgICAgICBcIjc4MjQzXCIsXG4gICAgICAgIFwiNzgyNDRcIixcbiAgICAgICAgXCI3ODI0NVwiLFxuICAgICAgICBcIjc4MjQ2XCIsXG4gICAgICAgIFwiNzgyNDdcIixcbiAgICAgICAgXCI3ODI0OFwiLFxuICAgICAgICBcIjc4MjQ5XCIsXG4gICAgICAgIFwiNzgyNTBcIixcbiAgICAgICAgXCI3ODI1MVwiLFxuICAgICAgICBcIjc4MjUyXCIsXG4gICAgICAgIFwiNzgyNTNcIixcbiAgICAgICAgXCI3ODI1NFwiLFxuICAgICAgICBcIjc4MjU1XCIsXG4gICAgICAgIFwiNzgyNTZcIixcbiAgICAgICAgXCI3ODI1N1wiLFxuICAgICAgICBcIjc4MjU4XCIsXG4gICAgICAgIFwiNzgyNTlcIixcbiAgICAgICAgXCI3ODI2MFwiLFxuICAgICAgICBcIjc4MjYxXCIsXG4gICAgICAgIFwiNzgyNjJcIixcbiAgICAgICAgXCI3ODI2M1wiLFxuICAgICAgICBcIjc4MjY0XCIsXG4gICAgICAgIFwiNzgyNjVcIixcbiAgICAgICAgXCI3ODI2NlwiLFxuICAgICAgICBcIjc4MjY4XCIsXG4gICAgICAgIFwiNzgyNjlcIixcbiAgICAgICAgXCI3ODI3MFwiLFxuICAgICAgICBcIjc4Mjc1XCIsXG4gICAgICAgIFwiNzgyNzhcIixcbiAgICAgICAgXCI3ODI3OVwiLFxuICAgICAgICBcIjc4MjgwXCIsXG4gICAgICAgIFwiNzgyODNcIixcbiAgICAgICAgXCI3ODI4NFwiLFxuICAgICAgICBcIjc4Mjg1XCIsXG4gICAgICAgIFwiNzgyODZcIixcbiAgICAgICAgXCI3ODI4N1wiLFxuICAgICAgICBcIjc4Mjg4XCIsXG4gICAgICAgIFwiNzgyODlcIixcbiAgICAgICAgXCI3ODI5MVwiLFxuICAgICAgICBcIjc4MjkyXCIsXG4gICAgICAgIFwiNzgyOTNcIixcbiAgICAgICAgXCI3ODI5NFwiLFxuICAgICAgICBcIjc4Mjk1XCIsXG4gICAgICAgIFwiNzgyOTZcIixcbiAgICAgICAgXCI3ODI5N1wiLFxuICAgICAgICBcIjc4Mjk4XCIsXG4gICAgICAgIFwiNzgyOTlcIlxuICAgIF1cbiAgICBdXG5dKTtcbiJdfQ==