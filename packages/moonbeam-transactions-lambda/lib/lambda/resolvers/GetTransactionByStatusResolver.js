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
             * Limit of 1 MB per paginated response data (in our case 3,800 items). An average size for an Item is about 205 bytes, which means that we won't
             * need to do pagination here, since we actually retrieve all users in a looped format, and we account for
             * paginated responses.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0VHJhbnNhY3Rpb25CeVN0YXR1c1Jlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvR2V0VHJhbnNhY3Rpb25CeVN0YXR1c1Jlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDhEQUFzRjtBQUN0RiwrREFNbUM7QUFFbkM7Ozs7Ozs7O0dBUUc7QUFDSSxNQUFNLHNCQUFzQixHQUFHLEtBQUssRUFBRSxTQUFpQixFQUFFLDJCQUF3RCxFQUFpRCxFQUFFO0lBQ3ZLLElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsNENBQTRDO1FBQzVDLE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBRTVEOzs7O1dBSUc7UUFDSCxJQUFJLE1BQU0sR0FBcUMsRUFBRSxDQUFDO1FBQ2xELElBQUksaUJBQWlCLEVBQUUsYUFBYSxDQUFDO1FBRXJDLEdBQUc7WUFDQzs7Ozs7Ozs7O2VBU0c7WUFDSCxhQUFhLEdBQUcsTUFBTSxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksOEJBQVksQ0FBQztnQkFDdkQsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQW1CO2dCQUMxQyxTQUFTLEVBQUUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLCtCQUFnQyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUyxJQUFJLE1BQU0sRUFBRTtnQkFDL0YsR0FBRyxDQUFDLGlCQUFpQixJQUFJLEVBQUMsaUJBQWlCLEVBQUUsaUJBQWlCLEVBQUMsQ0FBQztnQkFDaEUsS0FBSyxFQUFFLElBQUk7Z0JBQ1g7Ozs7O21CQUtHO2dCQUNILG9CQUFvQixFQUFFLHVEQUF1RDtnQkFDN0Usd0JBQXdCLEVBQUU7b0JBQ3RCLEtBQUssRUFB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TDtBQUNMLENBQUMsQ0FBQTtBQXhHWSxRQUFBLHNCQUFzQiwwQkF3R2xDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBdHRyaWJ1dGVWYWx1ZSwgRHluYW1vREJDbGllbnQsIFF1ZXJ5Q29tbWFuZH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1keW5hbW9kYlwiO1xuaW1wb3J0IHtcbiAgICBHZXRUcmFuc2FjdGlvbkJ5U3RhdHVzSW5wdXQsXG4gICAgTW9vbmJlYW1UcmFuc2FjdGlvbkJ5U3RhdHVzLFxuICAgIE1vb25iZWFtVHJhbnNhY3Rpb25zQnlTdGF0dXNSZXNwb25zZSxcbiAgICBUcmFuc2FjdGlvbnNFcnJvclR5cGUsXG4gICAgVHJhbnNhY3Rpb25zU3RhdHVzXG59IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5cbi8qKlxuICogR2V0VHJhbnNhY3Rpb25CeVN0YXR1c1Jlc29sdmVyIHJlc29sdmVyXG4gKlxuICogQHBhcmFtIGZpZWxkTmFtZSBuYW1lIG9mIHRoZSByZXNvbHZlciBwYXRoIGZyb20gdGhlIEFwcFN5bmMgZXZlbnRcbiAqIEBwYXJhbSBnZXRUcmFuc2FjdGlvbkJ5U3RhdHVzSW5wdXQgZ2V0IHRyYW5zYWN0aW9uIGJ5IHN0YXR1cyBpbnB1dCBvYmplY3QsIHVzZWQgdG8gcmV0cmlldmUgdHJhbnNhY3Rpb25hbCBpbmZvcm1hdGlvbixcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFzZWQgb24gc3RhdHVzLlxuICpcbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgTW9vbmJlYW1UcmFuc2FjdGlvbnNCeVN0YXR1c1Jlc3BvbnNlfVxuICovXG5leHBvcnQgY29uc3QgZ2V0VHJhbnNhY3Rpb25CeVN0YXR1cyA9IGFzeW5jIChmaWVsZE5hbWU6IHN0cmluZywgZ2V0VHJhbnNhY3Rpb25CeVN0YXR1c0lucHV0OiBHZXRUcmFuc2FjdGlvbkJ5U3RhdHVzSW5wdXQpOiBQcm9taXNlPE1vb25iZWFtVHJhbnNhY3Rpb25zQnlTdGF0dXNSZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIGluaXRpYWxpemluZyB0aGUgRHluYW1vREIgZG9jdW1lbnQgY2xpZW50XG4gICAgICAgIGNvbnN0IGR5bmFtb0RiQ2xpZW50ID0gbmV3IER5bmFtb0RCQ2xpZW50KHtyZWdpb246IHJlZ2lvbn0pO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiB0aGUgZGF0YSB0byBiZSByZXRyaWV2ZWQgZnJvbSB0aGUgUXVlcnkgQ29tbWFuZFxuICAgICAgICAgKiB0aGUgZWxpZ2libGUgdXNlciBJdGVtcyByZXR1cm5lZCBmcm9tIHRoZSBRdWVyeSBDb21tYW5kLCBhbGwgYWdncmVnYXRlZCB0b2dldGhlclxuICAgICAgICAgKiB0aGUgbGFzdCBldmFsdWF0ZWQga2V5LCB0byBoZWxwIHdpdGggdGhlIHBhZ2luYXRpb24gb2YgcmVzdWx0c1xuICAgICAgICAgKi9cbiAgICAgICAgbGV0IHJlc3VsdDogUmVjb3JkPHN0cmluZywgQXR0cmlidXRlVmFsdWU+W10gPSBbXTtcbiAgICAgICAgbGV0IGV4Y2x1c2l2ZVN0YXJ0S2V5LCByZXRyaWV2ZWREYXRhO1xuXG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogcmV0cmlldmUgYWxsIHRoZSB0cmFuc2FjdGlvbnMgd2l0aCBhIHNwZWNpZmljIHN0YXR1cywgZ2l2ZW4gdGhlIGdsb2JhbCBzZWNvbmRhcnkgaW5kZXhcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBMaW1pdCBvZiAxIE1CIHBlciBwYWdpbmF0ZWQgcmVzcG9uc2UgZGF0YSAoaW4gb3VyIGNhc2UgMyw4MDAgaXRlbXMpLiBBbiBhdmVyYWdlIHNpemUgZm9yIGFuIEl0ZW0gaXMgYWJvdXQgMjA1IGJ5dGVzLCB3aGljaCBtZWFucyB0aGF0IHdlIHdvbid0XG4gICAgICAgICAgICAgKiBuZWVkIHRvIGRvIHBhZ2luYXRpb24gaGVyZSwgc2luY2Ugd2UgYWN0dWFsbHkgcmV0cmlldmUgYWxsIHVzZXJzIGluIGEgbG9vcGVkIGZvcm1hdCwgYW5kIHdlIGFjY291bnQgZm9yXG4gICAgICAgICAgICAgKiBwYWdpbmF0ZWQgcmVzcG9uc2VzLlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIEBsaW5rIHtodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL1F1ZXJ5LlBhZ2luYXRpb24uaHRtbH1cbiAgICAgICAgICAgICAqIEBsaW5rIHtodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL1F1ZXJ5Lmh0bWx9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHJldHJpZXZlZERhdGEgPSBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBRdWVyeUNvbW1hbmQoe1xuICAgICAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuVFJBTlNBQ1RJT05TX1RBQkxFISxcbiAgICAgICAgICAgICAgICBJbmRleE5hbWU6IGAke3Byb2Nlc3MuZW52LlRSQU5TQUNUSU9OU19TVEFUVVNfTE9DQUxfSU5ERVghfS0ke3Byb2Nlc3MuZW52LkVOVl9OQU1FIX0tJHtyZWdpb259YCxcbiAgICAgICAgICAgICAgICAuLi4oZXhjbHVzaXZlU3RhcnRLZXkgJiYge0V4Y2x1c2l2ZVN0YXJ0S2V5OiBleGNsdXNpdmVTdGFydEtleX0pLFxuICAgICAgICAgICAgICAgIExpbWl0OiAzODAwLCAvLyAzODAwICogMTExIGJ5dGVzID0gNzc5LDAwMCBieXRlcyA9IDAuNzc5IE1CIChsZWF2ZSBhIG1hcmdpbiBvZiBlcnJvciBoZXJlIHVwIHRvIDEgTUIpXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogd2UncmUgbm90IGludGVyZXN0ZWQgaW4gZ2V0dGluZyBhbGwgdGhlIGRhdGEgZm9yIHRoaXMgY2FsbCwganVzdCB0aGUgbWluaW11bSBmb3IgdXMgdG8gcmV0dXJuIHRoZSBuZWNlc3NhcnkgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9hbWF6b25keW5hbW9kYi9sYXRlc3QvZGV2ZWxvcGVyZ3VpZGUvUmVzZXJ2ZWRXb3Jkcy5odG1sXG4gICAgICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2FtYXpvbmR5bmFtb2RiL2xhdGVzdC9kZXZlbG9wZXJndWlkZS9FeHByZXNzaW9ucy5FeHByZXNzaW9uQXR0cmlidXRlTmFtZXMuaHRtbFxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIFByb2plY3Rpb25FeHByZXNzaW9uOiAnI2lkLCAjdGltZSwgI2lkdCwgI3N0LCAjY2NhbXQsICNwY2FtdCwgI3J3YW10LCAjdG90YWwnLFxuICAgICAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lczoge1xuICAgICAgICAgICAgICAgICAgICAnI2lkJzogJ2lkJyxcbiAgICAgICAgICAgICAgICAgICAgJyNpZHQnOiAndHJhbnNhY3Rpb25JZCcsXG4gICAgICAgICAgICAgICAgICAgICcjdGltZSc6ICd0aW1lc3RhbXAnLFxuICAgICAgICAgICAgICAgICAgICAnI3N0JzogJ3RyYW5zYWN0aW9uU3RhdHVzJyxcbiAgICAgICAgICAgICAgICAgICAgJyNjY2FtdCc6ICdjcmVkaXRlZENhc2hiYWNrQW1vdW50JyxcbiAgICAgICAgICAgICAgICAgICAgJyNwY2FtdCc6ICdwZW5kaW5nQ2FzaGJhY2tBbW91bnQnLFxuICAgICAgICAgICAgICAgICAgICAnI3J3YW10JzogJ3Jld2FyZEFtb3VudCcsXG4gICAgICAgICAgICAgICAgICAgICcjdG90YWwnOiAndG90YWxBbW91bnQnXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlVmFsdWVzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiOmlkXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IGdldFRyYW5zYWN0aW9uQnlTdGF0dXNJbnB1dC5pZFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBcIjpzdFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiBnZXRUcmFuc2FjdGlvbkJ5U3RhdHVzSW5wdXQuc3RhdHVzXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIEtleUNvbmRpdGlvbkV4cHJlc3Npb246ICcjaWQgPSA6aWQgQU5EICNzdCA9IDpzdCdcbiAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgZXhjbHVzaXZlU3RhcnRLZXkgPSByZXRyaWV2ZWREYXRhLkxhc3RFdmFsdWF0ZWRLZXk7XG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KHJldHJpZXZlZERhdGEuSXRlbXMpO1xuICAgICAgICB9IHdoaWxlIChyZXRyaWV2ZWREYXRhICYmIHJldHJpZXZlZERhdGEuQ291bnQgJiYgcmV0cmlldmVkRGF0YS5JdGVtcyAmJlxuICAgICAgICByZXRyaWV2ZWREYXRhLkl0ZW1zLmxlbmd0aCAmJiByZXRyaWV2ZWREYXRhLkNvdW50ICE9PSAwICYmXG4gICAgICAgIHJldHJpZXZlZERhdGEuSXRlbXMubGVuZ3RoICE9PSAwICYmIHJldHJpZXZlZERhdGEuTGFzdEV2YWx1YXRlZEtleSk7XG5cbiAgICAgICAgLy8gaWYgdGhlcmUgYXJlIGVsaWdpYmxlIHRyYW5zYWN0aW9ucyByZXRyaWV2ZWQsIHRoZW4gcmV0dXJuIHRoZW0gYWNjb3JkaW5nbHlcbiAgICAgICAgaWYgKHJlc3VsdCAmJiByZXN1bHQubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAvLyBjb252ZXJ0IHRoZSBEeW5hbW8gREIgZGF0YSBmcm9tIER5bmFtbyBEQiBKU09OIGZvcm1hdCB0byBhIE1vb25iZWFtIHRyYW5zYWN0aW9uIGJ5IHN0YXR1cyBvYmplY3RcbiAgICAgICAgICAgIGNvbnN0IG1vb25iZWFtVHJhbnNhY3Rpb25CeVN0YXR1c0RhdGE6IE1vb25iZWFtVHJhbnNhY3Rpb25CeVN0YXR1c1tdID0gW107XG4gICAgICAgICAgICByZXN1bHQuZm9yRWFjaChtb29uYmVhbVRyYW5zYWN0aW9uQnlTdGF0dXNSZXN1bHQgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1vb25iZWFtVHJhbnNhY3Rpb25CeVN0YXR1czogTW9vbmJlYW1UcmFuc2FjdGlvbkJ5U3RhdHVzID0ge1xuICAgICAgICAgICAgICAgICAgICBpZDogbW9vbmJlYW1UcmFuc2FjdGlvbkJ5U3RhdHVzUmVzdWx0LmlkLlMhLFxuICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IE51bWJlcihtb29uYmVhbVRyYW5zYWN0aW9uQnlTdGF0dXNSZXN1bHQudGltZXN0YW1wLk4hKSxcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25JZDogbW9vbmJlYW1UcmFuc2FjdGlvbkJ5U3RhdHVzUmVzdWx0LnRyYW5zYWN0aW9uSWQuUyEsXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uU3RhdHVzOiBtb29uYmVhbVRyYW5zYWN0aW9uQnlTdGF0dXNSZXN1bHQudHJhbnNhY3Rpb25TdGF0dXMuUyEgYXMgVHJhbnNhY3Rpb25zU3RhdHVzLFxuICAgICAgICAgICAgICAgICAgICBjcmVkaXRlZENhc2hiYWNrQW1vdW50OiBOdW1iZXIobW9vbmJlYW1UcmFuc2FjdGlvbkJ5U3RhdHVzUmVzdWx0LmNyZWRpdGVkQ2FzaGJhY2tBbW91bnQuTiEpLFxuICAgICAgICAgICAgICAgICAgICBwZW5kaW5nQ2FzaGJhY2tBbW91bnQ6IE51bWJlcihtb29uYmVhbVRyYW5zYWN0aW9uQnlTdGF0dXNSZXN1bHQucGVuZGluZ0Nhc2hiYWNrQW1vdW50Lk4hKSxcbiAgICAgICAgICAgICAgICAgICAgcmV3YXJkQW1vdW50OiBOdW1iZXIobW9vbmJlYW1UcmFuc2FjdGlvbkJ5U3RhdHVzUmVzdWx0LnJld2FyZEFtb3VudC5OISksXG4gICAgICAgICAgICAgICAgICAgIHRvdGFsQW1vdW50OiBOdW1iZXIobW9vbmJlYW1UcmFuc2FjdGlvbkJ5U3RhdHVzUmVzdWx0LnRvdGFsQW1vdW50Lk4hKVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgbW9vbmJlYW1UcmFuc2FjdGlvbkJ5U3RhdHVzRGF0YS5wdXNoKG1vb25iZWFtVHJhbnNhY3Rpb25CeVN0YXR1cyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIHJldHVybiB0aGUgbGlzdCBvZiBmaWx0ZXJlZCB0cmFuc2FjdGlvbnNcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGF0YTogbW9vbmJlYW1UcmFuc2FjdGlvbkJ5U3RhdHVzRGF0YVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFRyYW5zYWN0aW9ucyB3aXRoIHN0YXR1cyAke2dldFRyYW5zYWN0aW9uQnlTdGF0dXNJbnB1dC5zdGF0dXN9IGZvciB1c2VyICR7Z2V0VHJhbnNhY3Rpb25CeVN0YXR1c0lucHV0LmlkfSAgbm90IGZvdW5kIWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLk5vbmVPckFic2VudFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyAke2ZpZWxkTmFtZX0gcXVlcnkgJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH07XG4gICAgfVxufVxuIl19