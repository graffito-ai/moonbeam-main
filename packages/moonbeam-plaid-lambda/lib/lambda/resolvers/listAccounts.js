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
    // initializing the DynamoDB document client
    const docClient = new AWS.DynamoDB.DocumentClient();
    try {
        // retrieve the account link object given the account link id (user id)
        const { Item } = await docClient.get({
            TableName: process.env.ACCOUNT_LINKS,
            Key: { id: filter.id }
        }).promise();
        // result to return
        const accounts = [];
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
                        institution: link.institution
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
                            institution: link.institution
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
    catch (err) {
        console.log(`Unexpected error while executing listAccounts query {}`, err);
        return {
            errorMessage: `Unexpected error while executing listAccounts query. ${err}`,
            errorType: moonbeam_models_1.LinkErrorType.UnexpectedError
        };
    }
};
exports.listAccounts = listAccounts;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdEFjY291bnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvbGlzdEFjY291bnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNkNBQStCO0FBQy9CLCtEQU1tQztBQUVuQzs7Ozs7R0FLRztBQUNJLE1BQU0sWUFBWSxHQUFHLEtBQUssRUFBRSxNQUF5QixFQUE0QixFQUFFO0lBQ3RGLDRDQUE0QztJQUM1QyxNQUFNLFNBQVMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLENBQUM7SUFFcEQsSUFBSTtRQUNBLHVFQUF1RTtRQUN2RSxNQUFNLEVBQUMsSUFBSSxFQUFDLEdBQUcsTUFBTSxTQUFTLENBQUMsR0FBRyxDQUFDO1lBQy9CLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWM7WUFDckMsR0FBRyxFQUFFLEVBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxFQUFFLEVBQUM7U0FDdkIsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRWIsbUJBQW1CO1FBQ25CLE1BQU0sUUFBUSxHQUFxQixFQUFFLENBQUM7UUFFdEMsb0RBQW9EO1FBQ3BELE1BQU0sb0JBQW9CLEdBQUcsSUFBb0IsQ0FBQztRQUVsRCxxQ0FBcUM7UUFDckMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN0Qyx3SEFBd0g7WUFDeEgsSUFBSSxJQUFLLENBQUMsUUFBUSxJQUFJLElBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDL0MsSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFO29CQUNmLElBQUssQ0FBQyxRQUFRO3lCQUNULE1BQU0sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsT0FBUSxDQUFDLGtCQUFrQixLQUFLLE1BQU0sQ0FBQyxNQUFNLENBQUM7eUJBQ2xFLEdBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQzt3QkFDNUIsRUFBRSxFQUFFLE9BQVEsQ0FBQyxFQUFFO3dCQUNmLElBQUksRUFBRSxPQUFRLENBQUMsSUFBSTt3QkFDbkIsSUFBSSxFQUFFLE9BQVEsQ0FBQyxJQUFJO3dCQUNuQixJQUFJLEVBQUUsT0FBUSxDQUFDLElBQUk7d0JBQ25CLGtCQUFrQixFQUFFLE9BQVEsQ0FBQyxrQkFBa0I7d0JBQy9DLFdBQVcsRUFBRSxJQUFLLENBQUMsV0FBWTtxQkFDbEMsQ0FBQyxDQUFDLENBQUM7aUJBQ1g7cUJBQU07b0JBQ0gsK0dBQStHO29CQUMvRyxJQUFLLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTt3QkFDN0IsUUFBUSxDQUFDLElBQUksQ0FBQzs0QkFDVixFQUFFLEVBQUUsT0FBUSxDQUFDLEVBQUU7NEJBQ2YsSUFBSSxFQUFFLE9BQVEsQ0FBQyxJQUFJOzRCQUNuQixJQUFJLEVBQUUsT0FBUSxDQUFDLElBQUk7NEJBQ25CLElBQUksRUFBRSxPQUFRLENBQUMsSUFBSTs0QkFDbkIsa0JBQWtCLEVBQUUsT0FBUSxDQUFDLGtCQUFrQjs0QkFDL0MsV0FBVyxFQUFFLElBQUssQ0FBQyxXQUFZO3lCQUNsQyxDQUFDLENBQUE7b0JBQ04sQ0FBQyxDQUFDLENBQUE7aUJBQ0w7YUFDSjtRQUNMLENBQUMsQ0FBQyxDQUFDO1FBRUgsd0NBQXdDO1FBQ3hDLE9BQU87WUFDSCxJQUFJLEVBQUUsUUFBUTtTQUNqQixDQUFDO0tBQ0w7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0RBQXdELEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFM0UsT0FBTztZQUNILFlBQVksRUFBRSx3REFBd0QsR0FBRyxFQUFFO1lBQzNFLFNBQVMsRUFBRSwrQkFBYSxDQUFDLGVBQWU7U0FDM0MsQ0FBQztLQUNMO0FBQ0wsQ0FBQyxDQUFBO0FBNURZLFFBQUEsWUFBWSxnQkE0RHhCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgQVdTIGZyb20gJ2F3cy1zZGsnO1xuaW1wb3J0IHtcbiAgICBBY2NvdW50RGV0YWlscyxcbiAgICBBY2NvdW50TGluayxcbiAgICBBY2NvdW50UmVzcG9uc2UsXG4gICAgTGlua0Vycm9yVHlwZSxcbiAgICBMaXN0QWNjb3VudHNJbnB1dFxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuXG4vKipcbiAqIExpc3RBY2NvdW50cyByZXNvbHZlclxuICpcbiAqIEBwYXJhbSBmaWx0ZXIgZmlsdGVycyB0byBiZSBwYXNzZWQgaW4sIHdoaWNoIHdpbGwgaGVscCBmaWx0ZXIgdGhyb3VnaCBhbGwgdGhlIGFjY291bnRzIGluIHRoZSBsaW5rc1xuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBBY2NvdW50UmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBsaXN0QWNjb3VudHMgPSBhc3luYyAoZmlsdGVyOiBMaXN0QWNjb3VudHNJbnB1dCk6IFByb21pc2U8QWNjb3VudFJlc3BvbnNlPiA9PiB7XG4gICAgLy8gaW5pdGlhbGl6aW5nIHRoZSBEeW5hbW9EQiBkb2N1bWVudCBjbGllbnRcbiAgICBjb25zdCBkb2NDbGllbnQgPSBuZXcgQVdTLkR5bmFtb0RCLkRvY3VtZW50Q2xpZW50KCk7XG5cbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2ZSB0aGUgYWNjb3VudCBsaW5rIG9iamVjdCBnaXZlbiB0aGUgYWNjb3VudCBsaW5rIGlkICh1c2VyIGlkKVxuICAgICAgICBjb25zdCB7SXRlbX0gPSBhd2FpdCBkb2NDbGllbnQuZ2V0KHtcbiAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuQUNDT1VOVF9MSU5LUyEsXG4gICAgICAgICAgICBLZXk6IHtpZDogZmlsdGVyLmlkfVxuICAgICAgICB9KS5wcm9taXNlKCk7XG5cbiAgICAgICAgLy8gcmVzdWx0IHRvIHJldHVyblxuICAgICAgICBjb25zdCBhY2NvdW50czogQWNjb3VudERldGFpbHNbXSA9IFtdO1xuXG4gICAgICAgIC8vIHJldHJpZXZlZCBhY2NvdW50LCBiYXNlZCBvbiB0aGUgbGluayBpZCAodXNlciBpZClcbiAgICAgICAgY29uc3QgcmV0cmlldmVkQWNjb3VudExpbmsgPSBJdGVtISBhcyBBY2NvdW50TGluaztcblxuICAgICAgICAvLyBsb29wIHRocm91Z2ggZWFjaCBvbmUgb2YgdGhlIGxpbmtzXG4gICAgICAgIHJldHJpZXZlZEFjY291bnRMaW5rLmxpbmtzLmZvckVhY2gobGluayA9PiB7XG4gICAgICAgICAgICAvLyBmb3IgZWFjaCBsaW5rLCBmaWx0ZXIgdGhlIGFjY291bnRzIG9ubHksIGluIG9yZGVyIHRvIHJldHVybiB0aGVtLCBhbmQgYWxzbyBmaWx0ZXIgdGhlbSBiYXNlZCBvbiBzdGF0dXMsIGlmIGFwcGxpY2FibGVcbiAgICAgICAgICAgIGlmIChsaW5rIS5hY2NvdW50cyAmJiBsaW5rIS5hY2NvdW50cy5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICBpZiAoZmlsdGVyLnN0YXR1cykge1xuICAgICAgICAgICAgICAgICAgICBsaW5rIS5hY2NvdW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgLmZpbHRlcigoYWNjb3VudCkgPT4gYWNjb3VudCEudmVyaWZpY2F0aW9uU3RhdHVzID09PSBmaWx0ZXIuc3RhdHVzKVxuICAgICAgICAgICAgICAgICAgICAgICAgLm1hcCgoYWNjb3VudCkgPT4gYWNjb3VudHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGFjY291bnQhLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IGFjY291bnQhLnR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogYWNjb3VudCEubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXNrOiBhY2NvdW50IS5tYXNrLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZlcmlmaWNhdGlvblN0YXR1czogYWNjb3VudCEudmVyaWZpY2F0aW9uU3RhdHVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc3RpdHV0aW9uOiBsaW5rIS5pbnN0aXR1dGlvbiFcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyB1c2VkIGEgZm9yIGVhY2ggaGVyZSwgaW5zdGVhZCBvZiBhIHNwcmVhZCBvcGVyYXRvciwgc2luY2UgdGhlIGFjY291bnQgY2FuIGJlIE1heWJlPEFjY291bnQ+IGluc2lkZSB0aGUgYXJyYXlcbiAgICAgICAgICAgICAgICAgICAgbGluayEuYWNjb3VudHMuZm9yRWFjaChhY2NvdW50ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjY291bnRzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBhY2NvdW50IS5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBhY2NvdW50IS50eXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGFjY291bnQhLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFzazogYWNjb3VudCEubWFzayxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2ZXJpZmljYXRpb25TdGF0dXM6IGFjY291bnQhLnZlcmlmaWNhdGlvblN0YXR1cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0aXR1dGlvbjogbGluayEuaW5zdGl0dXRpb24hXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gcmV0dXJucyB0aGUgZmlsdGVyZWQgYWNjb3VudHMgYXMgZGF0YVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGF0YTogYWNjb3VudHNcbiAgICAgICAgfTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5sb2coYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nIGxpc3RBY2NvdW50cyBxdWVyeSB7fWAsIGVycik7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nIGxpc3RBY2NvdW50cyBxdWVyeS4gJHtlcnJ9YCxcbiAgICAgICAgICAgIGVycm9yVHlwZTogTGlua0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfTtcbiAgICB9XG59XG4iXX0=