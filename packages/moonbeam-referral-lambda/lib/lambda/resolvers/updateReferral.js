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
exports.updateReferral = void 0;
const AWS = __importStar(require("aws-sdk"));
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * UpdateReferral resolver
 *
 * @param updateInput input to update a referral to
 * @returns {@link Promise} of {@link ReferralResponse}
 */
const updateReferral = async (updateInput) => {
    // initializing the DynamoDB document client
    const docClient = new AWS.DynamoDB.DocumentClient();
    let params = {
        TableName: process.env.REFERRAL_TABLE,
        Key: {
            id: updateInput.id
        },
        ExpressionAttributeValues: {},
        ExpressionAttributeNames: {},
        UpdateExpression: "",
        ReturnValues: "UPDATED_NEW"
    };
    let prefix = "set ";
    let attributes = Object.keys(updateInput);
    for (let i = 0; i < attributes.length; i++) {
        let attribute = attributes[i];
        if (attribute !== "id") {
            params["UpdateExpression"] += prefix + "#" + attribute + " = :" + attribute;
            // @ts-ignore
            params["ExpressionAttributeValues"][":" + attribute] = updateInput[attribute];
            params["ExpressionAttributeNames"]["#" + attribute] = attribute;
            prefix = ", ";
        }
    }
    try {
        await docClient.update(params).promise();
        return {
            data: [updateInput]
        };
    }
    catch (err) {
        console.log(`Unexpected error while executing updateReferral query {}`, err);
        return {
            errorMessage: `Unexpected error while executing updateReferral query. ${err}`,
            errorType: moonbeam_models_1.ReferralErrorType.UnexpectedError
        };
    }
};
exports.updateReferral = updateReferral;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlUmVmZXJyYWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL3Jlc29sdmVycy91cGRhdGVSZWZlcnJhbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZDQUE4QjtBQUM5QiwrREFBNkc7QUFlN0c7Ozs7O0dBS0c7QUFDSSxNQUFNLGNBQWMsR0FBRyxLQUFLLEVBQUUsV0FBZ0MsRUFBNkIsRUFBRTtJQUNoRyw0Q0FBNEM7SUFDNUMsTUFBTSxTQUFTLEdBQUcsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBRXBELElBQUksTUFBTSxHQUFpQjtRQUN2QixTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFlO1FBQ3RDLEdBQUcsRUFBRTtZQUNELEVBQUUsRUFBRSxXQUFXLENBQUMsRUFBRTtTQUNyQjtRQUNELHlCQUF5QixFQUFFLEVBQUU7UUFDN0Isd0JBQXdCLEVBQUUsRUFBRTtRQUM1QixnQkFBZ0IsRUFBRSxFQUFFO1FBQ3BCLFlBQVksRUFBRSxhQUFhO0tBQzlCLENBQUM7SUFDRixJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDcEIsSUFBSSxVQUFVLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUMxQyxLQUFLLElBQUksQ0FBQyxHQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUN0QyxJQUFJLFNBQVMsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDOUIsSUFBSSxTQUFTLEtBQUssSUFBSSxFQUFFO1lBQ3BCLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLE1BQU0sR0FBRyxHQUFHLEdBQUcsU0FBUyxHQUFHLE1BQU0sR0FBRyxTQUFTLENBQUM7WUFDNUUsYUFBYTtZQUNiLE1BQU0sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLEdBQUcsR0FBRyxTQUFTLENBQUMsR0FBRyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDOUUsTUFBTSxDQUFDLDBCQUEwQixDQUFDLENBQUMsR0FBRyxHQUFHLFNBQVMsQ0FBQyxHQUFHLFNBQVMsQ0FBQztZQUNoRSxNQUFNLEdBQUcsSUFBSSxDQUFDO1NBQ2pCO0tBQ0o7SUFFRCxJQUFJO1FBQ0EsTUFBTSxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3pDLE9BQU87WUFDSCxJQUFJLEVBQUUsQ0FBQyxXQUF1QixDQUFDO1NBQ2xDLENBQUE7S0FDSjtJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQywwREFBMEQsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUM3RSxPQUFPO1lBQ0gsWUFBWSxFQUFFLDBEQUEwRCxHQUFHLEVBQUU7WUFDN0UsU0FBUyxFQUFFLG1DQUFpQixDQUFDLGVBQWU7U0FDL0MsQ0FBQztLQUNMO0FBQ0wsQ0FBQyxDQUFBO0FBdkNZLFFBQUEsY0FBYyxrQkF1QzFCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgQVdTIGZyb20gJ2F3cy1zZGsnXG5pbXBvcnQge1JlZmVycmFsLCBSZWZlcnJhbEVycm9yVHlwZSwgUmVmZXJyYWxSZXNwb25zZSwgVXBkYXRlUmVmZXJyYWxJbnB1dH0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcbmltcG9ydCB7VGFibGVOYW1lLCBVcGRhdGVFeHByZXNzaW9ufSBmcm9tICdhd3Mtc2RrL2NsaWVudHMvZHluYW1vZGInO1xuXG4vKipcbiAqIE1hcHBpbmcgb3V0IHRoZSB1cGRhdGUgcGFyYW1ldGVycyB0byBwYXNzIGluIHRvIHRoZSBEeW5hbW9EQiBjbGllbnRcbiAqL1xudHlwZSBVcGRhdGVQYXJhbXMgPSB7XG4gICAgVGFibGVOYW1lOiBUYWJsZU5hbWVcbiAgICBLZXk6IGFueSxcbiAgICBFeHByZXNzaW9uQXR0cmlidXRlVmFsdWVzOiBhbnksXG4gICAgRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzOiBhbnksXG4gICAgVXBkYXRlRXhwcmVzc2lvbjogVXBkYXRlRXhwcmVzc2lvbixcbiAgICBSZXR1cm5WYWx1ZXM6IHN0cmluZ1xufVxuXG4vKipcbiAqIFVwZGF0ZVJlZmVycmFsIHJlc29sdmVyXG4gKlxuICogQHBhcmFtIHVwZGF0ZUlucHV0IGlucHV0IHRvIHVwZGF0ZSBhIHJlZmVycmFsIHRvXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIFJlZmVycmFsUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCB1cGRhdGVSZWZlcnJhbCA9IGFzeW5jICh1cGRhdGVJbnB1dDogVXBkYXRlUmVmZXJyYWxJbnB1dCk6IFByb21pc2U8UmVmZXJyYWxSZXNwb25zZT4gPT4ge1xuICAgIC8vIGluaXRpYWxpemluZyB0aGUgRHluYW1vREIgZG9jdW1lbnQgY2xpZW50XG4gICAgY29uc3QgZG9jQ2xpZW50ID0gbmV3IEFXUy5EeW5hbW9EQi5Eb2N1bWVudENsaWVudCgpO1xuXG4gICAgbGV0IHBhcmFtczogVXBkYXRlUGFyYW1zID0ge1xuICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LlJFRkVSUkFMX1RBQkxFISxcbiAgICAgICAgS2V5OiB7XG4gICAgICAgICAgICBpZDogdXBkYXRlSW5wdXQuaWRcbiAgICAgICAgfSxcbiAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlczoge30sXG4gICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lczoge30sXG4gICAgICAgIFVwZGF0ZUV4cHJlc3Npb246IFwiXCIsXG4gICAgICAgIFJldHVyblZhbHVlczogXCJVUERBVEVEX05FV1wiXG4gICAgfTtcbiAgICBsZXQgcHJlZml4ID0gXCJzZXQgXCI7XG4gICAgbGV0IGF0dHJpYnV0ZXMgPSBPYmplY3Qua2V5cyh1cGRhdGVJbnB1dCk7XG4gICAgZm9yIChsZXQgaT0wOyBpIDwgYXR0cmlidXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsZXQgYXR0cmlidXRlID0gYXR0cmlidXRlc1tpXTtcbiAgICAgICAgaWYgKGF0dHJpYnV0ZSAhPT0gXCJpZFwiKSB7XG4gICAgICAgICAgICBwYXJhbXNbXCJVcGRhdGVFeHByZXNzaW9uXCJdICs9IHByZWZpeCArIFwiI1wiICsgYXR0cmlidXRlICsgXCIgPSA6XCIgKyBhdHRyaWJ1dGU7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICBwYXJhbXNbXCJFeHByZXNzaW9uQXR0cmlidXRlVmFsdWVzXCJdW1wiOlwiICsgYXR0cmlidXRlXSA9IHVwZGF0ZUlucHV0W2F0dHJpYnV0ZV07XG4gICAgICAgICAgICBwYXJhbXNbXCJFeHByZXNzaW9uQXR0cmlidXRlTmFtZXNcIl1bXCIjXCIgKyBhdHRyaWJ1dGVdID0gYXR0cmlidXRlO1xuICAgICAgICAgICAgcHJlZml4ID0gXCIsIFwiO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgZG9jQ2xpZW50LnVwZGF0ZShwYXJhbXMpLnByb21pc2UoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRhdGE6IFt1cGRhdGVJbnB1dCBhcyBSZWZlcnJhbF1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zb2xlLmxvZyhgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgdXBkYXRlUmVmZXJyYWwgcXVlcnkge31gLCBlcnIpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgdXBkYXRlUmVmZXJyYWwgcXVlcnkuICR7ZXJyfWAsXG4gICAgICAgICAgICBlcnJvclR5cGU6IFJlZmVycmFsRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICB9O1xuICAgIH1cbn1cbiJdfQ==