"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBankingItemByToken = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
/**
 * GetBankingItemByToken resolver
 *
 * @param getBankingItemByTokenInput the input needed to retrieve an existing Plaid Banking Item
 * by its link token
 * @param fieldName name of the resolver path from the AppSync event
 * @returns {@link Promise} of {@link BankingItemResponse}
 */
const getBankingItemByToken = async (fieldName, getBankingItemByTokenInput) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // initializing the DynamoDB document client
        const dynamoDbClient = new client_dynamodb_1.DynamoDBClient({ region: region });
        /**
         * the data to be retrieved from the Query Command
         * the eligible Plaid Banking Items returned from the Query Command, all aggregated together
         * the last evaluated key, to help with the pagination of results
         */
        let result = [];
        let exclusiveStartKey, retrievedData;
        do {
            /**
             * retrieve the Plaid Banking Item by the link token, given the local secondary index to be queried by.
             *
             * Limit of 1 MB per paginated response data (in our case 1,000 items). An average size for an Item is about 765 bytes, which means that we won't
             * need to do pagination here, since we actually retrieve all Plaid Bank Items in a looped format, and we account for paginated responses.
             *
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.Pagination.html}
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html}
             */
            retrievedData = await dynamoDbClient.send(new client_dynamodb_1.QueryCommand({
                TableName: process.env.BANKING_ITEMS_TABLE,
                IndexName: `${process.env.BANKING_ITEM_LINK_TOKEN_LOCAL_INDEX}-${process.env.ENV_NAME}-${region}`,
                ...(exclusiveStartKey && { ExclusiveStartKey: exclusiveStartKey }),
                Limit: 1000,
                ExpressionAttributeNames: {
                    '#id': 'id',
                    '#lTk': 'link_token'
                },
                ExpressionAttributeValues: {
                    ':id': {
                        S: getBankingItemByTokenInput.id
                    },
                    ':lTk': {
                        S: getBankingItemByTokenInput.linkToken
                    }
                },
                KeyConditionExpression: '#id = :id AND #lTk = :lTk'
            }));
            exclusiveStartKey = retrievedData.LastEvaluatedKey;
            result = result.concat(retrievedData.Items);
        } while (retrievedData && retrievedData.Count && retrievedData.Items &&
            retrievedData.Items.length && retrievedData.Count !== 0 &&
            retrievedData.Items.length !== 0 && retrievedData.LastEvaluatedKey);
        // there needs to be only 1 Plaid Bank Item returned. For more than one, return an error accordingly
        if (result && result.length === 1) {
            // build the list of accounts linked to a particular Banking Item, to be returned
            const accounts = [];
            result.forEach(bankingItem => {
                bankingItem.accounts.L && bankingItem.accounts.L.forEach(account => {
                    const newAccount = {
                        accountId: account.M.accountId.S,
                        accountMask: account.M.accountMask.S,
                        accountName: account.M.accountName.S,
                        accountNumber: account.M.accountNumber.S,
                        accountOfficialName: account.M.accountOfficialName.S,
                        createdAt: account.M.createdAt.S,
                        id: account.M.id.S,
                        persistentAccountId: account.M.persistentAccountId.S,
                        routingNumber: account.M.routingNumber.S,
                        status: account.M.status.S,
                        subType: account.M.subType.S,
                        type: account.M.type.S,
                        updatedAt: account.M.updatedAt.S,
                        wireRoutingNumber: account.M.wireRoutingNumber.S
                    };
                    accounts.push(newAccount);
                });
            });
            // return the queried Plaid Banking Item's details
            return {
                data: {
                    id: result[0].id.S,
                    timestamp: Number(result[0].timestamp.N),
                    itemId: result[0].itemId.S,
                    institutionId: result[0].institutionId.S,
                    name: result[0].name.S,
                    createdAt: result[0].createdAt.S,
                    updatedAt: result[0].updatedAt.S,
                    accessToken: result[0].accessToken.S,
                    linkToken: result[0].linkToken.S,
                    publicToken: result[0].publicToken.S,
                    accounts: accounts,
                    status: result[0].status.S
                }
            };
        }
        else {
            // see if we have no or more than one Plaid Banking Item retrieved and return the appropriate error and message
            if (result.length === 0) {
                const errorMessage = `No Plaid Banking Item found for user ${getBankingItemByTokenInput.id}, and token ${getBankingItemByTokenInput.linkToken}!`;
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: moonbeam_models_1.BankingItemErrorType.NoneOrAbsent
                };
            }
            else if (result.length > 1) {
                const errorMessage = `More than one Plaid Banking Item retrieved for user ${getBankingItemByTokenInput.id}, and token ${getBankingItemByTokenInput.linkToken}!`;
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: moonbeam_models_1.BankingItemErrorType.DuplicateObjectFound
                };
            }
            else {
                const errorMessage = `Issues while retrieving Plaid Banking Item for user ${getBankingItemByTokenInput.id}, and token ${getBankingItemByTokenInput.linkToken}!`;
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: moonbeam_models_1.BankingItemErrorType.UnexpectedError
                };
            }
        }
    }
    catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.BankingItemErrorType.UnexpectedError
        };
    }
};
exports.getBankingItemByToken = getBankingItemByToken;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0QmFua2luZ0l0ZW1CeVRva2VuUmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL3Jlc29sdmVycy9HZXRCYW5raW5nSXRlbUJ5VG9rZW5SZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrREFTbUM7QUFDbkMsOERBQXNGO0FBRXRGOzs7Ozs7O0dBT0c7QUFDSSxNQUFNLHFCQUFxQixHQUFHLEtBQUssRUFBRSxTQUFpQixFQUFFLDBCQUFzRCxFQUFnQyxFQUFFO0lBQ25KLElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsNENBQTRDO1FBQzVDLE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBRTVEOzs7O1dBSUc7UUFDSCxJQUFJLE1BQU0sR0FBcUMsRUFBRSxDQUFDO1FBQ2xELElBQUksaUJBQWlCLEVBQUUsYUFBYSxDQUFDO1FBRXJDLEdBQUc7WUFDQzs7Ozs7Ozs7ZUFRRztZQUNILGFBQWEsR0FBRyxNQUFNLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSw4QkFBWSxDQUFDO2dCQUN2RCxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBb0I7Z0JBQzNDLFNBQVMsRUFBRSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUNBQW9DLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFTLElBQUksTUFBTSxFQUFFO2dCQUNuRyxHQUFHLENBQUMsaUJBQWlCLElBQUksRUFBQyxpQkFBaUIsRUFBRSxpQkFBaUIsRUFBQyxDQUFDO2dCQUNoRSxLQUFLLEVBQUUsSUFBSTtnQkFDWCx3QkFBd0IsRUFBRTtvQkFDdEIsS0FBSyxFQUFFLElBQUk7b0JBQ1gsTUFBTSxFQUFFLFlBQVk7aUJBQ3ZCO2dCQUNELHlCQUF5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QUMsQ0FBQztnQkFFMUIsT0FBTztvQkFDSCxZQUFZLEVBQUUsWUFBWTtvQkFDMUIsU0FBUyxFQUFFLHNDQUFvQixDQUFDLG9CQUFvQjtpQkFDdkQsQ0FBQTthQUNKO2lCQUFNO2dCQUNILE1BQU0sWUFBWSxHQUFHLHVEQUF1RCwwQkFBMEIsQ0FBQyxFQUFFLGVBQWUsMEJBQTBCLENBQUMsU0FBUyxHQUFHLENBQUM7Z0JBQ2hLLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBRTFCLE9BQU87b0JBQ0gsWUFBWSxFQUFFLFlBQVk7b0JBQzFCLFNBQVMsRUFBRSxzQ0FBb0IsQ0FBQyxlQUFlO2lCQUNsRCxDQUFBO2FBQ0o7U0FDSjtLQUNKO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVixNQUFNLFlBQVksR0FBRyxvQ0FBb0MsU0FBUyxhQUFhLEdBQUcsRUFBRSxDQUFDO1FBQ3JGLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUIsT0FBTztZQUNILFlBQVksRUFBRSxZQUFZO1lBQzFCLFNBQVMsRUFBRSxzQ0FBb0IsQ0FBQyxlQUFlO1NBQ2xELENBQUE7S0FDSjtBQUNMLENBQUMsQ0FBQTtBQWxJWSxRQUFBLHFCQUFxQix5QkFrSWpDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBCYW5raW5nQWNjb3VudCxcbiAgICBCYW5raW5nQWNjb3VudFN0YXR1cyxcbiAgICBCYW5raW5nSXRlbUVycm9yVHlwZSxcbiAgICBCYW5raW5nSXRlbVJlc3BvbnNlLFxuICAgIEJhbmtpbmdJdGVtU3RhdHVzLFxuICAgIEdldEJhbmtpbmdJdGVtQnlUb2tlbklucHV0LFxuICAgIFBsYWlkTGlua2luZ0FjY291bnRTdWJ0eXBlLFxuICAgIFBsYWlkTGlua2luZ0FjY291bnRUeXBlXG59IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5pbXBvcnQge0F0dHJpYnV0ZVZhbHVlLCBEeW5hbW9EQkNsaWVudCwgUXVlcnlDb21tYW5kfSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWR5bmFtb2RiXCI7XG5cbi8qKlxuICogR2V0QmFua2luZ0l0ZW1CeVRva2VuIHJlc29sdmVyXG4gKlxuICogQHBhcmFtIGdldEJhbmtpbmdJdGVtQnlUb2tlbklucHV0IHRoZSBpbnB1dCBuZWVkZWQgdG8gcmV0cmlldmUgYW4gZXhpc3RpbmcgUGxhaWQgQmFua2luZyBJdGVtXG4gKiBieSBpdHMgbGluayB0b2tlblxuICogQHBhcmFtIGZpZWxkTmFtZSBuYW1lIG9mIHRoZSByZXNvbHZlciBwYXRoIGZyb20gdGhlIEFwcFN5bmMgZXZlbnRcbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgQmFua2luZ0l0ZW1SZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGdldEJhbmtpbmdJdGVtQnlUb2tlbiA9IGFzeW5jIChmaWVsZE5hbWU6IHN0cmluZywgZ2V0QmFua2luZ0l0ZW1CeVRva2VuSW5wdXQ6IEdldEJhbmtpbmdJdGVtQnlUb2tlbklucHV0KTogUHJvbWlzZTxCYW5raW5nSXRlbVJlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLy8gaW5pdGlhbGl6aW5nIHRoZSBEeW5hbW9EQiBkb2N1bWVudCBjbGllbnRcbiAgICAgICAgY29uc3QgZHluYW1vRGJDbGllbnQgPSBuZXcgRHluYW1vREJDbGllbnQoe3JlZ2lvbjogcmVnaW9ufSk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIHRoZSBkYXRhIHRvIGJlIHJldHJpZXZlZCBmcm9tIHRoZSBRdWVyeSBDb21tYW5kXG4gICAgICAgICAqIHRoZSBlbGlnaWJsZSBQbGFpZCBCYW5raW5nIEl0ZW1zIHJldHVybmVkIGZyb20gdGhlIFF1ZXJ5IENvbW1hbmQsIGFsbCBhZ2dyZWdhdGVkIHRvZ2V0aGVyXG4gICAgICAgICAqIHRoZSBsYXN0IGV2YWx1YXRlZCBrZXksIHRvIGhlbHAgd2l0aCB0aGUgcGFnaW5hdGlvbiBvZiByZXN1bHRzXG4gICAgICAgICAqL1xuICAgICAgICBsZXQgcmVzdWx0OiBSZWNvcmQ8c3RyaW5nLCBBdHRyaWJ1dGVWYWx1ZT5bXSA9IFtdO1xuICAgICAgICBsZXQgZXhjbHVzaXZlU3RhcnRLZXksIHJldHJpZXZlZERhdGE7XG5cbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiByZXRyaWV2ZSB0aGUgUGxhaWQgQmFua2luZyBJdGVtIGJ5IHRoZSBsaW5rIHRva2VuLCBnaXZlbiB0aGUgbG9jYWwgc2Vjb25kYXJ5IGluZGV4IHRvIGJlIHF1ZXJpZWQgYnkuXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogTGltaXQgb2YgMSBNQiBwZXIgcGFnaW5hdGVkIHJlc3BvbnNlIGRhdGEgKGluIG91ciBjYXNlIDEsMDAwIGl0ZW1zKS4gQW4gYXZlcmFnZSBzaXplIGZvciBhbiBJdGVtIGlzIGFib3V0IDc2NSBieXRlcywgd2hpY2ggbWVhbnMgdGhhdCB3ZSB3b24ndFxuICAgICAgICAgICAgICogbmVlZCB0byBkbyBwYWdpbmF0aW9uIGhlcmUsIHNpbmNlIHdlIGFjdHVhbGx5IHJldHJpZXZlIGFsbCBQbGFpZCBCYW5rIEl0ZW1zIGluIGEgbG9vcGVkIGZvcm1hdCwgYW5kIHdlIGFjY291bnQgZm9yIHBhZ2luYXRlZCByZXNwb25zZXMuXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogQGxpbmsge2h0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9hbWF6b25keW5hbW9kYi9sYXRlc3QvZGV2ZWxvcGVyZ3VpZGUvUXVlcnkuUGFnaW5hdGlvbi5odG1sfVxuICAgICAgICAgICAgICogQGxpbmsge2h0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9hbWF6b25keW5hbW9kYi9sYXRlc3QvZGV2ZWxvcGVyZ3VpZGUvUXVlcnkuaHRtbH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgcmV0cmlldmVkRGF0YSA9IGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IFF1ZXJ5Q29tbWFuZCh7XG4gICAgICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5CQU5LSU5HX0lURU1TX1RBQkxFISxcbiAgICAgICAgICAgICAgICBJbmRleE5hbWU6IGAke3Byb2Nlc3MuZW52LkJBTktJTkdfSVRFTV9MSU5LX1RPS0VOX0xPQ0FMX0lOREVYIX0tJHtwcm9jZXNzLmVudi5FTlZfTkFNRSF9LSR7cmVnaW9ufWAsXG4gICAgICAgICAgICAgICAgLi4uKGV4Y2x1c2l2ZVN0YXJ0S2V5ICYmIHtFeGNsdXNpdmVTdGFydEtleTogZXhjbHVzaXZlU3RhcnRLZXl9KSxcbiAgICAgICAgICAgICAgICBMaW1pdDogMTAwMCwgLy8gMSwwMDAgKiA3NjUgYnl0ZXMgPSA3NjUsMDAwIGJ5dGVzID0gMC43NjUgTUIgKGxlYXZlIGEgbWFyZ2luIG9mIGVycm9yIGhlcmUgdXAgdG8gMSBNQilcbiAgICAgICAgICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlTmFtZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgJyNpZCc6ICdpZCcsXG4gICAgICAgICAgICAgICAgICAgICcjbFRrJzogJ2xpbmtfdG9rZW4nXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlVmFsdWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICc6aWQnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiBnZXRCYW5raW5nSXRlbUJ5VG9rZW5JbnB1dC5pZFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAnOmxUayc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IGdldEJhbmtpbmdJdGVtQnlUb2tlbklucHV0LmxpbmtUb2tlblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBLZXlDb25kaXRpb25FeHByZXNzaW9uOiAnI2lkID0gOmlkIEFORCAjbFRrID0gOmxUaydcbiAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgZXhjbHVzaXZlU3RhcnRLZXkgPSByZXRyaWV2ZWREYXRhLkxhc3RFdmFsdWF0ZWRLZXk7XG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KHJldHJpZXZlZERhdGEuSXRlbXMpO1xuICAgICAgICB9IHdoaWxlIChyZXRyaWV2ZWREYXRhICYmIHJldHJpZXZlZERhdGEuQ291bnQgJiYgcmV0cmlldmVkRGF0YS5JdGVtcyAmJlxuICAgICAgICByZXRyaWV2ZWREYXRhLkl0ZW1zLmxlbmd0aCAmJiByZXRyaWV2ZWREYXRhLkNvdW50ICE9PSAwICYmXG4gICAgICAgIHJldHJpZXZlZERhdGEuSXRlbXMubGVuZ3RoICE9PSAwICYmIHJldHJpZXZlZERhdGEuTGFzdEV2YWx1YXRlZEtleSk7XG5cbiAgICAgICAgLy8gdGhlcmUgbmVlZHMgdG8gYmUgb25seSAxIFBsYWlkIEJhbmsgSXRlbSByZXR1cm5lZC4gRm9yIG1vcmUgdGhhbiBvbmUsIHJldHVybiBhbiBlcnJvciBhY2NvcmRpbmdseVxuICAgICAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIC8vIGJ1aWxkIHRoZSBsaXN0IG9mIGFjY291bnRzIGxpbmtlZCB0byBhIHBhcnRpY3VsYXIgQmFua2luZyBJdGVtLCB0byBiZSByZXR1cm5lZFxuICAgICAgICAgICAgY29uc3QgYWNjb3VudHM6IEJhbmtpbmdBY2NvdW50W10gPSBbXTtcbiAgICAgICAgICAgIHJlc3VsdC5mb3JFYWNoKGJhbmtpbmdJdGVtID0+IHtcbiAgICAgICAgICAgICAgICBiYW5raW5nSXRlbS5hY2NvdW50cy5MICYmIGJhbmtpbmdJdGVtLmFjY291bnRzLkwhLmZvckVhY2goYWNjb3VudCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld0FjY291bnQ6IEJhbmtpbmdBY2NvdW50ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWNjb3VudElkOiBhY2NvdW50Lk0hLmFjY291bnRJZC5TISxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjY291bnRNYXNrOiBhY2NvdW50Lk0hLmFjY291bnRNYXNrLlMhLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWNjb3VudE5hbWU6IGFjY291bnQuTSEuYWNjb3VudE5hbWUuUyEsXG4gICAgICAgICAgICAgICAgICAgICAgICBhY2NvdW50TnVtYmVyOiBhY2NvdW50Lk0hLmFjY291bnROdW1iZXIuUyEsXG4gICAgICAgICAgICAgICAgICAgICAgICBhY2NvdW50T2ZmaWNpYWxOYW1lOiBhY2NvdW50Lk0hLmFjY291bnRPZmZpY2lhbE5hbWUuUyEsXG4gICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IGFjY291bnQuTSEuY3JlYXRlZEF0LlMhLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGFjY291bnQuTSEuaWQuUyEsXG4gICAgICAgICAgICAgICAgICAgICAgICBwZXJzaXN0ZW50QWNjb3VudElkOiBhY2NvdW50Lk0hLnBlcnNpc3RlbnRBY2NvdW50SWQuUyEsXG4gICAgICAgICAgICAgICAgICAgICAgICByb3V0aW5nTnVtYmVyOiBhY2NvdW50Lk0hLnJvdXRpbmdOdW1iZXIuUyEsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IGFjY291bnQuTSEuc3RhdHVzLlMhIGFzIEJhbmtpbmdBY2NvdW50U3RhdHVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3ViVHlwZTogYWNjb3VudC5NIS5zdWJUeXBlLlMhIGFzIFBsYWlkTGlua2luZ0FjY291bnRTdWJ0eXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogYWNjb3VudC5NIS50eXBlLlMhIGFzIFBsYWlkTGlua2luZ0FjY291bnRUeXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEF0OiBhY2NvdW50Lk0hLnVwZGF0ZWRBdC5TISxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpcmVSb3V0aW5nTnVtYmVyOiBhY2NvdW50Lk0hLndpcmVSb3V0aW5nTnVtYmVyLlMhXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYWNjb3VudHMucHVzaChuZXdBY2NvdW50KTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyByZXR1cm4gdGhlIHF1ZXJpZWQgUGxhaWQgQmFua2luZyBJdGVtJ3MgZGV0YWlsc1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiByZXN1bHRbMF0uaWQuUyEsXG4gICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogTnVtYmVyKHJlc3VsdFswXS50aW1lc3RhbXAuTiEpLFxuICAgICAgICAgICAgICAgICAgICBpdGVtSWQ6IHJlc3VsdFswXS5pdGVtSWQuUyEsXG4gICAgICAgICAgICAgICAgICAgIGluc3RpdHV0aW9uSWQ6IHJlc3VsdFswXS5pbnN0aXR1dGlvbklkLlMhLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiByZXN1bHRbMF0ubmFtZS5TISxcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0OiByZXN1bHRbMF0uY3JlYXRlZEF0LlMhLFxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQXQ6IHJlc3VsdFswXS51cGRhdGVkQXQuUyEsXG4gICAgICAgICAgICAgICAgICAgIGFjY2Vzc1Rva2VuOiByZXN1bHRbMF0uYWNjZXNzVG9rZW4uUyEsXG4gICAgICAgICAgICAgICAgICAgIGxpbmtUb2tlbjogcmVzdWx0WzBdLmxpbmtUb2tlbi5TISxcbiAgICAgICAgICAgICAgICAgICAgcHVibGljVG9rZW46IHJlc3VsdFswXS5wdWJsaWNUb2tlbi5TISxcbiAgICAgICAgICAgICAgICAgICAgYWNjb3VudHM6IGFjY291bnRzLFxuICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IHJlc3VsdFswXS5zdGF0dXMuUyEgYXMgQmFua2luZ0l0ZW1TdGF0dXNcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBzZWUgaWYgd2UgaGF2ZSBubyBvciBtb3JlIHRoYW4gb25lIFBsYWlkIEJhbmtpbmcgSXRlbSByZXRyaWV2ZWQgYW5kIHJldHVybiB0aGUgYXBwcm9wcmlhdGUgZXJyb3IgYW5kIG1lc3NhZ2VcbiAgICAgICAgICAgIGlmIChyZXN1bHQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vIFBsYWlkIEJhbmtpbmcgSXRlbSBmb3VuZCBmb3IgdXNlciAke2dldEJhbmtpbmdJdGVtQnlUb2tlbklucHV0LmlkfSwgYW5kIHRva2VuICR7Z2V0QmFua2luZ0l0ZW1CeVRva2VuSW5wdXQubGlua1Rva2VufSFgO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBCYW5raW5nSXRlbUVycm9yVHlwZS5Ob25lT3JBYnNlbnRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHJlc3VsdC5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE1vcmUgdGhhbiBvbmUgUGxhaWQgQmFua2luZyBJdGVtIHJldHJpZXZlZCBmb3IgdXNlciAke2dldEJhbmtpbmdJdGVtQnlUb2tlbklucHV0LmlkfSwgYW5kIHRva2VuICR7Z2V0QmFua2luZ0l0ZW1CeVRva2VuSW5wdXQubGlua1Rva2VufSFgO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBCYW5raW5nSXRlbUVycm9yVHlwZS5EdXBsaWNhdGVPYmplY3RGb3VuZFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYElzc3VlcyB3aGlsZSByZXRyaWV2aW5nIFBsYWlkIEJhbmtpbmcgSXRlbSBmb3IgdXNlciAke2dldEJhbmtpbmdJdGVtQnlUb2tlbklucHV0LmlkfSwgYW5kIHRva2VuICR7Z2V0QmFua2luZ0l0ZW1CeVRva2VuSW5wdXQubGlua1Rva2VufSFgO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBCYW5raW5nSXRlbUVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nICR7ZmllbGROYW1lfSBtdXRhdGlvbiAke2Vycn1gO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICBlcnJvclR5cGU6IEJhbmtpbmdJdGVtRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICB9XG4gICAgfVxufVxuIl19