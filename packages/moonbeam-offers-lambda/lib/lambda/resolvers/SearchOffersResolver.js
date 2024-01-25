"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchOffers = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * SearchOffers resolver - used for searching offers, based
 * on a specific input
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param searchOffersInput offers input used for the offers objects to be searched
 * and returned
 *
 * @returns {@link Promise} of {@link OffersResponse}
 */
const searchOffers = async (fieldName, searchOffersInput) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // check if a valid filter is passed in
        if ((searchOffersInput.radiusLongitude !== undefined && searchOffersInput.radiusLongitude !== null &&
            (searchOffersInput.radius === undefined || searchOffersInput.radiusLatitude === undefined)) ||
            (searchOffersInput.radiusLatitude !== undefined && searchOffersInput.radiusLatitude !== null &&
                (searchOffersInput.radius === undefined || searchOffersInput.radiusLongitude === undefined)) ||
            (searchOffersInput.radius !== undefined && searchOffersInput.radius !== null &&
                (searchOffersInput.radiusLatitude === undefined || searchOffersInput.radiusLongitude === undefined))) {
            const errorMessage = `Invalid radiusLongitude, radiusLatitude and radius input combination. Be sure to pass all three.`;
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
            const searchOffersResponse = await oliveClient.searchOffers(searchOffersInput);
            // check to see if the offers call was executed successfully
            if (searchOffersResponse && !searchOffersResponse.errorMessage && !searchOffersResponse.errorType && searchOffersResponse.data &&
                searchOffersResponse.data.totalNumberOfPages !== undefined && searchOffersResponse.data.totalNumberOfRecords !== undefined &&
                searchOffersResponse.data.offers !== undefined) {
                /**
                 * Todo: Remove this once the front-end is changed. Olive changed the type of the reward type for their enum so we're going to patch
                 * this so we match with whatever we had this on the front-end before they made this breaking change.
                 */
                searchOffersResponse.data.offers.forEach(retrievedOffer => {
                    if (retrievedOffer !== undefined && retrievedOffer !== null &&
                        retrievedOffer.reward !== undefined && retrievedOffer.reward !== null &&
                        retrievedOffer.reward.type !== undefined && retrievedOffer.reward.type !== null) {
                        /**
                         * switch Fixed to RewardAmount and
                         * switch Percentage to RewardPercentage
                         */
                        if (retrievedOffer.reward.type === moonbeam_models_1.RewardType.Percentage) {
                            retrievedOffer.reward.type = moonbeam_models_1.RewardType.RewardPercent;
                        }
                        if (retrievedOffer.reward.type === moonbeam_models_1.RewardType.Fixed) {
                            retrievedOffer.reward.type = moonbeam_models_1.RewardType.RewardAmount;
                        }
                    }
                });
                // returns the response data with the appropriate offers information
                return {
                    data: searchOffersResponse.data
                };
            }
            else {
                const errorMessage = `Unexpected response structure returned from the search offers call ${JSON.stringify(searchOffersResponse)}!`;
                console.log(errorMessage);
                // if there are errors associated with the call, just return the error message and error type from the upstream client
                return {
                    errorType: moonbeam_models_1.OffersErrorType.ValidationError,
                    errorMessage: errorMessage
                };
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
exports.searchOffers = searchOffers;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VhcmNoT2ZmZXJzUmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL3Jlc29sdmVycy9TZWFyY2hPZmZlcnNSZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrREFBc0g7QUFFdEg7Ozs7Ozs7OztHQVNHO0FBQ0ksTUFBTSxZQUFZLEdBQUcsS0FBSyxFQUFFLFNBQWlCLEVBQUUsaUJBQW9DLEVBQTJCLEVBQUU7SUFDbkgsSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qyx1Q0FBdUM7UUFDdkMsSUFDSSxDQUFDLGlCQUFpQixDQUFDLGVBQWUsS0FBSyxTQUFTLElBQUksaUJBQWlCLENBQUMsZUFBZSxLQUFLLElBQUk7WUFDMUYsQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEtBQUssU0FBUyxJQUFJLGlCQUFpQixDQUFDLGNBQWMsS0FBSyxTQUFTLENBQUMsQ0FDN0Y7WUFDRCxDQUFDLGlCQUFpQixDQUFDLGNBQWMsS0FBSyxTQUFTLElBQUksaUJBQWlCLENBQUMsY0FBYyxLQUFLLElBQUk7Z0JBQ3hGLENBQUMsaUJBQWlCLENBQUMsTUFBTSxLQUFLLFNBQVMsSUFBSSxpQkFBaUIsQ0FBQyxlQUFlLEtBQUssU0FBUyxDQUFDLENBQzlGO1lBQ0QsQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEtBQUssU0FBUyxJQUFJLGlCQUFpQixDQUFDLE1BQU0sS0FBSyxJQUFJO2dCQUN4RSxDQUFDLGlCQUFpQixDQUFDLGNBQWMsS0FBSyxTQUFTLElBQUksaUJBQWlCLENBQUMsZUFBZSxLQUFLLFNBQVMsQ0FBQyxDQUN0RyxFQUNIO1lBQ0UsTUFBTSxZQUFZLEdBQUcsa0dBQWtHLENBQUM7WUFDeEgsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUUxQixPQUFPO2dCQUNILFlBQVksRUFBRSxZQUFZO2dCQUMxQixTQUFTLEVBQUUsaUNBQWUsQ0FBQyxlQUFlO2FBQzdDLENBQUE7U0FDSjthQUFNO1lBQ0gsb0dBQW9HO1lBQ3BHLE1BQU0sV0FBVyxHQUFHLElBQUksNkJBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUVuRSx5Q0FBeUM7WUFDekMsTUFBTSxvQkFBb0IsR0FBbUIsTUFBTSxXQUFXLENBQUMsWUFBWSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFFL0YsNERBQTREO1lBQzVELElBQUksb0JBQW9CLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxZQUFZLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLElBQUksb0JBQW9CLENBQUMsSUFBSTtnQkFDMUgsb0JBQW9CLENBQUMsSUFBSSxDQUFDLGtCQUFrQixLQUFLLFNBQVMsSUFBSSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEtBQUssU0FBUztnQkFDMUgsb0JBQW9CLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxTQUFTLEVBQUU7Z0JBRWhEOzs7bUJBR0c7Z0JBQ0gsb0JBQW9CLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLEVBQUU7b0JBQ3RELElBQUksY0FBYyxLQUFLLFNBQVMsSUFBSSxjQUFjLEtBQUssSUFBSTt3QkFDdkQsY0FBYyxDQUFDLE1BQU0sS0FBSyxTQUFTLElBQUksY0FBYyxDQUFDLE1BQU0sS0FBSyxJQUFJO3dCQUNyRSxjQUFjLENBQUMsTUFBTyxDQUFDLElBQUksS0FBSyxTQUFTLElBQUksY0FBYyxDQUFDLE1BQU8sQ0FBQyxJQUFJLEtBQUssSUFBSSxFQUFFO3dCQUNuRjs7OzJCQUdHO3dCQUNILElBQUksY0FBYyxDQUFDLE1BQU8sQ0FBQyxJQUFLLEtBQUssNEJBQVUsQ0FBQyxVQUFVLEVBQUU7NEJBQ3hELGNBQWMsQ0FBQyxNQUFPLENBQUMsSUFBSyxHQUFHLDRCQUFVLENBQUMsYUFBYSxDQUFDO3lCQUMzRDt3QkFDRCxJQUFJLGNBQWMsQ0FBQyxNQUFPLENBQUMsSUFBSyxLQUFLLDRCQUFVLENBQUMsS0FBSyxFQUFFOzRCQUNuRCxjQUFjLENBQUMsTUFBTyxDQUFDLElBQUssR0FBRyw0QkFBVSxDQUFDLFlBQVksQ0FBQzt5QkFDMUQ7cUJBQ0o7Z0JBQ0wsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsb0VBQW9FO2dCQUNwRSxPQUFPO29CQUNILElBQUksRUFBRSxvQkFBb0IsQ0FBQyxJQUFJO2lCQUNsQyxDQUFBO2FBQ0o7aUJBQU07Z0JBQ0gsTUFBTSxZQUFZLEdBQUcsc0VBQXNFLElBQUksQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDO2dCQUNuSSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUUxQixzSEFBc0g7Z0JBQ3RILE9BQU87b0JBQ0gsU0FBUyxFQUFFLGlDQUFlLENBQUMsZUFBZTtvQkFDMUMsWUFBWSxFQUFFLFlBQVk7aUJBQzdCLENBQUE7YUFDSjtTQUNKO0tBQ0o7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLE1BQU0sWUFBWSxHQUFHLG9DQUFvQyxTQUFTLFVBQVUsR0FBRyxFQUFFLENBQUM7UUFDbEYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUUxQixPQUFPO1lBQ0gsWUFBWSxFQUFFLFlBQVk7WUFDMUIsU0FBUyxFQUFFLGlDQUFlLENBQUMsZUFBZTtTQUM3QyxDQUFDO0tBQ0w7QUFDTCxDQUFDLENBQUE7QUFqRlksUUFBQSxZQUFZLGdCQWlGeEIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge09mZmVyc0Vycm9yVHlwZSwgT2ZmZXJzUmVzcG9uc2UsIE9saXZlQ2xpZW50LCBSZXdhcmRUeXBlLCBTZWFyY2hPZmZlcnNJbnB1dH0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcblxuLyoqXG4gKiBTZWFyY2hPZmZlcnMgcmVzb2x2ZXIgLSB1c2VkIGZvciBzZWFyY2hpbmcgb2ZmZXJzLCBiYXNlZFxuICogb24gYSBzcGVjaWZpYyBpbnB1dFxuICpcbiAqIEBwYXJhbSBmaWVsZE5hbWUgbmFtZSBvZiB0aGUgcmVzb2x2ZXIgcGF0aCBmcm9tIHRoZSBBcHBTeW5jIGV2ZW50XG4gKiBAcGFyYW0gc2VhcmNoT2ZmZXJzSW5wdXQgb2ZmZXJzIGlucHV0IHVzZWQgZm9yIHRoZSBvZmZlcnMgb2JqZWN0cyB0byBiZSBzZWFyY2hlZFxuICogYW5kIHJldHVybmVkXG4gKlxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBPZmZlcnNSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IHNlYXJjaE9mZmVycyA9IGFzeW5jIChmaWVsZE5hbWU6IHN0cmluZywgc2VhcmNoT2ZmZXJzSW5wdXQ6IFNlYXJjaE9mZmVyc0lucHV0KTogUHJvbWlzZTxPZmZlcnNSZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIGNoZWNrIGlmIGEgdmFsaWQgZmlsdGVyIGlzIHBhc3NlZCBpblxuICAgICAgICBpZiAoXG4gICAgICAgICAgICAoc2VhcmNoT2ZmZXJzSW5wdXQucmFkaXVzTG9uZ2l0dWRlICE9PSB1bmRlZmluZWQgJiYgc2VhcmNoT2ZmZXJzSW5wdXQucmFkaXVzTG9uZ2l0dWRlICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgKHNlYXJjaE9mZmVyc0lucHV0LnJhZGl1cyA9PT0gdW5kZWZpbmVkIHx8IHNlYXJjaE9mZmVyc0lucHV0LnJhZGl1c0xhdGl0dWRlID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICApIHx8XG4gICAgICAgICAgICAoc2VhcmNoT2ZmZXJzSW5wdXQucmFkaXVzTGF0aXR1ZGUgIT09IHVuZGVmaW5lZCAmJiBzZWFyY2hPZmZlcnNJbnB1dC5yYWRpdXNMYXRpdHVkZSAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgIChzZWFyY2hPZmZlcnNJbnB1dC5yYWRpdXMgPT09IHVuZGVmaW5lZCB8fCBzZWFyY2hPZmZlcnNJbnB1dC5yYWRpdXNMb25naXR1ZGUgPT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICkgfHxcbiAgICAgICAgICAgIChzZWFyY2hPZmZlcnNJbnB1dC5yYWRpdXMgIT09IHVuZGVmaW5lZCAmJiBzZWFyY2hPZmZlcnNJbnB1dC5yYWRpdXMgIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICAoc2VhcmNoT2ZmZXJzSW5wdXQucmFkaXVzTGF0aXR1ZGUgPT09IHVuZGVmaW5lZCB8fCBzZWFyY2hPZmZlcnNJbnB1dC5yYWRpdXNMb25naXR1ZGUgPT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgIClcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgSW52YWxpZCByYWRpdXNMb25naXR1ZGUsIHJhZGl1c0xhdGl0dWRlIGFuZCByYWRpdXMgaW5wdXQgY29tYmluYXRpb24uIEJlIHN1cmUgdG8gcGFzcyBhbGwgdGhyZWUuYDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBPZmZlcnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBpbml0aWFsaXplIHRoZSBPbGl2ZSBDbGllbnQgQVBJIGhlcmUsIGluIG9yZGVyIHRvIGNhbGwgdGhlIGFwcHJvcHJpYXRlIGVuZHBvaW50cyBmb3IgdGhpcyBoYW5kbGVyXG4gICAgICAgICAgICBjb25zdCBvbGl2ZUNsaWVudCA9IG5ldyBPbGl2ZUNsaWVudChwcm9jZXNzLmVudi5FTlZfTkFNRSEsIHJlZ2lvbik7XG5cbiAgICAgICAgICAgIC8vIGV4ZWN1dGUgdGhlIEdFVCBvZmZlcnMgT2xpdmUgUkVTVCBjYWxsXG4gICAgICAgICAgICBjb25zdCBzZWFyY2hPZmZlcnNSZXNwb25zZTogT2ZmZXJzUmVzcG9uc2UgPSBhd2FpdCBvbGl2ZUNsaWVudC5zZWFyY2hPZmZlcnMoc2VhcmNoT2ZmZXJzSW5wdXQpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIG9mZmVycyBjYWxsIHdhcyBleGVjdXRlZCBzdWNjZXNzZnVsbHlcbiAgICAgICAgICAgIGlmIChzZWFyY2hPZmZlcnNSZXNwb25zZSAmJiAhc2VhcmNoT2ZmZXJzUmVzcG9uc2UuZXJyb3JNZXNzYWdlICYmICFzZWFyY2hPZmZlcnNSZXNwb25zZS5lcnJvclR5cGUgJiYgc2VhcmNoT2ZmZXJzUmVzcG9uc2UuZGF0YSAmJlxuICAgICAgICAgICAgICAgIHNlYXJjaE9mZmVyc1Jlc3BvbnNlLmRhdGEudG90YWxOdW1iZXJPZlBhZ2VzICE9PSB1bmRlZmluZWQgJiYgc2VhcmNoT2ZmZXJzUmVzcG9uc2UuZGF0YS50b3RhbE51bWJlck9mUmVjb3JkcyAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAgICAgc2VhcmNoT2ZmZXJzUmVzcG9uc2UuZGF0YS5vZmZlcnMgIT09IHVuZGVmaW5lZCkge1xuXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogVG9kbzogUmVtb3ZlIHRoaXMgb25jZSB0aGUgZnJvbnQtZW5kIGlzIGNoYW5nZWQuIE9saXZlIGNoYW5nZWQgdGhlIHR5cGUgb2YgdGhlIHJld2FyZCB0eXBlIGZvciB0aGVpciBlbnVtIHNvIHdlJ3JlIGdvaW5nIHRvIHBhdGNoXG4gICAgICAgICAgICAgICAgICogdGhpcyBzbyB3ZSBtYXRjaCB3aXRoIHdoYXRldmVyIHdlIGhhZCB0aGlzIG9uIHRoZSBmcm9udC1lbmQgYmVmb3JlIHRoZXkgbWFkZSB0aGlzIGJyZWFraW5nIGNoYW5nZS5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBzZWFyY2hPZmZlcnNSZXNwb25zZS5kYXRhLm9mZmVycy5mb3JFYWNoKHJldHJpZXZlZE9mZmVyID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJldHJpZXZlZE9mZmVyICE9PSB1bmRlZmluZWQgJiYgcmV0cmlldmVkT2ZmZXIgIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHJpZXZlZE9mZmVyLnJld2FyZCAhPT0gdW5kZWZpbmVkICYmIHJldHJpZXZlZE9mZmVyLnJld2FyZCAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0cmlldmVkT2ZmZXIucmV3YXJkIS50eXBlICE9PSB1bmRlZmluZWQgJiYgcmV0cmlldmVkT2ZmZXIucmV3YXJkIS50eXBlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIHN3aXRjaCBGaXhlZCB0byBSZXdhcmRBbW91bnQgYW5kXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBzd2l0Y2ggUGVyY2VudGFnZSB0byBSZXdhcmRQZXJjZW50YWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXRyaWV2ZWRPZmZlci5yZXdhcmQhLnR5cGUhID09PSBSZXdhcmRUeXBlLlBlcmNlbnRhZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXRyaWV2ZWRPZmZlci5yZXdhcmQhLnR5cGUhID0gUmV3YXJkVHlwZS5SZXdhcmRQZXJjZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJldHJpZXZlZE9mZmVyLnJld2FyZCEudHlwZSEgPT09IFJld2FyZFR5cGUuRml4ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXRyaWV2ZWRPZmZlci5yZXdhcmQhLnR5cGUhID0gUmV3YXJkVHlwZS5SZXdhcmRBbW91bnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIHJldHVybnMgdGhlIHJlc3BvbnNlIGRhdGEgd2l0aCB0aGUgYXBwcm9wcmlhdGUgb2ZmZXJzIGluZm9ybWF0aW9uXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogc2VhcmNoT2ZmZXJzUmVzcG9uc2UuZGF0YVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gdGhlIHNlYXJjaCBvZmZlcnMgY2FsbCAke0pTT04uc3RyaW5naWZ5KHNlYXJjaE9mZmVyc1Jlc3BvbnNlKX0hYDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgLy8gaWYgdGhlcmUgYXJlIGVycm9ycyBhc3NvY2lhdGVkIHdpdGggdGhlIGNhbGwsIGp1c3QgcmV0dXJuIHRoZSBlcnJvciBtZXNzYWdlIGFuZCBlcnJvciB0eXBlIGZyb20gdGhlIHVwc3RyZWFtIGNsaWVudFxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogT2ZmZXJzRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvcixcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nICR7ZmllbGROYW1lfSBxdWVyeSAke2Vycn1gO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIGVycm9yVHlwZTogT2ZmZXJzRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICB9O1xuICAgIH1cbn1cbiJdfQ==