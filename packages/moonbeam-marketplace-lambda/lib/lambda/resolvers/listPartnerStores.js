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
exports.listPartnerStores = void 0;
const AWS = __importStar(require("aws-sdk"));
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * ListPartnerStores resolver
 *
 * @param listPartnerStoresInput input to be passed in, which will help filter through all the Partner Stores
 * @returns {@link Promise} of {@link PartnerStoreResponse}
 */
const listPartnerStores = async (listPartnerStoresInput) => {
    try {
        // initializing the DynamoDB document client
        const docClient = new AWS.DynamoDB.DocumentClient();
        // retrieving all Partner Stores in the database
        const result = await docClient.scan({
            TableName: process.env.PARTNER_MERCHANT_TABLE,
        }).promise();
        // build Partner Stores data response
        const partnerStores = [];
        result.Items.forEach((item) => {
            partnerStores.push(item);
        });
        // check to see if there is a type passed in, to filter by, and filter the retrieved Partner Stores by it
        if (listPartnerStoresInput.type) {
            const filteredPartnerStores = [];
            partnerStores.filter((partnerStore) => partnerStore.type === listPartnerStoresInput.type).map((partnerStore) => filteredPartnerStores.push(partnerStore));
            // returns the filtered Partner Stores as data
            return {
                data: filteredPartnerStores
            };
        }
        else {
            // returns all Partner Stores as data
            return {
                data: partnerStores
            };
        }
    }
    catch (err) {
        console.log(`Unexpected error while executing listPartnerStores query {}`, err);
        return {
            errorMessage: `Unexpected error while executing listPartnerStores query. ${err}`,
            errorType: moonbeam_models_1.MarketplaceErrorType.UnexpectedError
        };
    }
};
exports.listPartnerStores = listPartnerStores;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdFBhcnRuZXJTdG9yZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL3Jlc29sdmVycy9saXN0UGFydG5lclN0b3Jlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZDQUErQjtBQUMvQiwrREFLbUM7QUFFbkM7Ozs7O0dBS0c7QUFDSSxNQUFNLGlCQUFpQixHQUFHLEtBQUssRUFBRSxzQkFBOEMsRUFBaUMsRUFBRTtJQUNySCxJQUFJO1FBQ0EsNENBQTRDO1FBQzVDLE1BQU0sU0FBUyxHQUFHLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUVwRCxnREFBZ0Q7UUFDaEQsTUFBTSxNQUFNLEdBQUcsTUFBTSxTQUFTLENBQUMsSUFBSSxDQUFDO1lBQ2hDLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUF1QjtTQUNqRCxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFYixxQ0FBcUM7UUFDckMsTUFBTSxhQUFhLEdBQW1CLEVBQUUsQ0FBQztRQUN6QyxNQUFNLENBQUMsS0FBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO1lBQzNCLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBb0IsQ0FBQyxDQUFBO1FBQzVDLENBQUMsQ0FBQyxDQUFDO1FBRUgseUdBQXlHO1FBQ3pHLElBQUksc0JBQXNCLENBQUMsSUFBSSxFQUFFO1lBQzdCLE1BQU0scUJBQXFCLEdBQW1CLEVBQUUsQ0FBQztZQUNqRCxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxLQUFLLHNCQUFzQixDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7WUFFMUosOENBQThDO1lBQzlDLE9BQU87Z0JBQ0gsSUFBSSxFQUFFLHFCQUFxQjthQUM5QixDQUFBO1NBQ0o7YUFBTTtZQUNILHFDQUFxQztZQUNyQyxPQUFPO2dCQUNILElBQUksRUFBRSxhQUFhO2FBQ3RCLENBQUE7U0FDSjtLQUNKO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVixPQUFPLENBQUMsR0FBRyxDQUFDLDZEQUE2RCxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRWhGLE9BQU87WUFDSCxZQUFZLEVBQUUsNkRBQTZELEdBQUcsRUFBRTtZQUNoRixTQUFTLEVBQUUsc0NBQW9CLENBQUMsZUFBZTtTQUNsRCxDQUFDO0tBQ0w7QUFDTCxDQUFDLENBQUE7QUF2Q1ksUUFBQSxpQkFBaUIscUJBdUM3QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIEFXUyBmcm9tICdhd3Mtc2RrJztcbmltcG9ydCB7XG4gICAgTGlzdFBhcnRuZXJTdG9yZXNJbnB1dCxcbiAgICBNYXJrZXRwbGFjZUVycm9yVHlwZSxcbiAgICBQYXJ0bmVyU3RvcmUsXG4gICAgUGFydG5lclN0b3JlUmVzcG9uc2Vcbn0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcblxuLyoqXG4gKiBMaXN0UGFydG5lclN0b3JlcyByZXNvbHZlclxuICpcbiAqIEBwYXJhbSBsaXN0UGFydG5lclN0b3Jlc0lucHV0IGlucHV0IHRvIGJlIHBhc3NlZCBpbiwgd2hpY2ggd2lsbCBoZWxwIGZpbHRlciB0aHJvdWdoIGFsbCB0aGUgUGFydG5lciBTdG9yZXNcbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgUGFydG5lclN0b3JlUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBsaXN0UGFydG5lclN0b3JlcyA9IGFzeW5jIChsaXN0UGFydG5lclN0b3Jlc0lucHV0OiBMaXN0UGFydG5lclN0b3Jlc0lucHV0KTogUHJvbWlzZTxQYXJ0bmVyU3RvcmVSZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIGluaXRpYWxpemluZyB0aGUgRHluYW1vREIgZG9jdW1lbnQgY2xpZW50XG4gICAgICAgIGNvbnN0IGRvY0NsaWVudCA9IG5ldyBBV1MuRHluYW1vREIuRG9jdW1lbnRDbGllbnQoKTtcblxuICAgICAgICAvLyByZXRyaWV2aW5nIGFsbCBQYXJ0bmVyIFN0b3JlcyBpbiB0aGUgZGF0YWJhc2VcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZG9jQ2xpZW50LnNjYW4oe1xuICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5QQVJUTkVSX01FUkNIQU5UX1RBQkxFISxcbiAgICAgICAgfSkucHJvbWlzZSgpO1xuXG4gICAgICAgIC8vIGJ1aWxkIFBhcnRuZXIgU3RvcmVzIGRhdGEgcmVzcG9uc2VcbiAgICAgICAgY29uc3QgcGFydG5lclN0b3JlczogUGFydG5lclN0b3JlW10gPSBbXTtcbiAgICAgICAgcmVzdWx0Lkl0ZW1zIS5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgICAgICBwYXJ0bmVyU3RvcmVzLnB1c2goaXRlbSBhcyBQYXJ0bmVyU3RvcmUpXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGVyZSBpcyBhIHR5cGUgcGFzc2VkIGluLCB0byBmaWx0ZXIgYnksIGFuZCBmaWx0ZXIgdGhlIHJldHJpZXZlZCBQYXJ0bmVyIFN0b3JlcyBieSBpdFxuICAgICAgICBpZiAobGlzdFBhcnRuZXJTdG9yZXNJbnB1dC50eXBlKSB7XG4gICAgICAgICAgICBjb25zdCBmaWx0ZXJlZFBhcnRuZXJTdG9yZXM6IFBhcnRuZXJTdG9yZVtdID0gW107XG4gICAgICAgICAgICBwYXJ0bmVyU3RvcmVzLmZpbHRlcigocGFydG5lclN0b3JlKSA9PiBwYXJ0bmVyU3RvcmUudHlwZSA9PT0gbGlzdFBhcnRuZXJTdG9yZXNJbnB1dC50eXBlKS5tYXAoKHBhcnRuZXJTdG9yZSkgPT4gZmlsdGVyZWRQYXJ0bmVyU3RvcmVzLnB1c2gocGFydG5lclN0b3JlKSk7XG5cbiAgICAgICAgICAgIC8vIHJldHVybnMgdGhlIGZpbHRlcmVkIFBhcnRuZXIgU3RvcmVzIGFzIGRhdGFcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGF0YTogZmlsdGVyZWRQYXJ0bmVyU3RvcmVzXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyByZXR1cm5zIGFsbCBQYXJ0bmVyIFN0b3JlcyBhcyBkYXRhXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRhdGE6IHBhcnRuZXJTdG9yZXNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zb2xlLmxvZyhgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgbGlzdFBhcnRuZXJTdG9yZXMgcXVlcnkge31gLCBlcnIpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyBsaXN0UGFydG5lclN0b3JlcyBxdWVyeS4gJHtlcnJ9YCxcbiAgICAgICAgICAgIGVycm9yVHlwZTogTWFya2V0cGxhY2VFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH07XG4gICAgfVxufVxuIl19