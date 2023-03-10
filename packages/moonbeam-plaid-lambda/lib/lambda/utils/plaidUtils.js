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
exports.PlaidUtils = void 0;
const AWS = __importStar(require("aws-sdk"));
const api_1 = require("plaid/api");
const plaid_1 = require("plaid");
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * Class used to initialize a new Plaid Client, to be used for retrieving various
 * secrets.
 */
class PlaidUtils {
    // Plaid credentials retrieve from AWS Secrets Manager
    plaidClientId;
    plaidSecret;
    // Plaid Client to be initialized
    plaidClient;
    /**
     * Constructor for the PlaidClient to be initialized.
     *
     * @param plaidClient plaid client to be initialized
     * @param plaidClientId plaid client id to be retrieved
     * @param plaidSecret plaid secret to be retrieved
     */
    constructor(plaidClient, plaidClientId, plaidSecret) {
        this.plaidClient = plaidClient;
        this.plaidClientId = plaidClientId;
        this.plaidSecret = plaidSecret;
    }
    /**
     * Method used to set up the utils class
     *
     * @return an instance of {@link Promise} of {@link PlaidUtils}
     */
    static setup = async () => {
        // retrieve the necessary Plaid credentials
        const plaidPair = await this.retrievePlaidPair();
        try {
            // use the Plaid library, in order to initialize a Plaid client
            const plaidClient = new api_1.PlaidApi(new plaid_1.Configuration({
                basePath: plaid_1.PlaidEnvironments.sandbox,
                baseOptions: {
                    headers: {
                        [moonbeam_models_1.Constants.AWSPairConstants.PLAID_CLIENT_ID]: plaidPair[0],
                        [moonbeam_models_1.Constants.AWSPairConstants.PLAID_SECRET]: plaidPair[1],
                    },
                },
            }));
            // return a new instance of the Utils class
            return new PlaidUtils(plaidClient, plaidPair[0], plaidPair[1]);
        }
        catch (err) {
            const errorMessage = `Unexpected error while setting up the Plaid client ${err}`;
            console.log(errorMessage);
            throw new Error(errorMessage);
        }
    };
    /**
     * Function used to return the Plaid secrets, returned from the AWS Secrets Manager,
     * given the current region and environment.
     *
     * @return a instance of {@link Promise} of a Pair of {@link string}, {@link string}
     */
    static retrievePlaidPair = async () => {
        try {
            // retrieving the current function region
            const region = process.env.AWS_REGION;
            // initializing the AWS Secrets Manager client
            const secretsClient = new AWS.SecretsManager({
                region: region,
            });
            // retrieve the Plaid related secrets for Moonbeam, depending on the current region and environment
            const plaidPair = await secretsClient
                .getSecretValue({ SecretId: `${moonbeam_models_1.Constants.AWSPairConstants.PLAID_SECRET_NAME}-${process.env.ENV_NAME}-${region}` }).promise();
            if (plaidPair.SecretString) {
                // convert the retrieved secrets pair value, as a JSON object
                const plaidPairAsJson = JSON.parse(plaidPair.SecretString);
                // filter out and set the necessary Plaid credentials
                return [plaidPairAsJson[moonbeam_models_1.Constants.AWSPairConstants.PLAID_CLIENT_ID], plaidPairAsJson[moonbeam_models_1.Constants.AWSPairConstants.PLAID_SECRET]];
            }
            throw new Error(`Plaid pair secret string not available ${JSON.stringify(plaidPair)}`);
        }
        catch (err) {
            const errorMessage = `Unexpected error while retrieving Plaid pair ${err}`;
            console.log(errorMessage);
            throw new Error(errorMessage);
        }
    };
}
exports.PlaidUtils = PlaidUtils;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhaWRVdGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvdXRpbHMvcGxhaWRVdGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZDQUErQjtBQUMvQixtQ0FBbUM7QUFDbkMsaUNBQXVEO0FBQ3ZELCtEQUFvRDtBQUVwRDs7O0dBR0c7QUFDSCxNQUFhLFVBQVU7SUFFbkIsc0RBQXNEO0lBQzdDLGFBQWEsQ0FBcUI7SUFDbEMsV0FBVyxDQUFxQjtJQUV6QyxpQ0FBaUM7SUFDeEIsV0FBVyxDQUF1QjtJQUUzQzs7Ozs7O09BTUc7SUFDSCxZQUFvQixXQUFzQixFQUFFLGFBQXNCLEVBQUUsV0FBb0I7UUFDcEYsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFDL0IsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7UUFDbkMsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7SUFDbkMsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxNQUFNLENBQUMsS0FBSyxHQUFHLEtBQUssSUFBeUIsRUFBRTtRQUNsRCwyQ0FBMkM7UUFDM0MsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUVqRCxJQUFJO1lBQ0EsK0RBQStEO1lBQy9ELE1BQU0sV0FBVyxHQUFHLElBQUksY0FBUSxDQUFDLElBQUkscUJBQWEsQ0FBQztnQkFDL0MsUUFBUSxFQUFFLHlCQUFpQixDQUFDLE9BQU87Z0JBQ25DLFdBQVcsRUFBRTtvQkFDVCxPQUFPLEVBQUU7d0JBQ0wsQ0FBQywyQkFBUyxDQUFDLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7d0JBQzFELENBQUMsMkJBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO3FCQUMxRDtpQkFDSjthQUNKLENBQUMsQ0FBQyxDQUFDO1lBRUosMkNBQTJDO1lBQzNDLE9BQU8sSUFBSSxVQUFVLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNsRTtRQUFDLE9BQU8sR0FBRyxFQUFFO1lBQ1YsTUFBTSxZQUFZLEdBQUcsc0RBQXNELEdBQUcsRUFBRSxDQUFDO1lBQ2pGLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDMUIsTUFBTSxJQUFJLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUNqQztJQUNMLENBQUMsQ0FBQTtJQUVEOzs7OztPQUtHO0lBQ0ssTUFBTSxDQUFDLGlCQUFpQixHQUFHLEtBQUssSUFBK0IsRUFBRTtRQUNyRSxJQUFJO1lBQ0EseUNBQXlDO1lBQ3pDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVyxDQUFDO1lBRXZDLDhDQUE4QztZQUM5QyxNQUFNLGFBQWEsR0FBRyxJQUFJLEdBQUcsQ0FBQyxjQUFjLENBQUM7Z0JBQ3pDLE1BQU0sRUFBRSxNQUFNO2FBQ2pCLENBQUMsQ0FBQztZQUVILG1HQUFtRztZQUNuRyxNQUFNLFNBQVMsR0FBRyxNQUFNLGFBQWE7aUJBQ2hDLGNBQWMsQ0FBQyxFQUFDLFFBQVEsRUFBRSxHQUFHLDJCQUFTLENBQUMsZ0JBQWdCLENBQUMsaUJBQWlCLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFTLElBQUksTUFBTSxFQUFFLEVBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBRWhJLElBQUksU0FBUyxDQUFDLFlBQVksRUFBRTtnQkFDeEIsNkRBQTZEO2dCQUM3RCxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxZQUFhLENBQUMsQ0FBQztnQkFFNUQscURBQXFEO2dCQUNyRCxPQUFPLENBQUMsZUFBZSxDQUFDLDJCQUFTLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxDQUFDLEVBQUUsZUFBZSxDQUFDLDJCQUFTLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQzthQUNsSTtZQUNELE1BQU0sSUFBSSxLQUFLLENBQUMsMENBQTBDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQzFGO1FBQUMsT0FBTyxHQUFHLEVBQUU7WUFDVixNQUFNLFlBQVksR0FBRyxnREFBZ0QsR0FBRyxFQUFFLENBQUM7WUFDM0UsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUMxQixNQUFNLElBQUksS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1NBQ2pDO0lBQ0wsQ0FBQyxDQUFBOztBQXJGTCxnQ0FzRkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBBV1MgZnJvbSBcImF3cy1zZGtcIjtcbmltcG9ydCB7UGxhaWRBcGl9IGZyb20gXCJwbGFpZC9hcGlcIjtcbmltcG9ydCB7Q29uZmlndXJhdGlvbiwgUGxhaWRFbnZpcm9ubWVudHN9IGZyb20gXCJwbGFpZFwiO1xuaW1wb3J0IHtDb25zdGFudHN9IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5cbi8qKlxuICogQ2xhc3MgdXNlZCB0byBpbml0aWFsaXplIGEgbmV3IFBsYWlkIENsaWVudCwgdG8gYmUgdXNlZCBmb3IgcmV0cmlldmluZyB2YXJpb3VzXG4gKiBzZWNyZXRzLlxuICovXG5leHBvcnQgY2xhc3MgUGxhaWRVdGlscyB7XG5cbiAgICAvLyBQbGFpZCBjcmVkZW50aWFscyByZXRyaWV2ZSBmcm9tIEFXUyBTZWNyZXRzIE1hbmFnZXJcbiAgICByZWFkb25seSBwbGFpZENsaWVudElkOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgcmVhZG9ubHkgcGxhaWRTZWNyZXQ6IHN0cmluZyB8IHVuZGVmaW5lZDtcblxuICAgIC8vIFBsYWlkIENsaWVudCB0byBiZSBpbml0aWFsaXplZFxuICAgIHJlYWRvbmx5IHBsYWlkQ2xpZW50OiBQbGFpZEFwaSB8IHVuZGVmaW5lZDtcblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yIGZvciB0aGUgUGxhaWRDbGllbnQgdG8gYmUgaW5pdGlhbGl6ZWQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcGxhaWRDbGllbnQgcGxhaWQgY2xpZW50IHRvIGJlIGluaXRpYWxpemVkXG4gICAgICogQHBhcmFtIHBsYWlkQ2xpZW50SWQgcGxhaWQgY2xpZW50IGlkIHRvIGJlIHJldHJpZXZlZFxuICAgICAqIEBwYXJhbSBwbGFpZFNlY3JldCBwbGFpZCBzZWNyZXQgdG8gYmUgcmV0cmlldmVkXG4gICAgICovXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihwbGFpZENsaWVudD86IFBsYWlkQXBpLCBwbGFpZENsaWVudElkPzogc3RyaW5nLCBwbGFpZFNlY3JldD86IHN0cmluZykge1xuICAgICAgICB0aGlzLnBsYWlkQ2xpZW50ID0gcGxhaWRDbGllbnQ7XG4gICAgICAgIHRoaXMucGxhaWRDbGllbnRJZCA9IHBsYWlkQ2xpZW50SWQ7XG4gICAgICAgIHRoaXMucGxhaWRTZWNyZXQgPSBwbGFpZFNlY3JldDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNZXRob2QgdXNlZCB0byBzZXQgdXAgdGhlIHV0aWxzIGNsYXNzXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIGFuIGluc3RhbmNlIG9mIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgUGxhaWRVdGlsc31cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHNldHVwID0gYXN5bmMgKCk6IFByb21pc2U8UGxhaWRVdGlscz4gPT4ge1xuICAgICAgICAvLyByZXRyaWV2ZSB0aGUgbmVjZXNzYXJ5IFBsYWlkIGNyZWRlbnRpYWxzXG4gICAgICAgIGNvbnN0IHBsYWlkUGFpciA9IGF3YWl0IHRoaXMucmV0cmlldmVQbGFpZFBhaXIoKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gdXNlIHRoZSBQbGFpZCBsaWJyYXJ5LCBpbiBvcmRlciB0byBpbml0aWFsaXplIGEgUGxhaWQgY2xpZW50XG4gICAgICAgICAgICBjb25zdCBwbGFpZENsaWVudCA9IG5ldyBQbGFpZEFwaShuZXcgQ29uZmlndXJhdGlvbih7XG4gICAgICAgICAgICAgICAgYmFzZVBhdGg6IFBsYWlkRW52aXJvbm1lbnRzLnNhbmRib3gsIC8vIHRoaXMgbmVlZHMgdG8gY2hhbmdlIGluIHRoZSBmdXR1cmUgZGVwZW5kaW5nIG9uIHRoZSBlbnZpcm9ubWVudFxuICAgICAgICAgICAgICAgIGJhc2VPcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFtDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5QTEFJRF9DTElFTlRfSURdOiBwbGFpZFBhaXJbMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICBbQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuUExBSURfU0VDUkVUXTogcGxhaWRQYWlyWzFdLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgIC8vIHJldHVybiBhIG5ldyBpbnN0YW5jZSBvZiB0aGUgVXRpbHMgY2xhc3NcbiAgICAgICAgICAgIHJldHVybiBuZXcgUGxhaWRVdGlscyhwbGFpZENsaWVudCwgcGxhaWRQYWlyWzBdLCBwbGFpZFBhaXJbMV0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHNldHRpbmcgdXAgdGhlIFBsYWlkIGNsaWVudCAke2Vycn1gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byByZXR1cm4gdGhlIFBsYWlkIHNlY3JldHMsIHJldHVybmVkIGZyb20gdGhlIEFXUyBTZWNyZXRzIE1hbmFnZXIsXG4gICAgICogZ2l2ZW4gdGhlIGN1cnJlbnQgcmVnaW9uIGFuZCBlbnZpcm9ubWVudC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4gYSBpbnN0YW5jZSBvZiB7QGxpbmsgUHJvbWlzZX0gb2YgYSBQYWlyIG9mIHtAbGluayBzdHJpbmd9LCB7QGxpbmsgc3RyaW5nfVxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIHJldHJpZXZlUGxhaWRQYWlyID0gYXN5bmMgKCk6IFByb21pc2U8W3N0cmluZywgc3RyaW5nXT4gPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgICAgICAvLyBpbml0aWFsaXppbmcgdGhlIEFXUyBTZWNyZXRzIE1hbmFnZXIgY2xpZW50XG4gICAgICAgICAgICBjb25zdCBzZWNyZXRzQ2xpZW50ID0gbmV3IEFXUy5TZWNyZXRzTWFuYWdlcih7XG4gICAgICAgICAgICAgICAgcmVnaW9uOiByZWdpb24sXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIFBsYWlkIHJlbGF0ZWQgc2VjcmV0cyBmb3IgTW9vbmJlYW0sIGRlcGVuZGluZyBvbiB0aGUgY3VycmVudCByZWdpb24gYW5kIGVudmlyb25tZW50XG4gICAgICAgICAgICBjb25zdCBwbGFpZFBhaXIgPSBhd2FpdCBzZWNyZXRzQ2xpZW50XG4gICAgICAgICAgICAgICAgLmdldFNlY3JldFZhbHVlKHtTZWNyZXRJZDogYCR7Q29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuUExBSURfU0VDUkVUX05BTUV9LSR7cHJvY2Vzcy5lbnYuRU5WX05BTUUhfS0ke3JlZ2lvbn1gfSkucHJvbWlzZSgpO1xuXG4gICAgICAgICAgICBpZiAocGxhaWRQYWlyLlNlY3JldFN0cmluZykge1xuICAgICAgICAgICAgICAgIC8vIGNvbnZlcnQgdGhlIHJldHJpZXZlZCBzZWNyZXRzIHBhaXIgdmFsdWUsIGFzIGEgSlNPTiBvYmplY3RcbiAgICAgICAgICAgICAgICBjb25zdCBwbGFpZFBhaXJBc0pzb24gPSBKU09OLnBhcnNlKHBsYWlkUGFpci5TZWNyZXRTdHJpbmchKTtcblxuICAgICAgICAgICAgICAgIC8vIGZpbHRlciBvdXQgYW5kIHNldCB0aGUgbmVjZXNzYXJ5IFBsYWlkIGNyZWRlbnRpYWxzXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtwbGFpZFBhaXJBc0pzb25bQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuUExBSURfQ0xJRU5UX0lEXSwgcGxhaWRQYWlyQXNKc29uW0NvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLlBMQUlEX1NFQ1JFVF1dO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBQbGFpZCBwYWlyIHNlY3JldCBzdHJpbmcgbm90IGF2YWlsYWJsZSAke0pTT04uc3RyaW5naWZ5KHBsYWlkUGFpcil9YCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgcmV0cmlldmluZyBQbGFpZCBwYWlyICR7ZXJyfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=