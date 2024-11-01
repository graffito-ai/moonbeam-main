"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventSeriesByOrganization = void 0;
/**
 * The map which defines our partner organizations and their
 * EventBrite event series.
 *
 * (this map needs to always be updated accordingly)
 */
exports.EventSeriesByOrganization = new Map([
    [
        "Veteran Spouse Network", [
            "307249470437",
            "694810576137",
            "735814269287",
            "760804776567",
            "768462390697",
            "776282059537",
            "770774957647",
            "764059140457",
            "769808005467",
            "759078011767",
            "763531452127",
            "804020395647",
            "809037552097",
            "837550645527",
            "837795848937",
            "820423898967",
            "795411446047",
            "849669041977",
            "846533322957",
            "848805138017",
            "852285186937",
            "849461621577",
            "849629874827",
            "853801351827",
            "852414985167",
            "846462150077",
            "862474322917",
            "859718620537",
            "859106539787", // My Journey: Spouse Mental Health & Trauma
        ]
    ]
]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXZlbnRTZXJpZXNCeU9yZ2FuaXphdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tb24vRXZlbnRTZXJpZXNCeU9yZ2FuaXphdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQTs7Ozs7R0FLRztBQUNVLFFBQUEseUJBQXlCLEdBQTBCLElBQUksR0FBRyxDQUFtQjtJQUN0RjtRQUNJLHdCQUF3QixFQUFFO1lBQ3RCLGNBQWM7WUFDZCxjQUFjO1lBQ2QsY0FBYztZQUNkLGNBQWM7WUFDZCxjQUFjO1lBQ2QsY0FBYztZQUNkLGNBQWM7WUFDZCxjQUFjO1lBQ2QsY0FBYztZQUNkLGNBQWM7WUFDZCxjQUFjO1lBQ2QsY0FBYztZQUNkLGNBQWM7WUFDZCxjQUFjO1lBQ2QsY0FBYztZQUNkLGNBQWM7WUFDZCxjQUFjO1lBQ2QsY0FBYztZQUNkLGNBQWM7WUFDZCxjQUFjO1lBQ2QsY0FBYztZQUNkLGNBQWM7WUFDZCxjQUFjO1lBQ2QsY0FBYztZQUNkLGNBQWM7WUFDZCxjQUFjO1lBQ2QsY0FBYztZQUNkLGNBQWM7WUFDZCxjQUFjLEVBQUUsNENBQTRDO1NBQ25FO0tBQ0E7Q0FDSixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFRoZSBtYXAgd2hpY2ggZGVmaW5lcyBvdXIgcGFydG5lciBvcmdhbml6YXRpb25zIGFuZCB0aGVpclxuICogRXZlbnRCcml0ZSBldmVudCBzZXJpZXMuXG4gKlxuICogKHRoaXMgbWFwIG5lZWRzIHRvIGFsd2F5cyBiZSB1cGRhdGVkIGFjY29yZGluZ2x5KVxuICovXG5leHBvcnQgY29uc3QgRXZlbnRTZXJpZXNCeU9yZ2FuaXphdGlvbjogTWFwPHN0cmluZywgc3RyaW5nW10+ID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZ1tdPihbXG4gICAgW1xuICAgICAgICBcIlZldGVyYW4gU3BvdXNlIE5ldHdvcmtcIiwgW1xuICAgICAgICAgICAgXCIzMDcyNDk0NzA0MzdcIiwgLy8gQ29mZmVlIENoYXRcbiAgICAgICAgICAgIFwiNjk0ODEwNTc2MTM3XCIsIC8vIERpdm9yY2VkIE1pbGl0YXJ5L1ZldGVyYW4gU3BvdXNlcy1QZWVyIFN1cHBvcnRcbiAgICAgICAgICAgIFwiNzM1ODE0MjY5Mjg3XCIsIC8vIE1vcm5pbmcgQnJlYXRod29yayB3aXRoIFdhcnJpb3IgU3Ryb25nXG4gICAgICAgICAgICBcIjc2MDgwNDc3NjU2N1wiLCAvLyBDQUxNIENvbnZlcnNhdGlvbnNcbiAgICAgICAgICAgIFwiNzY4NDYyMzkwNjk3XCIsIC8vIFRyYXZlbCBCZW5lZml0c1xuICAgICAgICAgICAgXCI3NzYyODIwNTk1MzdcIiwgLy8gRW1wb3dlckVkOiBTQVZFIFRyYWluaW5nXG4gICAgICAgICAgICBcIjc3MDc3NDk1NzY0N1wiLCAvLyBMZXQncyBUYWxrIEFib3V0IEl0OiBUYWtpbmcgQWN0aW9uXG4gICAgICAgICAgICBcIjc2NDA1OTE0MDQ1N1wiLCAvLyBMdW5jaCBhbmQgTGVhcm4gTmV0d29ya2luZyBIb3VyXG4gICAgICAgICAgICBcIjc2OTgwODAwNTQ2N1wiLCAvLyBSZWFsIFRhbGs6IExpZmUgJiBMb3ZlIHdpdGggUFRTRFxuICAgICAgICAgICAgXCI3NTkwNzgwMTE3NjdcIiwgLy8gSSdtIFdyaXRlIEFib3V0IFRoaXM6IE1vbnRobHkgSm91cm5hbGluZ1xuICAgICAgICAgICAgXCI3NjM1MzE0NTIxMjdcIiwgLy8gV3JpdGUgYXMgUmFpblxuICAgICAgICAgICAgXCI4MDQwMjAzOTU2NDdcIiwgLy8gQ2FyaW5nIFRvZ2V0aGVyOiBTdXBwb3J0aW5nIHRocm91Z2ggU3Vic3RhbmNlIEFidXNlXG4gICAgICAgICAgICBcIjgwOTAzNzU1MjA5N1wiLCAvLyBNYXN0ZXJpbmcgTWluZGZ1bG5lc3NcbiAgICAgICAgICAgIFwiODM3NTUwNjQ1NTI3XCIsIC8vIFRCSSBpbiBSZWxhdGlvbnNoaXBzXG4gICAgICAgICAgICBcIjgzNzc5NTg0ODkzN1wiLCAvLyBMZXQncyBUYWxrIEFib3V0IEl0OiBUQkkgaW4gUmVsYXRpb25zaGlwc1xuICAgICAgICAgICAgXCI4MjA0MjM4OTg5NjdcIiwgLy8gU28sIEkgbWFycmllZCBhIHZldGVyYW4uLi5Ob3cgd2hhdD9cbiAgICAgICAgICAgIFwiNzk1NDExNDQ2MDQ3XCIsIC8vIFNlbGYgRm9yZ2l2ZW5lc3NcbiAgICAgICAgICAgIFwiODQ5NjY5MDQxOTc3XCIsIC8vIEVtcG93ZXJFZDogVkEncyBDb2FjaGluZyBJbnRvIENhcmVcbiAgICAgICAgICAgIFwiODQ2NTMzMzIyOTU3XCIsIC8vIENoYW5nZSBIYXBwZW5zXG4gICAgICAgICAgICBcIjg0ODgwNTEzODAxN1wiLCAvLyBMZXZlcmFnaW5nIEFJIGluIFlvdXIgSm9iIFNlYXJjaFxuICAgICAgICAgICAgXCI4NTIyODUxODY5MzdcIiwgLy8gRW1wb3dlckVkOiBWQSBTQVZFICYgQ0FMTSBUcmFpbmluZ1xuICAgICAgICAgICAgXCI4NDk0NjE2MjE1NzdcIiwgLy8gVHJhdW1hOiBJbXBhY3Qgb24gT3VyIEJyYWluLCBNaW5kLCAmIEJvZHlcbiAgICAgICAgICAgIFwiODQ5NjI5ODc0ODI3XCIsIC8vIExldCdzIHRhbGsgYWJvdXQgaXQ6IFRyYXVtYSBvbiBvdXIgQnJhaW4sIE1pbmQsICYgQm9keVxuICAgICAgICAgICAgXCI4NTM4MDEzNTE4MjdcIiwgLy8gQ29tbXVuaWNhdGlvbiBCb290IENhbXBcbiAgICAgICAgICAgIFwiODUyNDE0OTg1MTY3XCIsIC8vIFlvdXRoIE1lbnRhbCBIZWFsdGggRmlyc3QgQWlkICYgVGFraW5nIEFjdGlvblxuICAgICAgICAgICAgXCI4NDY0NjIxNTAwNzdcIiwgLy8gU2lkZSBIdXN0bGVzIGFuZCBDb3N0LVNhdmluZyBTdHJhdGVnaWVzXG4gICAgICAgICAgICBcIjg2MjQ3NDMyMjkxN1wiLCAvLyBOdXJ0dXJpbmcgUmVsYXRpb25zaGlwc1xuICAgICAgICAgICAgXCI4NTk3MTg2MjA1MzdcIiwgLy8gTGV0J3MgVGFsayBBYm91dCBpdDogQ29hY2hpbmcgaW50byBDYXJlXG4gICAgICAgICAgICBcIjg1OTEwNjUzOTc4N1wiLCAvLyBNeSBKb3VybmV5OiBTcG91c2UgTWVudGFsIEhlYWx0aCAmIFRyYXVtYVxuICAgIF1cbiAgICBdXG5dKTtcbiJdfQ==