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
            // check if the secrets for Plaid exist
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhaWRVdGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvdXRpbHMvcGxhaWRVdGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZDQUErQjtBQUMvQixtQ0FBbUM7QUFDbkMsaUNBQXVEO0FBQ3ZELCtEQUFvRDtBQUVwRDs7O0dBR0c7QUFDSCxNQUFhLFVBQVU7SUFFbkIsc0RBQXNEO0lBQzdDLGFBQWEsQ0FBcUI7SUFDbEMsV0FBVyxDQUFxQjtJQUV6QyxpQ0FBaUM7SUFDeEIsV0FBVyxDQUF1QjtJQUUzQzs7Ozs7O09BTUc7SUFDSCxZQUFvQixXQUFzQixFQUFFLGFBQXNCLEVBQUUsV0FBb0I7UUFDcEYsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFDL0IsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7UUFDbkMsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7SUFDbkMsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxNQUFNLENBQUMsS0FBSyxHQUFHLEtBQUssSUFBeUIsRUFBRTtRQUNsRCwyQ0FBMkM7UUFDM0MsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUVqRCxJQUFJO1lBQ0EsK0RBQStEO1lBQy9ELE1BQU0sV0FBVyxHQUFHLElBQUksY0FBUSxDQUFDLElBQUkscUJBQWEsQ0FBQztnQkFDL0MsUUFBUSxFQUFFLHlCQUFpQixDQUFDLE9BQU87Z0JBQ25DLFdBQVcsRUFBRTtvQkFDVCxPQUFPLEVBQUU7d0JBQ0wsQ0FBQywyQkFBUyxDQUFDLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7d0JBQzFELENBQUMsMkJBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO3FCQUMxRDtpQkFDSjthQUNKLENBQUMsQ0FBQyxDQUFDO1lBRUosMkNBQTJDO1lBQzNDLE9BQU8sSUFBSSxVQUFVLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNsRTtRQUFDLE9BQU8sR0FBRyxFQUFFO1lBQ1YsTUFBTSxZQUFZLEdBQUcsc0RBQXNELEdBQUcsRUFBRSxDQUFDO1lBQ2pGLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDMUIsTUFBTSxJQUFJLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUNqQztJQUNMLENBQUMsQ0FBQTtJQUVEOzs7OztPQUtHO0lBQ0ssTUFBTSxDQUFDLGlCQUFpQixHQUFHLEtBQUssSUFBK0IsRUFBRTtRQUNyRSxJQUFJO1lBQ0EseUNBQXlDO1lBQ3pDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVyxDQUFDO1lBRXZDLDhDQUE4QztZQUM5QyxNQUFNLGFBQWEsR0FBRyxJQUFJLEdBQUcsQ0FBQyxjQUFjLENBQUM7Z0JBQ3pDLE1BQU0sRUFBRSxNQUFNO2FBQ2pCLENBQUMsQ0FBQztZQUVILG1HQUFtRztZQUNuRyxNQUFNLFNBQVMsR0FBRyxNQUFNLGFBQWE7aUJBQ2hDLGNBQWMsQ0FBQyxFQUFDLFFBQVEsRUFBRSxHQUFHLDJCQUFTLENBQUMsZ0JBQWdCLENBQUMsaUJBQWlCLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFTLElBQUksTUFBTSxFQUFFLEVBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBRWhJLHVDQUF1QztZQUN2QyxJQUFJLFNBQVMsQ0FBQyxZQUFZLEVBQUU7Z0JBQ3hCLDZEQUE2RDtnQkFDN0QsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsWUFBYSxDQUFDLENBQUM7Z0JBRTVELHFEQUFxRDtnQkFDckQsT0FBTyxDQUFDLGVBQWUsQ0FBQywyQkFBUyxDQUFDLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxFQUFFLGVBQWUsQ0FBQywyQkFBUyxDQUFDLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7YUFDbEk7WUFDRCxNQUFNLElBQUksS0FBSyxDQUFDLDBDQUEwQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUMxRjtRQUFDLE9BQU8sR0FBRyxFQUFFO1lBQ1YsTUFBTSxZQUFZLEdBQUcsZ0RBQWdELEdBQUcsRUFBRSxDQUFDO1lBQzNFLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDMUIsTUFBTSxJQUFJLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUNqQztJQUNMLENBQUMsQ0FBQTs7QUF0RkwsZ0NBdUZDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgQVdTIGZyb20gXCJhd3Mtc2RrXCI7XG5pbXBvcnQge1BsYWlkQXBpfSBmcm9tIFwicGxhaWQvYXBpXCI7XG5pbXBvcnQge0NvbmZpZ3VyYXRpb24sIFBsYWlkRW52aXJvbm1lbnRzfSBmcm9tIFwicGxhaWRcIjtcbmltcG9ydCB7Q29uc3RhbnRzfSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuXG4vKipcbiAqIENsYXNzIHVzZWQgdG8gaW5pdGlhbGl6ZSBhIG5ldyBQbGFpZCBDbGllbnQsIHRvIGJlIHVzZWQgZm9yIHJldHJpZXZpbmcgdmFyaW91c1xuICogc2VjcmV0cy5cbiAqL1xuZXhwb3J0IGNsYXNzIFBsYWlkVXRpbHMge1xuXG4gICAgLy8gUGxhaWQgY3JlZGVudGlhbHMgcmV0cmlldmUgZnJvbSBBV1MgU2VjcmV0cyBNYW5hZ2VyXG4gICAgcmVhZG9ubHkgcGxhaWRDbGllbnRJZDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIHJlYWRvbmx5IHBsYWlkU2VjcmV0OiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cbiAgICAvLyBQbGFpZCBDbGllbnQgdG8gYmUgaW5pdGlhbGl6ZWRcbiAgICByZWFkb25seSBwbGFpZENsaWVudDogUGxhaWRBcGkgfCB1bmRlZmluZWQ7XG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvciBmb3IgdGhlIFBsYWlkQ2xpZW50IHRvIGJlIGluaXRpYWxpemVkLlxuICAgICAqXG4gICAgICogQHBhcmFtIHBsYWlkQ2xpZW50IHBsYWlkIGNsaWVudCB0byBiZSBpbml0aWFsaXplZFxuICAgICAqIEBwYXJhbSBwbGFpZENsaWVudElkIHBsYWlkIGNsaWVudCBpZCB0byBiZSByZXRyaWV2ZWRcbiAgICAgKiBAcGFyYW0gcGxhaWRTZWNyZXQgcGxhaWQgc2VjcmV0IHRvIGJlIHJldHJpZXZlZFxuICAgICAqL1xuICAgIHByaXZhdGUgY29uc3RydWN0b3IocGxhaWRDbGllbnQ/OiBQbGFpZEFwaSwgcGxhaWRDbGllbnRJZD86IHN0cmluZywgcGxhaWRTZWNyZXQ/OiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5wbGFpZENsaWVudCA9IHBsYWlkQ2xpZW50O1xuICAgICAgICB0aGlzLnBsYWlkQ2xpZW50SWQgPSBwbGFpZENsaWVudElkO1xuICAgICAgICB0aGlzLnBsYWlkU2VjcmV0ID0gcGxhaWRTZWNyZXQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWV0aG9kIHVzZWQgdG8gc2V0IHVwIHRoZSB1dGlscyBjbGFzc1xuICAgICAqXG4gICAgICogQHJldHVybiBhbiBpbnN0YW5jZSBvZiB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIFBsYWlkVXRpbHN9XG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBzZXR1cCA9IGFzeW5jICgpOiBQcm9taXNlPFBsYWlkVXRpbHM+ID0+IHtcbiAgICAgICAgLy8gcmV0cmlldmUgdGhlIG5lY2Vzc2FyeSBQbGFpZCBjcmVkZW50aWFsc1xuICAgICAgICBjb25zdCBwbGFpZFBhaXIgPSBhd2FpdCB0aGlzLnJldHJpZXZlUGxhaWRQYWlyKCk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHVzZSB0aGUgUGxhaWQgbGlicmFyeSwgaW4gb3JkZXIgdG8gaW5pdGlhbGl6ZSBhIFBsYWlkIGNsaWVudFxuICAgICAgICAgICAgY29uc3QgcGxhaWRDbGllbnQgPSBuZXcgUGxhaWRBcGkobmV3IENvbmZpZ3VyYXRpb24oe1xuICAgICAgICAgICAgICAgIGJhc2VQYXRoOiBQbGFpZEVudmlyb25tZW50cy5zYW5kYm94LCAvLyB0aGlzIG5lZWRzIHRvIGNoYW5nZSBpbiB0aGUgZnV0dXJlIGRlcGVuZGluZyBvbiB0aGUgZW52aXJvbm1lbnRcbiAgICAgICAgICAgICAgICBiYXNlT3B0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBbQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuUExBSURfQ0xJRU5UX0lEXTogcGxhaWRQYWlyWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgW0NvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLlBMQUlEX1NFQ1JFVF06IHBsYWlkUGFpclsxXSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICAvLyByZXR1cm4gYSBuZXcgaW5zdGFuY2Ugb2YgdGhlIFV0aWxzIGNsYXNzXG4gICAgICAgICAgICByZXR1cm4gbmV3IFBsYWlkVXRpbHMocGxhaWRDbGllbnQsIHBsYWlkUGFpclswXSwgcGxhaWRQYWlyWzFdKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZXR0aW5nIHVwIHRoZSBQbGFpZCBjbGllbnQgJHtlcnJ9YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gcmV0dXJuIHRoZSBQbGFpZCBzZWNyZXRzLCByZXR1cm5lZCBmcm9tIHRoZSBBV1MgU2VjcmV0cyBNYW5hZ2VyLFxuICAgICAqIGdpdmVuIHRoZSBjdXJyZW50IHJlZ2lvbiBhbmQgZW52aXJvbm1lbnQuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIGEgaW5zdGFuY2Ugb2Yge0BsaW5rIFByb21pc2V9IG9mIGEgUGFpciBvZiB7QGxpbmsgc3RyaW5nfSwge0BsaW5rIHN0cmluZ31cbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyByZXRyaWV2ZVBsYWlkUGFpciA9IGFzeW5jICgpOiBQcm9taXNlPFtzdHJpbmcsIHN0cmluZ10+ID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAgICAgLy8gaW5pdGlhbGl6aW5nIHRoZSBBV1MgU2VjcmV0cyBNYW5hZ2VyIGNsaWVudFxuICAgICAgICAgICAgY29uc3Qgc2VjcmV0c0NsaWVudCA9IG5ldyBBV1MuU2VjcmV0c01hbmFnZXIoe1xuICAgICAgICAgICAgICAgIHJlZ2lvbjogcmVnaW9uLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBQbGFpZCByZWxhdGVkIHNlY3JldHMgZm9yIE1vb25iZWFtLCBkZXBlbmRpbmcgb24gdGhlIGN1cnJlbnQgcmVnaW9uIGFuZCBlbnZpcm9ubWVudFxuICAgICAgICAgICAgY29uc3QgcGxhaWRQYWlyID0gYXdhaXQgc2VjcmV0c0NsaWVudFxuICAgICAgICAgICAgICAgIC5nZXRTZWNyZXRWYWx1ZSh7U2VjcmV0SWQ6IGAke0NvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLlBMQUlEX1NFQ1JFVF9OQU1FfS0ke3Byb2Nlc3MuZW52LkVOVl9OQU1FIX0tJHtyZWdpb259YH0pLnByb21pc2UoKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgaWYgdGhlIHNlY3JldHMgZm9yIFBsYWlkIGV4aXN0XG4gICAgICAgICAgICBpZiAocGxhaWRQYWlyLlNlY3JldFN0cmluZykge1xuICAgICAgICAgICAgICAgIC8vIGNvbnZlcnQgdGhlIHJldHJpZXZlZCBzZWNyZXRzIHBhaXIgdmFsdWUsIGFzIGEgSlNPTiBvYmplY3RcbiAgICAgICAgICAgICAgICBjb25zdCBwbGFpZFBhaXJBc0pzb24gPSBKU09OLnBhcnNlKHBsYWlkUGFpci5TZWNyZXRTdHJpbmchKTtcblxuICAgICAgICAgICAgICAgIC8vIGZpbHRlciBvdXQgYW5kIHNldCB0aGUgbmVjZXNzYXJ5IFBsYWlkIGNyZWRlbnRpYWxzXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtwbGFpZFBhaXJBc0pzb25bQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuUExBSURfQ0xJRU5UX0lEXSwgcGxhaWRQYWlyQXNKc29uW0NvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLlBMQUlEX1NFQ1JFVF1dO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBQbGFpZCBwYWlyIHNlY3JldCBzdHJpbmcgbm90IGF2YWlsYWJsZSAke0pTT04uc3RyaW5naWZ5KHBsYWlkUGFpcil9YCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgcmV0cmlldmluZyBQbGFpZCBwYWlyICR7ZXJyfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=