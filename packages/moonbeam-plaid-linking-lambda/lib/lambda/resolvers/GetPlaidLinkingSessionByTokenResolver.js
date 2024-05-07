"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlaidLinkingSessionByToken = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
/**
 * GetPlaidLinkingSessionByToken resolver
 *
 * @param getPlaidLinkingSessionByTokenInput the input needed to update an existing plaid linking session's data
 * @param fieldName name of the resolver path from the AppSync event
 * @returns {@link Promise} of {@link PlaidLinkingSessionResponse}
 */
const getPlaidLinkingSessionByToken = async (fieldName, getPlaidLinkingSessionByTokenInput) => {
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
        let result = [];
        let exclusiveStartKey, retrievedData;
        do {
            /**
             * retrieve the Link Session by the link token, given the global secondary index to be queried by.
             *
             * Limit of 1 MB per paginated response data (in our case 2,000 items). An average size for an Item is about 365 bytes, which means that we won't
             * need to do pagination here, since we actually retrieve all Link Sessions in a looped format, and we account for
             * paginated responses.
             *
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.Pagination.html}
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html}
             */
            retrievedData = await dynamoDbClient.send(new client_dynamodb_1.QueryCommand({
                TableName: process.env.PLAID_LINKING_SESSIONS_TABLE,
                IndexName: `${process.env.PLAID_LINK_TOKEN_GLOBAL_INDEX}-${process.env.ENV_NAME}-${region}`,
                ...(exclusiveStartKey && { ExclusiveStartKey: exclusiveStartKey }),
                Limit: 2000,
                ExpressionAttributeNames: {
                    '#lTk': 'link_token'
                },
                ExpressionAttributeValues: {
                    ':lTk': {
                        S: getPlaidLinkingSessionByTokenInput.link_token
                    }
                },
                KeyConditionExpression: '#lTk = :lTk'
            }));
            exclusiveStartKey = retrievedData.LastEvaluatedKey;
            result = result.concat(retrievedData.Items);
        } while (retrievedData && retrievedData.Count && retrievedData.Items &&
            retrievedData.Items.length && retrievedData.Count !== 0 &&
            retrievedData.Items.length !== 0 && retrievedData.LastEvaluatedKey);
        // there needs to be only 1 Plaid Link session returned. For more than one, return an error accordingly
        if (result && result.length === 1) {
            // return the queried PLaid Linking Session's details
            return {
                data: {
                    createdAt: result[0].createdAt.S,
                    expiration: result[0].expiration.S,
                    hosted_link_url: result[0].hosted_link_url.S,
                    id: result[0].id.S,
                    link_token: result[0].link_token.S,
                    ...(result[0].public_token && result[0].public_token.S && {
                        public_token: result[0].public_token.S,
                    }),
                    request_id: result[0].request_id.S,
                    ...(result[0].session_id && result[0].session_id.S && {
                        public_token: result[0].session_id.S,
                    }),
                    status: result[0].status.S,
                    timestamp: Number(result[0].timestamp.N),
                    updatedAt: result[0].updatedAt.S
                }
            };
        }
        else {
            // see if we have no or more than one Sessions retrieved and return the appropriate error and message
            if (result.length === 0) {
                const errorMessage = `No Plaid Link Session found for token ${getPlaidLinkingSessionByTokenInput.link_token}!`;
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: moonbeam_models_1.PlaidLinkingErrorType.NoneOrAbsent
                };
            }
            else if (result.length > 1) {
                const errorMessage = `More than one Plaid Link Session retrieved for token ${getPlaidLinkingSessionByTokenInput.link_token}!`;
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: moonbeam_models_1.PlaidLinkingErrorType.DuplicateObjectFound
                };
            }
            else {
                const errorMessage = `Issues while retrieving Plaid Link Session for token ${getPlaidLinkingSessionByTokenInput.link_token}!`;
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: moonbeam_models_1.PlaidLinkingErrorType.UnexpectedError
                };
            }
        }
    }
    catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.PlaidLinkingErrorType.UnexpectedError
        };
    }
};
exports.getPlaidLinkingSessionByToken = getPlaidLinkingSessionByToken;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0UGxhaWRMaW5raW5nU2Vzc2lvbkJ5VG9rZW5SZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL0dldFBsYWlkTGlua2luZ1Nlc3Npb25CeVRva2VuUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0RBS21DO0FBQ25DLDhEQUFzRjtBQUV0Rjs7Ozs7O0dBTUc7QUFDSSxNQUFNLDZCQUE2QixHQUFHLEtBQUssRUFBRSxTQUFpQixFQUFFLGtDQUFzRSxFQUF3QyxFQUFFO0lBQ25MLElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsNENBQTRDO1FBQzVDLE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBRTVEOzs7O1dBSUc7UUFDSCxJQUFJLE1BQU0sR0FBcUMsRUFBRSxDQUFDO1FBQ2xELElBQUksaUJBQWlCLEVBQUUsYUFBYSxDQUFDO1FBRXJDLEdBQUc7WUFDQzs7Ozs7Ozs7O2VBU0c7WUFDSCxhQUFhLEdBQUcsTUFBTSxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksOEJBQVksQ0FBQztnQkFDdkQsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsNEJBQTZCO2dCQUNwRCxTQUFTLEVBQUUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLDZCQUE4QixJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUyxJQUFJLE1BQU0sRUFBRTtnQkFDN0YsR0FBRyxDQUFDLGlCQUFpQixJQUFJLEVBQUMsaUJBQWlCLEVBQUUsaUJBQWlCLEVBQUMsQ0FBQztnQkFDaEUsS0FBSyxFQUFFLElBQUk7Z0JBQ1gsd0JBQXdCLEVBQUU7b0JBQ3RCLE1BQU0sRUFBRSxZQUFZO2lCQUN2QjtnQkFDRCx5QkFBeUIsRUFB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UyxFQUFFLHVDQUFxQixDQUFDLG9CQUFvQjtpQkFDeEQsQ0FBQTthQUNKO2lCQUFNO2dCQUNILE1BQU0sWUFBWSxHQUFHLHdEQUF3RCxrQ0FBa0MsQ0FBQyxVQUFVLEdBQUcsQ0FBQztnQkFDOUgsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFFMUIsT0FBTztvQkFDSCxZQUFZLEVBQUUsWUFBWTtvQkFDMUIsU0FBUyxFQUFFLHVDQUFxQixDQUFDLGVBQWU7aUJBQ25ELENBQUE7YUFDSjtTQUNKO0tBQ0o7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLE1BQU0sWUFBWSxHQUFHLG9DQUFvQyxTQUFTLGFBQWEsR0FBRyxFQUFFLENBQUM7UUFDckYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMxQixPQUFPO1lBQ0gsWUFBWSxFQUFFLFlBQVk7WUFDMUIsU0FBUyxFQUFFLHVDQUFxQixDQUFDLGVBQWU7U0FDbkQsQ0FBQTtLQUNKO0FBQ0wsQ0FBQyxDQUFBO0FBM0dZLFFBQUEsNkJBQTZCLGlDQTJHekMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIEdldFBsYWlkTGlua2luZ1Nlc3Npb25CeVRva2VuSW5wdXQsXG4gICAgUGxhaWRMaW5raW5nRXJyb3JUeXBlLFxuICAgIFBsYWlkTGlua2luZ1Nlc3Npb25SZXNwb25zZSxcbiAgICBQbGFpZExpbmtpbmdTZXNzaW9uU3RhdHVzXG59IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5pbXBvcnQge0F0dHJpYnV0ZVZhbHVlLCBEeW5hbW9EQkNsaWVudCwgUXVlcnlDb21tYW5kfSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWR5bmFtb2RiXCI7XG5cbi8qKlxuICogR2V0UGxhaWRMaW5raW5nU2Vzc2lvbkJ5VG9rZW4gcmVzb2x2ZXJcbiAqXG4gKiBAcGFyYW0gZ2V0UGxhaWRMaW5raW5nU2Vzc2lvbkJ5VG9rZW5JbnB1dCB0aGUgaW5wdXQgbmVlZGVkIHRvIHVwZGF0ZSBhbiBleGlzdGluZyBwbGFpZCBsaW5raW5nIHNlc3Npb24ncyBkYXRhXG4gKiBAcGFyYW0gZmllbGROYW1lIG5hbWUgb2YgdGhlIHJlc29sdmVyIHBhdGggZnJvbSB0aGUgQXBwU3luYyBldmVudFxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBQbGFpZExpbmtpbmdTZXNzaW9uUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRQbGFpZExpbmtpbmdTZXNzaW9uQnlUb2tlbiA9IGFzeW5jIChmaWVsZE5hbWU6IHN0cmluZywgZ2V0UGxhaWRMaW5raW5nU2Vzc2lvbkJ5VG9rZW5JbnB1dDogR2V0UGxhaWRMaW5raW5nU2Vzc2lvbkJ5VG9rZW5JbnB1dCk6IFByb21pc2U8UGxhaWRMaW5raW5nU2Vzc2lvblJlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLy8gaW5pdGlhbGl6aW5nIHRoZSBEeW5hbW9EQiBkb2N1bWVudCBjbGllbnRcbiAgICAgICAgY29uc3QgZHluYW1vRGJDbGllbnQgPSBuZXcgRHluYW1vREJDbGllbnQoe3JlZ2lvbjogcmVnaW9ufSk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIHRoZSBkYXRhIHRvIGJlIHJldHJpZXZlZCBmcm9tIHRoZSBRdWVyeSBDb21tYW5kXG4gICAgICAgICAqIHRoZSBlbGlnaWJsZSB1c2VyIEl0ZW1zIHJldHVybmVkIGZyb20gdGhlIFF1ZXJ5IENvbW1hbmQsIGFsbCBhZ2dyZWdhdGVkIHRvZ2V0aGVyXG4gICAgICAgICAqIHRoZSBsYXN0IGV2YWx1YXRlZCBrZXksIHRvIGhlbHAgd2l0aCB0aGUgcGFnaW5hdGlvbiBvZiByZXN1bHRzXG4gICAgICAgICAqL1xuICAgICAgICBsZXQgcmVzdWx0OiBSZWNvcmQ8c3RyaW5nLCBBdHRyaWJ1dGVWYWx1ZT5bXSA9IFtdO1xuICAgICAgICBsZXQgZXhjbHVzaXZlU3RhcnRLZXksIHJldHJpZXZlZERhdGE7XG5cbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiByZXRyaWV2ZSB0aGUgTGluayBTZXNzaW9uIGJ5IHRoZSBsaW5rIHRva2VuLCBnaXZlbiB0aGUgZ2xvYmFsIHNlY29uZGFyeSBpbmRleCB0byBiZSBxdWVyaWVkIGJ5LlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIExpbWl0IG9mIDEgTUIgcGVyIHBhZ2luYXRlZCByZXNwb25zZSBkYXRhIChpbiBvdXIgY2FzZSAyLDAwMCBpdGVtcykuIEFuIGF2ZXJhZ2Ugc2l6ZSBmb3IgYW4gSXRlbSBpcyBhYm91dCAzNjUgYnl0ZXMsIHdoaWNoIG1lYW5zIHRoYXQgd2Ugd29uJ3RcbiAgICAgICAgICAgICAqIG5lZWQgdG8gZG8gcGFnaW5hdGlvbiBoZXJlLCBzaW5jZSB3ZSBhY3R1YWxseSByZXRyaWV2ZSBhbGwgTGluayBTZXNzaW9ucyBpbiBhIGxvb3BlZCBmb3JtYXQsIGFuZCB3ZSBhY2NvdW50IGZvclxuICAgICAgICAgICAgICogcGFnaW5hdGVkIHJlc3BvbnNlcy5cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAbGluayB7aHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2FtYXpvbmR5bmFtb2RiL2xhdGVzdC9kZXZlbG9wZXJndWlkZS9RdWVyeS5QYWdpbmF0aW9uLmh0bWx9XG4gICAgICAgICAgICAgKiBAbGluayB7aHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2FtYXpvbmR5bmFtb2RiL2xhdGVzdC9kZXZlbG9wZXJndWlkZS9RdWVyeS5odG1sfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICByZXRyaWV2ZWREYXRhID0gYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgUXVlcnlDb21tYW5kKHtcbiAgICAgICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LlBMQUlEX0xJTktJTkdfU0VTU0lPTlNfVEFCTEUhLFxuICAgICAgICAgICAgICAgIEluZGV4TmFtZTogYCR7cHJvY2Vzcy5lbnYuUExBSURfTElOS19UT0tFTl9HTE9CQUxfSU5ERVghfS0ke3Byb2Nlc3MuZW52LkVOVl9OQU1FIX0tJHtyZWdpb259YCxcbiAgICAgICAgICAgICAgICAuLi4oZXhjbHVzaXZlU3RhcnRLZXkgJiYge0V4Y2x1c2l2ZVN0YXJ0S2V5OiBleGNsdXNpdmVTdGFydEtleX0pLFxuICAgICAgICAgICAgICAgIExpbWl0OiAyMDAwLCAvLyAyLDAwMCAqIDM2NSBieXRlcyA9IDczMCwwMDAgYnl0ZXMgPSAwLjczIE1CIChsZWF2ZSBhIG1hcmdpbiBvZiBlcnJvciBoZXJlIHVwIHRvIDEgTUIpXG4gICAgICAgICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICcjbFRrJzogJ2xpbmtfdG9rZW4nXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlVmFsdWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICc6bFRrJzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogZ2V0UGxhaWRMaW5raW5nU2Vzc2lvbkJ5VG9rZW5JbnB1dC5saW5rX3Rva2VuXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIEtleUNvbmRpdGlvbkV4cHJlc3Npb246ICcjbFRrID0gOmxUaydcbiAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgZXhjbHVzaXZlU3RhcnRLZXkgPSByZXRyaWV2ZWREYXRhLkxhc3RFdmFsdWF0ZWRLZXk7XG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KHJldHJpZXZlZERhdGEuSXRlbXMpO1xuICAgICAgICB9IHdoaWxlIChyZXRyaWV2ZWREYXRhICYmIHJldHJpZXZlZERhdGEuQ291bnQgJiYgcmV0cmlldmVkRGF0YS5JdGVtcyAmJlxuICAgICAgICByZXRyaWV2ZWREYXRhLkl0ZW1zLmxlbmd0aCAmJiByZXRyaWV2ZWREYXRhLkNvdW50ICE9PSAwICYmXG4gICAgICAgIHJldHJpZXZlZERhdGEuSXRlbXMubGVuZ3RoICE9PSAwICYmIHJldHJpZXZlZERhdGEuTGFzdEV2YWx1YXRlZEtleSk7XG5cbiAgICAgICAgLy8gdGhlcmUgbmVlZHMgdG8gYmUgb25seSAxIFBsYWlkIExpbmsgc2Vzc2lvbiByZXR1cm5lZC4gRm9yIG1vcmUgdGhhbiBvbmUsIHJldHVybiBhbiBlcnJvciBhY2NvcmRpbmdseVxuICAgICAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIC8vIHJldHVybiB0aGUgcXVlcmllZCBQTGFpZCBMaW5raW5nIFNlc3Npb24ncyBkZXRhaWxzXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0OiByZXN1bHRbMF0uY3JlYXRlZEF0LlMhLFxuICAgICAgICAgICAgICAgICAgICBleHBpcmF0aW9uOiByZXN1bHRbMF0uZXhwaXJhdGlvbi5TISxcbiAgICAgICAgICAgICAgICAgICAgaG9zdGVkX2xpbmtfdXJsOiByZXN1bHRbMF0uaG9zdGVkX2xpbmtfdXJsLlMhLFxuICAgICAgICAgICAgICAgICAgICBpZDogcmVzdWx0WzBdLmlkLlMhLFxuICAgICAgICAgICAgICAgICAgICBsaW5rX3Rva2VuOiByZXN1bHRbMF0ubGlua190b2tlbi5TISxcbiAgICAgICAgICAgICAgICAgICAgLi4uKHJlc3VsdFswXS5wdWJsaWNfdG9rZW4gJiYgcmVzdWx0WzBdLnB1YmxpY190b2tlbi5TICYmIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1YmxpY190b2tlbjogcmVzdWx0WzBdLnB1YmxpY190b2tlbi5TISxcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3RfaWQ6IHJlc3VsdFswXS5yZXF1ZXN0X2lkLlMhLFxuICAgICAgICAgICAgICAgICAgICAuLi4ocmVzdWx0WzBdLnNlc3Npb25faWQgJiYgcmVzdWx0WzBdLnNlc3Npb25faWQuUyAmJiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwdWJsaWNfdG9rZW46IHJlc3VsdFswXS5zZXNzaW9uX2lkLlMhLFxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiByZXN1bHRbMF0uc3RhdHVzLlMhIGFzIFBsYWlkTGlua2luZ1Nlc3Npb25TdGF0dXMsXG4gICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogTnVtYmVyKHJlc3VsdFswXS50aW1lc3RhbXAuTiEpLFxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQXQ6IHJlc3VsdFswXS51cGRhdGVkQXQuUyFcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBzZWUgaWYgd2UgaGF2ZSBubyBvciBtb3JlIHRoYW4gb25lIFNlc3Npb25zIHJldHJpZXZlZCBhbmQgcmV0dXJuIHRoZSBhcHByb3ByaWF0ZSBlcnJvciBhbmQgbWVzc2FnZVxuICAgICAgICAgICAgaWYgKHJlc3VsdC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm8gUGxhaWQgTGluayBTZXNzaW9uIGZvdW5kIGZvciB0b2tlbiAke2dldFBsYWlkTGlua2luZ1Nlc3Npb25CeVRva2VuSW5wdXQubGlua190b2tlbn0hYDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogUGxhaWRMaW5raW5nRXJyb3JUeXBlLk5vbmVPckFic2VudFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAocmVzdWx0Lmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTW9yZSB0aGFuIG9uZSBQbGFpZCBMaW5rIFNlc3Npb24gcmV0cmlldmVkIGZvciB0b2tlbiAke2dldFBsYWlkTGlua2luZ1Nlc3Npb25CeVRva2VuSW5wdXQubGlua190b2tlbn0hYDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogUGxhaWRMaW5raW5nRXJyb3JUeXBlLkR1cGxpY2F0ZU9iamVjdEZvdW5kXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgSXNzdWVzIHdoaWxlIHJldHJpZXZpbmcgUGxhaWQgTGluayBTZXNzaW9uIGZvciB0b2tlbiAke2dldFBsYWlkTGlua2luZ1Nlc3Npb25CeVRva2VuSW5wdXQubGlua190b2tlbn0hYDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogUGxhaWRMaW5raW5nRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgJHtmaWVsZE5hbWV9IG11dGF0aW9uICR7ZXJyfWA7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIGVycm9yVHlwZTogUGxhaWRMaW5raW5nRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICB9XG4gICAgfVxufVxuIl19