"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppUpgradeClient = void 0;
const BaseAPIClient_1 = require("./BaseAPIClient");
const GraphqlExports_1 = require("../GraphqlExports");
const Constants_1 = require("../Constants");
/**
 * Class used as the base/generic client for all AppUpgradeClient calls.
 */
class AppUpgradeClient extends BaseAPIClient_1.BaseAPIClient {
    /**
     * Generic constructor for the client.
     *
     * @param environment the AWS environment passed in from the Lambda resolver.
     * @param region the AWS region passed in from the Lambda resolver.
     */
    constructor(environment, region) {
        super(region, environment);
    }
    /**
     * Function used to get the API Key for the App Upgrade service.
     *
     * @returns a {@link AppUpgradeResponse}, representing the API Key
     * used for the App Upgrade service.
     *
     */
    async getAppUpgradeAPIKey() {
        // easily identifiable API endpoint information
        const endpointInfo = 'getAppUpgradeAPIKey Query Moonbeam GraphQL API';
        try {
            // retrieve the API Key and Base URL, needed in order to get the API Key for App Upgrade retrieval call through the client
            const [appUpgradeBaseURL, appUpgradeAPIKey] = await super.retrieveServiceCredentials(Constants_1.Constants.AWSPairConstants.APP_UPGRADE_SECRET_NAME);
            // check to see if we obtained any invalid secret values from the call above
            if (appUpgradeBaseURL === null || appUpgradeBaseURL.length === 0 ||
                appUpgradeAPIKey === null || appUpgradeAPIKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for App Upgrade API call!";
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: GraphqlExports_1.AppUpgradeErrorType.UnexpectedError
                };
            }
            else {
                return {
                    data: appUpgradeAPIKey
                };
            }
        }
        catch (err) {
            const errorMessage = `Unexpected error while retrieving the App Upgrade API Key through the ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.AppUpgradeErrorType.UnexpectedError
            };
        }
    }
}
exports.AppUpgradeClient = AppUpgradeClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXBwVXBncmFkZUNsaWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tb24vY2xpZW50cy9BcHBVcGdyYWRlQ2xpZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1EQUE4QztBQUM5QyxzREFBMEU7QUFDMUUsNENBQXVDO0FBRXZDOztHQUVHO0FBQ0gsTUFBYSxnQkFBaUIsU0FBUSw2QkFBYTtJQUUvQzs7Ozs7T0FLRztJQUNILFlBQVksV0FBbUIsRUFBRSxNQUFjO1FBQzNDLEtBQUssQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNILEtBQUssQ0FBQyxtQkFBbUI7UUFDckIsK0NBQStDO1FBQy9DLE1BQU0sWUFBWSxHQUFHLGdEQUFnRCxDQUFDO1FBRXRFLElBQUk7WUFDQSwwSEFBMEg7WUFDMUgsTUFBTSxDQUFDLGlCQUFpQixFQUFFLGdCQUFnQixDQUFDLEdBQUcsTUFBTSxLQUFLLENBQUMsMEJBQTBCLENBQUMscUJBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1lBRXpJLDRFQUE0RTtZQUM1RSxJQUFJLGlCQUFpQixLQUFLLElBQUksSUFBSSxpQkFBaUIsQ0FBQyxNQUFNLEtBQUssQ0FBQztnQkFDNUQsZ0JBQWdCLEtBQUssSUFBSSxJQUFJLGdCQUFnQixDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQzVELE1BQU0sWUFBWSxHQUFHLG9EQUFvRCxDQUFDO2dCQUMxRSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUUxQixPQUFPO29CQUNILFlBQVksRUFBRSxZQUFZO29CQUMxQixTQUFTLEVBQUUsb0NBQW1CLENBQUMsZUFBZTtpQkFDakQsQ0FBQzthQUNMO2lCQUFNO2dCQUNILE9BQU87b0JBQ0gsSUFBSSxFQUFFLGdCQUFnQjtpQkFDekIsQ0FBQTthQUNKO1NBQ0o7UUFBQyxPQUFPLEdBQUcsRUFBRTtZQUNWLE1BQU0sWUFBWSxHQUFHLHlFQUF5RSxZQUFZLEVBQUUsQ0FBQztZQUM3RyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsWUFBWSxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFFdEMsT0FBTztnQkFDSCxZQUFZLEVBQUUsWUFBWTtnQkFDMUIsU0FBUyxFQUFFLG9DQUFtQixDQUFDLGVBQWU7YUFDakQsQ0FBQztTQUNMO0lBQ0wsQ0FBQztDQUNKO0FBcERELDRDQW9EQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QmFzZUFQSUNsaWVudH0gZnJvbSBcIi4vQmFzZUFQSUNsaWVudFwiO1xuaW1wb3J0IHtBcHBVcGdyYWRlRXJyb3JUeXBlLCBBcHBVcGdyYWRlUmVzcG9uc2V9IGZyb20gXCIuLi9HcmFwaHFsRXhwb3J0c1wiO1xuaW1wb3J0IHtDb25zdGFudHN9IGZyb20gXCIuLi9Db25zdGFudHNcIjtcblxuLyoqXG4gKiBDbGFzcyB1c2VkIGFzIHRoZSBiYXNlL2dlbmVyaWMgY2xpZW50IGZvciBhbGwgQXBwVXBncmFkZUNsaWVudCBjYWxscy5cbiAqL1xuZXhwb3J0IGNsYXNzIEFwcFVwZ3JhZGVDbGllbnQgZXh0ZW5kcyBCYXNlQVBJQ2xpZW50IHtcblxuICAgIC8qKlxuICAgICAqIEdlbmVyaWMgY29uc3RydWN0b3IgZm9yIHRoZSBjbGllbnQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZW52aXJvbm1lbnQgdGhlIEFXUyBlbnZpcm9ubWVudCBwYXNzZWQgaW4gZnJvbSB0aGUgTGFtYmRhIHJlc29sdmVyLlxuICAgICAqIEBwYXJhbSByZWdpb24gdGhlIEFXUyByZWdpb24gcGFzc2VkIGluIGZyb20gdGhlIExhbWJkYSByZXNvbHZlci5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlbnZpcm9ubWVudDogc3RyaW5nLCByZWdpb246IHN0cmluZykge1xuICAgICAgICBzdXBlcihyZWdpb24sIGVudmlyb25tZW50KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIGdldCB0aGUgQVBJIEtleSBmb3IgdGhlIEFwcCBVcGdyYWRlIHNlcnZpY2UuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBhIHtAbGluayBBcHBVcGdyYWRlUmVzcG9uc2V9LCByZXByZXNlbnRpbmcgdGhlIEFQSSBLZXlcbiAgICAgKiB1c2VkIGZvciB0aGUgQXBwIFVwZ3JhZGUgc2VydmljZS5cbiAgICAgKlxuICAgICAqL1xuICAgIGFzeW5jIGdldEFwcFVwZ3JhZGVBUElLZXkoKTogUHJvbWlzZTxBcHBVcGdyYWRlUmVzcG9uc2U+IHtcbiAgICAgICAgLy8gZWFzaWx5IGlkZW50aWZpYWJsZSBBUEkgZW5kcG9pbnQgaW5mb3JtYXRpb25cbiAgICAgICAgY29uc3QgZW5kcG9pbnRJbmZvID0gJ2dldEFwcFVwZ3JhZGVBUElLZXkgUXVlcnkgTW9vbmJlYW0gR3JhcGhRTCBBUEknO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgQVBJIEtleSBhbmQgQmFzZSBVUkwsIG5lZWRlZCBpbiBvcmRlciB0byBnZXQgdGhlIEFQSSBLZXkgZm9yIEFwcCBVcGdyYWRlIHJldHJpZXZhbCBjYWxsIHRocm91Z2ggdGhlIGNsaWVudFxuICAgICAgICAgICAgY29uc3QgW2FwcFVwZ3JhZGVCYXNlVVJMLCBhcHBVcGdyYWRlQVBJS2V5XSA9IGF3YWl0IHN1cGVyLnJldHJpZXZlU2VydmljZUNyZWRlbnRpYWxzKENvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLkFQUF9VUEdSQURFX1NFQ1JFVF9OQU1FKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHdlIG9idGFpbmVkIGFueSBpbnZhbGlkIHNlY3JldCB2YWx1ZXMgZnJvbSB0aGUgY2FsbCBhYm92ZVxuICAgICAgICAgICAgaWYgKGFwcFVwZ3JhZGVCYXNlVVJMID09PSBudWxsIHx8IGFwcFVwZ3JhZGVCYXNlVVJMLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIGFwcFVwZ3JhZGVBUElLZXkgPT09IG51bGwgfHwgYXBwVXBncmFkZUFQSUtleS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBcIkludmFsaWQgU2VjcmV0cyBvYnRhaW5lZCBmb3IgQXBwIFVwZ3JhZGUgQVBJIGNhbGwhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IEFwcFVwZ3JhZGVFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogYXBwVXBncmFkZUFQSUtleVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSByZXRyaWV2aW5nIHRoZSBBcHAgVXBncmFkZSBBUEkgS2V5IHRocm91Z2ggdGhlICR7ZW5kcG9pbnRJbmZvfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7ZXJyfWApO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQXBwVXBncmFkZUVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=