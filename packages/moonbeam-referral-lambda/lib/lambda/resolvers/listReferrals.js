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
/**
 * ListReferrals resolver
 *
 * @param filter filters to be passed in, which will help filter through all referrals
 * @returns {@link Promise} of {@link ReferralResponse}
 */
const listReferrals = async (filter) => {
    // initializing the DynamoDB document client
    const docClient = new AWS.DynamoDB.DocumentClient();
    const params = {
        TableName: process.env.REFERRAL_TABLE,
    };
    try {
        // constants to keep track of the type of filtering being done
        let referralFilterType = null;
        // set type of filtering depending on the parameters to be passed in
        referralFilterType = (filter.inviterEmail && filter.statusInviter && filter.status)
            ? moonbeam_models_2.ReferralFiltering.INVITER_FILTER
            : ((filter.inviteeEmail && filter.statusInvitee && filter.status) ? moonbeam_models_2.ReferralFiltering.INVITEE_FILTER : referralFilterType);
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
                console.log(`Invalid type of filtering to be executed {}`, JSON.stringify(filter));
                return {
                    errorMessage: `Invalid type of filtering to be executed ${JSON.stringify(filter)}`,
                    errorType: moonbeam_models_1.ReferralErrorType.ValidationError
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdFJlZmVycmFscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL2xpc3RSZWZlcnJhbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSw2Q0FBOEI7QUFDOUIsK0RBQTJHO0FBQzNHLCtEQUE0RDtBQUU1RDs7Ozs7R0FLRztBQUNJLE1BQU0sYUFBYSxHQUFHLEtBQUssRUFBRSxNQUF5QixFQUE2QixFQUFFO0lBQ3hGLDRDQUE0QztJQUM1QyxNQUFNLFNBQVMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLENBQUM7SUFFcEQsTUFBTSxNQUFNLEdBQUc7UUFDWCxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFlO0tBQ3pDLENBQUM7SUFFRixJQUFJO1FBQ0EsOERBQThEO1FBQzlELElBQUksa0JBQWtCLEdBQTZCLElBQUksQ0FBQztRQUV4RCxvRUFBb0U7UUFDcEUsa0JBQWtCLEdBQUcsQ0FBQyxNQUFNLENBQUMsWUFBWSxJQUFJLE1BQU0sQ0FBQyxhQUFhLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUMvRSxDQUFDLENBQUMsbUNBQWlCLENBQUMsY0FBYztZQUNsQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxZQUFZLElBQUksTUFBTSxDQUFDLGFBQWEsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLG1DQUFpQixDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQTtRQUU5SCxNQUFNLE1BQU0sR0FBRyxNQUFNLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDdEQsK0JBQStCO1FBQy9CLE1BQU0sU0FBUyxHQUFlLEVBQUUsQ0FBQztRQUNqQyxNQUFNLENBQUMsS0FBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO1lBQzNCLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBZ0IsQ0FBQyxDQUFBO1FBQ3BDLENBQUMsQ0FBQyxDQUFDO1FBRUgsd0RBQXdEO1FBQ3hELE1BQU0saUJBQWlCLEdBQWUsRUFBRSxDQUFDO1FBQ3pDLFFBQVEsa0JBQWtCLEVBQUU7WUFDeEIsS0FBSyxtQ0FBaUIsQ0FBQyxjQUFjO2dCQUNqQyxTQUFTO3FCQUNKLE1BQU0sQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLFlBQVksS0FBSyxNQUFNLENBQUMsWUFBYSxJQUFJLFFBQVEsQ0FBQyxhQUFhLEtBQUssTUFBTSxDQUFDLGFBQWMsQ0FBQztxQkFDeEgsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDekQsTUFBTTtZQUNWLEtBQUssbUNBQWlCLENBQUMsY0FBYztnQkFDakMsU0FBUztxQkFDSixNQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxZQUFZLEtBQUssTUFBTSxDQUFDLFlBQWEsSUFBSSxRQUFRLENBQUMsYUFBYSxLQUFLLE1BQU0sQ0FBQyxhQUFjLENBQUM7cUJBQ3hILEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pELE1BQU07WUFDVjtnQkFDSSxPQUFPLENBQUMsR0FBRyxDQUFDLDZDQUE2QyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDbkYsT0FBTztvQkFDSCxZQUFZLEVBQUUsNENBQTRDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUU7b0JBQ2xGLFNBQVMsRUFBRSxtQ0FBaUIsQ0FBQyxlQUFlO2lCQUMvQyxDQUFDO1NBQ1Q7UUFDRCx5Q0FBeUM7UUFDekMsT0FBTztZQUNILElBQUksRUFBRSxpQkFBaUI7U0FDMUIsQ0FBQztLQUNMO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVixPQUFPLENBQUMsR0FBRyxDQUFDLHlEQUF5RCxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRTVFLE9BQU87WUFDSCxZQUFZLEVBQUUseURBQXlELEdBQUcsRUFBRTtZQUM1RSxTQUFTLEVBQUUsbUNBQWlCLENBQUMsZUFBZTtTQUMvQyxDQUFDO0tBQ0w7QUFDTCxDQUFDLENBQUE7QUF4RFksUUFBQSxhQUFhLGlCQXdEekIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBBV1MgZnJvbSAnYXdzLXNkaydcbmltcG9ydCB7TGlzdFJlZmVycmFsSW5wdXQsIFJlZmVycmFsLCBSZWZlcnJhbEVycm9yVHlwZSwgUmVmZXJyYWxSZXNwb25zZX0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcbmltcG9ydCB7UmVmZXJyYWxGaWx0ZXJpbmd9IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5cbi8qKlxuICogTGlzdFJlZmVycmFscyByZXNvbHZlclxuICpcbiAqIEBwYXJhbSBmaWx0ZXIgZmlsdGVycyB0byBiZSBwYXNzZWQgaW4sIHdoaWNoIHdpbGwgaGVscCBmaWx0ZXIgdGhyb3VnaCBhbGwgcmVmZXJyYWxzXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIFJlZmVycmFsUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBsaXN0UmVmZXJyYWxzID0gYXN5bmMgKGZpbHRlcjogTGlzdFJlZmVycmFsSW5wdXQpOiBQcm9taXNlPFJlZmVycmFsUmVzcG9uc2U+ID0+IHtcbiAgICAvLyBpbml0aWFsaXppbmcgdGhlIER5bmFtb0RCIGRvY3VtZW50IGNsaWVudFxuICAgIGNvbnN0IGRvY0NsaWVudCA9IG5ldyBBV1MuRHluYW1vREIuRG9jdW1lbnRDbGllbnQoKTtcblxuICAgIGNvbnN0IHBhcmFtcyA9IHtcbiAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5SRUZFUlJBTF9UQUJMRSEsXG4gICAgfTtcblxuICAgIHRyeSB7XG4gICAgICAgIC8vIGNvbnN0YW50cyB0byBrZWVwIHRyYWNrIG9mIHRoZSB0eXBlIG9mIGZpbHRlcmluZyBiZWluZyBkb25lXG4gICAgICAgIGxldCByZWZlcnJhbEZpbHRlclR5cGU6IFJlZmVycmFsRmlsdGVyaW5nIHwgbnVsbCA9IG51bGw7XG5cbiAgICAgICAgLy8gc2V0IHR5cGUgb2YgZmlsdGVyaW5nIGRlcGVuZGluZyBvbiB0aGUgcGFyYW1ldGVycyB0byBiZSBwYXNzZWQgaW5cbiAgICAgICAgcmVmZXJyYWxGaWx0ZXJUeXBlID0gKGZpbHRlci5pbnZpdGVyRW1haWwgJiYgZmlsdGVyLnN0YXR1c0ludml0ZXIgJiYgZmlsdGVyLnN0YXR1cylcbiAgICAgICAgICAgID8gUmVmZXJyYWxGaWx0ZXJpbmcuSU5WSVRFUl9GSUxURVJcbiAgICAgICAgICAgIDogKChmaWx0ZXIuaW52aXRlZUVtYWlsICYmIGZpbHRlci5zdGF0dXNJbnZpdGVlICYmIGZpbHRlci5zdGF0dXMpID8gUmVmZXJyYWxGaWx0ZXJpbmcuSU5WSVRFRV9GSUxURVIgOiByZWZlcnJhbEZpbHRlclR5cGUpXG5cbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZG9jQ2xpZW50LnNjYW4ocGFyYW1zKS5wcm9taXNlKCk7XG4gICAgICAgIC8vIGJ1aWxkIHJlZmVycmFsIGRhdGEgcmVzcG9uc2VcbiAgICAgICAgY29uc3QgcmVmZXJyYWxzOiBSZWZlcnJhbFtdID0gW107XG4gICAgICAgIHJlc3VsdC5JdGVtcyEuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICAgICAgcmVmZXJyYWxzLnB1c2goaXRlbSBhcyBSZWZlcnJhbClcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gZmlsdGVyIHRoZSByZXN1bHRzIGFjY29yZGluZyB0byB0aGUgcGFzc2VkIGluIGZpbHRlcnNcbiAgICAgICAgY29uc3QgZmlsdGVyZWRSZWZlcnJhbHM6IFJlZmVycmFsW10gPSBbXTtcbiAgICAgICAgc3dpdGNoIChyZWZlcnJhbEZpbHRlclR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgUmVmZXJyYWxGaWx0ZXJpbmcuSU5WSVRFRV9GSUxURVI6XG4gICAgICAgICAgICAgICAgcmVmZXJyYWxzXG4gICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoKHJlZmVycmFsKSA9PiByZWZlcnJhbC5pbnZpdGVlRW1haWwgPT09IGZpbHRlci5pbnZpdGVlRW1haWwhICYmIHJlZmVycmFsLnN0YXR1c0ludml0ZWUgPT09IGZpbHRlci5zdGF0dXNJbnZpdGVlISlcbiAgICAgICAgICAgICAgICAgICAgLm1hcCgocmVmZXJyYWwpID0+IGZpbHRlcmVkUmVmZXJyYWxzLnB1c2gocmVmZXJyYWwpKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUmVmZXJyYWxGaWx0ZXJpbmcuSU5WSVRFUl9GSUxURVI6XG4gICAgICAgICAgICAgICAgcmVmZXJyYWxzXG4gICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoKHJlZmVycmFsKSA9PiByZWZlcnJhbC5pbnZpdGVyRW1haWwgPT09IGZpbHRlci5pbnZpdGVyRW1haWwhICYmIHJlZmVycmFsLnN0YXR1c0ludml0ZXIgPT09IGZpbHRlci5zdGF0dXNJbnZpdGVyISlcbiAgICAgICAgICAgICAgICAgICAgLm1hcCgocmVmZXJyYWwpID0+IGZpbHRlcmVkUmVmZXJyYWxzLnB1c2gocmVmZXJyYWwpKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYEludmFsaWQgdHlwZSBvZiBmaWx0ZXJpbmcgdG8gYmUgZXhlY3V0ZWQge31gLCBKU09OLnN0cmluZ2lmeShmaWx0ZXIpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBJbnZhbGlkIHR5cGUgb2YgZmlsdGVyaW5nIHRvIGJlIGV4ZWN1dGVkICR7SlNPTi5zdHJpbmdpZnkoZmlsdGVyKX1gLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFJlZmVycmFsRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgLy8gcmV0dXJucyB0aGUgZmlsdGVyZWQgcmVmZXJyYWxzIGFzIGRhdGFcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRhdGE6IGZpbHRlcmVkUmVmZXJyYWxzXG4gICAgICAgIH07XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyBsaXN0UmVmZXJyYWxzIHF1ZXJ5IHt9YCwgZXJyKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgbGlzdFJlZmVycmFscyBxdWVyeS4gJHtlcnJ9YCxcbiAgICAgICAgICAgIGVycm9yVHlwZTogUmVmZXJyYWxFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH07XG4gICAgfVxufVxuIl19