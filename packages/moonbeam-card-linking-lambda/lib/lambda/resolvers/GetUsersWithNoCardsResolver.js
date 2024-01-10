"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsersWithNoCards = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
/**
 * GetUsersWithNoCards resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @returns {@link Promise} of {@link IneligibleLinkedUsersResponse}
 */
const getUsersWithNoCards = async (fieldName) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // initializing the DynamoDB document client
        const dynamoDbClient = new client_dynamodb_1.DynamoDBClient({ region: region });
        /**
         * the data to be retrieved from the Query Command
         * the eligible user Items returned from the Query Command, all aggregated together
         * the last evaluated key, to help with the pagination of results
         */
        let eligibleUsersResult = [];
        let exclusiveStartKey, retrievedData;
        do {
            /**
             * retrieve all the eligible linked users, given the global secondary index, as well as the LINKED status to be queried by
             *
             * Limit of 1 MB per paginated response data (in our case 5,700 items). An average size for an Item is about 645 bytes, which means that we won't
             * need to do pagination here, since we actually retrieve all users in a looped format, and we account for
             * paginated responses.
             *
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.Pagination.html}
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html}
             */
            retrievedData = await dynamoDbClient.send(new client_dynamodb_1.QueryCommand({
                TableName: process.env.CARD_LINKING_TABLE,
                IndexName: `${process.env.CARD_LINKING_STATUS_GLOBAL_INDEX}-${process.env.ENV_NAME}-${region}`,
                ...(exclusiveStartKey && { ExclusiveStartKey: exclusiveStartKey }),
                Limit: 1200,
                /**
                 * we're not interested in getting all the data for this call, just the minimum for us to return the necessary information
                 *
                 * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html
                 * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeNames.html
                 */
                ProjectionExpression: '#idf, #mid, #cards',
                ExpressionAttributeNames: {
                    '#idf': 'id',
                    '#cards': 'cards',
                    '#mid': 'memberId',
                    '#st': 'status'
                },
                ExpressionAttributeValues: {
                    ":st": {
                        S: moonbeam_models_1.CardLinkingStatus.Linked
                    }
                },
                KeyConditionExpression: '#st = :st'
            }));
            exclusiveStartKey = retrievedData.LastEvaluatedKey;
            eligibleUsersResult = eligibleUsersResult.concat(retrievedData.Items);
        } while (retrievedData && retrievedData.Count && retrievedData.Items &&
            retrievedData.Items.length && retrievedData.Count !== 0 &&
            retrievedData.Items.length !== 0 && retrievedData.LastEvaluatedKey);
        console.log('here 1');
        /**
         * retrieve the list of all existent users from our Cognito user pool (eligible + ineligible)
         *
         * first, initialize the Moonbeam Client API here, in order to call the appropriate endpoints for this handler
         */
        const moonbeamClient = new moonbeam_models_1.MoonbeamClient(process.env.ENV_NAME, region);
        const usersForNotificationReminderResponse = await moonbeamClient.getAllUsersForNotificationReminders();
        console.log('here 2');
        // check to see if the get all users call was successful or not
        if (usersForNotificationReminderResponse && !usersForNotificationReminderResponse.errorMessage && !usersForNotificationReminderResponse.errorType &&
            usersForNotificationReminderResponse.data && usersForNotificationReminderResponse.data.length !== 0) {
            console.log('here 3');
            // if there are eligible users retrieved, then remove them from the list of all users retrieved (since we only need ineligible users returned)
            if (eligibleUsersResult && eligibleUsersResult.length !== 0) {
                console.log('here 7');
                // build out an array of eligible IDs from the list of DynamoDB records, representing eligible users returned
                console.log(`Found some eligible linked users, needed to get filtered out from the list of all users`);
                const eligibleIds = [];
                eligibleUsersResult.forEach(eligibleUserResult => eligibleIds.push(eligibleUserResult.id.S));
                // filter out and return the eligible users from the list of all users retrieved
                return {
                    data: usersForNotificationReminderResponse.data.filter(user => !eligibleIds.includes(user.id))
                };
            }
            else {
                console.log('here 6');
                // if there are no eligible users found, then we can conclude that all users retrieved are ineligible/have no linked cards
                const errorMessage = `Eligible linked users not found, returning all un-linked/ineligible users instead!`;
                console.log(errorMessage);
                return {
                    data: usersForNotificationReminderResponse.data
                };
            }
        }
        else {
            console.log('here 4');
            const errorMessage = `Retrieving all users through the getAllUsersForNotificationReminders call failed`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.CardLinkErrorType.UnexpectedError
            };
        }
    }
    catch (err) {
        console.log('here 5');
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.CardLinkErrorType.UnexpectedError
        };
    }
};
exports.getUsersWithNoCards = getUsersWithNoCards;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0VXNlcnNXaXRoTm9DYXJkc1Jlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvR2V0VXNlcnNXaXRoTm9DYXJkc1Jlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtEQU1tQztBQUNuQyw4REFBc0Y7QUFFdEY7Ozs7O0dBS0c7QUFDSSxNQUFNLG1CQUFtQixHQUFHLEtBQUssRUFBRSxTQUFpQixFQUEwQyxFQUFFO0lBQ25HLElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsNENBQTRDO1FBQzVDLE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBRTVEOzs7O1dBSUc7UUFDSCxJQUFJLG1CQUFtQixHQUFxQyxFQUFFLENBQUM7UUFDL0QsSUFBSSxpQkFBaUIsRUFBRSxhQUFhLENBQUM7UUFFckMsR0FBRztZQUNDOzs7Ozs7Ozs7ZUFTRztZQUNILGFBQWEsR0FBRyxNQUFNLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSw4QkFBWSxDQUFDO2dCQUN2RCxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBbUI7Z0JBQzFDLFNBQVMsRUFBRSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0NBQWlDLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFTLElBQUksTUFBTSxFQUFFO2dCQUNoRyxHQUFHLENBQUMsaUJBQWlCLElBQUksRUFBQyxpQkFBaUIsRUFBRSxpQkFBaUIsRUFBQyxDQUFDO2dCQUNoRSxLQUFLLEVBQUUsSUFBSTtnQkFDWDs7Ozs7bUJBS0c7Z0JBQ0gsb0JBQW9CLEVBQUUsb0JBQW9CO2dCQUMxQyx3QkFBd0IsRUFBRTtvQkFDdEIsTUFBTSxFQUFFLElBQUk7b0JBQ1osUUFBUSxF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RyxFQUFFO1FBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUV0QixNQUFNLFlBQVksR0FBRyxvQ0FBb0MsU0FBUyxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ2xGLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUIsT0FBTztZQUNILFlBQVksRUFBRSxZQUFZO1lBQzFCLFNBQVMsRUFBRSxtQ0FBaUIsQ0FBQyxlQUFlO1NBQy9DLENBQUM7S0FDTDtBQUNMLENBQUMsQ0FBQTtBQTNIWSxRQUFBLG1CQUFtQix1QkEySC9CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBDYXJkTGlua0Vycm9yVHlwZSxcbiAgICBDYXJkTGlua2luZ1N0YXR1cyxcbiAgICBJbmVsaWdpYmxlTGlua2VkVXNlcnNSZXNwb25zZSxcbiAgICBNb29uYmVhbUNsaWVudCxcbiAgICBVc2VyRm9yTm90aWZpY2F0aW9uUmVtaW5kZXJSZXNwb25zZVxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuaW1wb3J0IHtBdHRyaWJ1dGVWYWx1ZSwgRHluYW1vREJDbGllbnQsIFF1ZXJ5Q29tbWFuZH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1keW5hbW9kYlwiO1xuXG4vKipcbiAqIEdldFVzZXJzV2l0aE5vQ2FyZHMgcmVzb2x2ZXJcbiAqXG4gKiBAcGFyYW0gZmllbGROYW1lIG5hbWUgb2YgdGhlIHJlc29sdmVyIHBhdGggZnJvbSB0aGUgQXBwU3luYyBldmVudFxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBJbmVsaWdpYmxlTGlua2VkVXNlcnNSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGdldFVzZXJzV2l0aE5vQ2FyZHMgPSBhc3luYyAoZmllbGROYW1lOiBzdHJpbmcpOiBQcm9taXNlPEluZWxpZ2libGVMaW5rZWRVc2Vyc1Jlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLy8gaW5pdGlhbGl6aW5nIHRoZSBEeW5hbW9EQiBkb2N1bWVudCBjbGllbnRcbiAgICAgICAgY29uc3QgZHluYW1vRGJDbGllbnQgPSBuZXcgRHluYW1vREJDbGllbnQoe3JlZ2lvbjogcmVnaW9ufSk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIHRoZSBkYXRhIHRvIGJlIHJldHJpZXZlZCBmcm9tIHRoZSBRdWVyeSBDb21tYW5kXG4gICAgICAgICAqIHRoZSBlbGlnaWJsZSB1c2VyIEl0ZW1zIHJldHVybmVkIGZyb20gdGhlIFF1ZXJ5IENvbW1hbmQsIGFsbCBhZ2dyZWdhdGVkIHRvZ2V0aGVyXG4gICAgICAgICAqIHRoZSBsYXN0IGV2YWx1YXRlZCBrZXksIHRvIGhlbHAgd2l0aCB0aGUgcGFnaW5hdGlvbiBvZiByZXN1bHRzXG4gICAgICAgICAqL1xuICAgICAgICBsZXQgZWxpZ2libGVVc2Vyc1Jlc3VsdDogUmVjb3JkPHN0cmluZywgQXR0cmlidXRlVmFsdWU+W10gPSBbXTtcbiAgICAgICAgbGV0IGV4Y2x1c2l2ZVN0YXJ0S2V5LCByZXRyaWV2ZWREYXRhO1xuXG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogcmV0cmlldmUgYWxsIHRoZSBlbGlnaWJsZSBsaW5rZWQgdXNlcnMsIGdpdmVuIHRoZSBnbG9iYWwgc2Vjb25kYXJ5IGluZGV4LCBhcyB3ZWxsIGFzIHRoZSBMSU5LRUQgc3RhdHVzIHRvIGJlIHF1ZXJpZWQgYnlcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBMaW1pdCBvZiAxIE1CIHBlciBwYWdpbmF0ZWQgcmVzcG9uc2UgZGF0YSAoaW4gb3VyIGNhc2UgNSw3MDAgaXRlbXMpLiBBbiBhdmVyYWdlIHNpemUgZm9yIGFuIEl0ZW0gaXMgYWJvdXQgNjQ1IGJ5dGVzLCB3aGljaCBtZWFucyB0aGF0IHdlIHdvbid0XG4gICAgICAgICAgICAgKiBuZWVkIHRvIGRvIHBhZ2luYXRpb24gaGVyZSwgc2luY2Ugd2UgYWN0dWFsbHkgcmV0cmlldmUgYWxsIHVzZXJzIGluIGEgbG9vcGVkIGZvcm1hdCwgYW5kIHdlIGFjY291bnQgZm9yXG4gICAgICAgICAgICAgKiBwYWdpbmF0ZWQgcmVzcG9uc2VzLlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIEBsaW5rIHtodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL1F1ZXJ5LlBhZ2luYXRpb24uaHRtbH1cbiAgICAgICAgICAgICAqIEBsaW5rIHtodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL1F1ZXJ5Lmh0bWx9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHJldHJpZXZlZERhdGEgPSBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBRdWVyeUNvbW1hbmQoe1xuICAgICAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuQ0FSRF9MSU5LSU5HX1RBQkxFISxcbiAgICAgICAgICAgICAgICBJbmRleE5hbWU6IGAke3Byb2Nlc3MuZW52LkNBUkRfTElOS0lOR19TVEFUVVNfR0xPQkFMX0lOREVYIX0tJHtwcm9jZXNzLmVudi5FTlZfTkFNRSF9LSR7cmVnaW9ufWAsXG4gICAgICAgICAgICAgICAgLi4uKGV4Y2x1c2l2ZVN0YXJ0S2V5ICYmIHtFeGNsdXNpdmVTdGFydEtleTogZXhjbHVzaXZlU3RhcnRLZXl9KSxcbiAgICAgICAgICAgICAgICBMaW1pdDogMTIwMCwgLy8gMSwyMDAgKiA2NDUgYnl0ZXMgPSA3NzQsMDAwIGJ5dGVzID0gMC43NzQgTUIgKGxlYXZlIGEgbWFyZ2luIG9mIGVycm9yIGhlcmUgdXAgdG8gMSBNQilcbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiB3ZSdyZSBub3QgaW50ZXJlc3RlZCBpbiBnZXR0aW5nIGFsbCB0aGUgZGF0YSBmb3IgdGhpcyBjYWxsLCBqdXN0IHRoZSBtaW5pbXVtIGZvciB1cyB0byByZXR1cm4gdGhlIG5lY2Vzc2FyeSBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2FtYXpvbmR5bmFtb2RiL2xhdGVzdC9kZXZlbG9wZXJndWlkZS9SZXNlcnZlZFdvcmRzLmh0bWxcbiAgICAgICAgICAgICAgICAgKiBAbGluayBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL0V4cHJlc3Npb25zLkV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lcy5odG1sXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgUHJvamVjdGlvbkV4cHJlc3Npb246ICcjaWRmLCAjbWlkLCAjY2FyZHMnLFxuICAgICAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lczoge1xuICAgICAgICAgICAgICAgICAgICAnI2lkZic6ICdpZCcsXG4gICAgICAgICAgICAgICAgICAgICcjY2FyZHMnOiAnY2FyZHMnLFxuICAgICAgICAgICAgICAgICAgICAnI21pZCc6ICdtZW1iZXJJZCcsXG4gICAgICAgICAgICAgICAgICAgICcjc3QnOiAnc3RhdHVzJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlczoge1xuICAgICAgICAgICAgICAgICAgICBcIjpzdFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiBDYXJkTGlua2luZ1N0YXR1cy5MaW5rZWRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgS2V5Q29uZGl0aW9uRXhwcmVzc2lvbjogJyNzdCA9IDpzdCdcbiAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgZXhjbHVzaXZlU3RhcnRLZXkgPSByZXRyaWV2ZWREYXRhLkxhc3RFdmFsdWF0ZWRLZXk7XG4gICAgICAgICAgICBlbGlnaWJsZVVzZXJzUmVzdWx0ID0gZWxpZ2libGVVc2Vyc1Jlc3VsdC5jb25jYXQocmV0cmlldmVkRGF0YS5JdGVtcyk7XG4gICAgICAgIH0gd2hpbGUgKHJldHJpZXZlZERhdGEgJiYgcmV0cmlldmVkRGF0YS5Db3VudCAmJiByZXRyaWV2ZWREYXRhLkl0ZW1zICYmXG4gICAgICAgIHJldHJpZXZlZERhdGEuSXRlbXMubGVuZ3RoICYmIHJldHJpZXZlZERhdGEuQ291bnQgIT09IDAgJiZcbiAgICAgICAgcmV0cmlldmVkRGF0YS5JdGVtcy5sZW5ndGggIT09IDAgJiYgcmV0cmlldmVkRGF0YS5MYXN0RXZhbHVhdGVkS2V5KTtcblxuICAgICAgICBjb25zb2xlLmxvZygnaGVyZSAxJyk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIHJldHJpZXZlIHRoZSBsaXN0IG9mIGFsbCBleGlzdGVudCB1c2VycyBmcm9tIG91ciBDb2duaXRvIHVzZXIgcG9vbCAoZWxpZ2libGUgKyBpbmVsaWdpYmxlKVxuICAgICAgICAgKlxuICAgICAgICAgKiBmaXJzdCwgaW5pdGlhbGl6ZSB0aGUgTW9vbmJlYW0gQ2xpZW50IEFQSSBoZXJlLCBpbiBvcmRlciB0byBjYWxsIHRoZSBhcHByb3ByaWF0ZSBlbmRwb2ludHMgZm9yIHRoaXMgaGFuZGxlclxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgbW9vbmJlYW1DbGllbnQgPSBuZXcgTW9vbmJlYW1DbGllbnQocHJvY2Vzcy5lbnYuRU5WX05BTUUhLCByZWdpb24pO1xuICAgICAgICBjb25zdCB1c2Vyc0Zvck5vdGlmaWNhdGlvblJlbWluZGVyUmVzcG9uc2U6IFVzZXJGb3JOb3RpZmljYXRpb25SZW1pbmRlclJlc3BvbnNlID0gYXdhaXQgbW9vbmJlYW1DbGllbnQuZ2V0QWxsVXNlcnNGb3JOb3RpZmljYXRpb25SZW1pbmRlcnMoKTtcblxuICAgICAgICBjb25zb2xlLmxvZygnaGVyZSAyJyk7XG5cbiAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBnZXQgYWxsIHVzZXJzIGNhbGwgd2FzIHN1Y2Nlc3NmdWwgb3Igbm90XG4gICAgICAgIGlmICh1c2Vyc0Zvck5vdGlmaWNhdGlvblJlbWluZGVyUmVzcG9uc2UgJiYgIXVzZXJzRm9yTm90aWZpY2F0aW9uUmVtaW5kZXJSZXNwb25zZS5lcnJvck1lc3NhZ2UgJiYgIXVzZXJzRm9yTm90aWZpY2F0aW9uUmVtaW5kZXJSZXNwb25zZS5lcnJvclR5cGUgJiZcbiAgICAgICAgICAgIHVzZXJzRm9yTm90aWZpY2F0aW9uUmVtaW5kZXJSZXNwb25zZS5kYXRhICYmIHVzZXJzRm9yTm90aWZpY2F0aW9uUmVtaW5kZXJSZXNwb25zZS5kYXRhLmxlbmd0aCAhPT0gMCkge1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnaGVyZSAzJyk7XG5cbiAgICAgICAgICAgIC8vIGlmIHRoZXJlIGFyZSBlbGlnaWJsZSB1c2VycyByZXRyaWV2ZWQsIHRoZW4gcmVtb3ZlIHRoZW0gZnJvbSB0aGUgbGlzdCBvZiBhbGwgdXNlcnMgcmV0cmlldmVkIChzaW5jZSB3ZSBvbmx5IG5lZWQgaW5lbGlnaWJsZSB1c2VycyByZXR1cm5lZClcbiAgICAgICAgICAgIGlmIChlbGlnaWJsZVVzZXJzUmVzdWx0ICYmIGVsaWdpYmxlVXNlcnNSZXN1bHQubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2hlcmUgNycpO1xuXG4gICAgICAgICAgICAgICAgLy8gYnVpbGQgb3V0IGFuIGFycmF5IG9mIGVsaWdpYmxlIElEcyBmcm9tIHRoZSBsaXN0IG9mIER5bmFtb0RCIHJlY29yZHMsIHJlcHJlc2VudGluZyBlbGlnaWJsZSB1c2VycyByZXR1cm5lZFxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBGb3VuZCBzb21lIGVsaWdpYmxlIGxpbmtlZCB1c2VycywgbmVlZGVkIHRvIGdldCBmaWx0ZXJlZCBvdXQgZnJvbSB0aGUgbGlzdCBvZiBhbGwgdXNlcnNgKTtcbiAgICAgICAgICAgICAgICBjb25zdCBlbGlnaWJsZUlkczogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICAgICAgICBlbGlnaWJsZVVzZXJzUmVzdWx0LmZvckVhY2goZWxpZ2libGVVc2VyUmVzdWx0ID0+IGVsaWdpYmxlSWRzLnB1c2goZWxpZ2libGVVc2VyUmVzdWx0LmlkLlMhKSk7XG5cbiAgICAgICAgICAgICAgICAvLyBmaWx0ZXIgb3V0IGFuZCByZXR1cm4gdGhlIGVsaWdpYmxlIHVzZXJzIGZyb20gdGhlIGxpc3Qgb2YgYWxsIHVzZXJzIHJldHJpZXZlZFxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHVzZXJzRm9yTm90aWZpY2F0aW9uUmVtaW5kZXJSZXNwb25zZS5kYXRhLmZpbHRlcih1c2VyID0+ICFlbGlnaWJsZUlkcy5pbmNsdWRlcyh1c2VyIS5pZCkpXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2hlcmUgNicpO1xuXG4gICAgICAgICAgICAgICAgLy8gaWYgdGhlcmUgYXJlIG5vIGVsaWdpYmxlIHVzZXJzIGZvdW5kLCB0aGVuIHdlIGNhbiBjb25jbHVkZSB0aGF0IGFsbCB1c2VycyByZXRyaWV2ZWQgYXJlIGluZWxpZ2libGUvaGF2ZSBubyBsaW5rZWQgY2FyZHNcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgRWxpZ2libGUgbGlua2VkIHVzZXJzIG5vdCBmb3VuZCwgcmV0dXJuaW5nIGFsbCB1bi1saW5rZWQvaW5lbGlnaWJsZSB1c2VycyBpbnN0ZWFkIWA7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHVzZXJzRm9yTm90aWZpY2F0aW9uUmVtaW5kZXJSZXNwb25zZS5kYXRhXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnaGVyZSA0Jyk7XG5cbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBSZXRyaWV2aW5nIGFsbCB1c2VycyB0aHJvdWdoIHRoZSBnZXRBbGxVc2Vyc0Zvck5vdGlmaWNhdGlvblJlbWluZGVycyBjYWxsIGZhaWxlZGA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2hlcmUgNScpO1xuXG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyAke2ZpZWxkTmFtZX0gcXVlcnkgJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfTtcbiAgICB9XG59XG4iXX0=