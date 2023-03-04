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
const moonbeam_models_2 = require("@moonbeam/moonbeam-models");
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
        // constants to keep track of the type of filtering being done
        let referralFilterType = null;
        /**
         * first check to see if the incoming filter parameters are accurately passed in
         * we need to have one of either:
         * -
         */
        if (filter.inviteeEmail && filter.inviterEmail) {
            const validationErrMessage = "Invalid filters: inviteeEmail AND inviterEmail. Choose one or the other!";
            console.log(validationErrMessage);
            return {
                errorMessage: validationErrMessage,
                errorType: moonbeam_models_1.ReferralErrorType.UnexpectedError
            };
        }
        if (filter.statusInvitee && filter.statusInviter) {
            const validationErrMessage = "Invalid filters: statusInvitee AND statusInviter. Choose one or the other!";
            console.log(validationErrMessage);
            return {
                errorMessage: validationErrMessage,
                errorType: moonbeam_models_1.ReferralErrorType.UnexpectedError
            };
        }
        if ((filter.inviteeEmail && !filter.statusInvitee) || (!filter.inviteeEmail && filter.statusInvitee)) {
            const validationErrMessage = "Invalid filters: inviteeEmail AND statusInvitee are to be used together!";
            console.log(validationErrMessage);
            return {
                errorMessage: validationErrMessage,
                errorType: moonbeam_models_1.ReferralErrorType.UnexpectedError
            };
        }
        if ((filter.inviterEmail && !filter.statusInviter) || (!filter.inviterEmail && filter.statusInviter)) {
            const validationErrMessage = "Invalid filters: inviterEmail AND statusInviter are to be used together!";
            console.log(validationErrMessage);
            return {
                errorMessage: validationErrMessage,
                errorType: moonbeam_models_1.ReferralErrorType.UnexpectedError
            };
        }
        // set type of filtering depending on the parameters to be passed in
        referralFilterType = (filter.inviterEmail && filter.statusInviter)
            ? moonbeam_models_2.ReferralFiltering.INVITER_FILTER
            : ((filter.inviteeEmail && filter.statusInvitee) ? moonbeam_models_2.ReferralFiltering.INVITEE_FILTER : referralFilterType);
        const result = await docClient.scan(params).promise();
        // build referral data response
        const referrals = [];
        result.Items.forEach((item) => {
            referrals.push(item);
        });
        // filter the results according to the passed in filters
        const filteredReferrals = [];
        switch (referralFilterType) {
            case moonbeam_models_2.ReferralFiltering.INVITEE_FILTER:
                referrals
                    .filter((referral) => referral.inviteeEmail === filter.inviteeEmail && referral.statusInvitee === filter.statusInvitee)
                    .map((referral) => filteredReferrals.push(referral));
                break;
            case moonbeam_models_2.ReferralFiltering.INVITER_FILTER:
                referrals
                    .filter((referral) => referral.inviterEmail === filter.inviterEmail && referral.statusInviter === filter.statusInviter)
                    .map((referral) => filteredReferrals.push(referral));
                break;
            default:
                console.log(`Invalid type of filtering to be executed {}`, filter);
                return {
                    errorMessage: `Invalid type of filtering to be executed ${filter}`,
                    errorType: moonbeam_models_1.ReferralErrorType.UnexpectedError
                };
        }
        // returns the filtered referrals as data
        return {
            data: filteredReferrals
        };
    }
    catch (err) {
        console.log(`Unexpected error while executing listReferrals query {}`, err);
        return {
            errorMessage: `Unexpected error while executing listReferrals query. ${err}`,
            errorType: moonbeam_models_1.ReferralErrorType.UnexpectedError
        };
    }
};
exports.listReferrals = listReferrals;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdFJlZmVycmFscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL2xpc3RSZWZlcnJhbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSw2Q0FBOEI7QUFDOUIsK0RBQTJHO0FBQzNHLCtEQUE0RDtBQUU1RCxhQUFhO0FBQ04sTUFBTSxhQUFhLEdBQUcsS0FBSyxFQUFFLE1BQXlCLEVBQTZCLEVBQUU7SUFDeEYsNENBQTRDO0lBQzVDLGFBQWE7SUFDYixNQUFNLFNBQVMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLENBQUM7SUFFcEQsYUFBYTtJQUNiLE1BQU0sTUFBTSxHQUFHO1FBQ1gsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBZTtLQUN6QyxDQUFDO0lBRUYsSUFBSTtRQUNBLDhEQUE4RDtRQUM5RCxJQUFJLGtCQUFrQixHQUE2QixJQUFJLENBQUM7UUFFeEQ7Ozs7V0FJRztRQUNILElBQUksTUFBTSxDQUFDLFlBQVksSUFBSSxNQUFNLENBQUMsWUFBWSxFQUFFO1lBQzVDLE1BQU0sb0JBQW9CLEdBQUcsMEVBQTBFLENBQUM7WUFDeEcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1lBQ2xDLE9BQU87Z0JBQ0gsWUFBWSxFQUFFLG9CQUFvQjtnQkFDbEMsU0FBUyxFQUFFLG1DQUFpQixDQUFDLGVBQWU7YUFDL0MsQ0FBQztTQUNMO1FBQ0QsSUFBSSxNQUFNLENBQUMsYUFBYSxJQUFJLE1BQU0sQ0FBQyxhQUFhLEVBQUU7WUFDOUMsTUFBTSxvQkFBb0IsR0FBRyw0RUFBNEUsQ0FBQztZQUMxRyxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFDbEMsT0FBTztnQkFDSCxZQUFZLEVBQUUsb0JBQW9CO2dCQUNsQyxTQUFTLEVBQUUsbUNBQWlCLENBQUMs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RCx5Q0FBeUM7UUFDekMsT0FBTztZQUNILElBQUksRUFBRSxpQkFBaUI7U0FDMUIsQ0FBQztLQUNMO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVixPQUFPLENBQUMsR0FBRyxDQUFDLHlEQUF5RCxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRTVFLE9BQU87WUFDSCxZQUFZLEVBQUUseURBQXlELEdBQUcsRUFBRTtZQUM1RSxTQUFTLEVBQUUsbUNBQWlCLENBQUMsZUFBZTtTQUMvQyxDQUFDO0tBQ0w7QUFDTCxDQUFDLENBQUE7QUEvRlksUUFBQSxhQUFhLGlCQStGekIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBBV1MgZnJvbSAnYXdzLXNkaydcbmltcG9ydCB7TGlzdFJlZmVycmFsSW5wdXQsIFJlZmVycmFsLCBSZWZlcnJhbEVycm9yVHlwZSwgUmVmZXJyYWxSZXNwb25zZX0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcbmltcG9ydCB7UmVmZXJyYWxGaWx0ZXJpbmd9IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5cbi8vIEB0cy1pZ25vcmVcbmV4cG9ydCBjb25zdCBsaXN0UmVmZXJyYWxzID0gYXN5bmMgKGZpbHRlcjogTGlzdFJlZmVycmFsSW5wdXQpOiBQcm9taXNlPFJlZmVycmFsUmVzcG9uc2U+ID0+IHtcbiAgICAvLyBpbml0aWFsaXppbmcgdGhlIER5bmFtb0RCIGRvY3VtZW50IGNsaWVudFxuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBjb25zdCBkb2NDbGllbnQgPSBuZXcgQVdTLkR5bmFtb0RCLkRvY3VtZW50Q2xpZW50KCk7XG5cbiAgICAvLyBAdHMtaWdub3JlXG4gICAgY29uc3QgcGFyYW1zID0ge1xuICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LlJFRkVSUkFMX1RBQkxFISxcbiAgICB9O1xuXG4gICAgdHJ5IHtcbiAgICAgICAgLy8gY29uc3RhbnRzIHRvIGtlZXAgdHJhY2sgb2YgdGhlIHR5cGUgb2YgZmlsdGVyaW5nIGJlaW5nIGRvbmVcbiAgICAgICAgbGV0IHJlZmVycmFsRmlsdGVyVHlwZTogUmVmZXJyYWxGaWx0ZXJpbmcgfCBudWxsID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogZmlyc3QgY2hlY2sgdG8gc2VlIGlmIHRoZSBpbmNvbWluZyBmaWx0ZXIgcGFyYW1ldGVycyBhcmUgYWNjdXJhdGVseSBwYXNzZWQgaW5cbiAgICAgICAgICogd2UgbmVlZCB0byBoYXZlIG9uZSBvZiBlaXRoZXI6XG4gICAgICAgICAqIC1cbiAgICAgICAgICovXG4gICAgICAgIGlmIChmaWx0ZXIuaW52aXRlZUVtYWlsICYmIGZpbHRlci5pbnZpdGVyRW1haWwpIHtcbiAgICAgICAgICAgIGNvbnN0IHZhbGlkYXRpb25FcnJNZXNzYWdlID0gXCJJbnZhbGlkIGZpbHRlcnM6IGludml0ZWVFbWFpbCBBTkQgaW52aXRlckVtYWlsLiBDaG9vc2Ugb25lIG9yIHRoZSBvdGhlciFcIjtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHZhbGlkYXRpb25FcnJNZXNzYWdlKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiB2YWxpZGF0aW9uRXJyTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFJlZmVycmFsRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZmlsdGVyLnN0YXR1c0ludml0ZWUgJiYgZmlsdGVyLnN0YXR1c0ludml0ZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IHZhbGlkYXRpb25FcnJNZXNzYWdlID0gXCJJbnZhbGlkIGZpbHRlcnM6IHN0YXR1c0ludml0ZWUgQU5EIHN0YXR1c0ludml0ZXIuIENob29zZSBvbmUgb3IgdGhlIG90aGVyIVwiO1xuICAgICAgICAgICAgY29uc29sZS5sb2codmFsaWRhdGlvbkVyck1lc3NhZ2UpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IHZhbGlkYXRpb25FcnJNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogUmVmZXJyYWxFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGlmICgoZmlsdGVyLmludml0ZWVFbWFpbCAmJiAhZmlsdGVyLnN0YXR1c0ludml0ZWUpIHx8ICghZmlsdGVyLmludml0ZWVFbWFpbCAmJiBmaWx0ZXIuc3RhdHVzSW52aXRlZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IHZhbGlkYXRpb25FcnJNZXNzYWdlID0gXCJJbnZhbGlkIGZpbHRlcnM6IGludml0ZWVFbWFpbCBBTkQgc3RhdHVzSW52aXRlZSBhcmUgdG8gYmUgdXNlZCB0b2dldGhlciFcIjtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHZhbGlkYXRpb25FcnJNZXNzYWdlKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiB2YWxpZGF0aW9uRXJyTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFJlZmVycmFsRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoKGZpbHRlci5pbnZpdGVyRW1haWwgJiYgIWZpbHRlci5zdGF0dXNJbnZpdGVyKSB8fCAoIWZpbHRlci5pbnZpdGVyRW1haWwgJiYgZmlsdGVyLnN0YXR1c0ludml0ZXIpKSB7XG4gICAgICAgICAgICBjb25zdCB2YWxpZGF0aW9uRXJyTWVzc2FnZSA9IFwiSW52YWxpZCBmaWx0ZXJzOiBpbnZpdGVyRW1haWwgQU5EIHN0YXR1c0ludml0ZXIgYXJlIHRvIGJlIHVzZWQgdG9nZXRoZXIhXCI7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyh2YWxpZGF0aW9uRXJyTWVzc2FnZSk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogdmFsaWRhdGlvbkVyck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBSZWZlcnJhbEVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgLy8gc2V0IHR5cGUgb2YgZmlsdGVyaW5nIGRlcGVuZGluZyBvbiB0aGUgcGFyYW1ldGVycyB0byBiZSBwYXNzZWQgaW5cbiAgICAgICAgcmVmZXJyYWxGaWx0ZXJUeXBlID0gKGZpbHRlci5pbnZpdGVyRW1haWwgJiYgZmlsdGVyLnN0YXR1c0ludml0ZXIpXG4gICAgICAgICAgICA/IFJlZmVycmFsRmlsdGVyaW5nLklOVklURVJfRklMVEVSXG4gICAgICAgICAgICA6ICgoZmlsdGVyLmludml0ZWVFbWFpbCAmJiBmaWx0ZXIuc3RhdHVzSW52aXRlZSkgPyBSZWZlcnJhbEZpbHRlcmluZy5JTlZJVEVFX0ZJTFRFUiA6IHJlZmVycmFsRmlsdGVyVHlwZSlcblxuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBkb2NDbGllbnQuc2NhbihwYXJhbXMpLnByb21pc2UoKTtcbiAgICAgICAgLy8gYnVpbGQgcmVmZXJyYWwgZGF0YSByZXNwb25zZVxuICAgICAgICBjb25zdCByZWZlcnJhbHM6IFJlZmVycmFsW10gPSBbXTtcbiAgICAgICAgcmVzdWx0Lkl0ZW1zIS5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgICAgICByZWZlcnJhbHMucHVzaChpdGVtIGFzIFJlZmVycmFsKVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBmaWx0ZXIgdGhlIHJlc3VsdHMgYWNjb3JkaW5nIHRvIHRoZSBwYXNzZWQgaW4gZmlsdGVyc1xuICAgICAgICBjb25zdCBmaWx0ZXJlZFJlZmVycmFsczogUmVmZXJyYWxbXSA9IFtdO1xuICAgICAgICBzd2l0Y2ggKHJlZmVycmFsRmlsdGVyVHlwZSkge1xuICAgICAgICAgICAgY2FzZSBSZWZlcnJhbEZpbHRlcmluZy5JTlZJVEVFX0ZJTFRFUjpcbiAgICAgICAgICAgICAgICByZWZlcnJhbHNcbiAgICAgICAgICAgICAgICAgICAgLmZpbHRlcigocmVmZXJyYWwpID0+IHJlZmVycmFsLmludml0ZWVFbWFpbCA9PT0gZmlsdGVyLmludml0ZWVFbWFpbCAmJiByZWZlcnJhbC5zdGF0dXNJbnZpdGVlID09PSBmaWx0ZXIuc3RhdHVzSW52aXRlZSlcbiAgICAgICAgICAgICAgICAgICAgLm1hcCgocmVmZXJyYWwpID0+IGZpbHRlcmVkUmVmZXJyYWxzLnB1c2gocmVmZXJyYWwpKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUmVmZXJyYWxGaWx0ZXJpbmcuSU5WSVRFUl9GSUxURVI6XG4gICAgICAgICAgICAgICAgcmVmZXJyYWxzXG4gICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoKHJlZmVycmFsKSA9PiByZWZlcnJhbC5pbnZpdGVyRW1haWwgPT09IGZpbHRlci5pbnZpdGVyRW1haWwgJiYgcmVmZXJyYWwuc3RhdHVzSW52aXRlciA9PT0gZmlsdGVyLnN0YXR1c0ludml0ZXIpXG4gICAgICAgICAgICAgICAgICAgIC5tYXAoKHJlZmVycmFsKSA9PiBmaWx0ZXJlZFJlZmVycmFscy5wdXNoKHJlZmVycmFsKSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBJbnZhbGlkIHR5cGUgb2YgZmlsdGVyaW5nIHRvIGJlIGV4ZWN1dGVkIHt9YCwgZmlsdGVyKTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBJbnZhbGlkIHR5cGUgb2YgZmlsdGVyaW5nIHRvIGJlIGV4ZWN1dGVkICR7ZmlsdGVyfWAsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogUmVmZXJyYWxFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICAvLyByZXR1cm5zIHRoZSBmaWx0ZXJlZCByZWZlcnJhbHMgYXMgZGF0YVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGF0YTogZmlsdGVyZWRSZWZlcnJhbHNcbiAgICAgICAgfTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5sb2coYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nIGxpc3RSZWZlcnJhbHMgcXVlcnkge31gLCBlcnIpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyBsaXN0UmVmZXJyYWxzIHF1ZXJ5LiAke2Vycn1gLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBSZWZlcnJhbEVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfTtcbiAgICB9XG59XG4iXX0=