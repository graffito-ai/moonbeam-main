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
            result = result.concat(retrievedData.Items);
        } while (retrievedData && retrievedData.Count && retrievedData.Items &&
            retrievedData.Items.length && retrievedData.Count !== 0 &&
            retrievedData.Items.length !== 0 && retrievedData.LastEvaluatedKey);
        // if there are eligible users retrieved, then return them accordingly
        if (result && result.length !== 0) {
            // convert the Dynamo DB data from Dynamo DB JSON format to a Moonbeam eligible users data format
            const eligibleUsersData = [];
            result.forEach(eligibleUserResult => {
                const eligibleUser = {
                    id: eligibleUserResult.id.S,
                    memberId: eligibleUserResult.memberId.S,
                    cardId: eligibleUserResult.cards.L[0].M.id.S
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0RWxpZ2libGVMaW5rZWRVc2Vyc1Jlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvR2V0RWxpZ2libGVMaW5rZWRVc2Vyc1Jlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDhEQUFzRjtBQUN0RiwrREFLbUM7QUFFbkM7Ozs7O0dBS0c7QUFDSSxNQUFNLHNCQUFzQixHQUFHLEtBQUssRUFBRSxTQUFpQixFQUF3QyxFQUFFO0lBQ3BHLElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsNENBQTRDO1FBQzVDLE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBRTVEOzs7O1dBSUc7UUFDSCxJQUFJLE1BQU0sR0FBcUMsRUFBRSxDQUFDO1FBQ2xELElBQUksaUJBQWlCLEVBQUUsYUFBYSxDQUFDO1FBRXJDLEdBQUc7WUFDQzs7Ozs7Ozs7O2VBU0c7WUFDSCxhQUFhLEdBQUcsTUFBTSxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksOEJBQVksQ0FBQztnQkFDdkQsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQW1CO2dCQUMxQyxTQUFTLEVBQUUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGdDQUFpQyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUyxJQUFJLE1BQU0sRUFBRTtnQkFDaEcsR0FBRyxDQUFDLGlCQUFpQixJQUFJLEVBQUMsaUJBQWlCLEVBQUUsaUJBQWlCLEVBQUMsQ0FBQztnQkFDaEUsS0FBSyxFQUFFLElBQUk7Z0JBQ1g7Ozs7O21CQUtHO2dCQUNILG9CQUFvQixFQUFFLG1CQUFtQixHQUFHLFFBQVE7Z0JBQ3BELHdCQUF3QixFQUFFO29CQUN0QixNQUFNLEVBQUUsSUFBSTtvQkFDWixPQUFPLEVBQUUsT0FBTztvQkFDaEIsTUFBTSxFQUFFLFVBQVU7b0JBQ2xCLEtBQUssRUFBRSxRQUFRO2lCQUNsQjtnQkFDRCx5QkFBeUIsRUFBRTtvQkFDdkIsS0FBSyxFQUFFO3dCQUNILENBQUMsRUFBRSxtQ0FBaUIsQ0FBQyxNQUFNO3FCQUM5QjtpQkFDSjtnQkFDRCxzQkFBc0IsRUFBRSxXQUFXO2FBQ3RDLENBQUMsQ0FBQyxDQUFDO1lBRUosaUJBQWlCLEdBQUcsYUFBYSxDQUFDLGdCQUFnQixDQUFDO1lBQ25ELE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUMvQyxRQUFRLGFBQWEsSUFBSSxhQUFhLENBQUMsS0FBSyxJQUFJLGFBQWEsQ0FBQyxLQUFLO1lBQ3BFLGFBQWEsQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLGFBQWEsQ0FBQyxLQUFLLEtBQUssQ0FBQztZQUN2RCxhQUFhLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksYUFBYSxDQUFDLGdCQUFnQixFQUFFO1FBRXBFLHNFQUFzRTtRQUN0RSxJQUFJLE1BQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUMvQixpR0FBaUc7WUFDakcsTUFBTSxpQkFBaUIsR0FBeUIsRUFBRSxDQUFDO1lBQ25ELE1BQU0sQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsRUFBRTtnQkFDaEMsTUFBTSxZQUFZLEdBQXVCO29CQUNyQyxFQUFFLEVBQUUsa0JBQWtCLENBQUMsRUFBRSxDQUFDLENBQUU7b0JBQzVCLFFBQVEsRUFBRSxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsQ0FBRTtvQkFDeEMsTUFBTSxFQUFFLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFO2lCQUNsRCxDQUFDO2dCQUNGLGlCQUFpQixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUN6QyxDQUFDLENBQUMsQ0FBQztZQUNILG9DQUFvQztZQUNwQyxPQUFPO2dCQUNILElBQUksRUFBRSxpQkFBaUI7YUFDMUIsQ0FBQTtTQUNKO2FBQU07WUFDSCxNQUFNLFlBQVksR0FBRyxrQ0FBa0MsQ0FBQztZQUN4RCxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRTFCLE9BQU87Z0JBQ0gsWUFBWSxFQUFFLFlBQVk7Z0JBQzFCLFNBQVMsRUFBRSxtQ0FBaUIsQ0FBQyxZQUFZO2FBQzVDLENBQUE7U0FDSjtLQUNKO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVixNQUFNLFlBQVksR0FBRyxvQ0FBb0MsU0FBUyxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ2xGLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUIsT0FBTztZQUNILFlBQVksRUFBRSxZQUFZO1lBQzFCLFNBQVMsRUFBRSxtQ0FBaUIsQ0FBQyxlQUFlO1NBQy9DLENBQUM7S0FDTDtBQUNMLENBQUMsQ0FBQTtBQTVGWSxRQUFBLHNCQUFzQiwwQkE0RmxDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBdHRyaWJ1dGVWYWx1ZSwgRHluYW1vREJDbGllbnQsIFF1ZXJ5Q29tbWFuZH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1keW5hbW9kYlwiO1xuaW1wb3J0IHtcbiAgICBDYXJkTGlua0Vycm9yVHlwZSxcbiAgICBDYXJkTGlua2luZ1N0YXR1cyxcbiAgICBFbGlnaWJsZUxpbmtlZFVzZXIsXG4gICAgRWxpZ2libGVMaW5rZWRVc2Vyc1Jlc3BvbnNlXG59IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5cbi8qKlxuICogR2V0RWxpZ2libGVMaW5rZWRVc2VycyByZXNvbHZlclxuICpcbiAqIEBwYXJhbSBmaWVsZE5hbWUgbmFtZSBvZiB0aGUgcmVzb2x2ZXIgcGF0aCBmcm9tIHRoZSBBcHBTeW5jIGV2ZW50XG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIEVsaWdpYmxlTGlua2VkVXNlcnNSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGdldEVsaWdpYmxlTGlua2VkVXNlcnMgPSBhc3luYyAoZmllbGROYW1lOiBzdHJpbmcpOiBQcm9taXNlPEVsaWdpYmxlTGlua2VkVXNlcnNSZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIGluaXRpYWxpemluZyB0aGUgRHluYW1vREIgZG9jdW1lbnQgY2xpZW50XG4gICAgICAgIGNvbnN0IGR5bmFtb0RiQ2xpZW50ID0gbmV3IER5bmFtb0RCQ2xpZW50KHtyZWdpb246IHJlZ2lvbn0pO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiB0aGUgZGF0YSB0byBiZSByZXRyaWV2ZWQgZnJvbSB0aGUgUXVlcnkgQ29tbWFuZFxuICAgICAgICAgKiB0aGUgZWxpZ2libGUgdXNlciBJdGVtcyByZXR1cm5lZCBmcm9tIHRoZSBRdWVyeSBDb21tYW5kLCBhbGwgYWdncmVnYXRlZCB0b2dldGhlclxuICAgICAgICAgKiB0aGUgbGFzdCBldmFsdWF0ZWQga2V5LCB0byBoZWxwIHdpdGggdGhlIHBhZ2luYXRpb24gb2YgcmVzdWx0c1xuICAgICAgICAgKi9cbiAgICAgICAgbGV0IHJlc3VsdDogUmVjb3JkPHN0cmluZywgQXR0cmlidXRlVmFsdWU+W10gPSBbXTtcbiAgICAgICAgbGV0IGV4Y2x1c2l2ZVN0YXJ0S2V5LCByZXRyaWV2ZWREYXRhO1xuXG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogcmV0cmlldmUgYWxsIHRoZSBlbGlnaWJsZSBsaW5rZWQgdXNlcnMsIGdpdmVuIHRoZSBnbG9iYWwgc2Vjb25kYXJ5IGluZGV4LCBhcyB3ZWxsIGFzIHRoZSBMSU5LRUQgc3RhdHVzIHRvIGJlIHF1ZXJpZWQgYnlcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBMaW1pdCBvZiAxIE1CIHBlciBwYWdpbmF0ZWQgcmVzcG9uc2UgZGF0YSAoaW4gb3VyIGNhc2UgNSw3MDAgaXRlbXMpLiBBbiBhdmVyYWdlIHNpemUgZm9yIGFuIEl0ZW0gaXMgYWJvdXQgMTMzIGJ5dGVzLCB3aGljaCBtZWFucyB0aGF0IHdlIHdvbid0XG4gICAgICAgICAgICAgKiBuZWVkIHRvIGRvIHBhZ2luYXRpb24gaGVyZSwgc2luY2Ugd2UgYWN0dWFsbHkgcmV0cmlldmUgYWxsIHVzZXJzIGluIGEgbG9vcGVkIGZvcm1hdCwgYW5kIHdlIGFjY291bnQgZm9yXG4gICAgICAgICAgICAgKiBwYWdpbmF0ZWQgcmVzcG9uc2VzLlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIEBsaW5rIHtodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL1F1ZXJ5LlBhZ2luYXRpb24uaHRtbH1cbiAgICAgICAgICAgICAqIEBsaW5rIHtodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL1F1ZXJ5Lmh0bWx9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHJldHJpZXZlZERhdGEgPSBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBRdWVyeUNvbW1hbmQoe1xuICAgICAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuQ0FSRF9MSU5LSU5HX1RBQkxFISxcbiAgICAgICAgICAgICAgICBJbmRleE5hbWU6IGAke3Byb2Nlc3MuZW52LkNBUkRfTElOS0lOR19TVEFUVVNfR0xPQkFMX0lOREVYIX0tJHtwcm9jZXNzLmVudi5FTlZfTkFNRSF9LSR7cmVnaW9ufWAsXG4gICAgICAgICAgICAgICAgLi4uKGV4Y2x1c2l2ZVN0YXJ0S2V5ICYmIHtFeGNsdXNpdmVTdGFydEtleTogZXhjbHVzaXZlU3RhcnRLZXl9KSxcbiAgICAgICAgICAgICAgICBMaW1pdDogNTcwMCwgLy8gNSw3MDAgKiAxMzMgYnl0ZXMgPSA3NTgsMTAwIGJ5dGVzID0gMC43NTgxIE1CIChsZWF2ZSBhIG1hcmdpbiBvZiBlcnJvciBoZXJlIHVwIHRvIDEgTUIpXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogd2UncmUgbm90IGludGVyZXN0ZWQgaW4gZ2V0dGluZyBhbGwgdGhlIGRhdGEgZm9yIHRoaXMgY2FsbCwganVzdCB0aGUgbWluaW11bSBmb3IgdXMgdG8gcmV0dXJuIHRoZSBuZWNlc3NhcnkgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9hbWF6b25keW5hbW9kYi9sYXRlc3QvZGV2ZWxvcGVyZ3VpZGUvUmVzZXJ2ZWRXb3Jkcy5odG1sXG4gICAgICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2FtYXpvbmR5bmFtb2RiL2xhdGVzdC9kZXZlbG9wZXJndWlkZS9FeHByZXNzaW9ucy5FeHByZXNzaW9uQXR0cmlidXRlTmFtZXMuaHRtbFxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIFByb2plY3Rpb25FeHByZXNzaW9uOiAnI2lkZiwgI21pZCwgI2NhcmQnICsgJ1swXS5pZCcsXG4gICAgICAgICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICcjaWRmJzogJ2lkJyxcbiAgICAgICAgICAgICAgICAgICAgJyNjYXJkJzogJ2NhcmRzJyxcbiAgICAgICAgICAgICAgICAgICAgJyNtaWQnOiAnbWVtYmVySWQnLFxuICAgICAgICAgICAgICAgICAgICAnI3N0JzogJ3N0YXR1cydcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCI6c3RcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogQ2FyZExpbmtpbmdTdGF0dXMuTGlua2VkXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIEtleUNvbmRpdGlvbkV4cHJlc3Npb246ICcjc3QgPSA6c3QnXG4gICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgIGV4Y2x1c2l2ZVN0YXJ0S2V5ID0gcmV0cmlldmVkRGF0YS5MYXN0RXZhbHVhdGVkS2V5O1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdChyZXRyaWV2ZWREYXRhLkl0ZW1zKTtcbiAgICAgICAgfSB3aGlsZSAocmV0cmlldmVkRGF0YSAmJiByZXRyaWV2ZWREYXRhLkNvdW50ICYmIHJldHJpZXZlZERhdGEuSXRlbXMgJiZcbiAgICAgICAgcmV0cmlldmVkRGF0YS5JdGVtcy5sZW5ndGggJiYgcmV0cmlldmVkRGF0YS5Db3VudCAhPT0gMCAmJlxuICAgICAgICByZXRyaWV2ZWREYXRhLkl0ZW1zLmxlbmd0aCAhPT0gMCAmJiByZXRyaWV2ZWREYXRhLkxhc3RFdmFsdWF0ZWRLZXkpO1xuXG4gICAgICAgIC8vIGlmIHRoZXJlIGFyZSBlbGlnaWJsZSB1c2VycyByZXRyaWV2ZWQsIHRoZW4gcmV0dXJuIHRoZW0gYWNjb3JkaW5nbHlcbiAgICAgICAgaWYgKHJlc3VsdCAmJiByZXN1bHQubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAvLyBjb252ZXJ0IHRoZSBEeW5hbW8gREIgZGF0YSBmcm9tIER5bmFtbyBEQiBKU09OIGZvcm1hdCB0byBhIE1vb25iZWFtIGVsaWdpYmxlIHVzZXJzIGRhdGEgZm9ybWF0XG4gICAgICAgICAgICBjb25zdCBlbGlnaWJsZVVzZXJzRGF0YTogRWxpZ2libGVMaW5rZWRVc2VyW10gPSBbXTtcbiAgICAgICAgICAgIHJlc3VsdC5mb3JFYWNoKGVsaWdpYmxlVXNlclJlc3VsdCA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZWxpZ2libGVVc2VyOiBFbGlnaWJsZUxpbmtlZFVzZXIgPSB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiBlbGlnaWJsZVVzZXJSZXN1bHQuaWQuUyEsXG4gICAgICAgICAgICAgICAgICAgIG1lbWJlcklkOiBlbGlnaWJsZVVzZXJSZXN1bHQubWVtYmVySWQuUyEsXG4gICAgICAgICAgICAgICAgICAgIGNhcmRJZDogZWxpZ2libGVVc2VyUmVzdWx0LmNhcmRzLkwhWzBdLk0hLmlkLlMhXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBlbGlnaWJsZVVzZXJzRGF0YS5wdXNoKGVsaWdpYmxlVXNlcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIHJldHVybiB0aGUgbGlzdCBvZiBlbGlnaWJsZSB1c2Vyc1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBkYXRhOiBlbGlnaWJsZVVzZXJzRGF0YVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYEVsaWdpYmxlIGxpbmtlZCB1c2VycyBub3QgZm91bmQhYDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5Ob25lT3JBYnNlbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgJHtmaWVsZE5hbWV9IHF1ZXJ5ICR7ZXJyfWA7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH07XG4gICAgfVxufVxuIl19