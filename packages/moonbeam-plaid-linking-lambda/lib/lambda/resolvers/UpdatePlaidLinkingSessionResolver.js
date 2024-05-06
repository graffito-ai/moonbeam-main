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
 * @returns {@link Promise} of {@link UpdatePlaidLinkingSessionResponse}
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
                id: updatePlaidLinkingSessionInput.id,
                timestamp: Number(result[0].timestamp.N),
                link_token: result[0].link_token.S,
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
                    timestamp: Number(result[0].timestamp.N),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXBkYXRlUGxhaWRMaW5raW5nU2Vzc2lvblJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvVXBkYXRlUGxhaWRMaW5raW5nU2Vzc2lvblJlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtEQUltQztBQUNuQyw4REFBeUc7QUFFekc7Ozs7OztHQU1HO0FBQ0ksTUFBTSx5QkFBeUIsR0FBRyxLQUFLLEVBQUUsU0FBaUIsRUFBRSw4QkFBOEQsRUFBOEMsRUFBRTtJQUM3SyxJQUFJO1FBQ0EseUNBQXlDO1FBQ3pDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVyxDQUFDO1FBRXZDLDRDQUE0QztRQUM1QyxNQUFNLGNBQWMsR0FBRyxJQUFJLGdDQUFjLENBQUMsRUFBQyxNQUFNLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQztRQUU1RCxvQ0FBb0M7UUFDcEMsTUFBTSxTQUFTLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUMzQyw4QkFBOEIsQ0FBQyxTQUFTLEdBQUcsOEJBQThCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyw4QkFBOEIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUUzSTs7OztXQUlHO1FBQ0gsSUFBSSxNQUFNLEdBQXFDLEVBQUUsQ0FBQztRQUNsRCxJQUFJLGlCQUFpQixFQUFFLGFBQWEsQ0FBQztRQUVyQyxHQUFHO1lBQ0M7Ozs7Ozs7O2VBUUc7WUFDSCxhQUFhLEdBQUcsTUFBTSxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksOEJBQVksQ0FBQztnQkFDdkQsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsNEJBQTZCO2dCQUNwRCxTQUFTLEVBQUUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLDRCQUE2QixJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUyxJ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LENBQUMsRUFBRSxDQUFDLENBQUU7b0JBQ25CLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUU7b0JBQ25DLFlBQVksRUFBRSw4QkFBOEIsQ0FBQyxZQUFZO29CQUN6RCxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFFO29CQUNuQyxVQUFVLEVBQUUsOEJBQThCLENBQUMsVUFBVTtvQkFDckQsTUFBTSxFQUFFLDhCQUE4QixDQUFDLE1BQU07b0JBQzdDLFNBQVMsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFFLENBQUM7b0JBQ3pDLFNBQVMsRUFBRSw4QkFBOEIsQ0FBQyxTQUFTO2lCQUN0RDthQUNKLENBQUE7U0FDSjthQUFNO1lBQ0gsTUFBTSxZQUFZLEdBQUcseURBQXlELDhCQUE4QixDQUFDLEVBQUUsY0FBYyw4QkFBOEIsQ0FBQyxVQUFVLEdBQUcsQ0FBQztZQUMxSyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRTFCLE9BQU87Z0JBQ0gsWUFBWSxFQUFFLFlBQVk7Z0JBQzFCLFNBQVMsRUFBRSx1Q0FBcUIsQ0FBQyxZQUFZO2FBQ2hELENBQUE7U0FDSjtLQUNKO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVixNQUFNLFlBQVksR0FBRyxvQ0FBb0MsU0FBUyxhQUFhLEdBQUcsRUFBRSxDQUFDO1FBQ3JGLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUIsT0FBTztZQUNILFlBQVksRUFBRSxZQUFZO1lBQzFCLFNBQVMsRUFBRSx1Q0FBcUIsQ0FBQyxlQUFlO1NBQ25ELENBQUE7S0FDSjtBQUNMLENBQUMsQ0FBQTtBQWpJWSxRQUFBLHlCQUF5Qiw2QkFpSXJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBQbGFpZExpbmtpbmdFcnJvclR5cGUsXG4gICAgVXBkYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0LFxuICAgIFVwZGF0ZVBsYWlkTGlua2luZ1Nlc3Npb25SZXNwb25zZVxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuaW1wb3J0IHtBdHRyaWJ1dGVWYWx1ZSwgRHluYW1vREJDbGllbnQsIFF1ZXJ5Q29tbWFuZCwgVXBkYXRlSXRlbUNvbW1hbmR9IGZyb20gXCJAYXdzLXNkay9jbGllbnQtZHluYW1vZGJcIjtcblxuLyoqXG4gKiBVcGRhdGVQbGFpZExpbmtpbmdTZXNzaW9uUmVzb2x2ZXIgcmVzb2x2ZXJcbiAqXG4gKiBAcGFyYW0gdXBkYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0IHRoZSBpbnB1dCBuZWVkZWQgdG8gdXBkYXRlIGFuIGV4aXN0aW5nIHBsYWlkIGxpbmtpbmcgc2Vzc2lvbidzIGRhdGFcbiAqIEBwYXJhbSBmaWVsZE5hbWUgbmFtZSBvZiB0aGUgcmVzb2x2ZXIgcGF0aCBmcm9tIHRoZSBBcHBTeW5jIGV2ZW50XG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIFVwZGF0ZVBsYWlkTGlua2luZ1Nlc3Npb25SZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IHVwZGF0ZVBsYWlkTGlua2luZ1Nlc3Npb24gPSBhc3luYyAoZmllbGROYW1lOiBzdHJpbmcsIHVwZGF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dDogVXBkYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0KTogUHJvbWlzZTxVcGRhdGVQbGFpZExpbmtpbmdTZXNzaW9uUmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvLyBpbml0aWFsaXppbmcgdGhlIER5bmFtb0RCIGRvY3VtZW50IGNsaWVudFxuICAgICAgICBjb25zdCBkeW5hbW9EYkNsaWVudCA9IG5ldyBEeW5hbW9EQkNsaWVudCh7cmVnaW9uOiByZWdpb259KTtcblxuICAgICAgICAvLyB1cGRhdGUgdGhlIHRpbWVzdGFtcHMgYWNjb3JkaW5nbHlcbiAgICAgICAgY29uc3QgdXBkYXRlZEF0ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgICB1cGRhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQudXBkYXRlZEF0ID0gdXBkYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0LnVwZGF0ZWRBdCA/IHVwZGF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC51cGRhdGVkQXQgOiB1cGRhdGVkQXQ7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIHRoZSBkYXRhIHRvIGJlIHJldHJpZXZlZCBmcm9tIHRoZSBRdWVyeSBDb21tYW5kXG4gICAgICAgICAqIHRoZSBlbGlnaWJsZSB1c2VyIEl0ZW1zIHJldHVybmVkIGZyb20gdGhlIFF1ZXJ5IENvbW1hbmQsIGFsbCBhZ2dyZWdhdGVkIHRvZ2V0aGVyXG4gICAgICAgICAqIHRoZSBsYXN0IGV2YWx1YXRlZCBrZXksIHRvIGhlbHAgd2l0aCB0aGUgcGFnaW5hdGlvbiBvZiByZXN1bHRzXG4gICAgICAgICAqL1xuICAgICAgICBsZXQgcmVzdWx0OiBSZWNvcmQ8c3RyaW5nLCBBdHRyaWJ1dGVWYWx1ZT5bXSA9IFtdO1xuICAgICAgICBsZXQgZXhjbHVzaXZlU3RhcnRLZXksIHJldHJpZXZlZERhdGE7XG5cbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiByZXRyaWV2ZSB0aGUgUGxhaWQgTGlua2luZyBTZXNzaW9uIGZvciBhIHBhcnRpY3VsYXIgdXNlciwgZ2l2ZW4gdGhlIGxvY2FsIHNlY29uZGFyeSBpbmRleCBhbmQgdGhlIGxpbmsgdG9rZW4gb2JzZXJ2ZWQuXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogTGltaXQgb2YgMSBNQiBwZXIgcGFnaW5hdGVkIHJlc3BvbnNlIGRhdGEgKGluIG91ciBjYXNlIDEgaXRlbSkuIEl0IGRvZXMgbm90IG1hdHRlciB3aGF0IHRoZSBhdmVyYWdlIHNpemUgZm9yIGFuIGl0ZW0gaXMsXG4gICAgICAgICAgICAgKiBzaW5jZSB3ZSBvbmx5IHdpbGwgaGF2ZSAxIGl0ZW0gc3RvcmVkIHBlciBsaW5rIHRva2VuIGFueXdheS5cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAbGluayB7aHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2FtYXpvbmR5bmFtb2RiL2xhdGVzdC9kZXZlbG9wZXJndWlkZS9RdWVyeS5QYWdpbmF0aW9uLmh0bWx9XG4gICAgICAgICAgICAgKiBAbGluayB7aHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2FtYXpvbmR5bmFtb2RiL2xhdGVzdC9kZXZlbG9wZXJndWlkZS9RdWVyeS5odG1sfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICByZXRyaWV2ZWREYXRhID0gYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgUXVlcnlDb21tYW5kKHtcbiAgICAgICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LlBMQUlEX0xJTktJTkdfU0VTU0lPTlNfVEFCTEUhLFxuICAgICAgICAgICAgICAgIEluZGV4TmFtZTogYCR7cHJvY2Vzcy5lbnYuUExBSURfTElOS19UT0tFTl9MT0NBTF9JTkRFWCF9LSR7cHJvY2Vzcy5lbnYuRU5WX05BTUUhfS0ke3JlZ2lvbn1gLFxuICAgICAgICAgICAgICAgIC4uLihleGNsdXNpdmVTdGFydEtleSAmJiB7RXhjbHVzaXZlU3RhcnRLZXk6IGV4Y2x1c2l2ZVN0YXJ0S2V5fSksXG4gICAgICAgICAgICAgICAgTGltaXQ6IDEsXG4gICAgICAgICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICcjaWRmJzogJ2lkJyxcbiAgICAgICAgICAgICAgICAgICAgJyNsVGsnOiAnbGlua190b2tlbidcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCI6aWRmXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IHVwZGF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC5pZFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAnOmxUayc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IHVwZGF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC5saW5rX3Rva2VuXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIEtleUNvbmRpdGlvbkV4cHJlc3Npb246ICcjaWRmID0gOmlkZiBBTkQgI2xUayA9IDpsVGsnXG4gICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgIGV4Y2x1c2l2ZVN0YXJ0S2V5ID0gcmV0cmlldmVkRGF0YS5MYXN0RXZhbHVhdGVkS2V5O1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdChyZXRyaWV2ZWREYXRhLkl0ZW1zKTtcbiAgICAgICAgfSB3aGlsZSAocmV0cmlldmVkRGF0YSAmJiByZXRyaWV2ZWREYXRhLkNvdW50ICYmIHJldHJpZXZlZERhdGEuSXRlbXMgJiZcbiAgICAgICAgcmV0cmlldmVkRGF0YS5JdGVtcy5sZW5ndGggJiYgcmV0cmlldmVkRGF0YS5Db3VudCAhPT0gMCAmJlxuICAgICAgICByZXRyaWV2ZWREYXRhLkl0ZW1zLmxlbmd0aCAhPT0gMCAmJiByZXRyaWV2ZWREYXRhLkxhc3RFdmFsdWF0ZWRLZXkpO1xuXG4gICAgICAgIC8vIGlmIHRoZXJlIGlzIGEgUGxhaWQgTGluayBTZXNzaW9uIHJldHJpZXZlZCwgdGhlbiByZXR1cm4gdGhlbSBhY2NvcmRpbmdseVxuICAgICAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIC8vIHVwZGF0ZSB0aGUgUGxhaWQgTGlua2luZyBTZXNzaW9uIG9iamVjdCBiYXNlZCBvbiB0aGUgcGFzc2VkIGluIG9iamVjdFxuICAgICAgICAgICAgYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgVXBkYXRlSXRlbUNvbW1hbmQoe1xuICAgICAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuUExBSURfTElOS0lOR19TRVNTSU9OU19UQUJMRSEsXG4gICAgICAgICAgICAgICAgS2V5OiB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiB1cGRhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQuaWRcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBOOiByZXN1bHRbMF0udGltZXN0YW1wLk4hXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lczoge1xuICAgICAgICAgICAgICAgICAgICBcIiNzdGF0XCI6IFwic3RhdHVzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiI3NJZFwiOiBcInNlc3Npb25JZFwiLFxuICAgICAgICAgICAgICAgICAgICBcIiNwVGtcIjogXCJwdWJsaWNfdG9rZW5cIixcbiAgICAgICAgICAgICAgICAgICAgXCIjdWF0XCI6IFwidXBkYXRlZEF0XCJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCI6c3RhdFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiB1cGRhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQuc3RhdHVzXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIFwiOnNJZFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiB1cGRhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQuc2Vzc2lvbl9pZFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBcIjpwVGtcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogdXBkYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0LnB1YmxpY190b2tlblxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBcIjphdFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiB1cGRhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQudXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIFVwZGF0ZUV4cHJlc3Npb246IFwiU0VUICNzdGF0ID0gOnN0YXQsICNzSWQgPSA6c0lkLCAjcFRrID0gOnBUaywgI3VhdCA9IDphdFwiLFxuICAgICAgICAgICAgICAgIFJldHVyblZhbHVlczogXCJVUERBVEVEX05FV1wiXG4gICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgIC8vIHJldHVybiB0aGUgdXBkYXRlZCBQTGFpZCBMaW5raW5nIFNlc3Npb24ncyBkZXRhaWxzXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGlkOiB1cGRhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQuaWQsXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wOiBOdW1iZXIocmVzdWx0WzBdLnRpbWVzdGFtcC5OISksXG4gICAgICAgICAgICAgICAgbGlua190b2tlbjogcmVzdWx0WzBdLmxpbmtfdG9rZW4uUyEsXG4gICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IHJlc3VsdFswXS5jcmVhdGVkQXQuUyEsXG4gICAgICAgICAgICAgICAgICAgIGV4cGlyYXRpb246IHJlc3VsdFswXS5leHBpcmF0aW9uLlMhLFxuICAgICAgICAgICAgICAgICAgICBob3N0ZWRfbGlua191cmw6IHJlc3VsdFswXS5ob3N0ZWRfbGlua191cmwuUyEsXG4gICAgICAgICAgICAgICAgICAgIGlkOiByZXN1bHRbMF0uaWQuUyEsXG4gICAgICAgICAgICAgICAgICAgIGxpbmtfdG9rZW46IHJlc3VsdFswXS5saW5rX3Rva2VuLlMhLFxuICAgICAgICAgICAgICAgICAgICBwdWJsaWNfdG9rZW46IHVwZGF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC5wdWJsaWNfdG9rZW4sXG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3RfaWQ6IHJlc3VsdFswXS5yZXF1ZXN0X2lkLlMhLFxuICAgICAgICAgICAgICAgICAgICBzZXNzaW9uX2lkOiB1cGRhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQuc2Vzc2lvbl9pZCxcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiB1cGRhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQuc3RhdHVzLFxuICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IE51bWJlcihyZXN1bHRbMF0udGltZXN0YW1wLk4hKSxcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEF0OiB1cGRhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQudXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVua25vd24gUGxhaWQgTGluayBTZXNzaW9uIG9iamVjdCB0byB1cGRhdGUsIGZvciB1c2VyICR7dXBkYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0LmlkfSBhbmQgdG9rZW4gJHt1cGRhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQubGlua190b2tlbn0hYDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBQbGFpZExpbmtpbmdFcnJvclR5cGUuTm9uZU9yQWJzZW50XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nICR7ZmllbGROYW1lfSBtdXRhdGlvbiAke2Vycn1gO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICBlcnJvclR5cGU6IFBsYWlkTGlua2luZ0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==