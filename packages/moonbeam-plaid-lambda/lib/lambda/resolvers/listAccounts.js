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
exports.listAccounts = void 0;
const AWS = __importStar(require("aws-sdk"));
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * ListAccounts resolver
 *
 * @param filter filters to be passed in, which will help filter through all the accounts in the links
 * @returns {@link Promise} of {@link AccountResponse}
 */
const listAccounts = async (filter) => {
    try {
        // initializing the DynamoDB document client
        const docClient = new AWS.DynamoDB.DocumentClient();
        // retrieve the account link object given the account link id (user id)
        const { Item } = await docClient.get({
            TableName: process.env.ACCOUNT_LINKS,
            Key: { id: filter.id }
        }).promise();
        // result to return
        const accounts = [];
        // if an account link not exist, then return a list of empty accounts, since there is no account link yet for this user
        if (!Item) {
            return {
                data: []
            };
        }
        else {
            // retrieved account, based on the link id (user id)
            const retrievedAccountLink = Item;
            // loop through each one of the links
            retrievedAccountLink.links.forEach(link => {
                // for each link, filter the accounts only, in order to return them, and also filter them based on status, if applicable
                if (link.accounts && link.accounts.length !== 0) {
                    if (filter.status) {
                        link.accounts
                            .filter((account) => account.verificationStatus === filter.status)
                            .map((account) => accounts.push({
                            id: account.id,
                            type: account.type,
                            name: account.name,
                            mask: account.mask,
                            verificationStatus: account.verificationStatus,
                            institution: link.institution,
                            linkToken: link.linkToken
                        }));
                    }
                    else {
                        // used a for each here, instead of a spread operator, since the account can be Maybe<Account> inside the array
                        link.accounts.forEach(account => {
                            accounts.push({
                                id: account.id,
                                type: account.type,
                                name: account.name,
                                mask: account.mask,
                                verificationStatus: account.verificationStatus,
                                institution: link.institution,
                                linkToken: link.linkToken
                            });
                        });
                    }
                }
            });
            // returns the filtered accounts as data
            return {
                data: accounts
            };
        }
    }
    catch (err) {
        console.log(`Unexpected error while executing listAccounts query {}`, err);
        return {
            errorMessage: `Unexpected error while executing listAccounts query. ${err}`,
            errorType: moonbeam_models_1.LinkErrorType.UnexpectedError
        };
    }
};
exports.listAccounts = listAccounts;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdEFjY291bnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvbGlzdEFjY291bnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNkNBQStCO0FBQy9CLCtEQU1tQztBQUVuQzs7Ozs7R0FLRztBQUNJLE1BQU0sWUFBWSxHQUFHLEtBQUssRUFBRSxNQUF5QixFQUE0QixFQUFFO0lBQ3RGLElBQUk7UUFDQSw0Q0FBNEM7UUFDNUMsTUFBTSxTQUFTLEdBQUcsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBRXBELHVFQUF1RTtRQUN2RSxNQUFNLEVBQUMsSUFBSSxFQUFDLEdBQUcsTUFBTSxTQUFTLENBQUMsR0FBRyxDQUFDO1lBQy9CLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWM7WUFDckMsR0FBRyxFQUFFLEVBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxFQUFFLEVBQUM7U0FDdkIsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRWIsbUJBQW1CO1FBQ25CLE1BQU0sUUFBUSxHQUFxQixFQUFFLENBQUM7UUFFdEMsdUhBQXVIO1FBQ3ZILElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDUCxPQUFPO2dCQUNILElBQUksRUFBRSxFQUFFO2FBQ1gsQ0FBQztTQUNMO2FBQU07WUFDSCxvREFBb0Q7WUFDcEQsTUFBTSxvQkFBb0IsR0FBRyxJQUFvQixDQUFDO1lBRWxELHFDQUFxQztZQUNyQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUN0Qyx3SEFBd0g7Z0JBQ3hILElBQUksSUFBSyxDQUFDLFFBQVEsSUFBSSxJQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7b0JBQy9DLElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRTt3QkFDZixJQUFLLENBQUMsUUFBUTs2QkFDVCxNQUFNLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLE9BQVEsQ0FBQyxrQkFBa0IsS0FBSyxNQUFNLENBQUMsTUFBTSxDQUFDOzZCQUNsRSxHQUFHLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7NEJBQzVCLEVBQUUsRUFBRSxPQUFRLENBQUMsRUFBRTs0QkFDZixJQUFJLEVBQUUsT0FBUSxDQUFDLElBQUk7NEJBQ25CLElBQUksRUFBRSxPQUFRLENBQUMsSUFBSTs0QkFDbkIsSUFBSSxFQUFFLE9BQVEsQ0FBQyxJQUFJOzRCQUNuQixrQkFBa0IsRUFBRSxPQUFRLENBQUMsa0JBQWtCOzRCQUMvQyxXQUFXLEVBQUUsSUFBSyxDQUFDLFdBQVk7NEJBQy9CLFNBQVMsRUFBRSxJQUFLLENBQUMsU0FBUzt5QkFDN0IsQ0FBQyxDQUFDLENBQUM7cUJBQ1g7eUJBQU07d0JBQ0gsK0dBQStHO3dCQUMvRyxJQUFLLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTs0QkFDN0IsUUFBUSxDQUFDLElBQUksQ0FBQztnQ0FDVixFQUFFLEVBQUUsT0FBUSxDQUFDLEVBQUU7Z0NBQ2YsSUFBSSxFQUFFLE9BQVEsQ0FBQyxJQUFJO2dDQUNuQixJQUFJLEVBQUUsT0FBUSxDQUFDLElBQUk7Z0NBQ25CLElBQUksRUFBRSxPQUFRLENBQUMsSUFBSTtnQ0FDbkIsa0JBQWtCLEVBQUUsT0FBUSxDQUFDLGtCQUFrQjtnQ0FDL0MsV0FBVyxFQUFFLElBQUssQ0FBQyxXQUFZO2dDQUMvQixTQUFTLEVBQUUsSUFBSyxDQUFDLFNBQVM7NkJBQzdCLENBQUMsQ0FBQTt3QkFDTixDQUFDLENBQUMsQ0FBQTtxQkFDTDtpQkFDSjtZQUNMLENBQUMsQ0FBQyxDQUFDO1lBRUgsd0NBQXdDO1lBQ3hDLE9BQU87Z0JBQ0gsSUFBSSxFQUFFLFFBQVE7YUFDakIsQ0FBQztTQUNMO0tBQ0o7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0RBQXdELEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFM0UsT0FBTztZQUNILFlBQVksRUFBRSx3REFBd0QsR0FBRyxFQUFFO1lBQzNFLFNBQVMsRUFBRSwrQkFBYSxDQUFDLGVBQWU7U0FDM0MsQ0FBQztLQUNMO0FBQ0wsQ0FBQyxDQUFBO0FBckVZLFFBQUEsWUFBWSxnQkFxRXhCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgQVdTIGZyb20gJ2F3cy1zZGsnO1xuaW1wb3J0IHtcbiAgICBBY2NvdW50RGV0YWlscyxcbiAgICBBY2NvdW50TGluayxcbiAgICBBY2NvdW50UmVzcG9uc2UsXG4gICAgTGlua0Vycm9yVHlwZSxcbiAgICBMaXN0QWNjb3VudHNJbnB1dFxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuXG4vKipcbiAqIExpc3RBY2NvdW50cyByZXNvbHZlclxuICpcbiAqIEBwYXJhbSBmaWx0ZXIgZmlsdGVycyB0byBiZSBwYXNzZWQgaW4sIHdoaWNoIHdpbGwgaGVscCBmaWx0ZXIgdGhyb3VnaCBhbGwgdGhlIGFjY291bnRzIGluIHRoZSBsaW5rc1xuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBBY2NvdW50UmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBsaXN0QWNjb3VudHMgPSBhc3luYyAoZmlsdGVyOiBMaXN0QWNjb3VudHNJbnB1dCk6IFByb21pc2U8QWNjb3VudFJlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gaW5pdGlhbGl6aW5nIHRoZSBEeW5hbW9EQiBkb2N1bWVudCBjbGllbnRcbiAgICAgICAgY29uc3QgZG9jQ2xpZW50ID0gbmV3IEFXUy5EeW5hbW9EQi5Eb2N1bWVudENsaWVudCgpO1xuXG4gICAgICAgIC8vIHJldHJpZXZlIHRoZSBhY2NvdW50IGxpbmsgb2JqZWN0IGdpdmVuIHRoZSBhY2NvdW50IGxpbmsgaWQgKHVzZXIgaWQpXG4gICAgICAgIGNvbnN0IHtJdGVtfSA9IGF3YWl0IGRvY0NsaWVudC5nZXQoe1xuICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5BQ0NPVU5UX0xJTktTISxcbiAgICAgICAgICAgIEtleToge2lkOiBmaWx0ZXIuaWR9XG4gICAgICAgIH0pLnByb21pc2UoKTtcblxuICAgICAgICAvLyByZXN1bHQgdG8gcmV0dXJuXG4gICAgICAgIGNvbnN0IGFjY291bnRzOiBBY2NvdW50RGV0YWlsc1tdID0gW107XG5cbiAgICAgICAgLy8gaWYgYW4gYWNjb3VudCBsaW5rIG5vdCBleGlzdCwgdGhlbiByZXR1cm4gYSBsaXN0IG9mIGVtcHR5IGFjY291bnRzLCBzaW5jZSB0aGVyZSBpcyBubyBhY2NvdW50IGxpbmsgeWV0IGZvciB0aGlzIHVzZXJcbiAgICAgICAgaWYgKCFJdGVtKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRhdGE6IFtdXG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gcmV0cmlldmVkIGFjY291bnQsIGJhc2VkIG9uIHRoZSBsaW5rIGlkICh1c2VyIGlkKVxuICAgICAgICAgICAgY29uc3QgcmV0cmlldmVkQWNjb3VudExpbmsgPSBJdGVtISBhcyBBY2NvdW50TGluaztcblxuICAgICAgICAgICAgLy8gbG9vcCB0aHJvdWdoIGVhY2ggb25lIG9mIHRoZSBsaW5rc1xuICAgICAgICAgICAgcmV0cmlldmVkQWNjb3VudExpbmsubGlua3MuZm9yRWFjaChsaW5rID0+IHtcbiAgICAgICAgICAgICAgICAvLyBmb3IgZWFjaCBsaW5rLCBmaWx0ZXIgdGhlIGFjY291bnRzIG9ubHksIGluIG9yZGVyIHRvIHJldHVybiB0aGVtLCBhbmQgYWxzbyBmaWx0ZXIgdGhlbSBiYXNlZCBvbiBzdGF0dXMsIGlmIGFwcGxpY2FibGVcbiAgICAgICAgICAgICAgICBpZiAobGluayEuYWNjb3VudHMgJiYgbGluayEuYWNjb3VudHMubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmaWx0ZXIuc3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rIS5hY2NvdW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoKGFjY291bnQpID0+IGFjY291bnQhLnZlcmlmaWNhdGlvblN0YXR1cyA9PT0gZmlsdGVyLnN0YXR1cylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKChhY2NvdW50KSA9PiBhY2NvdW50cy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGFjY291bnQhLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBhY2NvdW50IS50eXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBhY2NvdW50IS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXNrOiBhY2NvdW50IS5tYXNrLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2ZXJpZmljYXRpb25TdGF0dXM6IGFjY291bnQhLnZlcmlmaWNhdGlvblN0YXR1cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGl0dXRpb246IGxpbmshLmluc3RpdHV0aW9uISxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlua1Rva2VuOiBsaW5rIS5saW5rVG9rZW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB1c2VkIGEgZm9yIGVhY2ggaGVyZSwgaW5zdGVhZCBvZiBhIHNwcmVhZCBvcGVyYXRvciwgc2luY2UgdGhlIGFjY291bnQgY2FuIGJlIE1heWJlPEFjY291bnQ+IGluc2lkZSB0aGUgYXJyYXlcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmshLmFjY291bnRzLmZvckVhY2goYWNjb3VudCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWNjb3VudHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBhY2NvdW50IS5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogYWNjb3VudCEudHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogYWNjb3VudCEubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFzazogYWNjb3VudCEubWFzayxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmVyaWZpY2F0aW9uU3RhdHVzOiBhY2NvdW50IS52ZXJpZmljYXRpb25TdGF0dXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc3RpdHV0aW9uOiBsaW5rIS5pbnN0aXR1dGlvbiEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmtUb2tlbjogbGluayEubGlua1Rva2VuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gcmV0dXJucyB0aGUgZmlsdGVyZWQgYWNjb3VudHMgYXMgZGF0YVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBkYXRhOiBhY2NvdW50c1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zb2xlLmxvZyhgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgbGlzdEFjY291bnRzIHF1ZXJ5IHt9YCwgZXJyKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgbGlzdEFjY291bnRzIHF1ZXJ5LiAke2Vycn1gLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICB9O1xuICAgIH1cbn1cbiJdfQ==