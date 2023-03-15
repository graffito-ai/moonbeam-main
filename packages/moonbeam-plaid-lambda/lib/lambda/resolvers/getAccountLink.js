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
exports.getAccountLink = void 0;
const AWS = __importStar(require("aws-sdk"));
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * GetAccountLink resolver
 *
 * @param id account link id (user id), for the account link to be retrieved
 * @returns {@link Promise} of {@link AccountLinkResponse}
 */
const getAccountLink = async (id) => {
    // initializing the DynamoDB document client
    const docClient = new AWS.DynamoDB.DocumentClient();
    try {
        // retrieve the account link object given the account link id (user id)
        const { Item } = await docClient.get({
            TableName: process.env.ACCOUNT_LINKS,
            Key: { id: id }
        }).promise();
        // return the retrieved account link
        return {
            data: Item
        };
    }
    catch (err) {
        console.log(`Unexpected error while executing getAccountLink query {}`, err);
        return {
            errorMessage: `Unexpected error while executing getAccountLink query. ${err}`,
            errorType: moonbeam_models_1.LinkErrorType.UnexpectedError
        };
    }
};
exports.getAccountLink = getAccountLink;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0QWNjb3VudExpbmsuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL3Jlc29sdmVycy9nZXRBY2NvdW50TGluay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZDQUErQjtBQUMvQiwrREFBMEY7QUFFMUY7Ozs7O0dBS0c7QUFDSSxNQUFNLGNBQWMsR0FBRyxLQUFLLEVBQUUsRUFBVSxFQUFnQyxFQUFFO0lBQzdFLDRDQUE0QztJQUM1QyxNQUFNLFNBQVMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLENBQUM7SUFFcEQsSUFBSTtRQUNBLHVFQUF1RTtRQUN2RSxNQUFNLEVBQUMsSUFBSSxFQUFDLEdBQUcsTUFBTSxTQUFTLENBQUMsR0FBRyxDQUFDO1lBQy9CLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWM7WUFDckMsR0FBRyxFQUFFLEVBQUMsRUFBRSxFQUFFLEVBQUUsRUFBQztTQUNoQixDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFYixvQ0FBb0M7UUFDcEMsT0FBTztZQUNILElBQUksRUFBRSxJQUFtQjtTQUM1QixDQUFBO0tBQ0o7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLE9BQU8sQ0FBQyxHQUFHLENBQUMsMERBQTBELEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDN0UsT0FBTztZQUNILFlBQVksRUFBRSwwREFBMEQsR0FBRyxFQUFFO1lBQzdFLFNBQVMsRUFBRSwrQkFBYSxDQUFDLGVBQWU7U0FDM0MsQ0FBQztLQUNMO0FBQ0wsQ0FBQyxDQUFBO0FBdEJZLFFBQUEsY0FBYyxrQkFzQjFCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgQVdTIGZyb20gJ2F3cy1zZGsnO1xuaW1wb3J0IHtBY2NvdW50TGluaywgQWNjb3VudExpbmtSZXNwb25zZSwgTGlua0Vycm9yVHlwZX0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcblxuLyoqXG4gKiBHZXRBY2NvdW50TGluayByZXNvbHZlclxuICpcbiAqIEBwYXJhbSBpZCBhY2NvdW50IGxpbmsgaWQgKHVzZXIgaWQpLCBmb3IgdGhlIGFjY291bnQgbGluayB0byBiZSByZXRyaWV2ZWRcbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgQWNjb3VudExpbmtSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGdldEFjY291bnRMaW5rID0gYXN5bmMgKGlkOiBzdHJpbmcpOiBQcm9taXNlPEFjY291bnRMaW5rUmVzcG9uc2U+ID0+IHtcbiAgICAvLyBpbml0aWFsaXppbmcgdGhlIER5bmFtb0RCIGRvY3VtZW50IGNsaWVudFxuICAgIGNvbnN0IGRvY0NsaWVudCA9IG5ldyBBV1MuRHluYW1vREIuRG9jdW1lbnRDbGllbnQoKTtcblxuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZlIHRoZSBhY2NvdW50IGxpbmsgb2JqZWN0IGdpdmVuIHRoZSBhY2NvdW50IGxpbmsgaWQgKHVzZXIgaWQpXG4gICAgICAgIGNvbnN0IHtJdGVtfSA9IGF3YWl0IGRvY0NsaWVudC5nZXQoe1xuICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5BQ0NPVU5UX0xJTktTISxcbiAgICAgICAgICAgIEtleToge2lkOiBpZH1cbiAgICAgICAgfSkucHJvbWlzZSgpO1xuXG4gICAgICAgIC8vIHJldHVybiB0aGUgcmV0cmlldmVkIGFjY291bnQgbGlua1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGF0YTogSXRlbSBhcyBBY2NvdW50TGlua1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyBnZXRBY2NvdW50TGluayBxdWVyeSB7fWAsIGVycik7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyBnZXRBY2NvdW50TGluayBxdWVyeS4gJHtlcnJ9YCxcbiAgICAgICAgICAgIGVycm9yVHlwZTogTGlua0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfTtcbiAgICB9XG59XG4iXX0=