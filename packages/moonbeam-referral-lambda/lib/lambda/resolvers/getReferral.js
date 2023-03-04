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
/**
 * GetReferral resolver
 *
 * @param id referral id, for the referral to be retrieved
 * @returns {@link Promise} of {@link ReferralResponse}
 */
const getReferral = async (id) => {
    // initializing the DynamoDB document client
    const docClient = new AWS.DynamoDB.DocumentClient();
    const params = {
        TableName: process.env.REFERRAL_TABLE,
        Key: { id: id }
    };
    try {
        const { Item } = await docClient.get(params).promise();
        return {
            data: [Item]
        };
    }
    catch (err) {
        console.log(`Unexpected error while executing getReferral query {}`, err);
        return {
            errorMessage: `Unexpected error while executing getReferral query. ${err}`,
            errorType: moonbeam_models_1.ReferralErrorType.UnexpectedError
        };
    }
};
exports.getReferral = getReferral;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0UmVmZXJyYWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL3Jlc29sdmVycy9nZXRSZWZlcnJhbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZDQUE4QjtBQUM5QiwrREFBOEU7QUFHOUU7Ozs7O0dBS0c7QUFDSSxNQUFNLFdBQVcsR0FBRyxLQUFLLEVBQUUsRUFBVSxFQUE2QixFQUFFO0lBQ3ZFLDRDQUE0QztJQUM1QyxNQUFNLFNBQVMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLENBQUM7SUFFcEQsTUFBTSxNQUFNLEdBQUc7UUFDWCxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFlO1FBQ3RDLEdBQUcsRUFBRSxFQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUM7S0FDaEIsQ0FBQztJQUVGLElBQUk7UUFDQSxNQUFNLEVBQUMsSUFBSSxFQUFDLEdBQUcsTUFBTSxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3JELE9BQU87WUFDSCxJQUFJLEVBQUUsQ0FBQyxJQUFnQixDQUFDO1NBQzNCLENBQUE7S0FDSjtJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1REFBdUQsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUMxRSxPQUFPO1lBQ0gsWUFBWSxFQUFFLHVEQUF1RCxHQUFHLEVBQUU7WUFDMUUsU0FBUyxFQUFFLG1DQUFpQixDQUFDLGVBQWU7U0FDL0MsQ0FBQztLQUNMO0FBQ0wsQ0FBQyxDQUFBO0FBckJZLFFBQUEsV0FBVyxlQXFCdkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBBV1MgZnJvbSAnYXdzLXNkaydcbmltcG9ydCB7UmVmZXJyYWxFcnJvclR5cGUsIFJlZmVycmFsUmVzcG9uc2V9IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5pbXBvcnQgeyBSZWZlcnJhbCB9IGZyb20gJ0Btb29uYmVhbS9tb29uYmVhbS1tb2RlbHMnO1xuXG4vKipcbiAqIEdldFJlZmVycmFsIHJlc29sdmVyXG4gKlxuICogQHBhcmFtIGlkIHJlZmVycmFsIGlkLCBmb3IgdGhlIHJlZmVycmFsIHRvIGJlIHJldHJpZXZlZFxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBSZWZlcnJhbFJlc3BvbnNlfVxuICovXG5leHBvcnQgY29uc3QgZ2V0UmVmZXJyYWwgPSBhc3luYyAoaWQ6IHN0cmluZyk6IFByb21pc2U8UmVmZXJyYWxSZXNwb25zZT4gPT4ge1xuICAgIC8vIGluaXRpYWxpemluZyB0aGUgRHluYW1vREIgZG9jdW1lbnQgY2xpZW50XG4gICAgY29uc3QgZG9jQ2xpZW50ID0gbmV3IEFXUy5EeW5hbW9EQi5Eb2N1bWVudENsaWVudCgpO1xuXG4gICAgY29uc3QgcGFyYW1zID0ge1xuICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LlJFRkVSUkFMX1RBQkxFISxcbiAgICAgICAgS2V5OiB7aWQ6IGlkfVxuICAgIH07XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCB7SXRlbX0gPSBhd2FpdCBkb2NDbGllbnQuZ2V0KHBhcmFtcykucHJvbWlzZSgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGF0YTogW0l0ZW0gYXMgUmVmZXJyYWxdXG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5sb2coYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nIGdldFJlZmVycmFsIHF1ZXJ5IHt9YCwgZXJyKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nIGdldFJlZmVycmFsIHF1ZXJ5LiAke2Vycn1gLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBSZWZlcnJhbEVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfTtcbiAgICB9XG59XG4iXX0=