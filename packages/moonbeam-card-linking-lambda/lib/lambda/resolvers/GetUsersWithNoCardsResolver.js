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
             * Limit of 1 MB per paginated response data (in our case 5,700 items). An average size for an Item is about 133 bytes, which means that we won't
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
                Limit: 5700,
                /**
                 * we're not interested in getting all the data for this call, just the minimum for us to return the necessary information
                 *
                 * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html
                 * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeNames.html
                 */
                ProjectionExpression: '#idf, #mid, #card' + '[0].id',
                ExpressionAttributeNames: {
                    '#idf': 'id',
                    '#card': 'cards',
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
        /**
         * retrieve the list of all existent users from our Cognito user pool (eligible + ineligible)
         *
         * first, initialize the Moonbeam Client API here, in order to call the appropriate endpoints for this handler
         */
        const moonbeamClient = new moonbeam_models_1.MoonbeamClient(process.env.ENV_NAME, region);
        const usersForNotificationReminderResponse = await moonbeamClient.getAllUsersForNotificationReminders();
        // check to see if the get all users call was successful or not
        if (usersForNotificationReminderResponse && !usersForNotificationReminderResponse.errorMessage && !usersForNotificationReminderResponse.errorType &&
            usersForNotificationReminderResponse.data && usersForNotificationReminderResponse.data.length !== 0) {
            // if there are eligible users retrieved, then remove them from the list of all users retrieved (since we only need ineligible users returned)
            if (eligibleUsersResult && eligibleUsersResult.length !== 0) {
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
                // if there are no eligible users found, then we can conclude that all users retrieved are ineligible/have no linked cards
                const errorMessage = `Eligible linked users not found, returning all un-linked/ineligible users instead!`;
                console.log(errorMessage);
                return {
                    data: usersForNotificationReminderResponse.data
                };
            }
        }
        else {
            const errorMessage = `Retrieving all users through the getAllUsersForNotificationReminders call failed`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.CardLinkErrorType.UnexpectedError
            };
        }
    }
    catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.CardLinkErrorType.UnexpectedError
        };
    }
};
exports.getUsersWithNoCards = getUsersWithNoCards;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0VXNlcnNXaXRoTm9DYXJkc1Jlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvR2V0VXNlcnNXaXRoTm9DYXJkc1Jlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtEQU1tQztBQUNuQyw4REFBc0Y7QUFFdEY7Ozs7O0dBS0c7QUFDSSxNQUFNLG1CQUFtQixHQUFHLEtBQUssRUFBRSxTQUFpQixFQUEwQyxFQUFFO0lBQ25HLElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsNENBQTRDO1FBQzVDLE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBRTVEOzs7O1dBSUc7UUFDSCxJQUFJLG1CQUFtQixHQUFxQyxFQUFFLENBQUM7UUFDL0QsSUFBSSxpQkFBaUIsRUFBRSxhQUFhLENBQUM7UUFFckMsR0FBRztZQUNDOzs7Ozs7Ozs7ZUFTRztZQUNILGFBQWEsR0FBRyxNQUFNLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSw4QkFBWSxDQUFDO2dCQUN2RCxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBbUI7Z0JBQzFDLFNBQVMsRUFBRSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0NBQWlDLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFTLElBQUksTUFBTSxFQUFFO2dCQUNoRyxHQUFHLENBQUMsaUJBQWlCLElBQUksRUFBQyxpQkFBaUIsRUFBRSxpQkFBaUIsRUFBQyxDQUFDO2dCQUNoRSxLQUFLLEVBQUUsSUFBSTtnQkFDWDs7Ozs7bUJBS0c7Z0JBQ0gsb0JBQW9CLEVBQUUsbUJBQW1CLEdBQUcsUUFBUTtnQkFDcEQsd0JBQXdCLEVBQUU7b0JBQ3RCLE1BQU0sRUFBRSxJQUFJO29C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OlsiaW1wb3J0IHtcbiAgICBDYXJkTGlua0Vycm9yVHlwZSxcbiAgICBDYXJkTGlua2luZ1N0YXR1cyxcbiAgICBJbmVsaWdpYmxlTGlua2VkVXNlcnNSZXNwb25zZSxcbiAgICBNb29uYmVhbUNsaWVudCxcbiAgICBVc2VyRm9yTm90aWZpY2F0aW9uUmVtaW5kZXJSZXNwb25zZVxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuaW1wb3J0IHtBdHRyaWJ1dGVWYWx1ZSwgRHluYW1vREJDbGllbnQsIFF1ZXJ5Q29tbWFuZH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1keW5hbW9kYlwiO1xuXG4vKipcbiAqIEdldFVzZXJzV2l0aE5vQ2FyZHMgcmVzb2x2ZXJcbiAqXG4gKiBAcGFyYW0gZmllbGROYW1lIG5hbWUgb2YgdGhlIHJlc29sdmVyIHBhdGggZnJvbSB0aGUgQXBwU3luYyBldmVudFxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBJbmVsaWdpYmxlTGlua2VkVXNlcnNSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGdldFVzZXJzV2l0aE5vQ2FyZHMgPSBhc3luYyAoZmllbGROYW1lOiBzdHJpbmcpOiBQcm9taXNlPEluZWxpZ2libGVMaW5rZWRVc2Vyc1Jlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLy8gaW5pdGlhbGl6aW5nIHRoZSBEeW5hbW9EQiBkb2N1bWVudCBjbGllbnRcbiAgICAgICAgY29uc3QgZHluYW1vRGJDbGllbnQgPSBuZXcgRHluYW1vREJDbGllbnQoe3JlZ2lvbjogcmVnaW9ufSk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIHRoZSBkYXRhIHRvIGJlIHJldHJpZXZlZCBmcm9tIHRoZSBRdWVyeSBDb21tYW5kXG4gICAgICAgICAqIHRoZSBlbGlnaWJsZSB1c2VyIEl0ZW1zIHJldHVybmVkIGZyb20gdGhlIFF1ZXJ5IENvbW1hbmQsIGFsbCBhZ2dyZWdhdGVkIHRvZ2V0aGVyXG4gICAgICAgICAqIHRoZSBsYXN0IGV2YWx1YXRlZCBrZXksIHRvIGhlbHAgd2l0aCB0aGUgcGFnaW5hdGlvbiBvZiByZXN1bHRzXG4gICAgICAgICAqL1xuICAgICAgICBsZXQgZWxpZ2libGVVc2Vyc1Jlc3VsdDogUmVjb3JkPHN0cmluZywgQXR0cmlidXRlVmFsdWU+W10gPSBbXTtcbiAgICAgICAgbGV0IGV4Y2x1c2l2ZVN0YXJ0S2V5LCByZXRyaWV2ZWREYXRhO1xuXG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogcmV0cmlldmUgYWxsIHRoZSBlbGlnaWJsZSBsaW5rZWQgdXNlcnMsIGdpdmVuIHRoZSBnbG9iYWwgc2Vjb25kYXJ5IGluZGV4LCBhcyB3ZWxsIGFzIHRoZSBMSU5LRUQgc3RhdHVzIHRvIGJlIHF1ZXJpZWQgYnlcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBMaW1pdCBvZiAxIE1CIHBlciBwYWdpbmF0ZWQgcmVzcG9uc2UgZGF0YSAoaW4gb3VyIGNhc2UgNSw3MDAgaXRlbXMpLiBBbiBhdmVyYWdlIHNpemUgZm9yIGFuIEl0ZW0gaXMgYWJvdXQgMTMzIGJ5dGVzLCB3aGljaCBtZWFucyB0aGF0IHdlIHdvbid0XG4gICAgICAgICAgICAgKiBuZWVkIHRvIGRvIHBhZ2luYXRpb24gaGVyZSwgc2luY2Ugd2UgYWN0dWFsbHkgcmV0cmlldmUgYWxsIHVzZXJzIGluIGEgbG9vcGVkIGZvcm1hdCwgYW5kIHdlIGFjY291bnQgZm9yXG4gICAgICAgICAgICAgKiBwYWdpbmF0ZWQgcmVzcG9uc2VzLlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIEBsaW5rIHtodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL1F1ZXJ5LlBhZ2luYXRpb24uaHRtbH1cbiAgICAgICAgICAgICAqIEBsaW5rIHtodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL1F1ZXJ5Lmh0bWx9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHJldHJpZXZlZERhdGEgPSBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBRdWVyeUNvbW1hbmQoe1xuICAgICAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuQ0FSRF9MSU5LSU5HX1RBQkxFISxcbiAgICAgICAgICAgICAgICBJbmRleE5hbWU6IGAke3Byb2Nlc3MuZW52LkNBUkRfTElOS0lOR19TVEFUVVNfR0xPQkFMX0lOREVYIX0tJHtwcm9jZXNzLmVudi5FTlZfTkFNRSF9LSR7cmVnaW9ufWAsXG4gICAgICAgICAgICAgICAgLi4uKGV4Y2x1c2l2ZVN0YXJ0S2V5ICYmIHtFeGNsdXNpdmVTdGFydEtleTogZXhjbHVzaXZlU3RhcnRLZXl9KSxcbiAgICAgICAgICAgICAgICBMaW1pdDogNTcwMCwgLy8gNSw3MDAgKiAxMzMgYnl0ZXMgPSA3NTgsMTAwIGJ5dGVzID0gMC43NTgxIE1CIChsZWF2ZSBhIG1hcmdpbiBvZiBlcnJvciBoZXJlIHVwIHRvIDEgTUIpXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogd2UncmUgbm90IGludGVyZXN0ZWQgaW4gZ2V0dGluZyBhbGwgdGhlIGRhdGEgZm9yIHRoaXMgY2FsbCwganVzdCB0aGUgbWluaW11bSBmb3IgdXMgdG8gcmV0dXJuIHRoZSBuZWNlc3NhcnkgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9hbWF6b25keW5hbW9kYi9sYXRlc3QvZGV2ZWxvcGVyZ3VpZGUvUmVzZXJ2ZWRXb3Jkcy5odG1sXG4gICAgICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2FtYXpvbmR5bmFtb2RiL2xhdGVzdC9kZXZlbG9wZXJndWlkZS9FeHByZXNzaW9ucy5FeHByZXNzaW9uQXR0cmlidXRlTmFtZXMuaHRtbFxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIFByb2plY3Rpb25FeHByZXNzaW9uOiAnI2lkZiwgI21pZCwgI2NhcmQnICsgJ1swXS5pZCcsXG4gICAgICAgICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICcjaWRmJzogJ2lkJyxcbiAgICAgICAgICAgICAgICAgICAgJyNjYXJkJzogJ2NhcmRzJyxcbiAgICAgICAgICAgICAgICAgICAgJyNtaWQnOiAnbWVtYmVySWQnLFxuICAgICAgICAgICAgICAgICAgICAnI3N0JzogJ3N0YXR1cydcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCI6c3RcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogQ2FyZExpbmtpbmdTdGF0dXMuTGlua2VkXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIEtleUNvbmRpdGlvbkV4cHJlc3Npb246ICcjc3QgPSA6c3QnXG4gICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgIGV4Y2x1c2l2ZVN0YXJ0S2V5ID0gcmV0cmlldmVkRGF0YS5MYXN0RXZhbHVhdGVkS2V5O1xuICAgICAgICAgICAgZWxpZ2libGVVc2Vyc1Jlc3VsdCA9IGVsaWdpYmxlVXNlcnNSZXN1bHQuY29uY2F0KHJldHJpZXZlZERhdGEuSXRlbXMpO1xuICAgICAgICB9IHdoaWxlIChyZXRyaWV2ZWREYXRhICYmIHJldHJpZXZlZERhdGEuQ291bnQgJiYgcmV0cmlldmVkRGF0YS5JdGVtcyAmJlxuICAgICAgICByZXRyaWV2ZWREYXRhLkl0ZW1zLmxlbmd0aCAmJiByZXRyaWV2ZWREYXRhLkNvdW50ICE9PSAwICYmXG4gICAgICAgIHJldHJpZXZlZERhdGEuSXRlbXMubGVuZ3RoICE9PSAwICYmIHJldHJpZXZlZERhdGEuTGFzdEV2YWx1YXRlZEtleSk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIHJldHJpZXZlIHRoZSBsaXN0IG9mIGFsbCBleGlzdGVudCB1c2VycyBmcm9tIG91ciBDb2duaXRvIHVzZXIgcG9vbCAoZWxpZ2libGUgKyBpbmVsaWdpYmxlKVxuICAgICAgICAgKlxuICAgICAgICAgKiBmaXJzdCwgaW5pdGlhbGl6ZSB0aGUgTW9vbmJlYW0gQ2xpZW50IEFQSSBoZXJlLCBpbiBvcmRlciB0byBjYWxsIHRoZSBhcHByb3ByaWF0ZSBlbmRwb2ludHMgZm9yIHRoaXMgaGFuZGxlclxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgbW9vbmJlYW1DbGllbnQgPSBuZXcgTW9vbmJlYW1DbGllbnQocHJvY2Vzcy5lbnYuRU5WX05BTUUhLCByZWdpb24pO1xuICAgICAgICBjb25zdCB1c2Vyc0Zvck5vdGlmaWNhdGlvblJlbWluZGVyUmVzcG9uc2U6IFVzZXJGb3JOb3RpZmljYXRpb25SZW1pbmRlclJlc3BvbnNlID0gYXdhaXQgbW9vbmJlYW1DbGllbnQuZ2V0QWxsVXNlcnNGb3JOb3RpZmljYXRpb25SZW1pbmRlcnMoKTtcblxuICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIGdldCBhbGwgdXNlcnMgY2FsbCB3YXMgc3VjY2Vzc2Z1bCBvciBub3RcbiAgICAgICAgaWYgKHVzZXJzRm9yTm90aWZpY2F0aW9uUmVtaW5kZXJSZXNwb25zZSAmJiAhdXNlcnNGb3JOb3RpZmljYXRpb25SZW1pbmRlclJlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhdXNlcnNGb3JOb3RpZmljYXRpb25SZW1pbmRlclJlc3BvbnNlLmVycm9yVHlwZSAmJlxuICAgICAgICAgICAgdXNlcnNGb3JOb3RpZmljYXRpb25SZW1pbmRlclJlc3BvbnNlLmRhdGEgJiYgdXNlcnNGb3JOb3RpZmljYXRpb25SZW1pbmRlclJlc3BvbnNlLmRhdGEubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAvLyBpZiB0aGVyZSBhcmUgZWxpZ2libGUgdXNlcnMgcmV0cmlldmVkLCB0aGVuIHJlbW92ZSB0aGVtIGZyb20gdGhlIGxpc3Qgb2YgYWxsIHVzZXJzIHJldHJpZXZlZCAoc2luY2Ugd2Ugb25seSBuZWVkIGluZWxpZ2libGUgdXNlcnMgcmV0dXJuZWQpXG4gICAgICAgICAgICBpZiAoZWxpZ2libGVVc2Vyc1Jlc3VsdCAmJiBlbGlnaWJsZVVzZXJzUmVzdWx0Lmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIC8vIGJ1aWxkIG91dCBhbiBhcnJheSBvZiBlbGlnaWJsZSBJRHMgZnJvbSB0aGUgbGlzdCBvZiBEeW5hbW9EQiByZWNvcmRzLCByZXByZXNlbnRpbmcgZWxpZ2libGUgdXNlcnMgcmV0dXJuZWRcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgRm91bmQgc29tZSBlbGlnaWJsZSBsaW5rZWQgdXNlcnMsIG5lZWRlZCB0byBnZXQgZmlsdGVyZWQgb3V0IGZyb20gdGhlIGxpc3Qgb2YgYWxsIHVzZXJzYCk7XG4gICAgICAgICAgICAgICAgY29uc3QgZWxpZ2libGVJZHM6IHN0cmluZ1tdID0gW107XG4gICAgICAgICAgICAgICAgZWxpZ2libGVVc2Vyc1Jlc3VsdC5mb3JFYWNoKGVsaWdpYmxlVXNlclJlc3VsdCA9PiBlbGlnaWJsZUlkcy5wdXNoKGVsaWdpYmxlVXNlclJlc3VsdC5pZC5TISkpO1xuXG4gICAgICAgICAgICAgICAgLy8gZmlsdGVyIG91dCBhbmQgcmV0dXJuIHRoZSBlbGlnaWJsZSB1c2VycyBmcm9tIHRoZSBsaXN0IG9mIGFsbCB1c2VycyByZXRyaWV2ZWRcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiB1c2Vyc0Zvck5vdGlmaWNhdGlvblJlbWluZGVyUmVzcG9uc2UuZGF0YS5maWx0ZXIodXNlciA9PiAhZWxpZ2libGVJZHMuaW5jbHVkZXModXNlciEuaWQpKVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIGlmIHRoZXJlIGFyZSBubyBlbGlnaWJsZSB1c2VycyBmb3VuZCwgdGhlbiB3ZSBjYW4gY29uY2x1ZGUgdGhhdCBhbGwgdXNlcnMgcmV0cmlldmVkIGFyZSBpbmVsaWdpYmxlL2hhdmUgbm8gbGlua2VkIGNhcmRzXG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYEVsaWdpYmxlIGxpbmtlZCB1c2VycyBub3QgZm91bmQsIHJldHVybmluZyBhbGwgdW4tbGlua2VkL2luZWxpZ2libGUgdXNlcnMgaW5zdGVhZCFgO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiB1c2Vyc0Zvck5vdGlmaWNhdGlvblJlbWluZGVyUmVzcG9uc2UuZGF0YVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBSZXRyaWV2aW5nIGFsbCB1c2VycyB0aHJvdWdoIHRoZSBnZXRBbGxVc2Vyc0Zvck5vdGlmaWNhdGlvblJlbWluZGVycyBjYWxsIGZhaWxlZGA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nICR7ZmllbGROYW1lfSBxdWVyeSAke2Vycn1gO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICB9O1xuICAgIH1cbn1cbiJdfQ==