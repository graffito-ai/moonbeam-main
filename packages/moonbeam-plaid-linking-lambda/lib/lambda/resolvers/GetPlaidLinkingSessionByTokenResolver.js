"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlaidLinkingSessionByToken = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
/**
 * GetPlaidLinkingSessionByToken resolver
 *
 * @param getPlaidLinkingSessionByTokenInput the input needed to retrieve an existing plaid linking session
 * by its link token
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
         * the eligible linking session Items returned from the Query Command, all aggregated together
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
            // return the queried Plaid Linking Session's details
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0UGxhaWRMaW5raW5nU2Vzc2lvbkJ5VG9rZW5SZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL0dldFBsYWlkTGlua2luZ1Nlc3Npb25CeVRva2VuUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0RBS21DO0FBQ25DLDhEQUFzRjtBQUV0Rjs7Ozs7OztHQU9HO0FBQ0ksTUFBTSw2QkFBNkIsR0FBRyxLQUFLLEVBQUUsU0FBaUIsRUFBRSxrQ0FBc0UsRUFBd0MsRUFBRTtJQUNuTCxJQUFJO1FBQ0EseUNBQXlDO1FBQ3pDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVyxDQUFDO1FBRXZDLDRDQUE0QztRQUM1QyxNQUFNLGNBQWMsR0FBRyxJQUFJLGdDQUFjLENBQUMsRUFBQyxNQUFNLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQztRQUU1RDs7OztXQUlHO1FBQ0gsSUFBSSxNQUFNLEdBQXFDLEVBQUUsQ0FBQztRQUNsRCxJQUFJLGlCQUFpQixFQUFFLGFBQWEsQ0FBQztRQUVyQyxHQUFHO1lBQ0M7Ozs7Ozs7OztlQVNHO1lBQ0gsYUFBYSxHQUFHLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLDhCQUFZLENBQUM7Z0JBQ3ZELFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLDRCQUE2QjtnQkFDcEQsU0FBUyxFQUFFLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyw2QkFBOEIsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVMsSUFBSSxNQUFNLEVBQUU7Z0JBQzdGLEdBQUcsQ0FBQyxpQkFBaUIsSUFBSSxFQUFDLGlCQUFpQixFQUFFLGlCQUFpQixFQUFDLENBQUM7Z0JBQ2hFLEtBQUssRUFBRSxJQUFJO2dCQUNYLHdCQUF3QixFQUFFO29CQUN0QixNQUFNLEVBQUUsWUFBWTtpQkFDdkI7Z0JBQ0QseUJBQXlCLEVB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QVMsRUFBRSx1Q0FBcUIsQ0FBQyxvQkFBb0I7aUJBQ3hELENBQUE7YUFDSjtpQkFBTTtnQkFDSCxNQUFNLFlBQVksR0FBRyx3REFBd0Qsa0NBQWtDLENBQUMsVUFBVSxHQUFHLENBQUM7Z0JBQzlILE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBRTFCLE9BQU87b0JBQ0gsWUFBWSxFQUFFLFlBQVk7b0JBQzFCLFNBQVMsRUFBRSx1Q0FBcUIsQ0FBQyxlQUFlO2lCQUNuRCxDQUFBO2FBQ0o7U0FDSjtLQUNKO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVixNQUFNLFlBQVksR0FBRyxvQ0FBb0MsU0FBUyxhQUFhLEdBQUcsRUFBRSxDQUFDO1FBQ3JGLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUIsT0FBTztZQUNILFlBQVksRUFBRSxZQUFZO1lBQzFCLFNBQVMsRUFBRSx1Q0FBcUIsQ0FBQyxlQUFlO1NBQ25ELENBQUE7S0FDSjtBQUNMLENBQUMsQ0FBQTtBQTNHWSxRQUFBLDZCQUE2QixpQ0EyR3pDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBHZXRQbGFpZExpbmtpbmdTZXNzaW9uQnlUb2tlbklucHV0LFxuICAgIFBsYWlkTGlua2luZ0Vycm9yVHlwZSxcbiAgICBQbGFpZExpbmtpbmdTZXNzaW9uUmVzcG9uc2UsXG4gICAgUGxhaWRMaW5raW5nU2Vzc2lvblN0YXR1c1xufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuaW1wb3J0IHtBdHRyaWJ1dGVWYWx1ZSwgRHluYW1vREJDbGllbnQsIFF1ZXJ5Q29tbWFuZH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1keW5hbW9kYlwiO1xuXG4vKipcbiAqIEdldFBsYWlkTGlua2luZ1Nlc3Npb25CeVRva2VuIHJlc29sdmVyXG4gKlxuICogQHBhcmFtIGdldFBsYWlkTGlua2luZ1Nlc3Npb25CeVRva2VuSW5wdXQgdGhlIGlucHV0IG5lZWRlZCB0byByZXRyaWV2ZSBhbiBleGlzdGluZyBwbGFpZCBsaW5raW5nIHNlc3Npb25cbiAqIGJ5IGl0cyBsaW5rIHRva2VuXG4gKiBAcGFyYW0gZmllbGROYW1lIG5hbWUgb2YgdGhlIHJlc29sdmVyIHBhdGggZnJvbSB0aGUgQXBwU3luYyBldmVudFxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBQbGFpZExpbmtpbmdTZXNzaW9uUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRQbGFpZExpbmtpbmdTZXNzaW9uQnlUb2tlbiA9IGFzeW5jIChmaWVsZE5hbWU6IHN0cmluZywgZ2V0UGxhaWRMaW5raW5nU2Vzc2lvbkJ5VG9rZW5JbnB1dDogR2V0UGxhaWRMaW5raW5nU2Vzc2lvbkJ5VG9rZW5JbnB1dCk6IFByb21pc2U8UGxhaWRMaW5raW5nU2Vzc2lvblJlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLy8gaW5pdGlhbGl6aW5nIHRoZSBEeW5hbW9EQiBkb2N1bWVudCBjbGllbnRcbiAgICAgICAgY29uc3QgZHluYW1vRGJDbGllbnQgPSBuZXcgRHluYW1vREJDbGllbnQoe3JlZ2lvbjogcmVnaW9ufSk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIHRoZSBkYXRhIHRvIGJlIHJldHJpZXZlZCBmcm9tIHRoZSBRdWVyeSBDb21tYW5kXG4gICAgICAgICAqIHRoZSBlbGlnaWJsZSBsaW5raW5nIHNlc3Npb24gSXRlbXMgcmV0dXJuZWQgZnJvbSB0aGUgUXVlcnkgQ29tbWFuZCwgYWxsIGFnZ3JlZ2F0ZWQgdG9nZXRoZXJcbiAgICAgICAgICogdGhlIGxhc3QgZXZhbHVhdGVkIGtleSwgdG8gaGVscCB3aXRoIHRoZSBwYWdpbmF0aW9uIG9mIHJlc3VsdHNcbiAgICAgICAgICovXG4gICAgICAgIGxldCByZXN1bHQ6IFJlY29yZDxzdHJpbmcsIEF0dHJpYnV0ZVZhbHVlPltdID0gW107XG4gICAgICAgIGxldCBleGNsdXNpdmVTdGFydEtleSwgcmV0cmlldmVkRGF0YTtcblxuICAgICAgICBkbyB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIHJldHJpZXZlIHRoZSBMaW5rIFNlc3Npb24gYnkgdGhlIGxpbmsgdG9rZW4sIGdpdmVuIHRoZSBnbG9iYWwgc2Vjb25kYXJ5IGluZGV4IHRvIGJlIHF1ZXJpZWQgYnkuXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogTGltaXQgb2YgMSBNQiBwZXIgcGFnaW5hdGVkIHJlc3BvbnNlIGRhdGEgKGluIG91ciBjYXNlIDIsMDAwIGl0ZW1zKS4gQW4gYXZlcmFnZSBzaXplIGZvciBhbiBJdGVtIGlzIGFib3V0IDM2NSBieXRlcywgd2hpY2ggbWVhbnMgdGhhdCB3ZSB3b24ndFxuICAgICAgICAgICAgICogbmVlZCB0byBkbyBwYWdpbmF0aW9uIGhlcmUsIHNpbmNlIHdlIGFjdHVhbGx5IHJldHJpZXZlIGFsbCBMaW5rIFNlc3Npb25zIGluIGEgbG9vcGVkIGZvcm1hdCwgYW5kIHdlIGFjY291bnQgZm9yXG4gICAgICAgICAgICAgKiBwYWdpbmF0ZWQgcmVzcG9uc2VzLlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIEBsaW5rIHtodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL1F1ZXJ5LlBhZ2luYXRpb24uaHRtbH1cbiAgICAgICAgICAgICAqIEBsaW5rIHtodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL1F1ZXJ5Lmh0bWx9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHJldHJpZXZlZERhdGEgPSBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBRdWVyeUNvbW1hbmQoe1xuICAgICAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuUExBSURfTElOS0lOR19TRVNTSU9OU19UQUJMRSEsXG4gICAgICAgICAgICAgICAgSW5kZXhOYW1lOiBgJHtwcm9jZXNzLmVudi5QTEFJRF9MSU5LX1RPS0VOX0dMT0JBTF9JTkRFWCF9LSR7cHJvY2Vzcy5lbnYuRU5WX05BTUUhfS0ke3JlZ2lvbn1gLFxuICAgICAgICAgICAgICAgIC4uLihleGNsdXNpdmVTdGFydEtleSAmJiB7RXhjbHVzaXZlU3RhcnRLZXk6IGV4Y2x1c2l2ZVN0YXJ0S2V5fSksXG4gICAgICAgICAgICAgICAgTGltaXQ6IDIwMDAsIC8vIDIsMDAwICogMzY1IGJ5dGVzID0gNzMwLDAwMCBieXRlcyA9IDAuNzMgTUIgKGxlYXZlIGEgbWFyZ2luIG9mIGVycm9yIGhlcmUgdXAgdG8gMSBNQilcbiAgICAgICAgICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlTmFtZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgJyNsVGsnOiAnbGlua190b2tlbidcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgJzpsVGsnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiBnZXRQbGFpZExpbmtpbmdTZXNzaW9uQnlUb2tlbklucHV0LmxpbmtfdG9rZW5cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgS2V5Q29uZGl0aW9uRXhwcmVzc2lvbjogJyNsVGsgPSA6bFRrJ1xuICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICBleGNsdXNpdmVTdGFydEtleSA9IHJldHJpZXZlZERhdGEuTGFzdEV2YWx1YXRlZEtleTtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQocmV0cmlldmVkRGF0YS5JdGVtcyk7XG4gICAgICAgIH0gd2hpbGUgKHJldHJpZXZlZERhdGEgJiYgcmV0cmlldmVkRGF0YS5Db3VudCAmJiByZXRyaWV2ZWREYXRhLkl0ZW1zICYmXG4gICAgICAgIHJldHJpZXZlZERhdGEuSXRlbXMubGVuZ3RoICYmIHJldHJpZXZlZERhdGEuQ291bnQgIT09IDAgJiZcbiAgICAgICAgcmV0cmlldmVkRGF0YS5JdGVtcy5sZW5ndGggIT09IDAgJiYgcmV0cmlldmVkRGF0YS5MYXN0RXZhbHVhdGVkS2V5KTtcblxuICAgICAgICAvLyB0aGVyZSBuZWVkcyB0byBiZSBvbmx5IDEgUGxhaWQgTGluayBzZXNzaW9uIHJldHVybmVkLiBGb3IgbW9yZSB0aGFuIG9uZSwgcmV0dXJuIGFuIGVycm9yIGFjY29yZGluZ2x5XG4gICAgICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBxdWVyaWVkIFBsYWlkIExpbmtpbmcgU2Vzc2lvbidzIGRldGFpbHNcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IHJlc3VsdFswXS5jcmVhdGVkQXQuUyEsXG4gICAgICAgICAgICAgICAgICAgIGV4cGlyYXRpb246IHJlc3VsdFswXS5leHBpcmF0aW9uLlMhLFxuICAgICAgICAgICAgICAgICAgICBob3N0ZWRfbGlua191cmw6IHJlc3VsdFswXS5ob3N0ZWRfbGlua191cmwuUyEsXG4gICAgICAgICAgICAgICAgICAgIGlkOiByZXN1bHRbMF0uaWQuUyEsXG4gICAgICAgICAgICAgICAgICAgIGxpbmtfdG9rZW46IHJlc3VsdFswXS5saW5rX3Rva2VuLlMhLFxuICAgICAgICAgICAgICAgICAgICAuLi4ocmVzdWx0WzBdLnB1YmxpY190b2tlbiAmJiByZXN1bHRbMF0ucHVibGljX3Rva2VuLlMgJiYge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHVibGljX3Rva2VuOiByZXN1bHRbMF0ucHVibGljX3Rva2VuLlMhLFxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgcmVxdWVzdF9pZDogcmVzdWx0WzBdLnJlcXVlc3RfaWQuUyEsXG4gICAgICAgICAgICAgICAgICAgIC4uLihyZXN1bHRbMF0uc2Vzc2lvbl9pZCAmJiByZXN1bHRbMF0uc2Vzc2lvbl9pZC5TICYmIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1YmxpY190b2tlbjogcmVzdWx0WzBdLnNlc3Npb25faWQuUyEsXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IHJlc3VsdFswXS5zdGF0dXMuUyEgYXMgUGxhaWRMaW5raW5nU2Vzc2lvblN0YXR1cyxcbiAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiBOdW1iZXIocmVzdWx0WzBdLnRpbWVzdGFtcC5OISksXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBdDogcmVzdWx0WzBdLnVwZGF0ZWRBdC5TIVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIHNlZSBpZiB3ZSBoYXZlIG5vIG9yIG1vcmUgdGhhbiBvbmUgU2Vzc2lvbnMgcmV0cmlldmVkIGFuZCByZXR1cm4gdGhlIGFwcHJvcHJpYXRlIGVycm9yIGFuZCBtZXNzYWdlXG4gICAgICAgICAgICBpZiAocmVzdWx0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyBQbGFpZCBMaW5rIFNlc3Npb24gZm91bmQgZm9yIHRva2VuICR7Z2V0UGxhaWRMaW5raW5nU2Vzc2lvbkJ5VG9rZW5JbnB1dC5saW5rX3Rva2VufSFgO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBQbGFpZExpbmtpbmdFcnJvclR5cGUuTm9uZU9yQWJzZW50XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChyZXN1bHQubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBNb3JlIHRoYW4gb25lIFBsYWlkIExpbmsgU2Vzc2lvbiByZXRyaWV2ZWQgZm9yIHRva2VuICR7Z2V0UGxhaWRMaW5raW5nU2Vzc2lvbkJ5VG9rZW5JbnB1dC5saW5rX3Rva2VufSFgO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBQbGFpZExpbmtpbmdFcnJvclR5cGUuRHVwbGljYXRlT2JqZWN0Rm91bmRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBJc3N1ZXMgd2hpbGUgcmV0cmlldmluZyBQbGFpZCBMaW5rIFNlc3Npb24gZm9yIHRva2VuICR7Z2V0UGxhaWRMaW5raW5nU2Vzc2lvbkJ5VG9rZW5JbnB1dC5saW5rX3Rva2VufSFgO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBQbGFpZExpbmtpbmdFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyAke2ZpZWxkTmFtZX0gbXV0YXRpb24gJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBQbGFpZExpbmtpbmdFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=