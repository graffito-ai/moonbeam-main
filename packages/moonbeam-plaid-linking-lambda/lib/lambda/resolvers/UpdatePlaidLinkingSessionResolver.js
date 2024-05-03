"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePlaidLinkingSession = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
/**
 * UpdatePlaidLinkingSessionResolver resolver
 *
 * @param updatePlaidLinkingSessionInput the input needed to update an existing plaid linking session's data
 * @param fieldName name of the resolver path from the AppSync event
 * @returns {@link Promise} of {@link PlaidLinkingSessionResponse}
 */
const updatePlaidLinkingSession = async (fieldName, updatePlaidLinkingSessionInput) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // initializing the DynamoDB document client
        const dynamoDbClient = new client_dynamodb_1.DynamoDBClient({ region: region });
        // update the timestamps accordingly
        const updatedAt = new Date().toISOString();
        updatePlaidLinkingSessionInput.updatedAt = updatePlaidLinkingSessionInput.updatedAt ? updatePlaidLinkingSessionInput.updatedAt : updatedAt;
        /**
         * the data to be retrieved from the Query Command
         * the eligible user Items returned from the Query Command, all aggregated together
         * the last evaluated key, to help with the pagination of results
         */
        let result = [];
        let exclusiveStartKey, retrievedData;
        do {
            /**
             * retrieve the Plaid Linking Session for a particular user, given the local secondary index and the link token observed.
             *
             * Limit of 1 MB per paginated response data (in our case 1 item). It does not matter what the average size for an item is,
             * since we only will have 1 item stored per link token anyway.
             *
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.Pagination.html}
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html}
             */
            retrievedData = await dynamoDbClient.send(new client_dynamodb_1.QueryCommand({
                TableName: process.env.PLAID_LINKING_SESSIONS_TABLE,
                IndexName: `${process.env.PLAID_LINK_TOKEN_LOCAL_INDEX}-${process.env.ENV_NAME}-${region}`,
                ...(exclusiveStartKey && { ExclusiveStartKey: exclusiveStartKey }),
                Limit: 1,
                ExpressionAttributeNames: {
                    '#idf': 'id',
                    '#lTk': 'link_token'
                },
                ExpressionAttributeValues: {
                    ":idf": {
                        S: updatePlaidLinkingSessionInput.id
                    },
                    ':lTk': {
                        S: updatePlaidLinkingSessionInput.link_token
                    }
                },
                KeyConditionExpression: '#idf = :idf AND #lTk = :lTk'
            }));
            exclusiveStartKey = retrievedData.LastEvaluatedKey;
            result = result.concat(retrievedData.Items);
        } while (retrievedData && retrievedData.Count && retrievedData.Items &&
            retrievedData.Items.length && retrievedData.Count !== 0 &&
            retrievedData.Items.length !== 0 && retrievedData.LastEvaluatedKey);
        // if there is a Plaid Link Session retrieved, then return them accordingly
        if (result && result.length === 1) {
            // update the Plaid Linking Session object based on the passed in object
            await dynamoDbClient.send(new client_dynamodb_1.UpdateItemCommand({
                TableName: process.env.PLAID_LINKING_SESSIONS_TABLE,
                Key: {
                    id: {
                        S: updatePlaidLinkingSessionInput.id
                    },
                    timestamp: {
                        N: result[0].timestamp.N
                    }
                },
                ExpressionAttributeNames: {
                    "#stat": "status",
                    "#sId": "sessionId",
                    "#pTk": "public_token",
                    "#uat": "updatedAt"
                },
                ExpressionAttributeValues: {
                    ":stat": {
                        S: updatePlaidLinkingSessionInput.status
                    },
                    ":sId": {
                        S: updatePlaidLinkingSessionInput.session_id
                    },
                    ":pTk": {
                        S: updatePlaidLinkingSessionInput.public_token
                    },
                    ":at": {
                        S: updatePlaidLinkingSessionInput.updatedAt
                    }
                },
                UpdateExpression: "SET #stat = :stat, #sId = :sId, #pTk = :pTk, #uat = :at",
                ReturnValues: "UPDATED_NEW"
            }));
            // return the updated PLaid Linking Session's details
            return {
                data: {
                    createdAt: result[0].createdAt.S,
                    expiration: result[0].expiration.S,
                    hosted_link_url: result[0].hosted_link_url.S,
                    id: result[0].id.S,
                    link_token: result[0].link_token.S,
                    public_token: updatePlaidLinkingSessionInput.public_token,
                    request_id: result[0].request_id.S,
                    session_id: updatePlaidLinkingSessionInput.session_id,
                    status: updatePlaidLinkingSessionInput.status,
                    timestamp: Number(result[0].request_id.N),
                    updatedAt: updatePlaidLinkingSessionInput.updatedAt
                }
            };
        }
        else {
            const errorMessage = `Unknown Plaid Link Session object to update, for user ${updatePlaidLinkingSessionInput.id} and token ${updatePlaidLinkingSessionInput.link_token}!`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.PlaidLinkingErrorType.NoneOrAbsent
            };
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
exports.updatePlaidLinkingSession = updatePlaidLinkingSession;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXBkYXRlUGxhaWRMaW5raW5nU2Vzc2lvblJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvVXBkYXRlUGxhaWRMaW5raW5nU2Vzc2lvblJlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtEQUltQztBQUNuQyw4REFBeUc7QUFFekc7Ozs7OztHQU1HO0FBQ0ksTUFBTSx5QkFBeUIsR0FBRyxLQUFLLEVBQUUsU0FBaUIsRUFBRSw4QkFBOEQsRUFBd0MsRUFBRTtJQUN2SyxJQUFJO1FBQ0EseUNBQXlDO1FBQ3pDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVyxDQUFDO1FBRXZDLDRDQUE0QztRQUM1QyxNQUFNLGNBQWMsR0FBRyxJQUFJLGdDQUFjLENBQUMsRUFBQyxNQUFNLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQztRQUU1RCxvQ0FBb0M7UUFDcEMsTUFBTSxTQUFTLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUMzQyw4QkFBOEIsQ0FBQyxTQUFTLEdBQUcsOEJBQThCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyw4QkFBOEIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUUzSTs7OztXQUlHO1FBQ0gsSUFBSSxNQUFNLEdBQXFDLEVBQUUsQ0FBQztRQUNsRCxJQUFJLGlCQUFpQixFQUFFLGFBQWEsQ0FBQztRQUVyQyxHQUFHO1lBQ0M7Ozs7Ozs7O2VBUUc7WUFDSCxhQUFhLEdBQUcsTUFBTSxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksOEJBQVksQ0FBQztnQkFDdkQsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsNEJBQTZCO2dCQUNwRCxTQUFTLEVBQUUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLDRCQUE2QixJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUyxJ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LENBQUU7b0JBQ25DLFVBQVUsRUFBRSw4QkFBOEIsQ0FBQyxVQUFVO29CQUNyRCxNQUFNLEVBQUUsOEJBQThCLENBQUMsTUFBTTtvQkFDN0MsU0FBUyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUUsQ0FBQztvQkFDMUMsU0FBUyxFQUFFLDhCQUE4QixDQUFDLFNBQVM7aUJBQ3REO2FBQ0osQ0FBQTtTQUNKO2FBQU07WUFDSCxNQUFNLFlBQVksR0FBRyx5REFBeUQsOEJBQThCLENBQUMsRUFBRSxjQUFjLDhCQUE4QixDQUFDLFVBQVUsR0FBRyxDQUFDO1lBQzFLLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFMUIsT0FBTztnQkFDSCxZQUFZLEVBQUUsWUFBWTtnQkFDMUIsU0FBUyxFQUFFLHVDQUFxQixDQUFDLFlBQVk7YUFDaEQsQ0FBQTtTQUNKO0tBQ0o7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLE1BQU0sWUFBWSxHQUFHLG9DQUFvQyxTQUFTLGFBQWEsR0FBRyxFQUFFLENBQUM7UUFDckYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMxQixPQUFPO1lBQ0gsWUFBWSxFQUFFLFlBQVk7WUFDMUIsU0FBUyxFQUFFLHVDQUFxQixDQUFDLGVBQWU7U0FDbkQsQ0FBQTtLQUNKO0FBQ0wsQ0FBQyxDQUFBO0FBOUhZLFFBQUEseUJBQXlCLDZCQThIckMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIFBsYWlkTGlua2luZ0Vycm9yVHlwZSxcbiAgICBQbGFpZExpbmtpbmdTZXNzaW9uUmVzcG9uc2UsXG4gICAgVXBkYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0XG59IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5pbXBvcnQge0F0dHJpYnV0ZVZhbHVlLCBEeW5hbW9EQkNsaWVudCwgUXVlcnlDb21tYW5kLCBVcGRhdGVJdGVtQ29tbWFuZH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1keW5hbW9kYlwiO1xuXG4vKipcbiAqIFVwZGF0ZVBsYWlkTGlua2luZ1Nlc3Npb25SZXNvbHZlciByZXNvbHZlclxuICpcbiAqIEBwYXJhbSB1cGRhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQgdGhlIGlucHV0IG5lZWRlZCB0byB1cGRhdGUgYW4gZXhpc3RpbmcgcGxhaWQgbGlua2luZyBzZXNzaW9uJ3MgZGF0YVxuICogQHBhcmFtIGZpZWxkTmFtZSBuYW1lIG9mIHRoZSByZXNvbHZlciBwYXRoIGZyb20gdGhlIEFwcFN5bmMgZXZlbnRcbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgUGxhaWRMaW5raW5nU2Vzc2lvblJlc3BvbnNlfVxuICovXG5leHBvcnQgY29uc3QgdXBkYXRlUGxhaWRMaW5raW5nU2Vzc2lvbiA9IGFzeW5jIChmaWVsZE5hbWU6IHN0cmluZywgdXBkYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0OiBVcGRhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQpOiBQcm9taXNlPFBsYWlkTGlua2luZ1Nlc3Npb25SZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIGluaXRpYWxpemluZyB0aGUgRHluYW1vREIgZG9jdW1lbnQgY2xpZW50XG4gICAgICAgIGNvbnN0IGR5bmFtb0RiQ2xpZW50ID0gbmV3IER5bmFtb0RCQ2xpZW50KHtyZWdpb246IHJlZ2lvbn0pO1xuXG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgdGltZXN0YW1wcyBhY2NvcmRpbmdseVxuICAgICAgICBjb25zdCB1cGRhdGVkQXQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIHVwZGF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC51cGRhdGVkQXQgPSB1cGRhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQudXBkYXRlZEF0ID8gdXBkYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0LnVwZGF0ZWRBdCA6IHVwZGF0ZWRBdDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogdGhlIGRhdGEgdG8gYmUgcmV0cmlldmVkIGZyb20gdGhlIFF1ZXJ5IENvbW1hbmRcbiAgICAgICAgICogdGhlIGVsaWdpYmxlIHVzZXIgSXRlbXMgcmV0dXJuZWQgZnJvbSB0aGUgUXVlcnkgQ29tbWFuZCwgYWxsIGFnZ3JlZ2F0ZWQgdG9nZXRoZXJcbiAgICAgICAgICogdGhlIGxhc3QgZXZhbHVhdGVkIGtleSwgdG8gaGVscCB3aXRoIHRoZSBwYWdpbmF0aW9uIG9mIHJlc3VsdHNcbiAgICAgICAgICovXG4gICAgICAgIGxldCByZXN1bHQ6IFJlY29yZDxzdHJpbmcsIEF0dHJpYnV0ZVZhbHVlPltdID0gW107XG4gICAgICAgIGxldCBleGNsdXNpdmVTdGFydEtleSwgcmV0cmlldmVkRGF0YTtcblxuICAgICAgICBkbyB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIHJldHJpZXZlIHRoZSBQbGFpZCBMaW5raW5nIFNlc3Npb24gZm9yIGEgcGFydGljdWxhciB1c2VyLCBnaXZlbiB0aGUgbG9jYWwgc2Vjb25kYXJ5IGluZGV4IGFuZCB0aGUgbGluayB0b2tlbiBvYnNlcnZlZC5cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBMaW1pdCBvZiAxIE1CIHBlciBwYWdpbmF0ZWQgcmVzcG9uc2UgZGF0YSAoaW4gb3VyIGNhc2UgMSBpdGVtKS4gSXQgZG9lcyBub3QgbWF0dGVyIHdoYXQgdGhlIGF2ZXJhZ2Ugc2l6ZSBmb3IgYW4gaXRlbSBpcyxcbiAgICAgICAgICAgICAqIHNpbmNlIHdlIG9ubHkgd2lsbCBoYXZlIDEgaXRlbSBzdG9yZWQgcGVyIGxpbmsgdG9rZW4gYW55d2F5LlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIEBsaW5rIHtodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL1F1ZXJ5LlBhZ2luYXRpb24uaHRtbH1cbiAgICAgICAgICAgICAqIEBsaW5rIHtodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL1F1ZXJ5Lmh0bWx9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHJldHJpZXZlZERhdGEgPSBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBRdWVyeUNvbW1hbmQoe1xuICAgICAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuUExBSURfTElOS0lOR19TRVNTSU9OU19UQUJMRSEsXG4gICAgICAgICAgICAgICAgSW5kZXhOYW1lOiBgJHtwcm9jZXNzLmVudi5QTEFJRF9MSU5LX1RPS0VOX0xPQ0FMX0lOREVYIX0tJHtwcm9jZXNzLmVudi5FTlZfTkFNRSF9LSR7cmVnaW9ufWAsXG4gICAgICAgICAgICAgICAgLi4uKGV4Y2x1c2l2ZVN0YXJ0S2V5ICYmIHtFeGNsdXNpdmVTdGFydEtleTogZXhjbHVzaXZlU3RhcnRLZXl9KSxcbiAgICAgICAgICAgICAgICBMaW1pdDogMSxcbiAgICAgICAgICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlTmFtZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgJyNpZGYnOiAnaWQnLFxuICAgICAgICAgICAgICAgICAgICAnI2xUayc6ICdsaW5rX3Rva2VuJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlczoge1xuICAgICAgICAgICAgICAgICAgICBcIjppZGZcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogdXBkYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0LmlkXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICc6bFRrJzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogdXBkYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0LmxpbmtfdG9rZW5cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgS2V5Q29uZGl0aW9uRXhwcmVzc2lvbjogJyNpZGYgPSA6aWRmIEFORCAjbFRrID0gOmxUaydcbiAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgZXhjbHVzaXZlU3RhcnRLZXkgPSByZXRyaWV2ZWREYXRhLkxhc3RFdmFsdWF0ZWRLZXk7XG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KHJldHJpZXZlZERhdGEuSXRlbXMpO1xuICAgICAgICB9IHdoaWxlIChyZXRyaWV2ZWREYXRhICYmIHJldHJpZXZlZERhdGEuQ291bnQgJiYgcmV0cmlldmVkRGF0YS5JdGVtcyAmJlxuICAgICAgICByZXRyaWV2ZWREYXRhLkl0ZW1zLmxlbmd0aCAmJiByZXRyaWV2ZWREYXRhLkNvdW50ICE9PSAwICYmXG4gICAgICAgIHJldHJpZXZlZERhdGEuSXRlbXMubGVuZ3RoICE9PSAwICYmIHJldHJpZXZlZERhdGEuTGFzdEV2YWx1YXRlZEtleSk7XG5cbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgYSBQbGFpZCBMaW5rIFNlc3Npb24gcmV0cmlldmVkLCB0aGVuIHJldHVybiB0aGVtIGFjY29yZGluZ2x5XG4gICAgICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgLy8gdXBkYXRlIHRoZSBQbGFpZCBMaW5raW5nIFNlc3Npb24gb2JqZWN0IGJhc2VkIG9uIHRoZSBwYXNzZWQgaW4gb2JqZWN0XG4gICAgICAgICAgICBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBVcGRhdGVJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5QTEFJRF9MSU5LSU5HX1NFU1NJT05TX1RBQkxFISxcbiAgICAgICAgICAgICAgICBLZXk6IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IHVwZGF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC5pZFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIE46IHJlc3VsdFswXS50aW1lc3RhbXAuTiFcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiI3N0YXRcIjogXCJzdGF0dXNcIixcbiAgICAgICAgICAgICAgICAgICAgXCIjc0lkXCI6IFwic2Vzc2lvbklkXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiI3BUa1wiOiBcInB1YmxpY190b2tlblwiLFxuICAgICAgICAgICAgICAgICAgICBcIiN1YXRcIjogXCJ1cGRhdGVkQXRcIlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlczoge1xuICAgICAgICAgICAgICAgICAgICBcIjpzdGF0XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IHVwZGF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC5zdGF0dXNcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgXCI6c0lkXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IHVwZGF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC5zZXNzaW9uX2lkXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIFwiOnBUa1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiB1cGRhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQucHVibGljX3Rva2VuXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIFwiOmF0XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IHVwZGF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC51cGRhdGVkQXRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgVXBkYXRlRXhwcmVzc2lvbjogXCJTRVQgI3N0YXQgPSA6c3RhdCwgI3NJZCA9IDpzSWQsICNwVGsgPSA6cFRrLCAjdWF0ID0gOmF0XCIsXG4gICAgICAgICAgICAgICAgUmV0dXJuVmFsdWVzOiBcIlVQREFURURfTkVXXCJcbiAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSB1cGRhdGVkIFBMYWlkIExpbmtpbmcgU2Vzc2lvbidzIGRldGFpbHNcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IHJlc3VsdFswXS5jcmVhdGVkQXQuUyEsXG4gICAgICAgICAgICAgICAgICAgIGV4cGlyYXRpb246IHJlc3VsdFswXS5leHBpcmF0aW9uLlMhLFxuICAgICAgICAgICAgICAgICAgICBob3N0ZWRfbGlua191cmw6IHJlc3VsdFswXS5ob3N0ZWRfbGlua191cmwuUyEsXG4gICAgICAgICAgICAgICAgICAgIGlkOiByZXN1bHRbMF0uaWQuUyEsXG4gICAgICAgICAgICAgICAgICAgIGxpbmtfdG9rZW46IHJlc3VsdFswXS5saW5rX3Rva2VuLlMhLFxuICAgICAgICAgICAgICAgICAgICBwdWJsaWNfdG9rZW46IHVwZGF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC5wdWJsaWNfdG9rZW4sXG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3RfaWQ6IHJlc3VsdFswXS5yZXF1ZXN0X2lkLlMhLFxuICAgICAgICAgICAgICAgICAgICBzZXNzaW9uX2lkOiB1cGRhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQuc2Vzc2lvbl9pZCxcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiB1cGRhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQuc3RhdHVzLFxuICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IE51bWJlcihyZXN1bHRbMF0ucmVxdWVzdF9pZC5OISksXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBdDogdXBkYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0LnVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmtub3duIFBsYWlkIExpbmsgU2Vzc2lvbiBvYmplY3QgdG8gdXBkYXRlLCBmb3IgdXNlciAke3VwZGF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC5pZH0gYW5kIHRva2VuICR7dXBkYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0LmxpbmtfdG9rZW59IWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogUGxhaWRMaW5raW5nRXJyb3JUeXBlLk5vbmVPckFic2VudFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyAke2ZpZWxkTmFtZX0gbXV0YXRpb24gJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBQbGFpZExpbmtpbmdFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=