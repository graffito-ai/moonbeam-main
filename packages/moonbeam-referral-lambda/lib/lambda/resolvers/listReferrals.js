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
exports.listReferrals = void 0;
const AWS = __importStar(require("aws-sdk"));
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
// @ts-ignore
const listReferrals = async (filter) => {
    // initializing the DynamoDB document client
    // @ts-ignore
    const docClient = new AWS.DynamoDB.DocumentClient();
    // @ts-ignore
    const params = {
        TableName: process.env.REFERRAL_TABLE,
    };
    try {
        // first check to see if the parameters are accurately passed in
        /**
         * first check to see if the incoming filter parameters are accurately passed in
         * we need to have one of either:
         * -
         */
        if (filter.inviteeEmail && filter.inviterEmail) {
            const validationErrMessage = "Invalid filters: inviteeEmail AND inviterEmail. Choose one or the other!";
            console.log(validationErrMessage);
            return {
                data: [],
                errorMessage: validationErrMessage,
                errorType: moonbeam_models_1.ReferralErrorType.UnexpectedError
            };
        }
        if (filter.statusInvitee && filter.statusInviter) {
            const validationErrMessage = "Invalid filters: statusInvitee AND statusInviter. Choose one or the other!";
            console.log(validationErrMessage);
            return {
                data: [],
                errorMessage: validationErrMessage,
                errorType: moonbeam_models_1.ReferralErrorType.UnexpectedError
            };
        }
        if ((filter.inviteeEmail && !filter.statusInvitee) || (!filter.inviteeEmail && filter.statusInvitee)) {
            const validationErrMessage = "Invalid filters: inviteeEmail AND statusInvitee are to be used together!";
            console.log(validationErrMessage);
            return {
                data: [],
                errorMessage: validationErrMessage,
                errorType: moonbeam_models_1.ReferralErrorType.UnexpectedError
            };
        }
        if ((filter.inviterEmail && !filter.statusInviter) || (!filter.inviterEmail && filter.statusInviter)) {
            const validationErrMessage = "Invalid filters: inviterEmail AND statusInviter are to be used together!";
            console.log(validationErrMessage);
            return {
                data: [],
                errorMessage: validationErrMessage,
                errorType: moonbeam_models_1.ReferralErrorType.UnexpectedError
            };
        }
        // build a response to return
        return {
            data: [],
            errorMessage: `Lala error mofo`,
            errorType: moonbeam_models_1.ReferralErrorType.UnexpectedError
        };
        // const referralData = await docClient.scan(params).promise();
        // return Item;
    }
    catch (err) {
        console.log(`Unexpected error while executing listReferrals query {}`, err);
        return {
            data: [],
            errorMessage: `Unexpected error while executing listReferrals query. ${err}`,
            errorType: moonbeam_models_1.ReferralErrorType.UnexpectedError
        };
    }
};
exports.listReferrals = listReferrals;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdFJlZmVycmFscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL2xpc3RSZWZlcnJhbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSw2Q0FBOEI7QUFDOUIsK0RBQWlHO0FBRWpHLGFBQWE7QUFDTixNQUFNLGFBQWEsR0FBRyxLQUFLLEVBQUUsTUFBeUIsRUFBNkIsRUFBRTtJQUN4Riw0Q0FBNEM7SUFDNUMsYUFBYTtJQUNiLE1BQU0sU0FBUyxHQUFHLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUVwRCxhQUFhO0lBQ2IsTUFBTSxNQUFNLEdBQUc7UUFDWCxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFlO0tBQ3pDLENBQUM7SUFFRixJQUFJO1FBQ0EsZ0VBQWdFO1FBQ2hFOzs7O1dBSUc7UUFDSCxJQUFJLE1BQU0sQ0FBQyxZQUFZLElBQUksTUFBTSxDQUFDLFlBQVksRUFBRTtZQUM1QyxNQUFNLG9CQUFvQixHQUFHLDBFQUEwRSxDQUFDO1lBQ3hHLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUNsQyxPQUFPO2dCQUNILElBQUksRUFBRSxFQUFFO2dCQUNSLFlBQVksRUFBRSxvQkFBb0I7Z0JBQ2xDLFNBQVMsRUFBRSxtQ0FBaUIsQ0FBQyxlQUFlO2FBQy9DLENBQUM7U0FDTDtRQUNELElBQUksTUFBTSxDQUFDLGFBQWEsSUFBSSxNQUFNLENBQUMsYUFBYSxFQUFFO1lBQzlDLE1BQU0sb0JBQW9CLEdBQUcsNEVBQTRFLENBQUM7WUFDMUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1lBQ2xDLE9BQU87Z0JBQ0gsSUFBSSxFQUFFLEVBQUU7Z0JBQ1IsWUFBWSxFQUFFLG9CQUFvQjtnQkFDbEMsU0FBUyxFQUFFLG1DQUFpQixDQUFDLGVBQWU7YUFDL0MsQ0FBQztTQUNMO1FBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxZQUFZLElBQUksTUFBTSxDQUFDLGFBQWEsQ0FBQyxFQUFFO1lBQ2xHLE1BQU0sb0JBQW9CLEdBQUcsMEVBQTBFLENBQUM7WUFDeEcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1lBQ2xDLE9BQU87Z0JBQ0gsSUFBSSxFQUFFLEVBQUU7Z0JBQ1IsWUFBWSxFQUFFLG9CQUFvQjtnQkFDbEMsU0FBUyxFQUFFLG1DQUFpQixDQUFDLGVBQWU7YUFDL0MsQ0FBQztTQUNMO1FBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxZQUFZLElBQUksTUFBTSxDQUFDLGFBQWEsQ0FBQyxFQUFFO1lBQ2xHLE1BQU0sb0JBQW9CLEdBQUcsMEVBQTBFLENBQUM7WUFDeEcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1lBQ2xDLE9BQU87Z0JBQ0gsSUFBSSxFQUFFLEVBQUU7Z0JBQ1IsWUFBWSxFQUFFLG9CQUFvQjtnQkFDbEMsU0FBUyxFQUFFLG1DQUFpQixDQUFDLGVBQWU7YUFDL0MsQ0FBQztTQUNMO1FBRUQsNkJBQTZCO1FBQzdCLE9BQU87WUFDSCxJQUFJLEVBQUUsRUFBRTtZQUNSLFlBQVksRUFBRSxpQkFBaUI7WUFDL0IsU0FBUyxFQUFFLG1DQUFpQixDQUFDLGVBQWU7U0FDL0MsQ0FBQztRQUNGLCtEQUErRDtRQUMvRCxlQUFlO0tBQ2xCO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVixPQUFPLENBQUMsR0FBRyxDQUFDLHlEQUF5RCxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRTVFLE9BQU87WUFDSCxJQUFJLEVBQUUsRUFBRTtZQUNSLFlBQVksRUFBRSx5REFBeUQsR0FBRyxFQUFFO1lBQzVFLFNBQVMsRUFBRSxtQ0FBaUIsQ0FBQyxlQUFlO1NBQy9DLENBQUM7S0FDTDtBQUNMLENBQUMsQ0FBQTtBQXZFWSxRQUFBLGFBQWEsaUJBdUV6QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIEFXUyBmcm9tICdhd3Mtc2RrJ1xuaW1wb3J0IHtMaXN0UmVmZXJyYWxJbnB1dCwgUmVmZXJyYWxFcnJvclR5cGUsIFJlZmVycmFsUmVzcG9uc2V9IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5cbi8vIEB0cy1pZ25vcmVcbmV4cG9ydCBjb25zdCBsaXN0UmVmZXJyYWxzID0gYXN5bmMgKGZpbHRlcjogTGlzdFJlZmVycmFsSW5wdXQpOiBQcm9taXNlPFJlZmVycmFsUmVzcG9uc2U+ID0+IHtcbiAgICAvLyBpbml0aWFsaXppbmcgdGhlIER5bmFtb0RCIGRvY3VtZW50IGNsaWVudFxuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBjb25zdCBkb2NDbGllbnQgPSBuZXcgQVdTLkR5bmFtb0RCLkRvY3VtZW50Q2xpZW50KCk7XG5cbiAgICAvLyBAdHMtaWdub3JlXG4gICAgY29uc3QgcGFyYW1zID0ge1xuICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LlJFRkVSUkFMX1RBQkxFISxcbiAgICB9O1xuXG4gICAgdHJ5IHtcbiAgICAgICAgLy8gZmlyc3QgY2hlY2sgdG8gc2VlIGlmIHRoZSBwYXJhbWV0ZXJzIGFyZSBhY2N1cmF0ZWx5IHBhc3NlZCBpblxuICAgICAgICAvKipcbiAgICAgICAgICogZmlyc3QgY2hlY2sgdG8gc2VlIGlmIHRoZSBpbmNvbWluZyBmaWx0ZXIgcGFyYW1ldGVycyBhcmUgYWNjdXJhdGVseSBwYXNzZWQgaW5cbiAgICAgICAgICogd2UgbmVlZCB0byBoYXZlIG9uZSBvZiBlaXRoZXI6XG4gICAgICAgICAqIC1cbiAgICAgICAgICovXG4gICAgICAgIGlmIChmaWx0ZXIuaW52aXRlZUVtYWlsICYmIGZpbHRlci5pbnZpdGVyRW1haWwpIHtcbiAgICAgICAgICAgIGNvbnN0IHZhbGlkYXRpb25FcnJNZXNzYWdlID0gXCJJbnZhbGlkIGZpbHRlcnM6IGludml0ZWVFbWFpbCBBTkQgaW52aXRlckVtYWlsLiBDaG9vc2Ugb25lIG9yIHRoZSBvdGhlciFcIjtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHZhbGlkYXRpb25FcnJNZXNzYWdlKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGF0YTogW10sXG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiB2YWxpZGF0aW9uRXJyTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFJlZmVycmFsRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZmlsdGVyLnN0YXR1c0ludml0ZWUgJiYgZmlsdGVyLnN0YXR1c0ludml0ZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IHZhbGlkYXRpb25FcnJNZXNzYWdlID0gXCJJbnZhbGlkIGZpbHRlcnM6IHN0YXR1c0ludml0ZWUgQU5EIHN0YXR1c0ludml0ZXIuIENob29zZSBvbmUgb3IgdGhlIG90aGVyIVwiO1xuICAgICAgICAgICAgY29uc29sZS5sb2codmFsaWRhdGlvbkVyck1lc3NhZ2UpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBkYXRhOiBbXSxcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IHZhbGlkYXRpb25FcnJNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogUmVmZXJyYWxFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGlmICgoZmlsdGVyLmludml0ZWVFbWFpbCAmJiAhZmlsdGVyLnN0YXR1c0ludml0ZWUpIHx8ICghZmlsdGVyLmludml0ZWVFbWFpbCAmJiBmaWx0ZXIuc3RhdHVzSW52aXRlZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IHZhbGlkYXRpb25FcnJNZXNzYWdlID0gXCJJbnZhbGlkIGZpbHRlcnM6IGludml0ZWVFbWFpbCBBTkQgc3RhdHVzSW52aXRlZSBhcmUgdG8gYmUgdXNlZCB0b2dldGhlciFcIjtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHZhbGlkYXRpb25FcnJNZXNzYWdlKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGF0YTogW10sXG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiB2YWxpZGF0aW9uRXJyTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFJlZmVycmFsRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoKGZpbHRlci5pbnZpdGVyRW1haWwgJiYgIWZpbHRlci5zdGF0dXNJbnZpdGVyKSB8fCAoIWZpbHRlci5pbnZpdGVyRW1haWwgJiYgZmlsdGVyLnN0YXR1c0ludml0ZXIpKSB7XG4gICAgICAgICAgICBjb25zdCB2YWxpZGF0aW9uRXJyTWVzc2FnZSA9IFwiSW52YWxpZCBmaWx0ZXJzOiBpbnZpdGVyRW1haWwgQU5EIHN0YXR1c0ludml0ZXIgYXJlIHRvIGJlIHVzZWQgdG9nZXRoZXIhXCI7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyh2YWxpZGF0aW9uRXJyTWVzc2FnZSk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRhdGE6IFtdLFxuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogdmFsaWRhdGlvbkVyck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBSZWZlcnJhbEVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBidWlsZCBhIHJlc3BvbnNlIHRvIHJldHVyblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGF0YTogW10sXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBMYWxhIGVycm9yIG1vZm9gLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBSZWZlcnJhbEVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfTtcbiAgICAgICAgLy8gY29uc3QgcmVmZXJyYWxEYXRhID0gYXdhaXQgZG9jQ2xpZW50LnNjYW4ocGFyYW1zKS5wcm9taXNlKCk7XG4gICAgICAgIC8vIHJldHVybiBJdGVtO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zb2xlLmxvZyhgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgbGlzdFJlZmVycmFscyBxdWVyeSB7fWAsIGVycik7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRhdGE6IFtdLFxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgbGlzdFJlZmVycmFscyBxdWVyeS4gJHtlcnJ9YCxcbiAgICAgICAgICAgIGVycm9yVHlwZTogUmVmZXJyYWxFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH07XG4gICAgfVxufVxuIl19