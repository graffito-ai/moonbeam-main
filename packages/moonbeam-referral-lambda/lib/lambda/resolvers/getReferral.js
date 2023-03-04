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
exports.getReferral = void 0;
const AWS = __importStar(require("aws-sdk"));
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const util_dynamodb_1 = require("@aws-sdk/util-dynamodb");
// @ts-ignore
const getReferral = async (id) => {
    // initializing the DynamoDB document client
    // @ts-ignore
    const docClient = new AWS.DynamoDB.DocumentClient();
    // @ts-ignore
    const params = {
        TableName: process.env.REFERRAL_TABLE,
        Key: { id: id }
    };
    try {
        const { Item } = await docClient.get(params).promise();
        const retrievedReferral = (0, util_dynamodb_1.unmarshall)(Item);
        return {
            data: [retrievedReferral]
        };
    }
    catch (err) {
        console.log(`Unexpected error while executing getReferral query {}`, err);
        return {
            data: [],
            errorMessage: `Unexpected error while executing getReferral query. ${err}`,
            errorType: moonbeam_models_1.ReferralErrorType.UnexpectedError
        };
    }
};
exports.getReferral = getReferral;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0UmVmZXJyYWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL3Jlc29sdmVycy9nZXRSZWZlcnJhbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZDQUE4QjtBQUM5QiwrREFBd0Y7QUFDeEYsMERBQWtEO0FBRWxELGFBQWE7QUFDTixNQUFNLFdBQVcsR0FBRyxLQUFLLEVBQUUsRUFBVSxFQUE2QixFQUFFO0lBQ3ZFLDRDQUE0QztJQUM1QyxhQUFhO0lBQ2IsTUFBTSxTQUFTLEdBQUcsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBRXBELGFBQWE7SUFDYixNQUFNLE1BQU0sR0FBRztRQUNYLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWU7UUFDdEMsR0FBRyxFQUFFLEVBQUMsRUFBRSxFQUFFLEVBQUUsRUFBQztLQUNoQixDQUFDO0lBRUYsSUFBSTtRQUNBLE1BQU0sRUFBQyxJQUFJLEVBQUMsR0FBRyxNQUFNLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDckQsTUFBTSxpQkFBaUIsR0FBRyxJQUFBLDBCQUFVLEVBQUMsSUFBSyxDQUFhLENBQUM7UUFDeEQsT0FBTztZQUNILElBQUksRUFBRSxDQUFDLGlCQUFpQixDQUFDO1NBQzVCLENBQUE7S0FDSjtJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1REFBdUQsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUUxRSxPQUFPO1lBQ0gsSUFBSSxFQUFFLEVBQUU7WUFDUixZQUFZLEVBQUUsdURBQXVELEdBQUcsRUFBRTtZQUMxRSxTQUFTLEVBQUUsbUNBQWlCLENBQUMsZUFBZTtTQUMvQyxDQUFDO0tBQ0w7QUFDTCxDQUFDLENBQUE7QUExQlksUUFBQSxXQUFXLGVBMEJ2QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIEFXUyBmcm9tICdhd3Mtc2RrJ1xuaW1wb3J0IHtSZWZlcnJhbCwgUmVmZXJyYWxFcnJvclR5cGUsIFJlZmVycmFsUmVzcG9uc2V9IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5pbXBvcnQge3VubWFyc2hhbGx9IGZyb20gXCJAYXdzLXNkay91dGlsLWR5bmFtb2RiXCI7XG5cbi8vIEB0cy1pZ25vcmVcbmV4cG9ydCBjb25zdCBnZXRSZWZlcnJhbCA9IGFzeW5jIChpZDogc3RyaW5nKTogUHJvbWlzZTxSZWZlcnJhbFJlc3BvbnNlPiA9PiB7XG4gICAgLy8gaW5pdGlhbGl6aW5nIHRoZSBEeW5hbW9EQiBkb2N1bWVudCBjbGllbnRcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgY29uc3QgZG9jQ2xpZW50ID0gbmV3IEFXUy5EeW5hbW9EQi5Eb2N1bWVudENsaWVudCgpO1xuXG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGNvbnN0IHBhcmFtcyA9IHtcbiAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5SRUZFUlJBTF9UQUJMRSEsXG4gICAgICAgIEtleToge2lkOiBpZH1cbiAgICB9O1xuXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3Qge0l0ZW19ID0gYXdhaXQgZG9jQ2xpZW50LmdldChwYXJhbXMpLnByb21pc2UoKTtcbiAgICAgICAgY29uc3QgcmV0cmlldmVkUmVmZXJyYWwgPSB1bm1hcnNoYWxsKEl0ZW0hKSBhcyBSZWZlcnJhbDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRhdGE6IFtyZXRyaWV2ZWRSZWZlcnJhbF1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zb2xlLmxvZyhgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgZ2V0UmVmZXJyYWwgcXVlcnkge31gLCBlcnIpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkYXRhOiBbXSxcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nIGdldFJlZmVycmFsIHF1ZXJ5LiAke2Vycn1gLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBSZWZlcnJhbEVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfTtcbiAgICB9XG59XG4iXX0=