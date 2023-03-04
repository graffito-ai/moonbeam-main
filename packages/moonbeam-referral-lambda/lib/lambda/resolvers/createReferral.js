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
exports.createReferral = void 0;
const AWS = __importStar(require("aws-sdk"));
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * CreateReferral resolver
 *
 * @param createInput referral object to be created
 * @returns {@link Promise} of {@link ReferralResponse}
 */
const createReferral = async (createInput) => {
    // initializing the DynamoDB document client
    const docClient = new AWS.DynamoDB.DocumentClient();
    const params = {
        TableName: process.env.REFERRAL_TABLE,
        Item: createInput
    };
    try {
        await docClient.put(params).promise();
        return {
            data: [createInput]
        };
    }
    catch (err) {
        console.log(`Unexpected error while executing createReferral query {}`, err);
        return {
            errorMessage: `Unexpected error while executing createReferral query. ${err}`,
            errorType: moonbeam_models_1.ReferralErrorType.UnexpectedError
        };
    }
};
exports.createReferral = createReferral;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlUmVmZXJyYWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL3Jlc29sdmVycy9jcmVhdGVSZWZlcnJhbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZDQUE4QjtBQUM5QiwrREFBbUc7QUFFbkc7Ozs7O0dBS0c7QUFDSSxNQUFNLGNBQWMsR0FBRyxLQUFLLEVBQUUsV0FBZ0MsRUFBNkIsRUFBRTtJQUNoRyw0Q0FBNEM7SUFDNUMsTUFBTSxTQUFTLEdBQUcsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBRXBELE1BQU0sTUFBTSxHQUFHO1FBQ1gsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBZTtRQUN0QyxJQUFJLEVBQUUsV0FBVztLQUNwQixDQUFDO0lBRUYsSUFBSTtRQUNBLE1BQU0sU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN0QyxPQUFPO1lBQ0gsSUFBSSxFQUFFLENBQUMsV0FBVyxDQUFDO1NBQ3RCLENBQUE7S0FDSjtJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQywwREFBMEQsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUM3RSxPQUFPO1lBQ0gsWUFBWSxFQUFFLDBEQUEwRCxHQUFHLEVBQUU7WUFDN0UsU0FBUyxFQUFFLG1DQUFpQixDQUFDLGVBQWU7U0FDL0MsQ0FBQztLQUNMO0FBQ0wsQ0FBQyxDQUFBO0FBckJZLFFBQUEsY0FBYyxrQkFxQjFCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgQVdTIGZyb20gJ2F3cy1zZGsnXG5pbXBvcnQge0NyZWF0ZVJlZmVycmFsSW5wdXQsIFJlZmVycmFsRXJyb3JUeXBlLCBSZWZlcnJhbFJlc3BvbnNlfSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuXG4vKipcbiAqIENyZWF0ZVJlZmVycmFsIHJlc29sdmVyXG4gKlxuICogQHBhcmFtIGNyZWF0ZUlucHV0IHJlZmVycmFsIG9iamVjdCB0byBiZSBjcmVhdGVkXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIFJlZmVycmFsUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBjcmVhdGVSZWZlcnJhbCA9IGFzeW5jIChjcmVhdGVJbnB1dDogQ3JlYXRlUmVmZXJyYWxJbnB1dCk6IFByb21pc2U8UmVmZXJyYWxSZXNwb25zZT4gPT4ge1xuICAgIC8vIGluaXRpYWxpemluZyB0aGUgRHluYW1vREIgZG9jdW1lbnQgY2xpZW50XG4gICAgY29uc3QgZG9jQ2xpZW50ID0gbmV3IEFXUy5EeW5hbW9EQi5Eb2N1bWVudENsaWVudCgpO1xuXG4gICAgY29uc3QgcGFyYW1zID0ge1xuICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LlJFRkVSUkFMX1RBQkxFISxcbiAgICAgICAgSXRlbTogY3JlYXRlSW5wdXRcbiAgICB9O1xuXG4gICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgZG9jQ2xpZW50LnB1dChwYXJhbXMpLnByb21pc2UoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRhdGE6IFtjcmVhdGVJbnB1dF1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zb2xlLmxvZyhgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgY3JlYXRlUmVmZXJyYWwgcXVlcnkge31gLCBlcnIpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgY3JlYXRlUmVmZXJyYWwgcXVlcnkuICR7ZXJyfWAsXG4gICAgICAgICAgICBlcnJvclR5cGU6IFJlZmVycmFsRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICB9O1xuICAgIH1cbn1cbiJdfQ==