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
        // retrieving all FAQs in the database
        const result = await docClient.scan({
            TableName: process.env.FAQ_TABLE,
        }).promise();
        // build FAQ data response
        const faqs = [];
        result.Items.forEach((item) => {
            faqs.push(item);
        });
        // check to see if there is a type passed in, to filter by, and filter the retrieved FAQs by it
        if (listFaqInput.type) {
            const filteredAQs = [];
            faqs.filter((faq) => faq.type === listFaqInput.type).map((faq) => filteredAQs.push(faq));
            // returns the filtered FAQs as data
            return {
                data: filteredAQs
            };
        }
        else {
            // returns all FAQs as data
            return {
                data: faqs
            };
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdEZBUXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL3Jlc29sdmVycy9saXN0RkFRcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZDQUErQjtBQUMvQiwrREFBd0c7QUFFeEc7Ozs7O0dBS0c7QUFDSSxNQUFNLFFBQVEsR0FBRyxLQUFLLEVBQUUsWUFBMEIsRUFBd0IsRUFBRTtJQUMvRSxJQUFJO1FBQ0EsNENBQTRDO1FBQzVDLE1BQU0sU0FBUyxHQUFHLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUVwRCxzQ0FBc0M7UUFDdEMsTUFBTSxNQUFNLEdBQUcsTUFBTSxTQUFTLENBQUMsSUFBSSxDQUFDO1lBQ2hDLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVU7U0FDcEMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRWIsMEJBQTBCO1FBQzFCLE1BQU0sSUFBSSxHQUFVLEVBQUUsQ0FBQztRQUN2QixNQUFNLENBQUMsS0FBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO1lBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBVyxDQUFDLENBQUE7UUFDMUIsQ0FBQyxDQUFDLENBQUM7UUFFSCwrRkFBK0Y7UUFDL0YsSUFBSSxZQUFZLENBQUMsSUFBSSxFQUFFO1lBQ25CLE1BQU0sV0FBVyxHQUFVLEVBQUUsQ0FBQztZQUM5QixJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxLQUFLLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUV6RixvQ0FBb0M7WUFDcEMsT0FBTztnQkFDSCxJQUFJLEVBQUUsV0FBVzthQUNwQixDQUFBO1NBQ0o7YUFBTTtZQUNILDJCQUEyQjtZQUMzQixPQUFPO2dCQUNILElBQUksRUFBRSxJQUFJO2FBQ2IsQ0FBQTtTQUNKO0tBQ0o7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0RBQW9ELEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFdkUsT0FBTztZQUNILFlBQVksRUFBRSxvREFBb0QsR0FBRyxFQUFFO1lBQ3ZFLFNBQVMsRUFBRSw4QkFBWSxDQUFDLGVBQWU7U0FDMUMsQ0FBQztLQUNMO0FBQ0wsQ0FBQyxDQUFBO0FBdkNZLFFBQUEsUUFBUSxZQXVDcEIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBBV1MgZnJvbSAnYXdzLXNkayc7XG5pbXBvcnQge0FjY291bnRSZXNwb25zZSwgRmFxLCBGYXFFcnJvclR5cGUsIEZhcVJlc3BvbnNlLCBMaXN0RmFxSW5wdXR9IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5cbi8qKlxuICogTGlzdEZBUXMgcmVzb2x2ZXJcbiAqXG4gKiBAcGFyYW0gbGlzdEZhcUlucHV0IGlucHV0IHRvIGJlIHBhc3NlZCBpbiwgd2hpY2ggd2lsbCBoZWxwIGZpbHRlciB0aHJvdWdoIGFsbCB0aGUgRkFRc1xuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBBY2NvdW50UmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBsaXN0RkFRcyA9IGFzeW5jIChsaXN0RmFxSW5wdXQ6IExpc3RGYXFJbnB1dCk6IFByb21pc2U8RmFxUmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyBpbml0aWFsaXppbmcgdGhlIER5bmFtb0RCIGRvY3VtZW50IGNsaWVudFxuICAgICAgICBjb25zdCBkb2NDbGllbnQgPSBuZXcgQVdTLkR5bmFtb0RCLkRvY3VtZW50Q2xpZW50KCk7XG5cbiAgICAgICAgLy8gcmV0cmlldmluZyBhbGwgRkFRcyBpbiB0aGUgZGF0YWJhc2VcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZG9jQ2xpZW50LnNjYW4oe1xuICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5GQVFfVEFCTEUhLFxuICAgICAgICB9KS5wcm9taXNlKCk7XG5cbiAgICAgICAgLy8gYnVpbGQgRkFRIGRhdGEgcmVzcG9uc2VcbiAgICAgICAgY29uc3QgZmFxczogRmFxW10gPSBbXTtcbiAgICAgICAgcmVzdWx0Lkl0ZW1zIS5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgICAgICBmYXFzLnB1c2goaXRlbSBhcyBGYXEpXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGVyZSBpcyBhIHR5cGUgcGFzc2VkIGluLCB0byBmaWx0ZXIgYnksIGFuZCBmaWx0ZXIgdGhlIHJldHJpZXZlZCBGQVFzIGJ5IGl0XG4gICAgICAgIGlmIChsaXN0RmFxSW5wdXQudHlwZSkge1xuICAgICAgICAgICAgY29uc3QgZmlsdGVyZWRBUXM6IEZhcVtdID0gW107XG4gICAgICAgICAgICBmYXFzLmZpbHRlcigoZmFxKSA9PiBmYXEudHlwZSA9PT0gbGlzdEZhcUlucHV0LnR5cGUpLm1hcCgoZmFxKSA9PiBmaWx0ZXJlZEFRcy5wdXNoKGZhcSkpO1xuXG4gICAgICAgICAgICAvLyByZXR1cm5zIHRoZSBmaWx0ZXJlZCBGQVFzIGFzIGRhdGFcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGF0YTogZmlsdGVyZWRBUXNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIHJldHVybnMgYWxsIEZBUXMgYXMgZGF0YVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBkYXRhOiBmYXFzXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5sb2coYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nIGxpc3RGQVFzIHF1ZXJ5IHt9YCwgZXJyKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgbGlzdEZBUXMgcXVlcnkuICR7ZXJyfWAsXG4gICAgICAgICAgICBlcnJvclR5cGU6IEZhcUVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfTtcbiAgICB9XG59XG4iXX0=