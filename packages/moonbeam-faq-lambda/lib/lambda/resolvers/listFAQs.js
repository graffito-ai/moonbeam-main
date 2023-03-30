"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listFAQs = void 0;
const AWS = __importStar(require("aws-sdk"));
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * ListFAQs resolver
 *
 * @param listFaqInput input to be passed in, which will help filter through all the FAQs
 * @returns {@link Promise} of {@link AccountResponse}
 */
const listFAQs = async (listFaqInput) => {
    try {
        // initializing the DynamoDB document client
        const docClient = new AWS.DynamoDB.DocumentClient();
    }
    catch (err) {
        console.log(`Unexpected error while executing listFAQs query {}`, err);
        return {
            errorMessage: `Unexpected error while executing listFAQs query. ${err}`,
            errorType: moonbeam_models_1.FaqErrorType.UnexpectedError
        };
    }
};
exports.listFAQs = listFAQs;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdEZBUXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL3Jlc29sdmVycy9saXN0RkFRcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZDQUErQjtBQUMvQiwrREFBbUc7QUFFbkc7Ozs7O0dBS0c7QUFDSSxNQUFNLFFBQVEsR0FBRyxLQUFLLEVBQUUsWUFBMEIsRUFBd0IsRUFBRTtJQUMvRSxJQUFJO1FBQ0EsNENBQTRDO1FBQzVDLE1BQU0sU0FBUyxHQUFHLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQztLQUV2RDtJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvREFBb0QsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUV2RSxPQUFPO1lBQ0gsWUFBWSxFQUFFLG9EQUFvRCxHQUFHLEVBQUU7WUFDdkUsU0FBUyxFQUFFLDhCQUFZLENBQUMsZUFBZTtTQUMxQyxDQUFDO0tBQ0w7QUFDTCxDQUFDLENBQUE7QUFiWSxRQUFBLFFBQVEsWUFhcEIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBBV1MgZnJvbSAnYXdzLXNkayc7XG5pbXBvcnQge0FjY291bnRSZXNwb25zZSwgRmFxRXJyb3JUeXBlLCBGYXFSZXNwb25zZSwgTGlzdEZhcUlucHV0fSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuXG4vKipcbiAqIExpc3RGQVFzIHJlc29sdmVyXG4gKlxuICogQHBhcmFtIGxpc3RGYXFJbnB1dCBpbnB1dCB0byBiZSBwYXNzZWQgaW4sIHdoaWNoIHdpbGwgaGVscCBmaWx0ZXIgdGhyb3VnaCBhbGwgdGhlIEZBUXNcbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgQWNjb3VudFJlc3BvbnNlfVxuICovXG5leHBvcnQgY29uc3QgbGlzdEZBUXMgPSBhc3luYyAobGlzdEZhcUlucHV0OiBMaXN0RmFxSW5wdXQpOiBQcm9taXNlPEZhcVJlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gaW5pdGlhbGl6aW5nIHRoZSBEeW5hbW9EQiBkb2N1bWVudCBjbGllbnRcbiAgICAgICAgY29uc3QgZG9jQ2xpZW50ID0gbmV3IEFXUy5EeW5hbW9EQi5Eb2N1bWVudENsaWVudCgpO1xuXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyBsaXN0RkFRcyBxdWVyeSB7fWAsIGVycik7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nIGxpc3RGQVFzIHF1ZXJ5LiAke2Vycn1gLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBGYXFFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH07XG4gICAgfVxufVxuIl19