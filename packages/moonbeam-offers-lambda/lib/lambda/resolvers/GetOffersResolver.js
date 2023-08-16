"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOffers = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * GetOffers resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getOffersInput offers input used for the offers objects to be retrieved
 * @returns {@link Promise} of {@link OffersResponse}
 */
const getOffers = async (fieldName, getOffersInput) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // check if a valid filter is passed in
        if (getOffersInput.filterType !== moonbeam_models_1.OfferFilter.Nearby && getOffersInput.filterType !== moonbeam_models_1.OfferFilter.Online) {
            const errorMessage = `Unsupported filter for offers query filter ${getOffersInput.filterType}. Use getFidelisPartners instead.`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.OffersErrorType.ValidationError
            };
        }
        else {
            // check if valid information is passed in
            if (getOffersInput.filterType === moonbeam_models_1.OfferFilter.Nearby
                && (!getOffersInput.radius || !getOffersInput.radiusLatitude || !getOffersInput.radiusLongitude || getOffersInput.radiusIncludeOnlineStores === undefined)) {
                const errorMessage = `Invalid information passed in for offers query filer ${getOffersInput.filterType}.`;
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: moonbeam_models_1.OffersErrorType.ValidationError
                };
            }
            else {
                // initialize the Olive Client API here, in order to call the appropriate endpoints for this handler
                const oliveClient = new moonbeam_models_1.OliveClient(process.env.ENV_NAME, region);
                // execute the GET offers Olive REST call
                const offersResponse = await oliveClient.getOffers(getOffersInput);
                // check to see if the offers call was executed successfully
                if (offersResponse && !offersResponse.errorMessage && !offersResponse.errorType && offersResponse.data &&
                    offersResponse.data.totalNumberOfPages !== undefined && offersResponse.data.totalNumberOfRecords !== undefined &&
                    offersResponse.data.offers !== undefined) {
                    // returns the response data with the appropriate offers information
                    return {
                        data: offersResponse.data
                    };
                }
                else {
                    const errorMessage = `Unexpected response structure returned from the get offers call ${JSON.stringify(offersResponse)}!`;
                    console.log(errorMessage);
                    // if there are errors associated with the call, just return the error message and error type from the upstream client
                    return {
                        errorType: moonbeam_models_1.OffersErrorType.ValidationError,
                        errorMessage: errorMessage
                    };
                }
            }
        }
    }
    catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.OffersErrorType.UnexpectedError
        };
    }
};
exports.getOffers = getOffers;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0T2ZmZXJzUmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL3Jlc29sdmVycy9HZXRPZmZlcnNSZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrREFBb0g7QUFFcEg7Ozs7OztHQU1HO0FBQ0ksTUFBTSxTQUFTLEdBQUcsS0FBSyxFQUFFLFNBQWlCLEVBQUUsY0FBOEIsRUFBMkIsRUFBRTtJQUMxRyxJQUFJO1FBQ0EseUNBQXlDO1FBQ3pDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVyxDQUFDO1FBRXZDLHVDQUF1QztRQUN2QyxJQUFJLGNBQWMsQ0FBQyxVQUFVLEtBQUssNkJBQVcsQ0FBQyxNQUFNLElBQUksY0FBYyxDQUFDLFVBQVUsS0FBSyw2QkFBVyxDQUFDLE1BQU0sRUFBRTtZQUN0RyxNQUFNLFlBQVksR0FBRyw4Q0FBOEMsY0FBYyxDQUFDLFVBQVUsbUNBQW1DLENBQUM7WUFDaEksT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUUxQixPQUFPO2dCQUNILFlBQVksRUFBRSxZQUFZO2dCQUMxQixTQUFTLEVBQUUsaUNBQWUsQ0FBQyxlQUFlO2FBQzdDLENBQUE7U0FDSjthQUFNO1lBQ0gsMENBQTBDO1lBQzFDLElBQUksY0FBYyxDQUFDLFVBQVUsS0FBSyw2QkFBVyxDQUFDLE1BQU07bUJBQzdDLENBQUMsQ0FBQyxjQUFjLENBQUMsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLGNBQWMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxlQUFlLElBQUksY0FBYyxDQUFDLHlCQUF5QixLQUFLLFNBQVMsQ0FBQyxFQUFFO2dCQUM1SixNQUFNLFlBQVksR0FBRyx3REFBd0QsY0FBYyxDQUFDLFVBQVUsR0FBRyxDQUFDO2dCQUMxRyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUUxQixPQUFPO29CQUNILFlBQVksRUFBRSxZQUFZO29CQUMxQixTQUFTLEVBQUUsaUNBQWUsQ0FBQyxlQUFlO2lCQUM3QyxDQUFBO2FBQ0o7aUJBQU07Z0JBQ0gsb0dBQW9HO2dCQUNwRyxNQUFNLFdBQVcsR0FBRyxJQUFJLDZCQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBRW5FLHlDQUF5QztnQkFDekMsTUFBTSxjQUFjLEdBQW1CLE1BQU0sV0FBVyxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFFbkYsNERBQTREO2dCQUM1RCxJQUFJLGNBQWMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxJQUFJLGNBQWMsQ0FBQyxJQUFJO29CQUNsRyxjQUFjLENBQUMsSUFBSSxDQUFDLGtCQUFrQixLQUFLLFNBQVMsSUFBSSxjQUFjLENBQUMsSUFBSSxDQUFDLG9CQUFvQixLQUFLLFNBQVM7b0JBQzlHLGNBQWMsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLFNBQVMsRUFBRTtvQkFDMUMsb0VBQW9FO29CQUNwRSxPQUFPO3dCQUNILElBQUksRUFBRSxjQUFjLENBQUMsSUFBSTtxQkFDNUIsQ0FBQTtpQkFDSjtxQkFBTTtvQkFDSCxNQUFNLFlBQVksR0FBRyxtRUFBbUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDO29CQUMxSCxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO29CQUUxQixzSEFBc0g7b0JBQ3RILE9BQU87d0JBQ0gsU0FBUyxFQUFFLGlDQUFlLENBQUMsZUFBZTt3QkFDMUMsWUFBWSxFQUFFLFlBQVk7cUJBQzdCLENBQUE7aUJBQ0o7YUFDSjtTQUNKO0tBQ0o7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLE1BQU0sWUFBWSxHQUFHLG9DQUFvQyxTQUFTLFVBQVUsR0FBRyxFQUFFLENBQUM7UUFDbEYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUUxQixPQUFPO1lBQ0gsWUFBWSxFQUFFLFlBQVk7WUFDMUIsU0FBUyxFQUFFLGlDQUFlLENBQUMsZUFBZTtTQUM3QyxDQUFDO0tBQ0w7QUFDTCxDQUFDLENBQUE7QUE3RFksUUFBQSxTQUFTLGFBNkRyQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7R2V0T2ZmZXJzSW5wdXQsIE9mZmVyRmlsdGVyLCBPZmZlcnNFcnJvclR5cGUsIE9mZmVyc1Jlc3BvbnNlLCBPbGl2ZUNsaWVudH0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcblxuLyoqXG4gKiBHZXRPZmZlcnMgcmVzb2x2ZXJcbiAqXG4gKiBAcGFyYW0gZmllbGROYW1lIG5hbWUgb2YgdGhlIHJlc29sdmVyIHBhdGggZnJvbSB0aGUgQXBwU3luYyBldmVudFxuICogQHBhcmFtIGdldE9mZmVyc0lucHV0IG9mZmVycyBpbnB1dCB1c2VkIGZvciB0aGUgb2ZmZXJzIG9iamVjdHMgdG8gYmUgcmV0cmlldmVkXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIE9mZmVyc1Jlc3BvbnNlfVxuICovXG5leHBvcnQgY29uc3QgZ2V0T2ZmZXJzID0gYXN5bmMgKGZpZWxkTmFtZTogc3RyaW5nLCBnZXRPZmZlcnNJbnB1dDogR2V0T2ZmZXJzSW5wdXQpOiBQcm9taXNlPE9mZmVyc1Jlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLy8gY2hlY2sgaWYgYSB2YWxpZCBmaWx0ZXIgaXMgcGFzc2VkIGluXG4gICAgICAgIGlmIChnZXRPZmZlcnNJbnB1dC5maWx0ZXJUeXBlICE9PSBPZmZlckZpbHRlci5OZWFyYnkgJiYgZ2V0T2ZmZXJzSW5wdXQuZmlsdGVyVHlwZSAhPT0gT2ZmZXJGaWx0ZXIuT25saW5lKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5zdXBwb3J0ZWQgZmlsdGVyIGZvciBvZmZlcnMgcXVlcnkgZmlsdGVyICR7Z2V0T2ZmZXJzSW5wdXQuZmlsdGVyVHlwZX0uIFVzZSBnZXRGaWRlbGlzUGFydG5lcnMgaW5zdGVhZC5gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE9mZmVyc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGNoZWNrIGlmIHZhbGlkIGluZm9ybWF0aW9uIGlzIHBhc3NlZCBpblxuICAgICAgICAgICAgaWYgKGdldE9mZmVyc0lucHV0LmZpbHRlclR5cGUgPT09IE9mZmVyRmlsdGVyLk5lYXJieVxuICAgICAgICAgICAgICAgICYmICghZ2V0T2ZmZXJzSW5wdXQucmFkaXVzIHx8ICFnZXRPZmZlcnNJbnB1dC5yYWRpdXNMYXRpdHVkZSB8fCAhZ2V0T2ZmZXJzSW5wdXQucmFkaXVzTG9uZ2l0dWRlIHx8IGdldE9mZmVyc0lucHV0LnJhZGl1c0luY2x1ZGVPbmxpbmVTdG9yZXMgPT09IHVuZGVmaW5lZCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgSW52YWxpZCBpbmZvcm1hdGlvbiBwYXNzZWQgaW4gZm9yIG9mZmVycyBxdWVyeSBmaWxlciAke2dldE9mZmVyc0lucHV0LmZpbHRlclR5cGV9LmA7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE9mZmVyc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIGluaXRpYWxpemUgdGhlIE9saXZlIENsaWVudCBBUEkgaGVyZSwgaW4gb3JkZXIgdG8gY2FsbCB0aGUgYXBwcm9wcmlhdGUgZW5kcG9pbnRzIGZvciB0aGlzIGhhbmRsZXJcbiAgICAgICAgICAgICAgICBjb25zdCBvbGl2ZUNsaWVudCA9IG5ldyBPbGl2ZUNsaWVudChwcm9jZXNzLmVudi5FTlZfTkFNRSEsIHJlZ2lvbik7XG5cbiAgICAgICAgICAgICAgICAvLyBleGVjdXRlIHRoZSBHRVQgb2ZmZXJzIE9saXZlIFJFU1QgY2FsbFxuICAgICAgICAgICAgICAgIGNvbnN0IG9mZmVyc1Jlc3BvbnNlOiBPZmZlcnNSZXNwb25zZSA9IGF3YWl0IG9saXZlQ2xpZW50LmdldE9mZmVycyhnZXRPZmZlcnNJbnB1dCk7XG5cbiAgICAgICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIG9mZmVycyBjYWxsIHdhcyBleGVjdXRlZCBzdWNjZXNzZnVsbHlcbiAgICAgICAgICAgICAgICBpZiAob2ZmZXJzUmVzcG9uc2UgJiYgIW9mZmVyc1Jlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhb2ZmZXJzUmVzcG9uc2UuZXJyb3JUeXBlICYmIG9mZmVyc1Jlc3BvbnNlLmRhdGEgICYmXG4gICAgICAgICAgICAgICAgICAgIG9mZmVyc1Jlc3BvbnNlLmRhdGEudG90YWxOdW1iZXJPZlBhZ2VzICE9PSB1bmRlZmluZWQgJiYgb2ZmZXJzUmVzcG9uc2UuZGF0YS50b3RhbE51bWJlck9mUmVjb3JkcyAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAgICAgICAgIG9mZmVyc1Jlc3BvbnNlLmRhdGEub2ZmZXJzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJucyB0aGUgcmVzcG9uc2UgZGF0YSB3aXRoIHRoZSBhcHByb3ByaWF0ZSBvZmZlcnMgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IG9mZmVyc1Jlc3BvbnNlLmRhdGFcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tIHRoZSBnZXQgb2ZmZXJzIGNhbGwgJHtKU09OLnN0cmluZ2lmeShvZmZlcnNSZXNwb25zZSl9IWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgdGhlcmUgYXJlIGVycm9ycyBhc3NvY2lhdGVkIHdpdGggdGhlIGNhbGwsIGp1c3QgcmV0dXJuIHRoZSBlcnJvciBtZXNzYWdlIGFuZCBlcnJvciB0eXBlIGZyb20gdGhlIHVwc3RyZWFtIGNsaWVudFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBPZmZlcnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgJHtmaWVsZE5hbWV9IHF1ZXJ5ICR7ZXJyfWA7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBPZmZlcnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH07XG4gICAgfVxufVxuIl19