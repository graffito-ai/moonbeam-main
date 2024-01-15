"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransaction = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * GetTransactionResolver resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getTransactionInput get transaction input object, used to retrieve transactional information,
 *
 * @returns {@link Promise} of {@link MoonbeamTransactionResponse}
 */
const getTransaction = async (fieldName, getTransactionInput) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // initializing the DynamoDB document client
        const dynamoDbClient = new client_dynamodb_1.DynamoDBClient({ region: region });
        // converting the AWSDateTime to Timestamp, for comparison and sorting purposes, based on the primary key's sort key
        const startDateTimestamp = getTransactionInput.startDate && Date.parse(new Date(getTransactionInput.startDate).toISOString());
        const endDateTimestamp = Date.parse(new Date(getTransactionInput.endDate).toISOString());
        /**
         * determine whether this range of creation time of a transaction, falls within particular
         * upper and lower bounds, or just within a particular bound.
         */
        const conditionalExpression = startDateTimestamp
            ? '#idf = :idf and #t BETWEEN :tStart and :tEnd'
            : '#idf = :idf and #t <= :tEnd';
        /**
         * the data to be retrieved from the Query Command
         * the transactional Items returned from the Query Command, all aggregated together
         * the last evaluated key, to help with the pagination of results
         */
        let result = [];
        let exclusiveStartKey, retrievedData;
        do {
            /**
             * retrieve the transactional data, given the get transactional input filtering/information
             *
             * Limit of 1 MB per paginated response data (in our case 1,500 items). An average size for an Item is about 500 bytes, which means that we won't
             * need to do pagination, until we actually decide to display transactions in a statement format.
             *
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.Pagination.html}
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html}
             */
            retrievedData = await dynamoDbClient.send(new client_dynamodb_1.QueryCommand({
                TableName: process.env.TRANSACTIONS_TABLE,
                ...(exclusiveStartKey && { ExclusiveStartKey: exclusiveStartKey }),
                Limit: 1500,
                ExpressionAttributeNames: {
                    '#idf': 'id',
                    '#t': 'timestamp'
                },
                ExpressionAttributeValues: {
                    ":idf": {
                        S: getTransactionInput.id
                    },
                    ":tEnd": {
                        N: endDateTimestamp.toString()
                    },
                    ...(startDateTimestamp && {
                        ":tStart": {
                            N: startDateTimestamp.toString()
                        }
                    })
                },
                KeyConditionExpression: conditionalExpression
            }));
            exclusiveStartKey = retrievedData.LastEvaluatedKey;
            result = result.concat(retrievedData.Items);
        } while (retrievedData && retrievedData.Count && retrievedData.Items &&
            retrievedData.Items.length && retrievedData.Count !== 0 &&
            retrievedData.Items.length !== 0 && retrievedData.LastEvaluatedKey);
        // if there is any transactional data retrieved, then return it accordingly
        if (result && result.length !== 0) {
            // convert the Dynamo DB data from Dynamo DB JSON format to a Moonbeam transactional data format
            const transactionalData = [];
            result.forEach(transactionResult => {
                const transaction = {
                    brandId: transactionResult.brandId.S,
                    cardId: transactionResult.cardId.S,
                    category: transactionResult.category.S,
                    createdAt: transactionResult.createdAt.S,
                    creditedCashbackAmount: Number(transactionResult.creditedCashbackAmount.N),
                    currencyCode: transactionResult.currencyCode.S,
                    id: transactionResult.id.S,
                    memberId: transactionResult.memberId.S,
                    pendingCashbackAmount: Number(transactionResult.pendingCashbackAmount.N),
                    rewardAmount: Number(transactionResult.rewardAmount.N),
                    storeId: transactionResult.storeId.S,
                    timestamp: Number(transactionResult.timestamp.N),
                    totalAmount: Number(transactionResult.totalAmount.N),
                    transactionBrandAddress: transactionResult.transactionBrandAddress.S,
                    transactionBrandLogoUrl: transactionResult.transactionBrandLogoUrl.S,
                    transactionBrandName: transactionResult.transactionBrandName.S,
                    transactionBrandURLAddress: transactionResult.transactionBrandURLAddress.S,
                    transactionId: transactionResult.transactionId.S,
                    transactionIsOnline: transactionResult.transactionIsOnline.BOOL,
                    transactionStatus: transactionResult.transactionStatus.S,
                    transactionType: transactionResult.transactionType.S,
                    updatedAt: transactionResult.updatedAt.S
                };
                transactionalData.push(transaction);
            });
            // return the retrieved card linking object
            return {
                data: transactionalData
            };
        }
        else {
            const errorMessage = `Transactional data not found for ${getTransactionInput.id}, and ${JSON.stringify(getTransactionInput)}`;
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
exports.getTransaction = getTransaction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0VHJhbnNhY3Rpb25SZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL0dldFRyYW5zYWN0aW9uUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOERBQXNGO0FBQ3RGLCtEQU1tQztBQUVuQzs7Ozs7OztHQU9HO0FBQ0ksTUFBTSxjQUFjLEdBQUcsS0FBSyxFQUFFLFNBQWlCLEVBQUUsbUJBQXdDLEVBQXlDLEVBQUU7SUFDdkksSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qyw0Q0FBNEM7UUFDNUMsTUFBTSxjQUFjLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFFNUQsb0hBQW9IO1FBQ3BILE1BQU0sa0JBQWtCLEdBQUcsbUJBQW1CLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsbUJBQW1CLENBQUMsU0FBUyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztRQUM5SCxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztRQUV6Rjs7O1dBR0c7UUFDSCxNQUFNLHFCQUFxQixHQUFHLGtCQUFrQjtZQUM1QyxDQUFDLENBQUMsOENBQThDO1lBQ2hELENBQUMsQ0FBQyw2QkFBNkIsQ0FBQztRQUVwQzs7OztXQUlHO1FBQ0gsSUFBSSxNQUFNLEdBQXFDLEVBQUUsQ0FBQztRQUNsRCxJQUFJLGlCQUFpQixFQUFFLGFBQWEsQ0FBQztRQUVyQyxHQUFHO1lBQ0M7Ozs7Ozs7O2VBUUc7WUFDSCxhQUFhLEdBQUcsTUFBTSxjQUFjLENBQUMsSUFBSSxD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UXVlcnlDb21tYW5kfSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWR5bmFtb2RiXCI7XG5pbXBvcnQge1xuICAgIEN1cnJlbmN5Q29kZVR5cGUsXG4gICAgR2V0VHJhbnNhY3Rpb25JbnB1dCxcbiAgICBNb29uYmVhbVRyYW5zYWN0aW9uLFxuICAgIE1vb25iZWFtVHJhbnNhY3Rpb25zUmVzcG9uc2UsXG4gICAgVHJhbnNhY3Rpb25zRXJyb3JUeXBlLCBUcmFuc2FjdGlvbnNTdGF0dXMsIFRyYW5zYWN0aW9uVHlwZVxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuXG4vKipcbiAqIEdldFRyYW5zYWN0aW9uUmVzb2x2ZXIgcmVzb2x2ZXJcbiAqXG4gKiBAcGFyYW0gZmllbGROYW1lIG5hbWUgb2YgdGhlIHJlc29sdmVyIHBhdGggZnJvbSB0aGUgQXBwU3luYyBldmVudFxuICogQHBhcmFtIGdldFRyYW5zYWN0aW9uSW5wdXQgZ2V0IHRyYW5zYWN0aW9uIGlucHV0IG9iamVjdCwgdXNlZCB0byByZXRyaWV2ZSB0cmFuc2FjdGlvbmFsIGluZm9ybWF0aW9uLFxuICpcbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgTW9vbmJlYW1UcmFuc2FjdGlvblJlc3BvbnNlfVxuICovXG5leHBvcnQgY29uc3QgZ2V0VHJhbnNhY3Rpb24gPSBhc3luYyAoZmllbGROYW1lOiBzdHJpbmcsIGdldFRyYW5zYWN0aW9uSW5wdXQ6IEdldFRyYW5zYWN0aW9uSW5wdXQpOiBQcm9taXNlPE1vb25iZWFtVHJhbnNhY3Rpb25zUmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvLyBpbml0aWFsaXppbmcgdGhlIER5bmFtb0RCIGRvY3VtZW50IGNsaWVudFxuICAgICAgICBjb25zdCBkeW5hbW9EYkNsaWVudCA9IG5ldyBEeW5hbW9EQkNsaWVudCh7cmVnaW9uOiByZWdpb259KTtcblxuICAgICAgICAvLyBjb252ZXJ0aW5nIHRoZSBBV1NEYXRlVGltZSB0byBUaW1lc3RhbXAsIGZvciBjb21wYXJpc29uIGFuZCBzb3J0aW5nIHB1cnBvc2VzLCBiYXNlZCBvbiB0aGUgcHJpbWFyeSBrZXkncyBzb3J0IGtleVxuICAgICAgICBjb25zdCBzdGFydERhdGVUaW1lc3RhbXAgPSBnZXRUcmFuc2FjdGlvbklucHV0LnN0YXJ0RGF0ZSAmJiBEYXRlLnBhcnNlKG5ldyBEYXRlKGdldFRyYW5zYWN0aW9uSW5wdXQuc3RhcnREYXRlKS50b0lTT1N0cmluZygpKTtcbiAgICAgICAgY29uc3QgZW5kRGF0ZVRpbWVzdGFtcCA9IERhdGUucGFyc2UobmV3IERhdGUoZ2V0VHJhbnNhY3Rpb25JbnB1dC5lbmREYXRlKS50b0lTT1N0cmluZygpKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogZGV0ZXJtaW5lIHdoZXRoZXIgdGhpcyByYW5nZSBvZiBjcmVhdGlvbiB0aW1lIG9mIGEgdHJhbnNhY3Rpb24sIGZhbGxzIHdpdGhpbiBwYXJ0aWN1bGFyXG4gICAgICAgICAqIHVwcGVyIGFuZCBsb3dlciBib3VuZHMsIG9yIGp1c3Qgd2l0aGluIGEgcGFydGljdWxhciBib3VuZC5cbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IGNvbmRpdGlvbmFsRXhwcmVzc2lvbiA9IHN0YXJ0RGF0ZVRpbWVzdGFtcFxuICAgICAgICAgICAgPyAnI2lkZiA9IDppZGYgYW5kICN0IEJFVFdFRU4gOnRTdGFydCBhbmQgOnRFbmQnXG4gICAgICAgICAgICA6ICcjaWRmID0gOmlkZiBhbmQgI3QgPD0gOnRFbmQnO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiB0aGUgZGF0YSB0byBiZSByZXRyaWV2ZWQgZnJvbSB0aGUgUXVlcnkgQ29tbWFuZFxuICAgICAgICAgKiB0aGUgdHJhbnNhY3Rpb25hbCBJdGVtcyByZXR1cm5lZCBmcm9tIHRoZSBRdWVyeSBDb21tYW5kLCBhbGwgYWdncmVnYXRlZCB0b2dldGhlclxuICAgICAgICAgKiB0aGUgbGFzdCBldmFsdWF0ZWQga2V5LCB0byBoZWxwIHdpdGggdGhlIHBhZ2luYXRpb24gb2YgcmVzdWx0c1xuICAgICAgICAgKi9cbiAgICAgICAgbGV0IHJlc3VsdDogUmVjb3JkPHN0cmluZywgQXR0cmlidXRlVmFsdWU+W10gPSBbXTtcbiAgICAgICAgbGV0IGV4Y2x1c2l2ZVN0YXJ0S2V5LCByZXRyaWV2ZWREYXRhO1xuXG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogcmV0cmlldmUgdGhlIHRyYW5zYWN0aW9uYWwgZGF0YSwgZ2l2ZW4gdGhlIGdldCB0cmFuc2FjdGlvbmFsIGlucHV0IGZpbHRlcmluZy9pbmZvcm1hdGlvblxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIExpbWl0IG9mIDEgTUIgcGVyIHBhZ2luYXRlZCByZXNwb25zZSBkYXRhIChpbiBvdXIgY2FzZSAxLDUwMCBpdGVtcykuIEFuIGF2ZXJhZ2Ugc2l6ZSBmb3IgYW4gSXRlbSBpcyBhYm91dCA1MDAgYnl0ZXMsIHdoaWNoIG1lYW5zIHRoYXQgd2Ugd29uJ3RcbiAgICAgICAgICAgICAqIG5lZWQgdG8gZG8gcGFnaW5hdGlvbiwgdW50aWwgd2UgYWN0dWFsbHkgZGVjaWRlIHRvIGRpc3BsYXkgdHJhbnNhY3Rpb25zIGluIGEgc3RhdGVtZW50IGZvcm1hdC5cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAbGluayB7aHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2FtYXpvbmR5bmFtb2RiL2xhdGVzdC9kZXZlbG9wZXJndWlkZS9RdWVyeS5QYWdpbmF0aW9uLmh0bWx9XG4gICAgICAgICAgICAgKiBAbGluayB7aHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2FtYXpvbmR5bmFtb2RiL2xhdGVzdC9kZXZlbG9wZXJndWlkZS9RdWVyeS5odG1sfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICByZXRyaWV2ZWREYXRhID0gYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgUXVlcnlDb21tYW5kKHtcbiAgICAgICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LlRSQU5TQUNUSU9OU19UQUJMRSEsXG4gICAgICAgICAgICAgICAgLi4uKGV4Y2x1c2l2ZVN0YXJ0S2V5ICYmIHtFeGNsdXNpdmVTdGFydEtleTogZXhjbHVzaXZlU3RhcnRLZXl9KSxcbiAgICAgICAgICAgICAgICBMaW1pdDogMTUwMCwgLy8gMSw1MDAgKiA1MDAgYnl0ZXMgPSA3NTAsMDAwIGJ5dGVzID0gMC43NSBNQiAobGVhdmUgYSBtYXJnaW4gb2YgZXJyb3IgaGVyZSB1cCB0byAxIE1CKVxuICAgICAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lczoge1xuICAgICAgICAgICAgICAgICAgICAnI2lkZic6ICdpZCcsXG4gICAgICAgICAgICAgICAgICAgICcjdCc6ICd0aW1lc3RhbXAnXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlVmFsdWVzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiOmlkZlwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiBnZXRUcmFuc2FjdGlvbklucHV0LmlkXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIFwiOnRFbmRcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgTjogZW5kRGF0ZVRpbWVzdGFtcC50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIC4uLihzdGFydERhdGVUaW1lc3RhbXAgJiYge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCI6dFN0YXJ0XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBOOiBzdGFydERhdGVUaW1lc3RhbXAudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgS2V5Q29uZGl0aW9uRXhwcmVzc2lvbjogY29uZGl0aW9uYWxFeHByZXNzaW9uXG4gICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgIGV4Y2x1c2l2ZVN0YXJ0S2V5ID0gcmV0cmlldmVkRGF0YS5MYXN0RXZhbHVhdGVkS2V5O1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdChyZXRyaWV2ZWREYXRhLkl0ZW1zKTtcbiAgICAgICAgfSB3aGlsZSAocmV0cmlldmVkRGF0YSAmJiByZXRyaWV2ZWREYXRhLkNvdW50ICYmIHJldHJpZXZlZERhdGEuSXRlbXMgJiZcbiAgICAgICAgcmV0cmlldmVkRGF0YS5JdGVtcy5sZW5ndGggJiYgcmV0cmlldmVkRGF0YS5Db3VudCAhPT0gMCAmJlxuICAgICAgICByZXRyaWV2ZWREYXRhLkl0ZW1zLmxlbmd0aCAhPT0gMCAmJiByZXRyaWV2ZWREYXRhLkxhc3RFdmFsdWF0ZWRLZXkpO1xuXG4gICAgICAgIC8vIGlmIHRoZXJlIGlzIGFueSB0cmFuc2FjdGlvbmFsIGRhdGEgcmV0cmlldmVkLCB0aGVuIHJldHVybiBpdCBhY2NvcmRpbmdseVxuICAgICAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgIC8vIGNvbnZlcnQgdGhlIER5bmFtbyBEQiBkYXRhIGZyb20gRHluYW1vIERCIEpTT04gZm9ybWF0IHRvIGEgTW9vbmJlYW0gdHJhbnNhY3Rpb25hbCBkYXRhIGZvcm1hdFxuICAgICAgICAgICBjb25zdCB0cmFuc2FjdGlvbmFsRGF0YTogTW9vbmJlYW1UcmFuc2FjdGlvbltdID0gW107XG4gICAgICAgICAgIHJlc3VsdC5mb3JFYWNoKHRyYW5zYWN0aW9uUmVzdWx0ID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB0cmFuc2FjdGlvbjogTW9vbmJlYW1UcmFuc2FjdGlvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgYnJhbmRJZDogdHJhbnNhY3Rpb25SZXN1bHQuYnJhbmRJZC5TISxcbiAgICAgICAgICAgICAgICAgICAgY2FyZElkOiB0cmFuc2FjdGlvblJlc3VsdC5jYXJkSWQuUyEsXG4gICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5OiB0cmFuc2FjdGlvblJlc3VsdC5jYXRlZ29yeS5TISxcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0OiB0cmFuc2FjdGlvblJlc3VsdC5jcmVhdGVkQXQuUyEsXG4gICAgICAgICAgICAgICAgICAgIGNyZWRpdGVkQ2FzaGJhY2tBbW91bnQ6IE51bWJlcih0cmFuc2FjdGlvblJlc3VsdC5jcmVkaXRlZENhc2hiYWNrQW1vdW50Lk4hKSxcbiAgICAgICAgICAgICAgICAgICAgY3VycmVuY3lDb2RlOiB0cmFuc2FjdGlvblJlc3VsdC5jdXJyZW5jeUNvZGUuUyEgYXMgQ3VycmVuY3lDb2RlVHlwZSxcbiAgICAgICAgICAgICAgICAgICAgaWQ6IHRyYW5zYWN0aW9uUmVzdWx0LmlkLlMhLFxuICAgICAgICAgICAgICAgICAgICBtZW1iZXJJZDogdHJhbnNhY3Rpb25SZXN1bHQubWVtYmVySWQuUyEsXG4gICAgICAgICAgICAgICAgICAgIHBlbmRpbmdDYXNoYmFja0Ftb3VudDogTnVtYmVyKHRyYW5zYWN0aW9uUmVzdWx0LnBlbmRpbmdDYXNoYmFja0Ftb3VudC5OISksXG4gICAgICAgICAgICAgICAgICAgIHJld2FyZEFtb3VudDogTnVtYmVyKHRyYW5zYWN0aW9uUmVzdWx0LnJld2FyZEFtb3VudC5OISksXG4gICAgICAgICAgICAgICAgICAgIHN0b3JlSWQ6IHRyYW5zYWN0aW9uUmVzdWx0LnN0b3JlSWQuUyEsXG4gICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogTnVtYmVyKHRyYW5zYWN0aW9uUmVzdWx0LnRpbWVzdGFtcC5OISksXG4gICAgICAgICAgICAgICAgICAgIHRvdGFsQW1vdW50OiBOdW1iZXIodHJhbnNhY3Rpb25SZXN1bHQudG90YWxBbW91bnQuTiEpLFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kQWRkcmVzczogdHJhbnNhY3Rpb25SZXN1bHQudHJhbnNhY3Rpb25CcmFuZEFkZHJlc3MuUyEsXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uQnJhbmRMb2dvVXJsOiB0cmFuc2FjdGlvblJlc3VsdC50cmFuc2FjdGlvbkJyYW5kTG9nb1VybC5TISxcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZE5hbWU6IHRyYW5zYWN0aW9uUmVzdWx0LnRyYW5zYWN0aW9uQnJhbmROYW1lLlMhLFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kVVJMQWRkcmVzczogdHJhbnNhY3Rpb25SZXN1bHQudHJhbnNhY3Rpb25CcmFuZFVSTEFkZHJlc3MuUyEsXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uSWQ6IHRyYW5zYWN0aW9uUmVzdWx0LnRyYW5zYWN0aW9uSWQuUyEsXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uSXNPbmxpbmU6IHRyYW5zYWN0aW9uUmVzdWx0LnRyYW5zYWN0aW9uSXNPbmxpbmUuQk9PTCEsXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uU3RhdHVzOiB0cmFuc2FjdGlvblJlc3VsdC50cmFuc2FjdGlvblN0YXR1cy5TISBhcyBUcmFuc2FjdGlvbnNTdGF0dXMsXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uVHlwZTogdHJhbnNhY3Rpb25SZXN1bHQudHJhbnNhY3Rpb25UeXBlLlMhIGFzIFRyYW5zYWN0aW9uVHlwZSxcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEF0OiB0cmFuc2FjdGlvblJlc3VsdC51cGRhdGVkQXQuUyFcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25hbERhdGEucHVzaCh0cmFuc2FjdGlvbik7XG4gICAgICAgICAgICB9KTtcblxuXG4gICAgICAgICAgICAvLyByZXR1cm4gdGhlIHJldHJpZXZlZCBjYXJkIGxpbmtpbmcgb2JqZWN0XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRhdGE6IHRyYW5zYWN0aW9uYWxEYXRhXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVHJhbnNhY3Rpb25hbCBkYXRhIG5vdCBmb3VuZCBmb3IgJHtnZXRUcmFuc2FjdGlvbklucHV0LmlkfSwgYW5kICR7SlNPTi5zdHJpbmdpZnkoZ2V0VHJhbnNhY3Rpb25JbnB1dCl9YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuTm9uZU9yQWJzZW50XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgJHtmaWVsZE5hbWV9IHF1ZXJ5ICR7ZXJyfWA7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICB9O1xuICAgIH1cbn1cbiJdfQ==