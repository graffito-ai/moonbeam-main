"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEligibleLinkedUsers = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * GetEligibleLinkedUsers resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @returns {@link Promise} of {@link EligibleLinkedUsersResponse}
 */
const getEligibleLinkedUsers = async (fieldName) => {
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
             * retrieve all the eligible linked users, given the global secondary index, as well as the LINKED status to be queried by
             *
             * Limit of 1 MB per paginated response data (in our case 1,200 items). An average size for an Item is about 645 bytes, which means that we won't
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
            result = result.concat(retrievedData.Items);
        } while (retrievedData && retrievedData.Count && retrievedData.Items &&
            retrievedData.Items.length && retrievedData.Count !== 0 &&
            retrievedData.Items.length !== 0 && retrievedData.LastEvaluatedKey);
        // if there are eligible users retrieved, then return them accordingly
        if (result && result.length !== 0) {
            // convert the Dynamo DB data from Dynamo DB JSON format to a Moonbeam eligible users data format
            const eligibleUsersData = [];
            result.forEach(eligibleUserResult => {
                // get all card ids for the eligible user
                const cardIDs = [];
                for (const linkedCard of eligibleUserResult.cards.L) {
                    cardIDs.push(linkedCard.M.id.S);
                }
                // construct an eligible user to return in the list of users
                const eligibleUser = {
                    id: eligibleUserResult.id.S,
                    memberId: eligibleUserResult.memberId.S,
                    cardIds: cardIDs
                };
                eligibleUsersData.push(eligibleUser);
            });
            // return the list of eligible users
            return {
                data: eligibleUsersData
            };
        }
        else {
            const errorMessage = `Eligible linked users not found!`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.CardLinkErrorType.NoneOrAbsent
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
exports.getEligibleLinkedUsers = getEligibleLinkedUsers;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0RWxpZ2libGVMaW5rZWRVc2Vyc1Jlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvR2V0RWxpZ2libGVMaW5rZWRVc2Vyc1Jlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDhEQUFzRjtBQUN0RiwrREFLbUM7QUFFbkM7Ozs7O0dBS0c7QUFDSSxNQUFNLHNCQUFzQixHQUFHLEtBQUssRUFBRSxTQUFpQixFQUF3QyxFQUFFO0lBQ3BHLElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsNENBQTRDO1FBQzVDLE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBRTVEOzs7O1dBSUc7UUFDSCxJQUFJLE1BQU0sR0FBcUMsRUFBRSxDQUFDO1FBQ2xELElBQUksaUJBQWlCLEVBQUUsYUFBYSxDQUFDO1FBRXJDLEdBQUc7WUFDQzs7Ozs7Ozs7O2VBU0c7WUFDSCxhQUFhLEdBQUcsTUFBTSxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksOEJBQVksQ0FBQztnQkFDdkQsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQW1CO2dCQUMxQyxTQUFTLEVBQUUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGdDQUFpQyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUyxJQUFJLE1BQU0sRUFBRTtnQkFDaEcsR0FBRyxDQUFDLGlCQUFpQixJQUFJLEVBQUMsaUJBQWlCLEVBQUUsaUJBQWlCLEVBQUMsQ0FBQztnQkFDaEUsS0FBSyxFQUFFLElBQUk7Z0JBQ1g7Ozs7O21CQUtHO2dCQUNILG9CQUFvQixFQUFFLG9CQUFvQjtnQkFDMUMsd0JBQXdCLEVBQUU7b0JBQ3RCLE1BQU0sRUFBRSxJQUFJO29CQUNaLFFBQVEsRUFBRSxPQUFPO29CQUNqQixNQUFNLEVBQUUsVUFBVTtvQkFDbEIsS0FBSyxFQUFFLFFBQVE7aUJBQ2xCO2dCQUNELHlCQUF5QixFQUFFO29CQUN2QixLQUFLLEVBQUU7d0JBQ0gsQ0FBQyxFQUFFLG1DQUFpQixDQUFDLE1BQU07cUJBQzlCO2lCQUNKO2dCQUNELHNCQUFzQixFQUFFLFdBQVc7YUFDdEMsQ0FBQyxDQUFDLENBQUM7WUFFSixpQkFBaUIsR0FBRyxhQUFhLENBQUMsZ0JBQWdCLENBQUM7WUFDbkQsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQy9DLFFBQVEsYUFBYSxJQUFJLGFBQWEsQ0FBQyxLQUFLLElBQUksYUFBYSxDQUFDLEtBQUs7WUFDcEUsYUFBYSxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksYUFBYSxDQUFDLEtBQUssS0FBSyxDQUFDO1lBQ3ZELGFBQWEsQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxhQUFhLENBQUMsZ0JBQWdCLEVBQUU7UUFFcEUsc0VBQXNFO1FBQ3RFLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQy9CLGlHQUFpRztZQUNqRyxNQUFNLGlCQUFpQixHQUF5QixFQUFFLENBQUM7WUFDbkQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFO2dCQUNoQyx5Q0FBeUM7Z0JBQ3pDLE1BQU0sT0FBTyxHQUFhLEVBQUUsQ0FBQztnQkFDN0IsS0FBSyxNQUFNLFVBQVUsSUFBSSxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBRSxFQUFFO29CQUNsRCxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FBQyxDQUFDO2lCQUNyQztnQkFDRCw0REFBNEQ7Z0JBQzVELE1BQU0sWUFBWSxHQUF1QjtvQkFDckMsRUFBRSxFQUFFLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxDQUFFO29CQUM1QixRQUFRLEVBQUUsa0JBQWtCLENBQUMsUUFBUSxDQUFDLENBQUU7b0JBQ3hDLE9BQU8sRUFBRSxPQUFPO2lCQUNuQixDQUFDO2dCQUNGLGlCQUFpQixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUN6QyxDQUFDLENBQUMsQ0FBQztZQUNILG9DQUFvQztZQUNwQyxPQUFPO2dCQUNILElBQUksRUFBRSxpQkFBaUI7YUFDMUIsQ0FBQTtTQUNKO2FBQU07WUFDSCxNQUFNLFlBQVksR0FBRyxrQ0FBa0MsQ0FBQztZQUN4RCxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRTFCLE9BQU87Z0JBQ0gsWUFBWSxFQUFFLFlBQVk7Z0JBQzFCLFNBQVMsRUFBRSxtQ0FBaUIsQ0FBQyxZQUFZO2FBQzVDLENBQUE7U0FDSjtLQUNKO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVixNQUFNLFlBQVksR0FBRyxvQ0FBb0MsU0FBUyxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ2xGLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUIsT0FBTztZQUNILFlBQVksRUFBRSxZQUFZO1lBQzFCLFNBQVMsRUFBRSxtQ0FBaUIsQ0FBQyxlQUFlO1NBQy9DLENBQUM7S0FDTDtBQUNMLENBQUMsQ0FBQTtBQWxHWSxRQUFBLHNCQUFzQiwwQkFrR2xDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBdHRyaWJ1dGVWYWx1ZSwgRHluYW1vREJDbGllbnQsIFF1ZXJ5Q29tbWFuZH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1keW5hbW9kYlwiO1xuaW1wb3J0IHtcbiAgICBDYXJkTGlua0Vycm9yVHlwZSxcbiAgICBDYXJkTGlua2luZ1N0YXR1cyxcbiAgICBFbGlnaWJsZUxpbmtlZFVzZXIsXG4gICAgRWxpZ2libGVMaW5rZWRVc2Vyc1Jlc3BvbnNlXG59IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5cbi8qKlxuICogR2V0RWxpZ2libGVMaW5rZWRVc2VycyByZXNvbHZlclxuICpcbiAqIEBwYXJhbSBmaWVsZE5hbWUgbmFtZSBvZiB0aGUgcmVzb2x2ZXIgcGF0aCBmcm9tIHRoZSBBcHBTeW5jIGV2ZW50XG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIEVsaWdpYmxlTGlua2VkVXNlcnNSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGdldEVsaWdpYmxlTGlua2VkVXNlcnMgPSBhc3luYyAoZmllbGROYW1lOiBzdHJpbmcpOiBQcm9taXNlPEVsaWdpYmxlTGlua2VkVXNlcnNSZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIGluaXRpYWxpemluZyB0aGUgRHluYW1vREIgZG9jdW1lbnQgY2xpZW50XG4gICAgICAgIGNvbnN0IGR5bmFtb0RiQ2xpZW50ID0gbmV3IER5bmFtb0RCQ2xpZW50KHtyZWdpb246IHJlZ2lvbn0pO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiB0aGUgZGF0YSB0byBiZSByZXRyaWV2ZWQgZnJvbSB0aGUgUXVlcnkgQ29tbWFuZFxuICAgICAgICAgKiB0aGUgZWxpZ2libGUgdXNlciBJdGVtcyByZXR1cm5lZCBmcm9tIHRoZSBRdWVyeSBDb21tYW5kLCBhbGwgYWdncmVnYXRlZCB0b2dldGhlclxuICAgICAgICAgKiB0aGUgbGFzdCBldmFsdWF0ZWQga2V5LCB0byBoZWxwIHdpdGggdGhlIHBhZ2luYXRpb24gb2YgcmVzdWx0c1xuICAgICAgICAgKi9cbiAgICAgICAgbGV0IHJlc3VsdDogUmVjb3JkPHN0cmluZywgQXR0cmlidXRlVmFsdWU+W10gPSBbXTtcbiAgICAgICAgbGV0IGV4Y2x1c2l2ZVN0YXJ0S2V5LCByZXRyaWV2ZWREYXRhO1xuXG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogcmV0cmlldmUgYWxsIHRoZSBlbGlnaWJsZSBsaW5rZWQgdXNlcnMsIGdpdmVuIHRoZSBnbG9iYWwgc2Vjb25kYXJ5IGluZGV4LCBhcyB3ZWxsIGFzIHRoZSBMSU5LRUQgc3RhdHVzIHRvIGJlIHF1ZXJpZWQgYnlcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBMaW1pdCBvZiAxIE1CIHBlciBwYWdpbmF0ZWQgcmVzcG9uc2UgZGF0YSAoaW4gb3VyIGNhc2UgMSwyMDAgaXRlbXMpLiBBbiBhdmVyYWdlIHNpemUgZm9yIGFuIEl0ZW0gaXMgYWJvdXQgNjQ1IGJ5dGVzLCB3aGljaCBtZWFucyB0aGF0IHdlIHdvbid0XG4gICAgICAgICAgICAgKiBuZWVkIHRvIGRvIHBhZ2luYXRpb24gaGVyZSwgc2luY2Ugd2UgYWN0dWFsbHkgcmV0cmlldmUgYWxsIHVzZXJzIGluIGEgbG9vcGVkIGZvcm1hdCwgYW5kIHdlIGFjY291bnQgZm9yXG4gICAgICAgICAgICAgKiBwYWdpbmF0ZWQgcmVzcG9uc2VzLlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIEBsaW5rIHtodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL1F1ZXJ5LlBhZ2luYXRpb24uaHRtbH1cbiAgICAgICAgICAgICAqIEBsaW5rIHtodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL1F1ZXJ5Lmh0bWx9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHJldHJpZXZlZERhdGEgPSBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBRdWVyeUNvbW1hbmQoe1xuICAgICAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuQ0FSRF9MSU5LSU5HX1RBQkxFISxcbiAgICAgICAgICAgICAgICBJbmRleE5hbWU6IGAke3Byb2Nlc3MuZW52LkNBUkRfTElOS0lOR19TVEFUVVNfR0xPQkFMX0lOREVYIX0tJHtwcm9jZXNzLmVudi5FTlZfTkFNRSF9LSR7cmVnaW9ufWAsXG4gICAgICAgICAgICAgICAgLi4uKGV4Y2x1c2l2ZVN0YXJ0S2V5ICYmIHtFeGNsdXNpdmVTdGFydEtleTogZXhjbHVzaXZlU3RhcnRLZXl9KSxcbiAgICAgICAgICAgICAgICBMaW1pdDogMTIwMCwgLy8gMSwyMDAgKiA2NDUgYnl0ZXMgPSA3NzQsMDAwIGJ5dGVzID0gMC43NzQgTUIgKGxlYXZlIGEgbWFyZ2luIG9mIGVycm9yIGhlcmUgdXAgdG8gMSBNQilcbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiB3ZSdyZSBub3QgaW50ZXJlc3RlZCBpbiBnZXR0aW5nIGFsbCB0aGUgZGF0YSBmb3IgdGhpcyBjYWxsLCBqdXN0IHRoZSBtaW5pbXVtIGZvciB1cyB0byByZXR1cm4gdGhlIG5lY2Vzc2FyeSBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2FtYXpvbmR5bmFtb2RiL2xhdGVzdC9kZXZlbG9wZXJndWlkZS9SZXNlcnZlZFdvcmRzLmh0bWxcbiAgICAgICAgICAgICAgICAgKiBAbGluayBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL0V4cHJlc3Npb25zLkV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lcy5odG1sXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgUHJvamVjdGlvbkV4cHJlc3Npb246ICcjaWRmLCAjbWlkLCAjY2FyZHMnLFxuICAgICAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lczoge1xuICAgICAgICAgICAgICAgICAgICAnI2lkZic6ICdpZCcsXG4gICAgICAgICAgICAgICAgICAgICcjY2FyZHMnOiAnY2FyZHMnLFxuICAgICAgICAgICAgICAgICAgICAnI21pZCc6ICdtZW1iZXJJZCcsXG4gICAgICAgICAgICAgICAgICAgICcjc3QnOiAnc3RhdHVzJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlczoge1xuICAgICAgICAgICAgICAgICAgICBcIjpzdFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiBDYXJkTGlua2luZ1N0YXR1cy5MaW5rZWRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgS2V5Q29uZGl0aW9uRXhwcmVzc2lvbjogJyNzdCA9IDpzdCdcbiAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgZXhjbHVzaXZlU3RhcnRLZXkgPSByZXRyaWV2ZWREYXRhLkxhc3RFdmFsdWF0ZWRLZXk7XG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KHJldHJpZXZlZERhdGEuSXRlbXMpO1xuICAgICAgICB9IHdoaWxlIChyZXRyaWV2ZWREYXRhICYmIHJldHJpZXZlZERhdGEuQ291bnQgJiYgcmV0cmlldmVkRGF0YS5JdGVtcyAmJlxuICAgICAgICByZXRyaWV2ZWREYXRhLkl0ZW1zLmxlbmd0aCAmJiByZXRyaWV2ZWREYXRhLkNvdW50ICE9PSAwICYmXG4gICAgICAgIHJldHJpZXZlZERhdGEuSXRlbXMubGVuZ3RoICE9PSAwICYmIHJldHJpZXZlZERhdGEuTGFzdEV2YWx1YXRlZEtleSk7XG5cbiAgICAgICAgLy8gaWYgdGhlcmUgYXJlIGVsaWdpYmxlIHVzZXJzIHJldHJpZXZlZCwgdGhlbiByZXR1cm4gdGhlbSBhY2NvcmRpbmdseVxuICAgICAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgIC8vIGNvbnZlcnQgdGhlIER5bmFtbyBEQiBkYXRhIGZyb20gRHluYW1vIERCIEpTT04gZm9ybWF0IHRvIGEgTW9vbmJlYW0gZWxpZ2libGUgdXNlcnMgZGF0YSBmb3JtYXRcbiAgICAgICAgICAgIGNvbnN0IGVsaWdpYmxlVXNlcnNEYXRhOiBFbGlnaWJsZUxpbmtlZFVzZXJbXSA9IFtdO1xuICAgICAgICAgICAgcmVzdWx0LmZvckVhY2goZWxpZ2libGVVc2VyUmVzdWx0ID0+IHtcbiAgICAgICAgICAgICAgICAvLyBnZXQgYWxsIGNhcmQgaWRzIGZvciB0aGUgZWxpZ2libGUgdXNlclxuICAgICAgICAgICAgICAgIGNvbnN0IGNhcmRJRHM6IHN0cmluZ1tdID0gW107XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBsaW5rZWRDYXJkIG9mIGVsaWdpYmxlVXNlclJlc3VsdC5jYXJkcy5MISkge1xuICAgICAgICAgICAgICAgICAgICBjYXJkSURzLnB1c2gobGlua2VkQ2FyZC5NIS5pZC5TISk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGNvbnN0cnVjdCBhbiBlbGlnaWJsZSB1c2VyIHRvIHJldHVybiBpbiB0aGUgbGlzdCBvZiB1c2Vyc1xuICAgICAgICAgICAgICAgIGNvbnN0IGVsaWdpYmxlVXNlcjogRWxpZ2libGVMaW5rZWRVc2VyID0ge1xuICAgICAgICAgICAgICAgICAgICBpZDogZWxpZ2libGVVc2VyUmVzdWx0LmlkLlMhLFxuICAgICAgICAgICAgICAgICAgICBtZW1iZXJJZDogZWxpZ2libGVVc2VyUmVzdWx0Lm1lbWJlcklkLlMhLFxuICAgICAgICAgICAgICAgICAgICBjYXJkSWRzOiBjYXJkSURzXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBlbGlnaWJsZVVzZXJzRGF0YS5wdXNoKGVsaWdpYmxlVXNlcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIHJldHVybiB0aGUgbGlzdCBvZiBlbGlnaWJsZSB1c2Vyc1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBkYXRhOiBlbGlnaWJsZVVzZXJzRGF0YVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYEVsaWdpYmxlIGxpbmtlZCB1c2VycyBub3QgZm91bmQhYDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5Ob25lT3JBYnNlbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgJHtmaWVsZE5hbWV9IHF1ZXJ5ICR7ZXJyfWA7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH07XG4gICAgfVxufVxuIl19