"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppsFlyerClient = void 0;
const BaseAPIClient_1 = require("./BaseAPIClient");
const GraphqlExports_1 = require("../GraphqlExports");
const Constants_1 = require("../Constants");
/**
 * Class used as the base/generic client for all AppsFlyerClient calls.
 */
class AppsFlyerClient extends BaseAPIClient_1.BaseAPIClient {
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
     * Function used to get the API Key for the Apps Flyer service.
     *
     * @param osType the type of operating system installed on the device,
     * that will determine which API Key we will be returning.
     *
     * @returns a {@link AppsFlyerResponse}, representing the API Key
     * used for the Apps Flyer service.
     */
    async getAppsFlyerAPIKey(osType) {
        // easily identifiable API endpoint information
        const endpointInfo = 'getAppsFlyerAPIKey Query Moonbeam GraphQL API';
        try {
            // retrieve the API Key and Base URL, needed in order to get the API Key for Apps Flyer retrieval call through the client
            const [appsFlyerIOSAPIKey, appsFlyerAndroidAPIKey] = await super.retrieveServiceCredentials(Constants_1.Constants.AWSPairConstants.APPS_FLYER_SECRET_NAME);
            // check to see if we obtained any invalid secret values from the call above
            if (appsFlyerIOSAPIKey === null || appsFlyerIOSAPIKey.length === 0 ||
                appsFlyerAndroidAPIKey === null || appsFlyerAndroidAPIKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for App Upgrade API call!";
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: GraphqlExports_1.AppsFlyerErrorType.UnexpectedError
                };
            }
            else {
                return {
                    data: osType === GraphqlExports_1.OsType.IOs ? appsFlyerIOSAPIKey : appsFlyerAndroidAPIKey
                };
            }
        }
        catch (err) {
            const errorMessage = `Unexpected error while retrieving the Apps Flyer API Key through the ${endpointInfo}, for OS ${osType}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.AppsFlyerErrorType.UnexpectedError
            };
        }
    }
}
exports.AppsFlyerClient = AppsFlyerClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXBwc0ZseWVyQ2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1vbi9jbGllbnRzL0FwcHNGbHllckNsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtREFBOEM7QUFDOUMsc0RBQWdGO0FBQ2hGLDRDQUF1QztBQUV2Qzs7R0FFRztBQUNILE1BQWEsZUFBZ0IsU0FBUSw2QkFBYTtJQUU5Qzs7Ozs7T0FLRztJQUNILFlBQVksV0FBbUIsRUFBRSxNQUFjO1FBQzNDLEtBQUssQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUVEOzs7Ozs7OztPQVFHO0lBQ0gsS0FBSyxDQUFDLGtCQUFrQixDQUFDLE1BQWM7UUFDbkMsK0NBQStDO1FBQy9DLE1BQU0sWUFBWSxHQUFHLCtDQUErQyxDQUFDO1FBRXJFLElBQUk7WUFDQSx5SEFBeUg7WUFDekgsTUFBTSxDQUFDLGtCQUFrQixFQUFFLHNCQUFzQixDQUFDLEdBQUcsTUFBTSxLQUFLLENBQUMsMEJBQTBCLENBQUMscUJBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1lBRS9JLDRFQUE0RTtZQUM1RSxJQUFJLGtCQUFrQixLQUFLLElBQUksSUFBSSxrQkFBa0IsQ0FBQyxNQUFNLEtBQUssQ0FBQztnQkFDOUQsc0JBQXNCLEtBQUssSUFBSSxJQUFJLHNCQUFzQixDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ3hFLE1BQU0sWUFBWSxHQUFHLG9EQUFvRCxDQUFDO2dCQUMxRSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUUxQixPQUFPO29CQUNILFlBQVksRUFBRSxZQUFZO29CQUMxQixTQUFTLEVBQUUsbUNBQWtCLENBQUMsZUFBZTtpQkFDaEQsQ0FBQzthQUNMO2lCQUFNO2dCQUNILE9BQU87b0JBQ0gsSUFBSSxFQUFFLE1BQU0sS0FBSyx1QkFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLHNCQUFzQjtpQkFDNUUsQ0FBQTthQUNKO1NBQ0o7UUFBQyxPQUFPLEdBQUcsRUFBRTtZQUNWLE1BQU0sWUFBWSxHQUFHLHdFQUF3RSxZQUFZLFlBQVksTUFBTSxFQUFFLENBQUM7WUFDOUgsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFlBQVksSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBRXRDLE9BQU87Z0JBQ0gsWUFBWSxFQUFFLFlBQVk7Z0JBQzFCLFNBQVMsRUFBRSxtQ0FBa0IsQ0FBQyxlQUFlO2FBQ2hELENBQUM7U0FDTDtJQUNMLENBQUM7Q0FDSjtBQXRERCwwQ0FzREMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0Jhc2VBUElDbGllbnR9IGZyb20gXCIuL0Jhc2VBUElDbGllbnRcIjtcbmltcG9ydCB7QXBwc0ZseWVyRXJyb3JUeXBlLCBBcHBzRmx5ZXJSZXNwb25zZSwgT3NUeXBlfSBmcm9tIFwiLi4vR3JhcGhxbEV4cG9ydHNcIjtcbmltcG9ydCB7Q29uc3RhbnRzfSBmcm9tIFwiLi4vQ29uc3RhbnRzXCI7XG5cbi8qKlxuICogQ2xhc3MgdXNlZCBhcyB0aGUgYmFzZS9nZW5lcmljIGNsaWVudCBmb3IgYWxsIEFwcHNGbHllckNsaWVudCBjYWxscy5cbiAqL1xuZXhwb3J0IGNsYXNzIEFwcHNGbHllckNsaWVudCBleHRlbmRzIEJhc2VBUElDbGllbnQge1xuXG4gICAgLyoqXG4gICAgICogR2VuZXJpYyBjb25zdHJ1Y3RvciBmb3IgdGhlIGNsaWVudC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbnZpcm9ubWVudCB0aGUgQVdTIGVudmlyb25tZW50IHBhc3NlZCBpbiBmcm9tIHRoZSBMYW1iZGEgcmVzb2x2ZXIuXG4gICAgICogQHBhcmFtIHJlZ2lvbiB0aGUgQVdTIHJlZ2lvbiBwYXNzZWQgaW4gZnJvbSB0aGUgTGFtYmRhIHJlc29sdmVyLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGVudmlyb25tZW50OiBzdHJpbmcsIHJlZ2lvbjogc3RyaW5nKSB7XG4gICAgICAgIHN1cGVyKHJlZ2lvbiwgZW52aXJvbm1lbnQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gZ2V0IHRoZSBBUEkgS2V5IGZvciB0aGUgQXBwcyBGbHllciBzZXJ2aWNlLlxuICAgICAqXG4gICAgICogQHBhcmFtIG9zVHlwZSB0aGUgdHlwZSBvZiBvcGVyYXRpbmcgc3lzdGVtIGluc3RhbGxlZCBvbiB0aGUgZGV2aWNlLFxuICAgICAqIHRoYXQgd2lsbCBkZXRlcm1pbmUgd2hpY2ggQVBJIEtleSB3ZSB3aWxsIGJlIHJldHVybmluZy5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIGEge0BsaW5rIEFwcHNGbHllclJlc3BvbnNlfSwgcmVwcmVzZW50aW5nIHRoZSBBUEkgS2V5XG4gICAgICogdXNlZCBmb3IgdGhlIEFwcHMgRmx5ZXIgc2VydmljZS5cbiAgICAgKi9cbiAgICBhc3luYyBnZXRBcHBzRmx5ZXJBUElLZXkob3NUeXBlOiBPc1R5cGUpOiBQcm9taXNlPEFwcHNGbHllclJlc3BvbnNlPiB7XG4gICAgICAgIC8vIGVhc2lseSBpZGVudGlmaWFibGUgQVBJIGVuZHBvaW50IGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IGVuZHBvaW50SW5mbyA9ICdnZXRBcHBzRmx5ZXJBUElLZXkgUXVlcnkgTW9vbmJlYW0gR3JhcGhRTCBBUEknO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgQVBJIEtleSBhbmQgQmFzZSBVUkwsIG5lZWRlZCBpbiBvcmRlciB0byBnZXQgdGhlIEFQSSBLZXkgZm9yIEFwcHMgRmx5ZXIgcmV0cmlldmFsIGNhbGwgdGhyb3VnaCB0aGUgY2xpZW50XG4gICAgICAgICAgICBjb25zdCBbYXBwc0ZseWVySU9TQVBJS2V5LCBhcHBzRmx5ZXJBbmRyb2lkQVBJS2V5XSA9IGF3YWl0IHN1cGVyLnJldHJpZXZlU2VydmljZUNyZWRlbnRpYWxzKENvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLkFQUFNfRkxZRVJfU0VDUkVUX05BTUUpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgd2Ugb2J0YWluZWQgYW55IGludmFsaWQgc2VjcmV0IHZhbHVlcyBmcm9tIHRoZSBjYWxsIGFib3ZlXG4gICAgICAgICAgICBpZiAoYXBwc0ZseWVySU9TQVBJS2V5ID09PSBudWxsIHx8IGFwcHNGbHllcklPU0FQSUtleS5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBhcHBzRmx5ZXJBbmRyb2lkQVBJS2V5ID09PSBudWxsIHx8IGFwcHNGbHllckFuZHJvaWRBUElLZXkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gXCJJbnZhbGlkIFNlY3JldHMgb2J0YWluZWQgZm9yIEFwcCBVcGdyYWRlIEFQSSBjYWxsIVwiO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBBcHBzRmx5ZXJFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogb3NUeXBlID09PSBPc1R5cGUuSU9zID8gYXBwc0ZseWVySU9TQVBJS2V5IDogYXBwc0ZseWVyQW5kcm9pZEFQSUtleVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSByZXRyaWV2aW5nIHRoZSBBcHBzIEZseWVyIEFQSSBLZXkgdGhyb3VnaCB0aGUgJHtlbmRwb2ludEluZm99LCBmb3IgT1MgJHtvc1R5cGV9YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBBcHBzRmx5ZXJFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxufVxuIl19