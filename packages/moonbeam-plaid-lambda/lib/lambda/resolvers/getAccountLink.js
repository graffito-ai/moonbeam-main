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
 * @returns {@link Promise} of {@link ReferralResponse}
 */
const getAccountLink = async (id) => {
    // initializing the DynamoDB document client
    const docClient = new AWS.DynamoDB.DocumentClient();
    try {
        // retrieve the referral object given the account link id (user id)
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0QWNjb3VudExpbmsuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL3Jlc29sdmVycy9nZXRBY2NvdW50TGluay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZDQUErQjtBQUMvQiwrREFBbUg7QUFFbkg7Ozs7O0dBS0c7QUFDSSxNQUFNLGNBQWMsR0FBRyxLQUFLLEVBQUUsRUFBVSxFQUFnQyxFQUFFO0lBQzdFLDRDQUE0QztJQUM1QyxNQUFNLFNBQVMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLENBQUM7SUFFcEQsSUFBSTtRQUNBLG1FQUFtRTtRQUNuRSxNQUFNLEVBQUMsSUFBSSxFQUFDLEdBQUcsTUFBTSxTQUFTLENBQUMsR0FBRyxDQUFDO1lBQy9CLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWM7WUFDckMsR0FBRyxFQUFFLEVBQUMsRUFBRSxFQUFFLEVBQUUsRUFBQztTQUNoQixDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFYixvQ0FBb0M7UUFDcEMsT0FBTztZQUNILElBQUksRUFBRSxJQUEwQjtTQUNuQyxDQUFBO0tBQ0o7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLE9BQU8sQ0FBQyxHQUFHLENBQUMsMERBQTBELEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDN0UsT0FBTztZQUNILFlBQVksRUFBRSwwREFBMEQsR0FBRyxFQUFFO1lBQzdFLFNBQVMsRUFBRSwrQkFBYSxDQUFDLGVBQWU7U0FDM0MsQ0FBQztLQUNMO0FBQ0wsQ0FBQyxDQUFBO0FBdEJZLFFBQUEsY0FBYyxrQkFzQjFCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgQVdTIGZyb20gJ2F3cy1zZGsnO1xuaW1wb3J0IHtBY2NvdW50TGlua0RldGFpbHMsIEFjY291bnRMaW5rUmVzcG9uc2UsIExpbmtFcnJvclR5cGUsIFJlZmVycmFsUmVzcG9uc2V9IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5cbi8qKlxuICogR2V0QWNjb3VudExpbmsgcmVzb2x2ZXJcbiAqXG4gKiBAcGFyYW0gaWQgYWNjb3VudCBsaW5rIGlkICh1c2VyIGlkKSwgZm9yIHRoZSBhY2NvdW50IGxpbmsgdG8gYmUgcmV0cmlldmVkXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIFJlZmVycmFsUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRBY2NvdW50TGluayA9IGFzeW5jIChpZDogc3RyaW5nKTogUHJvbWlzZTxBY2NvdW50TGlua1Jlc3BvbnNlPiA9PiB7XG4gICAgLy8gaW5pdGlhbGl6aW5nIHRoZSBEeW5hbW9EQiBkb2N1bWVudCBjbGllbnRcbiAgICBjb25zdCBkb2NDbGllbnQgPSBuZXcgQVdTLkR5bmFtb0RCLkRvY3VtZW50Q2xpZW50KCk7XG5cbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2ZSB0aGUgcmVmZXJyYWwgb2JqZWN0IGdpdmVuIHRoZSBhY2NvdW50IGxpbmsgaWQgKHVzZXIgaWQpXG4gICAgICAgIGNvbnN0IHtJdGVtfSA9IGF3YWl0IGRvY0NsaWVudC5nZXQoe1xuICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5BQ0NPVU5UX0xJTktTISxcbiAgICAgICAgICAgIEtleToge2lkOiBpZH1cbiAgICAgICAgfSkucHJvbWlzZSgpO1xuXG4gICAgICAgIC8vIHJldHVybiB0aGUgcmV0cmlldmVkIGFjY291bnQgbGlua1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGF0YTogSXRlbSBhcyBBY2NvdW50TGlua0RldGFpbHNcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zb2xlLmxvZyhgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgZ2V0QWNjb3VudExpbmsgcXVlcnkge31gLCBlcnIpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgZ2V0QWNjb3VudExpbmsgcXVlcnkuICR7ZXJyfWAsXG4gICAgICAgICAgICBlcnJvclR5cGU6IExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH07XG4gICAgfVxufVxuIl19