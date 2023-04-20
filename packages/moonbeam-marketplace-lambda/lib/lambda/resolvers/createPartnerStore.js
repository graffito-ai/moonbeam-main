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
exports.createPartnerStore = void 0;
const AWS = __importStar(require("aws-sdk"));
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * CreatePartnerStore resolver
 *
 * @param createPartnerStoreInput object to be used when creating a new Partner Store object
 * @returns {@link Promise} of {@link PartnerStoreResponse}
 */
const createPartnerStore = async (createPartnerStoreInput) => {
    try {
        // initializing the DynamoDB document client
        const docClient = new AWS.DynamoDB.DocumentClient();
        // update the timestamps accordingly
        const createdAt = new Date().toISOString();
        createPartnerStoreInput.createdAt = createdAt;
        createPartnerStoreInput.updatedAt = createdAt;
        // validating that the appropriate input object parameters are passed in according to the type of FAQ to be created
        switch (createPartnerStoreInput.type) {
            case moonbeam_models_1.PartnerMerchantType.NonFeatured:
                // do any future validations in here for non-featured products
                break;
            case moonbeam_models_1.PartnerMerchantType.Featured:
                // validate that there is a description for featured partner stores
                if (!createPartnerStoreInput.description || createPartnerStoreInput.description.length === 0) {
                    const invalidFeaturedPartnerStoreInputMessage = `Invalid ${moonbeam_models_1.PartnerMerchantType.Featured} input passed in!`;
                    return {
                        errorMessage: invalidFeaturedPartnerStoreInputMessage,
                        errorType: moonbeam_models_1.MarketplaceErrorType.ValidationError
                    };
                }
                break;
            default:
                const invalidPartnerStoreTypeMessage = `Invalid Partner Store type passed in ${createPartnerStoreInput.type}`;
                console.log(invalidPartnerStoreTypeMessage);
                return {
                    errorMessage: invalidPartnerStoreTypeMessage,
                    errorType: moonbeam_models_1.MarketplaceErrorType.ValidationError
                };
        }
        // store the FAQ object
        await docClient.put({
            TableName: process.env.PARTNER_MERCHANT_TABLE,
            Item: createPartnerStoreInput
        }).promise();
        // return the FAQS object
        return {
            data: [createPartnerStoreInput]
        };
    }
    catch (err) {
        console.log(`Unexpected error while executing createPartnerStore mutation {}`, err);
        return {
            errorMessage: `Unexpected error while executing createPartnerStore mutation ${err}`,
            errorType: moonbeam_models_1.MarketplaceErrorType.UnexpectedError
        };
    }
};
exports.createPartnerStore = createPartnerStore;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlUGFydG5lclN0b3JlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvY3JlYXRlUGFydG5lclN0b3JlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNkNBQStCO0FBQy9CLCtEQU1tQztBQUVuQzs7Ozs7R0FLRztBQUNJLE1BQU0sa0JBQWtCLEdBQUcsS0FBSyxFQUFFLHVCQUFnRCxFQUFpQyxFQUFFO0lBQ3hILElBQUk7UUFDQSw0Q0FBNEM7UUFDNUMsTUFBTSxTQUFTLEdBQUcsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBRXBELG9DQUFvQztRQUNwQyxNQUFNLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzNDLHVCQUF1QixDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDOUMsdUJBQXVCLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQTtRQUU3QyxtSEFBbUg7UUFDbkgsUUFBUSx1QkFBdUIsQ0FBQyxJQUFJLEVBQUU7WUFDbEMsS0FBSyxxQ0FBbUIsQ0FBQyxXQUFXO2dCQUNoQyw4REFBOEQ7Z0JBQzlELE1BQU07WUFDVixLQUFLLHFDQUFtQixDQUFDLFFBQVE7Z0JBQzdCLG1FQUFtRTtnQkFDbkUsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFdBQVcsSUFBSSx1QkFBdUIsQ0FBQyxXQUFXLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtvQkFDMUYsTUFBTSx1Q0FBdUMsR0FBRyxXQUFXLHFDQUFtQixDQUFDLFFBQVEsbUJBQW1CLENBQUM7b0JBQzNHLE9BQU87d0JBQ0gsWUFBWSxFQUFFLHVDQUF1Qzt3QkFDckQsU0FBUyxFQUFFLHNDQUFvQixDQUFDLGVBQWU7cUJBQ2xELENBQUE7aUJBQ0o7Z0JBQ0QsTUFBTTtZQUNWO2dCQUNJLE1BQU0sOEJBQThCLEdBQUcsd0NBQXdDLHVCQUF1QixDQUFDLElBQUksRUFBRSxDQUFDO2dCQUM5RyxPQUFPLENBQUMsR0FBRyxDQUFDLDhCQUE4QixDQUFDLENBQUM7Z0JBQzVDLE9BQU87b0JBQ0gsWUFBWSxFQUFFLDhCQUE4QjtvQkFDNUMsU0FBUyxFQUFFLHNDQUFvQixDQUFDLGVBQWU7aUJBQ2xELENBQUE7U0FDUjtRQUVELHVCQUF1QjtRQUN2QixNQUFNLFNBQVMsQ0FBQyxHQUFHLENBQUM7WUFDaEIsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXVCO1lBQzlDLElBQUksRUFBRSx1QkFBdUI7U0FDaEMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRWIseUJBQXlCO1FBQ3pCLE9BQU87WUFDSCxJQUFJLEVBQUUsQ0FBQyx1QkFBdUMsQ0FBQztTQUNsRCxDQUFBO0tBQ0o7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUVBQWlFLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDcEYsT0FBTztZQUNILFlBQVksRUFBRSxnRUFBZ0UsR0FBRyxFQUFFO1lBQ25GLFNBQVMsRUFBRSxzQ0FBb0IsQ0FBQyxlQUFlO1NBQ2xELENBQUM7S0FDTDtBQUNMLENBQUMsQ0FBQTtBQW5EWSxRQUFBLGtCQUFrQixzQkFtRDlCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgQVdTIGZyb20gJ2F3cy1zZGsnO1xuaW1wb3J0IHtcbiAgICBDcmVhdGVQYXJ0bmVyU3RvcmVJbnB1dCxcbiAgICBNYXJrZXRwbGFjZUVycm9yVHlwZSxcbiAgICBQYXJ0bmVyTWVyY2hhbnRUeXBlLFxuICAgIFBhcnRuZXJTdG9yZSxcbiAgICBQYXJ0bmVyU3RvcmVSZXNwb25zZVxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuXG4vKipcbiAqIENyZWF0ZVBhcnRuZXJTdG9yZSByZXNvbHZlclxuICpcbiAqIEBwYXJhbSBjcmVhdGVQYXJ0bmVyU3RvcmVJbnB1dCBvYmplY3QgdG8gYmUgdXNlZCB3aGVuIGNyZWF0aW5nIGEgbmV3IFBhcnRuZXIgU3RvcmUgb2JqZWN0XG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIFBhcnRuZXJTdG9yZVJlc3BvbnNlfVxuICovXG5leHBvcnQgY29uc3QgY3JlYXRlUGFydG5lclN0b3JlID0gYXN5bmMgKGNyZWF0ZVBhcnRuZXJTdG9yZUlucHV0OiBDcmVhdGVQYXJ0bmVyU3RvcmVJbnB1dCk6IFByb21pc2U8UGFydG5lclN0b3JlUmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyBpbml0aWFsaXppbmcgdGhlIER5bmFtb0RCIGRvY3VtZW50IGNsaWVudFxuICAgICAgICBjb25zdCBkb2NDbGllbnQgPSBuZXcgQVdTLkR5bmFtb0RCLkRvY3VtZW50Q2xpZW50KCk7XG5cbiAgICAgICAgLy8gdXBkYXRlIHRoZSB0aW1lc3RhbXBzIGFjY29yZGluZ2x5XG4gICAgICAgIGNvbnN0IGNyZWF0ZWRBdCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICAgICAgY3JlYXRlUGFydG5lclN0b3JlSW5wdXQuY3JlYXRlZEF0ID0gY3JlYXRlZEF0O1xuICAgICAgICBjcmVhdGVQYXJ0bmVyU3RvcmVJbnB1dC51cGRhdGVkQXQgPSBjcmVhdGVkQXRcblxuICAgICAgICAvLyB2YWxpZGF0aW5nIHRoYXQgdGhlIGFwcHJvcHJpYXRlIGlucHV0IG9iamVjdCBwYXJhbWV0ZXJzIGFyZSBwYXNzZWQgaW4gYWNjb3JkaW5nIHRvIHRoZSB0eXBlIG9mIEZBUSB0byBiZSBjcmVhdGVkXG4gICAgICAgIHN3aXRjaCAoY3JlYXRlUGFydG5lclN0b3JlSW5wdXQudHlwZSkge1xuICAgICAgICAgICAgY2FzZSBQYXJ0bmVyTWVyY2hhbnRUeXBlLk5vbkZlYXR1cmVkOlxuICAgICAgICAgICAgICAgIC8vIGRvIGFueSBmdXR1cmUgdmFsaWRhdGlvbnMgaW4gaGVyZSBmb3Igbm9uLWZlYXR1cmVkIHByb2R1Y3RzXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFBhcnRuZXJNZXJjaGFudFR5cGUuRmVhdHVyZWQ6XG4gICAgICAgICAgICAgICAgLy8gdmFsaWRhdGUgdGhhdCB0aGVyZSBpcyBhIGRlc2NyaXB0aW9uIGZvciBmZWF0dXJlZCBwYXJ0bmVyIHN0b3Jlc1xuICAgICAgICAgICAgICAgIGlmICghY3JlYXRlUGFydG5lclN0b3JlSW5wdXQuZGVzY3JpcHRpb24gfHwgY3JlYXRlUGFydG5lclN0b3JlSW5wdXQuZGVzY3JpcHRpb24ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGludmFsaWRGZWF0dXJlZFBhcnRuZXJTdG9yZUlucHV0TWVzc2FnZSA9IGBJbnZhbGlkICR7UGFydG5lck1lcmNoYW50VHlwZS5GZWF0dXJlZH0gaW5wdXQgcGFzc2VkIGluIWA7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGludmFsaWRGZWF0dXJlZFBhcnRuZXJTdG9yZUlucHV0TWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTWFya2V0cGxhY2VFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGNvbnN0IGludmFsaWRQYXJ0bmVyU3RvcmVUeXBlTWVzc2FnZSA9IGBJbnZhbGlkIFBhcnRuZXIgU3RvcmUgdHlwZSBwYXNzZWQgaW4gJHtjcmVhdGVQYXJ0bmVyU3RvcmVJbnB1dC50eXBlfWA7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coaW52YWxpZFBhcnRuZXJTdG9yZVR5cGVNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGludmFsaWRQYXJ0bmVyU3RvcmVUeXBlTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBNYXJrZXRwbGFjZUVycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzdG9yZSB0aGUgRkFRIG9iamVjdFxuICAgICAgICBhd2FpdCBkb2NDbGllbnQucHV0KHtcbiAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuUEFSVE5FUl9NRVJDSEFOVF9UQUJMRSEsXG4gICAgICAgICAgICBJdGVtOiBjcmVhdGVQYXJ0bmVyU3RvcmVJbnB1dFxuICAgICAgICB9KS5wcm9taXNlKCk7XG5cbiAgICAgICAgLy8gcmV0dXJuIHRoZSBGQVFTIG9iamVjdFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGF0YTogW2NyZWF0ZVBhcnRuZXJTdG9yZUlucHV0IGFzIFBhcnRuZXJTdG9yZV1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zb2xlLmxvZyhgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgY3JlYXRlUGFydG5lclN0b3JlIG11dGF0aW9uIHt9YCwgZXJyKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nIGNyZWF0ZVBhcnRuZXJTdG9yZSBtdXRhdGlvbiAke2Vycn1gLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBNYXJrZXRwbGFjZUVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfTtcbiAgICB9XG59XG4iXX0=