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
exports.getPartnerStore = void 0;
const AWS = __importStar(require("aws-sdk"));
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * GetPartnerStore resolver
 *
 * @param id id, for the Partner Store to be retrieved
 * @returns {@link Promise} of {@link PartnerStoreResponse}
 */
const getPartnerStore = async (id) => {
    try {
        // initializing the DynamoDB document client
        const docClient = new AWS.DynamoDB.DocumentClient();
        // retrieve the Partner Store object given id
        const { Item } = await docClient.get({
            TableName: process.env.PARTNER_MERCHANT_TABLE,
            Key: { id: id }
        }).promise();
        // return the retrieved Partner Store
        return {
            data: [Item]
        };
    }
    catch (err) {
        console.log(`Unexpected error while executing getPartnerStore query {}`, err);
        return {
            errorMessage: `Unexpected error while executing getPartnerStore query ${err}`,
            errorType: moonbeam_models_1.MarketplaceErrorType.UnexpectedError
        };
    }
};
exports.getPartnerStore = getPartnerStore;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0UGFydG5lclN0b3JlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvZ2V0UGFydG5lclN0b3JlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNkNBQStCO0FBQy9CLCtEQUFtRztBQUVuRzs7Ozs7R0FLRztBQUNJLE1BQU0sZUFBZSxHQUFHLEtBQUssRUFBRSxFQUFVLEVBQWlDLEVBQUU7SUFDL0UsSUFBSTtRQUNBLDRDQUE0QztRQUM1QyxNQUFNLFNBQVMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLENBQUM7UUFFcEQsNkNBQTZDO1FBQzdDLE1BQU0sRUFBQyxJQUFJLEVBQUMsR0FBRyxNQUFNLFNBQVMsQ0FBQyxHQUFHLENBQUM7WUFDL0IsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXVCO1lBQzlDLEdBQUcsRUFBRSxFQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUM7U0FDaEIsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRWIscUNBQXFDO1FBQ3JDLE9BQU87WUFDSCxJQUFJLEVBQUUsQ0FBQyxJQUFvQixDQUFDO1NBQy9CLENBQUE7S0FDSjtJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQywyREFBMkQsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUM5RSxPQUFPO1lBQ0gsWUFBWSxFQUFFLDBEQUEwRCxHQUFHLEVBQUU7WUFDN0UsU0FBUyxFQUFFLHNDQUFvQixDQUFDLGVBQWU7U0FDbEQsQ0FBQztLQUNMO0FBQ0wsQ0FBQyxDQUFBO0FBdEJZLFFBQUEsZUFBZSxtQkFzQjNCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgQVdTIGZyb20gJ2F3cy1zZGsnO1xuaW1wb3J0IHtNYXJrZXRwbGFjZUVycm9yVHlwZSwgUGFydG5lclN0b3JlLCBQYXJ0bmVyU3RvcmVSZXNwb25zZX0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcblxuLyoqXG4gKiBHZXRQYXJ0bmVyU3RvcmUgcmVzb2x2ZXJcbiAqXG4gKiBAcGFyYW0gaWQgaWQsIGZvciB0aGUgUGFydG5lciBTdG9yZSB0byBiZSByZXRyaWV2ZWRcbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgUGFydG5lclN0b3JlUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRQYXJ0bmVyU3RvcmUgPSBhc3luYyAoaWQ6IHN0cmluZyk6IFByb21pc2U8UGFydG5lclN0b3JlUmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyBpbml0aWFsaXppbmcgdGhlIER5bmFtb0RCIGRvY3VtZW50IGNsaWVudFxuICAgICAgICBjb25zdCBkb2NDbGllbnQgPSBuZXcgQVdTLkR5bmFtb0RCLkRvY3VtZW50Q2xpZW50KCk7XG5cbiAgICAgICAgLy8gcmV0cmlldmUgdGhlIFBhcnRuZXIgU3RvcmUgb2JqZWN0IGdpdmVuIGlkXG4gICAgICAgIGNvbnN0IHtJdGVtfSA9IGF3YWl0IGRvY0NsaWVudC5nZXQoe1xuICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5QQVJUTkVSX01FUkNIQU5UX1RBQkxFISxcbiAgICAgICAgICAgIEtleToge2lkOiBpZH1cbiAgICAgICAgfSkucHJvbWlzZSgpO1xuXG4gICAgICAgIC8vIHJldHVybiB0aGUgcmV0cmlldmVkIFBhcnRuZXIgU3RvcmVcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRhdGE6IFtJdGVtIGFzIFBhcnRuZXJTdG9yZV1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zb2xlLmxvZyhgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgZ2V0UGFydG5lclN0b3JlIHF1ZXJ5IHt9YCwgZXJyKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nIGdldFBhcnRuZXJTdG9yZSBxdWVyeSAke2Vycn1gLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBNYXJrZXRwbGFjZUVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfTtcbiAgICB9XG59XG4iXX0=