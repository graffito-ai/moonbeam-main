"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionByStatus = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * GetTransactionByStatusResolver resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getTransactionByStatusInput get transaction by status input object, used to retrieve transactional information,
 *                                    based on status.
 *
 * @returns {@link Promise} of {@link MoonbeamTransactionsByStatusResponse}
 */
const getTransactionByStatus = async (fieldName, getTransactionByStatusInput) => {
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
             * retrieve all the transactions with a specific status, given the global secondary index
             *
             * Limit of 1 MB per paginated response data (in our case 3,800 items). An average size for an Item is about 111 bytes, which means that we won't
             * need to do pagination here, since we actually retrieve all transactions in a looped format, and we account for paginated responses.
             *
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.Pagination.html}
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html}
             */
            retrievedData = await dynamoDbClient.send(new client_dynamodb_1.QueryCommand({
                TableName: process.env.TRANSACTIONS_TABLE,
                IndexName: `${process.env.TRANSACTIONS_STATUS_LOCAL_INDEX}-${process.env.ENV_NAME}-${region}`,
                ...(exclusiveStartKey && { ExclusiveStartKey: exclusiveStartKey }),
                Limit: 3800,
                /**
                 * we're not interested in getting all the data for this call, just the minimum for us to return the necessary information
                 *
                 * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html
                 * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeNames.html
                 */
                ProjectionExpression: '#id, #time, #idt, #st, #ccamt, #pcamt, #rwamt, #total',
                ExpressionAttributeNames: {
                    '#id': 'id',
                    '#idt': 'transactionId',
                    '#time': 'timestamp',
                    '#st': 'transactionStatus',
                    '#ccamt': 'creditedCashbackAmount',
                    '#pcamt': 'pendingCashbackAmount',
                    '#rwamt': 'rewardAmount',
                    '#total': 'totalAmount'
                },
                ExpressionAttributeValues: {
                    ":id": {
                        S: getTransactionByStatusInput.id
                    },
                    ":st": {
                        S: getTransactionByStatusInput.status
                    }
                },
                KeyConditionExpression: '#id = :id AND #st = :st'
            }));
            exclusiveStartKey = retrievedData.LastEvaluatedKey;
            result = result.concat(retrievedData.Items);
        } while (retrievedData && retrievedData.Count && retrievedData.Items &&
            retrievedData.Items.length && retrievedData.Count !== 0 &&
            retrievedData.Items.length !== 0 && retrievedData.LastEvaluatedKey);
        // if there are eligible transactions retrieved, then return them accordingly
        if (result && result.length !== 0) {
            // convert the Dynamo DB data from Dynamo DB JSON format to a Moonbeam transaction by status object
            const moonbeamTransactionByStatusData = [];
            result.forEach(moonbeamTransactionByStatusResult => {
                const moonbeamTransactionByStatus = {
                    id: moonbeamTransactionByStatusResult.id.S,
                    timestamp: Number(moonbeamTransactionByStatusResult.timestamp.N),
                    transactionId: moonbeamTransactionByStatusResult.transactionId.S,
                    transactionStatus: moonbeamTransactionByStatusResult.transactionStatus.S,
                    creditedCashbackAmount: Number(moonbeamTransactionByStatusResult.creditedCashbackAmount.N),
                    pendingCashbackAmount: Number(moonbeamTransactionByStatusResult.pendingCashbackAmount.N),
                    rewardAmount: Number(moonbeamTransactionByStatusResult.rewardAmount.N),
                    totalAmount: Number(moonbeamTransactionByStatusResult.totalAmount.N)
                };
                moonbeamTransactionByStatusData.push(moonbeamTransactionByStatus);
            });
            // return the list of filtered transactions
            return {
                data: moonbeamTransactionByStatusData
            };
        }
        else {
            const errorMessage = `Transactions with status ${getTransactionByStatusInput.status} for user ${getTransactionByStatusInput.id}  not found!`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.TransactionsErrorType.NoneOrAbsent
            };
        }
    }
    catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.TransactionsErrorType.UnexpectedError
        };
    }
};
exports.getTransactionByStatus = getTransactionByStatus;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0VHJhbnNhY3Rpb25CeVN0YXR1c1Jlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvR2V0VHJhbnNhY3Rpb25CeVN0YXR1c1Jlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDhEQUFzRjtBQUN0RiwrREFNbUM7QUFFbkM7Ozs7Ozs7O0dBUUc7QUFDSSxNQUFNLHNCQUFzQixHQUFHLEtBQUssRUFBRSxTQUFpQixFQUFFLDJCQUF3RCxFQUFpRCxFQUFFO0lBQ3ZLLElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsNENBQTRDO1FBQzVDLE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBRTVEOzs7O1dBSUc7UUFDSCxJQUFJLE1BQU0sR0FBcUMsRUFBRSxDQUFDO1FBQ2xELElBQUksaUJBQWlCLEVBQUUsYUFBYSxDQUFDO1FBRXJDLEdBQUc7WUFDQzs7Ozs7Ozs7ZUFRRztZQUNILGFBQWEsR0FBRyxNQUFNLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSw4QkFBWSxDQUFDO2dCQUN2RCxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBbUI7Z0JBQzFDLFNBQVMsRUFBRSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsK0JBQWdDLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFTLElBQUksTUFBTSxFQUFFO2dCQUMvRixHQUFHLENBQUMsaUJBQWlCLElBQUksRUFBQyxpQkFBaUIsRUFBRSxpQkFBaUIsRUFBQyxDQUFDO2dCQUNoRSxLQUFLLEVBQUUsSUFBSTtnQkFDWDs7Ozs7bUJBS0c7Z0JBQ0gsb0JBQW9CLEVBQUUsdURBQXVEO2dCQUM3RSx3QkFBd0IsRUFBRTtvQkFDdEIsS0FBSyxFQUFF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O0FBQ0wsQ0FBQyxDQUFBO0FBdkdZLFFBQUEsc0JBQXNCLDBCQXVHbEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0F0dHJpYnV0ZVZhbHVlLCBEeW5hbW9EQkNsaWVudCwgUXVlcnlDb21tYW5kfSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWR5bmFtb2RiXCI7XG5pbXBvcnQge1xuICAgIEdldFRyYW5zYWN0aW9uQnlTdGF0dXNJbnB1dCxcbiAgICBNb29uYmVhbVRyYW5zYWN0aW9uQnlTdGF0dXMsXG4gICAgTW9vbmJlYW1UcmFuc2FjdGlvbnNCeVN0YXR1c1Jlc3BvbnNlLFxuICAgIFRyYW5zYWN0aW9uc0Vycm9yVHlwZSxcbiAgICBUcmFuc2FjdGlvbnNTdGF0dXNcbn0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcblxuLyoqXG4gKiBHZXRUcmFuc2FjdGlvbkJ5U3RhdHVzUmVzb2x2ZXIgcmVzb2x2ZXJcbiAqXG4gKiBAcGFyYW0gZmllbGROYW1lIG5hbWUgb2YgdGhlIHJlc29sdmVyIHBhdGggZnJvbSB0aGUgQXBwU3luYyBldmVudFxuICogQHBhcmFtIGdldFRyYW5zYWN0aW9uQnlTdGF0dXNJbnB1dCBnZXQgdHJhbnNhY3Rpb24gYnkgc3RhdHVzIGlucHV0IG9iamVjdCwgdXNlZCB0byByZXRyaWV2ZSB0cmFuc2FjdGlvbmFsIGluZm9ybWF0aW9uLFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYXNlZCBvbiBzdGF0dXMuXG4gKlxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBNb29uYmVhbVRyYW5zYWN0aW9uc0J5U3RhdHVzUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRUcmFuc2FjdGlvbkJ5U3RhdHVzID0gYXN5bmMgKGZpZWxkTmFtZTogc3RyaW5nLCBnZXRUcmFuc2FjdGlvbkJ5U3RhdHVzSW5wdXQ6IEdldFRyYW5zYWN0aW9uQnlTdGF0dXNJbnB1dCk6IFByb21pc2U8TW9vbmJlYW1UcmFuc2FjdGlvbnNCeVN0YXR1c1Jlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLy8gaW5pdGlhbGl6aW5nIHRoZSBEeW5hbW9EQiBkb2N1bWVudCBjbGllbnRcbiAgICAgICAgY29uc3QgZHluYW1vRGJDbGllbnQgPSBuZXcgRHluYW1vREJDbGllbnQoe3JlZ2lvbjogcmVnaW9ufSk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIHRoZSBkYXRhIHRvIGJlIHJldHJpZXZlZCBmcm9tIHRoZSBRdWVyeSBDb21tYW5kXG4gICAgICAgICAqIHRoZSBlbGlnaWJsZSB1c2VyIEl0ZW1zIHJldHVybmVkIGZyb20gdGhlIFF1ZXJ5IENvbW1hbmQsIGFsbCBhZ2dyZWdhdGVkIHRvZ2V0aGVyXG4gICAgICAgICAqIHRoZSBsYXN0IGV2YWx1YXRlZCBrZXksIHRvIGhlbHAgd2l0aCB0aGUgcGFnaW5hdGlvbiBvZiByZXN1bHRzXG4gICAgICAgICAqL1xuICAgICAgICBsZXQgcmVzdWx0OiBSZWNvcmQ8c3RyaW5nLCBBdHRyaWJ1dGVWYWx1ZT5bXSA9IFtdO1xuICAgICAgICBsZXQgZXhjbHVzaXZlU3RhcnRLZXksIHJldHJpZXZlZERhdGE7XG5cbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiByZXRyaWV2ZSBhbGwgdGhlIHRyYW5zYWN0aW9ucyB3aXRoIGEgc3BlY2lmaWMgc3RhdHVzLCBnaXZlbiB0aGUgZ2xvYmFsIHNlY29uZGFyeSBpbmRleFxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIExpbWl0IG9mIDEgTUIgcGVyIHBhZ2luYXRlZCByZXNwb25zZSBkYXRhIChpbiBvdXIgY2FzZSAzLDgwMCBpdGVtcykuIEFuIGF2ZXJhZ2Ugc2l6ZSBmb3IgYW4gSXRlbSBpcyBhYm91dCAxMTEgYnl0ZXMsIHdoaWNoIG1lYW5zIHRoYXQgd2Ugd29uJ3RcbiAgICAgICAgICAgICAqIG5lZWQgdG8gZG8gcGFnaW5hdGlvbiBoZXJlLCBzaW5jZSB3ZSBhY3R1YWxseSByZXRyaWV2ZSBhbGwgdHJhbnNhY3Rpb25zIGluIGEgbG9vcGVkIGZvcm1hdCwgYW5kIHdlIGFjY291bnQgZm9yIHBhZ2luYXRlZCByZXNwb25zZXMuXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogQGxpbmsge2h0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9hbWF6b25keW5hbW9kYi9sYXRlc3QvZGV2ZWxvcGVyZ3VpZGUvUXVlcnkuUGFnaW5hdGlvbi5odG1sfVxuICAgICAgICAgICAgICogQGxpbmsge2h0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9hbWF6b25keW5hbW9kYi9sYXRlc3QvZGV2ZWxvcGVyZ3VpZGUvUXVlcnkuaHRtbH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgcmV0cmlldmVkRGF0YSA9IGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IFF1ZXJ5Q29tbWFuZCh7XG4gICAgICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5UUkFOU0FDVElPTlNfVEFCTEUhLFxuICAgICAgICAgICAgICAgIEluZGV4TmFtZTogYCR7cHJvY2Vzcy5lbnYuVFJBTlNBQ1RJT05TX1NUQVRVU19MT0NBTF9JTkRFWCF9LSR7cHJvY2Vzcy5lbnYuRU5WX05BTUUhfS0ke3JlZ2lvbn1gLFxuICAgICAgICAgICAgICAgIC4uLihleGNsdXNpdmVTdGFydEtleSAmJiB7RXhjbHVzaXZlU3RhcnRLZXk6IGV4Y2x1c2l2ZVN0YXJ0S2V5fSksXG4gICAgICAgICAgICAgICAgTGltaXQ6IDM4MDAsIC8vIDM4MDAgKiAxMTEgYnl0ZXMgPSA3NzksMDAwIGJ5dGVzID0gMC43NzkgTUIgKGxlYXZlIGEgbWFyZ2luIG9mIGVycm9yIGhlcmUgdXAgdG8gMSBNQilcbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiB3ZSdyZSBub3QgaW50ZXJlc3RlZCBpbiBnZXR0aW5nIGFsbCB0aGUgZGF0YSBmb3IgdGhpcyBjYWxsLCBqdXN0IHRoZSBtaW5pbXVtIGZvciB1cyB0byByZXR1cm4gdGhlIG5lY2Vzc2FyeSBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2FtYXpvbmR5bmFtb2RiL2xhdGVzdC9kZXZlbG9wZXJndWlkZS9SZXNlcnZlZFdvcmRzLmh0bWxcbiAgICAgICAgICAgICAgICAgKiBAbGluayBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL0V4cHJlc3Npb25zLkV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lcy5odG1sXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgUHJvamVjdGlvbkV4cHJlc3Npb246ICcjaWQsICN0aW1lLCAjaWR0LCAjc3QsICNjY2FtdCwgI3BjYW10LCAjcndhbXQsICN0b3RhbCcsXG4gICAgICAgICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICcjaWQnOiAnaWQnLFxuICAgICAgICAgICAgICAgICAgICAnI2lkdCc6ICd0cmFuc2FjdGlvbklkJyxcbiAgICAgICAgICAgICAgICAgICAgJyN0aW1lJzogJ3RpbWVzdGFtcCcsXG4gICAgICAgICAgICAgICAgICAgICcjc3QnOiAndHJhbnNhY3Rpb25TdGF0dXMnLFxuICAgICAgICAgICAgICAgICAgICAnI2NjYW10JzogJ2NyZWRpdGVkQ2FzaGJhY2tBbW91bnQnLFxuICAgICAgICAgICAgICAgICAgICAnI3BjYW10JzogJ3BlbmRpbmdDYXNoYmFja0Ftb3VudCcsXG4gICAgICAgICAgICAgICAgICAgICcjcndhbXQnOiAncmV3YXJkQW1vdW50JyxcbiAgICAgICAgICAgICAgICAgICAgJyN0b3RhbCc6ICd0b3RhbEFtb3VudCdcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCI6aWRcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogZ2V0VHJhbnNhY3Rpb25CeVN0YXR1c0lucHV0LmlkXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIFwiOnN0XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IGdldFRyYW5zYWN0aW9uQnlTdGF0dXNJbnB1dC5zdGF0dXNcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgS2V5Q29uZGl0aW9uRXhwcmVzc2lvbjogJyNpZCA9IDppZCBBTkQgI3N0ID0gOnN0J1xuICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICBleGNsdXNpdmVTdGFydEtleSA9IHJldHJpZXZlZERhdGEuTGFzdEV2YWx1YXRlZEtleTtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQocmV0cmlldmVkRGF0YS5JdGVtcyk7XG4gICAgICAgIH0gd2hpbGUgKHJldHJpZXZlZERhdGEgJiYgcmV0cmlldmVkRGF0YS5Db3VudCAmJiByZXRyaWV2ZWREYXRhLkl0ZW1zICYmXG4gICAgICAgIHJldHJpZXZlZERhdGEuSXRlbXMubGVuZ3RoICYmIHJldHJpZXZlZERhdGEuQ291bnQgIT09IDAgJiZcbiAgICAgICAgcmV0cmlldmVkRGF0YS5JdGVtcy5sZW5ndGggIT09IDAgJiYgcmV0cmlldmVkRGF0YS5MYXN0RXZhbHVhdGVkS2V5KTtcblxuICAgICAgICAvLyBpZiB0aGVyZSBhcmUgZWxpZ2libGUgdHJhbnNhY3Rpb25zIHJldHJpZXZlZCwgdGhlbiByZXR1cm4gdGhlbSBhY2NvcmRpbmdseVxuICAgICAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgIC8vIGNvbnZlcnQgdGhlIER5bmFtbyBEQiBkYXRhIGZyb20gRHluYW1vIERCIEpTT04gZm9ybWF0IHRvIGEgTW9vbmJlYW0gdHJhbnNhY3Rpb24gYnkgc3RhdHVzIG9iamVjdFxuICAgICAgICAgICAgY29uc3QgbW9vbmJlYW1UcmFuc2FjdGlvbkJ5U3RhdHVzRGF0YTogTW9vbmJlYW1UcmFuc2FjdGlvbkJ5U3RhdHVzW10gPSBbXTtcbiAgICAgICAgICAgIHJlc3VsdC5mb3JFYWNoKG1vb25iZWFtVHJhbnNhY3Rpb25CeVN0YXR1c1Jlc3VsdCA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbW9vbmJlYW1UcmFuc2FjdGlvbkJ5U3RhdHVzOiBNb29uYmVhbVRyYW5zYWN0aW9uQnlTdGF0dXMgPSB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiBtb29uYmVhbVRyYW5zYWN0aW9uQnlTdGF0dXNSZXN1bHQuaWQuUyEsXG4gICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogTnVtYmVyKG1vb25iZWFtVHJhbnNhY3Rpb25CeVN0YXR1c1Jlc3VsdC50aW1lc3RhbXAuTiEpLFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbklkOiBtb29uYmVhbVRyYW5zYWN0aW9uQnlTdGF0dXNSZXN1bHQudHJhbnNhY3Rpb25JZC5TISxcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25TdGF0dXM6IG1vb25iZWFtVHJhbnNhY3Rpb25CeVN0YXR1c1Jlc3VsdC50cmFuc2FjdGlvblN0YXR1cy5TISBhcyBUcmFuc2FjdGlvbnNTdGF0dXMsXG4gICAgICAgICAgICAgICAgICAgIGNyZWRpdGVkQ2FzaGJhY2tBbW91bnQ6IE51bWJlcihtb29uYmVhbVRyYW5zYWN0aW9uQnlTdGF0dXNSZXN1bHQuY3JlZGl0ZWRDYXNoYmFja0Ftb3VudC5OISksXG4gICAgICAgICAgICAgICAgICAgIHBlbmRpbmdDYXNoYmFja0Ftb3VudDogTnVtYmVyKG1vb25iZWFtVHJhbnNhY3Rpb25CeVN0YXR1c1Jlc3VsdC5wZW5kaW5nQ2FzaGJhY2tBbW91bnQuTiEpLFxuICAgICAgICAgICAgICAgICAgICByZXdhcmRBbW91bnQ6IE51bWJlcihtb29uYmVhbVRyYW5zYWN0aW9uQnlTdGF0dXNSZXN1bHQucmV3YXJkQW1vdW50Lk4hKSxcbiAgICAgICAgICAgICAgICAgICAgdG90YWxBbW91bnQ6IE51bWJlcihtb29uYmVhbVRyYW5zYWN0aW9uQnlTdGF0dXNSZXN1bHQudG90YWxBbW91bnQuTiEpXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBtb29uYmVhbVRyYW5zYWN0aW9uQnlTdGF0dXNEYXRhLnB1c2gobW9vbmJlYW1UcmFuc2FjdGlvbkJ5U3RhdHVzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBsaXN0IG9mIGZpbHRlcmVkIHRyYW5zYWN0aW9uc1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBkYXRhOiBtb29uYmVhbVRyYW5zYWN0aW9uQnlTdGF0dXNEYXRhXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVHJhbnNhY3Rpb25zIHdpdGggc3RhdHVzICR7Z2V0VHJhbnNhY3Rpb25CeVN0YXR1c0lucHV0LnN0YXR1c30gZm9yIHVzZXIgJHtnZXRUcmFuc2FjdGlvbkJ5U3RhdHVzSW5wdXQuaWR9ICBub3QgZm91bmQhYDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuTm9uZU9yQWJzZW50XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nICR7ZmllbGROYW1lfSBxdWVyeSAke2Vycn1gO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfTtcbiAgICB9XG59XG4iXX0=