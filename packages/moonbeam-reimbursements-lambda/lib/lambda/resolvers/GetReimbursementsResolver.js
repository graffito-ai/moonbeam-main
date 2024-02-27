"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReimbursements = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * GetReimbursements resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getReimbursementsInput get reimbursements input object, used to retrieve reimbursement information.
 *
 * @returns {@link Promise} of {@link ReimbursementResponse}
 */
const getReimbursements = async (fieldName, getReimbursementsInput) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // initializing the DynamoDB document client
        const dynamoDbClient = new client_dynamodb_1.DynamoDBClient({ region: region });
        // converting the AWSDateTime to Timestamp, for comparison and sorting purposes, based on the primary key's sort key
        const startDateTimestamp = getReimbursementsInput.startDate && Date.parse(new Date(getReimbursementsInput.startDate).toISOString());
        const endDateTimestamp = Date.parse(new Date(getReimbursementsInput.endDate).toISOString());
        /**
         * determine whether this range of creation time of a reimbursement, falls within particular
         * upper and lower bounds, or just within a particular bound.
         */
        const conditionalExpression = startDateTimestamp
            ? '#idf = :idf and #t BETWEEN :tStart and :tEnd'
            : '#idf = :idf and #t <= :tEnd';
        /**
         * the data to be retrieved from the Query Command
         * the reimbursement Items returned from the Query Command, all aggregated together
         * the last evaluated key, to help with the pagination of results
         */
        let result = [];
        let exclusiveStartKey, retrievedData;
        do {
            /**
             * retrieve the reimbursement data, given the get reimbursement input filtering/information
             *
             * Limit of 1 MB per paginated response data (in our case 300 items). We cannot really determine the average size for an Item,
             * because a reimbursement can have multiple potential transactions. Nevertheless, we do not need to do pagination, until we actually
             * decide to display reimbursements in a statement format.
             *
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.Pagination.html}
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html}
             */
            retrievedData = await dynamoDbClient.send(new client_dynamodb_1.QueryCommand({
                TableName: process.env.REIMBURSEMENTS_TABLE,
                ...(exclusiveStartKey && { ExclusiveStartKey: exclusiveStartKey }),
                Limit: 300,
                ExpressionAttributeNames: {
                    '#idf': 'id',
                    '#t': 'timestamp'
                },
                ExpressionAttributeValues: {
                    ":idf": {
                        S: getReimbursementsInput.id
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
        // if there is any reimbursement data retrieved, then return it accordingly
        if (result && result.length !== 0) {
            // convert the Dynamo DB data from Dynamo DB JSON format to a Moonbeam Reimbursement data format
            const reimbursementData = [];
            result.forEach(reimbursementResult => {
                // first build the transaction array data to return for reimbursements
                const transactions = [];
                reimbursementResult.transactions.L && reimbursementResult.transactions.L.forEach(transactionResult => {
                    const newTransaction = {
                        brandId: transactionResult.M.brandId.S,
                        cardId: transactionResult.M.cardId.S,
                        category: transactionResult.M.category.S,
                        createdAt: transactionResult.M.createdAt.S,
                        creditedCashbackAmount: Number(transactionResult.M.creditedCashbackAmount.N),
                        currencyCode: transactionResult.M.currencyCode.S,
                        id: transactionResult.M.id.S,
                        memberId: transactionResult.M.memberId.S,
                        pendingCashbackAmount: Number(transactionResult.M.pendingCashbackAmount.N),
                        rewardAmount: Number(transactionResult.M.rewardAmount.N),
                        storeId: transactionResult.M.storeId.S,
                        timestamp: Number(transactionResult.M.timestamp.N),
                        totalAmount: Number(transactionResult.M.totalAmount.N),
                        transactionBrandAddress: transactionResult.M.transactionBrandAddress.S,
                        transactionBrandLogoUrl: transactionResult.M.transactionBrandLogoUrl.S,
                        transactionBrandName: transactionResult.M.transactionBrandName.S,
                        transactionBrandURLAddress: transactionResult.M.transactionBrandURLAddress.S,
                        transactionId: transactionResult.M.transactionId.S,
                        transactionIsOnline: transactionResult.M.transactionIsOnline.BOOL,
                        transactionStatus: transactionResult.M.transactionStatus.S,
                        transactionType: transactionResult.M.transactionType.S,
                        updatedAt: transactionResult.M.updatedAt.S
                    };
                    transactions.push(newTransaction);
                });
                // build out each reimbursement object to return
                const reimbursement = {
                    amount: Number(reimbursementResult.amount.N),
                    cardId: reimbursementResult.cardId.S,
                    cardLast4: reimbursementResult.cardLast4.S,
                    cardType: reimbursementResult.cardType.S,
                    createdAt: reimbursementResult.createdAt.S,
                    id: reimbursementResult.id.S,
                    reimbursementId: reimbursementResult.reimbursementId.S,
                    status: reimbursementResult.status.S,
                    timestamp: Number(reimbursementResult.timestamp.N),
                    transactions: transactions,
                    updatedAt: reimbursementResult.updatedAt.S,
                };
                // add each reimbursement object to the reimbursements array to be returned
                reimbursementData.push(reimbursement);
            });
            // return the retrieved reimbursements
            return {
                data: reimbursementData
            };
        }
        else {
            const errorMessage = `Reimbursements data not found for ${getReimbursementsInput.id}, and ${getReimbursementsInput.endDate}`;
            console.log(errorMessage);
            return {
                data: [],
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.ReimbursementsErrorType.NoneOrAbsent
            };
        }
    }
    catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.ReimbursementsErrorType.UnexpectedError
        };
    }
};
exports.getReimbursements = getReimbursements;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0UmVpbWJ1cnNlbWVudHNSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL0dldFJlaW1idXJzZW1lbnRzUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOERBQXNGO0FBQ3RGLCtEQVdtQztBQUVuQzs7Ozs7OztHQU9HO0FBQ0ksTUFBTSxpQkFBaUIsR0FBRyxLQUFLLEVBQUUsU0FBaUIsRUFBRSxzQkFBOEMsRUFBa0MsRUFBRTtJQUN6SSxJQUFJO1FBQ0EseUNBQXlDO1FBQ3pDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVyxDQUFDO1FBRXZDLDRDQUE0QztRQUM1QyxNQUFNLGNBQWMsR0FBRyxJQUFJLGdDQUFjLENBQUMsRUFBQyxNQUFNLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQztRQUU1RCxvSEFBb0g7UUFDcEgsTUFBTSxrQkFBa0IsR0FBRyxzQkFBc0IsQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1FBQ3BJLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1FBRTVGOzs7V0FHRztRQUNILE1BQU0scUJBQXFCLEdBQUcsa0JBQWtCO1lBQzVDLENBQUMsQ0FBQyw4Q0FBOEM7WUFDaEQsQ0FBQyxDQUFDLDZCQUE2QixDQUFDO1FBRXBDOzs7O1dBSUc7UUFDSCxJQUFJLE1BQU0sR0FBcUMsRUFBRSxDQUFDO1FBQ2xELElBQUksaUJBQWlCLEVBQUUsYUFBYSxDQUFDO1FBRXJDLEdBQUc7WUFDQzs7Ozs7Ozs7O2VBU0c7WUFDSCxhQUFhLEdBQUcsTUFBTSxjQUFjLENB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QUNMLENBQUMsQ0FBQTtBQWpKWSxRQUFBLGlCQUFpQixxQkFpSjdCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBdHRyaWJ1dGVWYWx1ZSwgRHluYW1vREJDbGllbnQsIFF1ZXJ5Q29tbWFuZH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1keW5hbW9kYlwiO1xuaW1wb3J0IHtcbiAgICBDYXJkVHlwZSxcbiAgICBDdXJyZW5jeUNvZGVUeXBlLFxuICAgIEdldFJlaW1idXJzZW1lbnRzSW5wdXQsXG4gICAgUmVpbWJ1cnNlbWVudCxcbiAgICBSZWltYnVyc2VtZW50UmVzcG9uc2UsXG4gICAgUmVpbWJ1cnNlbWVudHNFcnJvclR5cGUsXG4gICAgUmVpbWJ1cnNlbWVudFN0YXR1cyxcbiAgICBUcmFuc2FjdGlvbixcbiAgICBUcmFuc2FjdGlvbnNTdGF0dXMsXG4gICAgVHJhbnNhY3Rpb25UeXBlXG59IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5cbi8qKlxuICogR2V0UmVpbWJ1cnNlbWVudHMgcmVzb2x2ZXJcbiAqXG4gKiBAcGFyYW0gZmllbGROYW1lIG5hbWUgb2YgdGhlIHJlc29sdmVyIHBhdGggZnJvbSB0aGUgQXBwU3luYyBldmVudFxuICogQHBhcmFtIGdldFJlaW1idXJzZW1lbnRzSW5wdXQgZ2V0IHJlaW1idXJzZW1lbnRzIGlucHV0IG9iamVjdCwgdXNlZCB0byByZXRyaWV2ZSByZWltYnVyc2VtZW50IGluZm9ybWF0aW9uLlxuICpcbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgUmVpbWJ1cnNlbWVudFJlc3BvbnNlfVxuICovXG5leHBvcnQgY29uc3QgZ2V0UmVpbWJ1cnNlbWVudHMgPSBhc3luYyAoZmllbGROYW1lOiBzdHJpbmcsIGdldFJlaW1idXJzZW1lbnRzSW5wdXQ6IEdldFJlaW1idXJzZW1lbnRzSW5wdXQpOiBQcm9taXNlPFJlaW1idXJzZW1lbnRSZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIGluaXRpYWxpemluZyB0aGUgRHluYW1vREIgZG9jdW1lbnQgY2xpZW50XG4gICAgICAgIGNvbnN0IGR5bmFtb0RiQ2xpZW50ID0gbmV3IER5bmFtb0RCQ2xpZW50KHtyZWdpb246IHJlZ2lvbn0pO1xuXG4gICAgICAgIC8vIGNvbnZlcnRpbmcgdGhlIEFXU0RhdGVUaW1lIHRvIFRpbWVzdGFtcCwgZm9yIGNvbXBhcmlzb24gYW5kIHNvcnRpbmcgcHVycG9zZXMsIGJhc2VkIG9uIHRoZSBwcmltYXJ5IGtleSdzIHNvcnQga2V5XG4gICAgICAgIGNvbnN0IHN0YXJ0RGF0ZVRpbWVzdGFtcCA9IGdldFJlaW1idXJzZW1lbnRzSW5wdXQuc3RhcnREYXRlICYmIERhdGUucGFyc2UobmV3IERhdGUoZ2V0UmVpbWJ1cnNlbWVudHNJbnB1dC5zdGFydERhdGUpLnRvSVNPU3RyaW5nKCkpO1xuICAgICAgICBjb25zdCBlbmREYXRlVGltZXN0YW1wID0gRGF0ZS5wYXJzZShuZXcgRGF0ZShnZXRSZWltYnVyc2VtZW50c0lucHV0LmVuZERhdGUpLnRvSVNPU3RyaW5nKCkpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBkZXRlcm1pbmUgd2hldGhlciB0aGlzIHJhbmdlIG9mIGNyZWF0aW9uIHRpbWUgb2YgYSByZWltYnVyc2VtZW50LCBmYWxscyB3aXRoaW4gcGFydGljdWxhclxuICAgICAgICAgKiB1cHBlciBhbmQgbG93ZXIgYm91bmRzLCBvciBqdXN0IHdpdGhpbiBhIHBhcnRpY3VsYXIgYm91bmQuXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBjb25kaXRpb25hbEV4cHJlc3Npb24gPSBzdGFydERhdGVUaW1lc3RhbXBcbiAgICAgICAgICAgID8gJyNpZGYgPSA6aWRmIGFuZCAjdCBCRVRXRUVOIDp0U3RhcnQgYW5kIDp0RW5kJ1xuICAgICAgICAgICAgOiAnI2lkZiA9IDppZGYgYW5kICN0IDw9IDp0RW5kJztcblxuICAgICAgICAvKipcbiAgICAgICAgICogdGhlIGRhdGEgdG8gYmUgcmV0cmlldmVkIGZyb20gdGhlIFF1ZXJ5IENvbW1hbmRcbiAgICAgICAgICogdGhlIHJlaW1idXJzZW1lbnQgSXRlbXMgcmV0dXJuZWQgZnJvbSB0aGUgUXVlcnkgQ29tbWFuZCwgYWxsIGFnZ3JlZ2F0ZWQgdG9nZXRoZXJcbiAgICAgICAgICogdGhlIGxhc3QgZXZhbHVhdGVkIGtleSwgdG8gaGVscCB3aXRoIHRoZSBwYWdpbmF0aW9uIG9mIHJlc3VsdHNcbiAgICAgICAgICovXG4gICAgICAgIGxldCByZXN1bHQ6IFJlY29yZDxzdHJpbmcsIEF0dHJpYnV0ZVZhbHVlPltdID0gW107XG4gICAgICAgIGxldCBleGNsdXNpdmVTdGFydEtleSwgcmV0cmlldmVkRGF0YTtcblxuICAgICAgICBkbyB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIHJldHJpZXZlIHRoZSByZWltYnVyc2VtZW50IGRhdGEsIGdpdmVuIHRoZSBnZXQgcmVpbWJ1cnNlbWVudCBpbnB1dCBmaWx0ZXJpbmcvaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBMaW1pdCBvZiAxIE1CIHBlciBwYWdpbmF0ZWQgcmVzcG9uc2UgZGF0YSAoaW4gb3VyIGNhc2UgMzAwIGl0ZW1zKS4gV2UgY2Fubm90IHJlYWxseSBkZXRlcm1pbmUgdGhlIGF2ZXJhZ2Ugc2l6ZSBmb3IgYW4gSXRlbSxcbiAgICAgICAgICAgICAqIGJlY2F1c2UgYSByZWltYnVyc2VtZW50IGNhbiBoYXZlIG11bHRpcGxlIHBvdGVudGlhbCB0cmFuc2FjdGlvbnMuIE5ldmVydGhlbGVzcywgd2UgZG8gbm90IG5lZWQgdG8gZG8gcGFnaW5hdGlvbiwgdW50aWwgd2UgYWN0dWFsbHlcbiAgICAgICAgICAgICAqIGRlY2lkZSB0byBkaXNwbGF5IHJlaW1idXJzZW1lbnRzIGluIGEgc3RhdGVtZW50IGZvcm1hdC5cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAbGluayB7aHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2FtYXpvbmR5bmFtb2RiL2xhdGVzdC9kZXZlbG9wZXJndWlkZS9RdWVyeS5QYWdpbmF0aW9uLmh0bWx9XG4gICAgICAgICAgICAgKiBAbGluayB7aHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2FtYXpvbmR5bmFtb2RiL2xhdGVzdC9kZXZlbG9wZXJndWlkZS9RdWVyeS5odG1sfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICByZXRyaWV2ZWREYXRhID0gYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgUXVlcnlDb21tYW5kKHtcbiAgICAgICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LlJFSU1CVVJTRU1FTlRTX1RBQkxFISxcbiAgICAgICAgICAgICAgICAuLi4oZXhjbHVzaXZlU3RhcnRLZXkgJiYge0V4Y2x1c2l2ZVN0YXJ0S2V5OiBleGNsdXNpdmVTdGFydEtleX0pLFxuICAgICAgICAgICAgICAgIExpbWl0OiAzMDAsXG4gICAgICAgICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICcjaWRmJzogJ2lkJyxcbiAgICAgICAgICAgICAgICAgICAgJyN0JzogJ3RpbWVzdGFtcCdcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCI6aWRmXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IGdldFJlaW1idXJzZW1lbnRzSW5wdXQuaWRcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgXCI6dEVuZFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBOOiBlbmREYXRlVGltZXN0YW1wLnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgLi4uKHN0YXJ0RGF0ZVRpbWVzdGFtcCAmJiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIjp0U3RhcnRcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE46IHN0YXJ0RGF0ZVRpbWVzdGFtcC50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBLZXlDb25kaXRpb25FeHByZXNzaW9uOiBjb25kaXRpb25hbEV4cHJlc3Npb25cbiAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgZXhjbHVzaXZlU3RhcnRLZXkgPSByZXRyaWV2ZWREYXRhLkxhc3RFdmFsdWF0ZWRLZXk7XG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KHJldHJpZXZlZERhdGEuSXRlbXMpO1xuICAgICAgICB9IHdoaWxlIChyZXRyaWV2ZWREYXRhICYmIHJldHJpZXZlZERhdGEuQ291bnQgJiYgcmV0cmlldmVkRGF0YS5JdGVtcyAmJlxuICAgICAgICByZXRyaWV2ZWREYXRhLkl0ZW1zLmxlbmd0aCAmJiByZXRyaWV2ZWREYXRhLkNvdW50ICE9PSAwICYmXG4gICAgICAgIHJldHJpZXZlZERhdGEuSXRlbXMubGVuZ3RoICE9PSAwICYmIHJldHJpZXZlZERhdGEuTGFzdEV2YWx1YXRlZEtleSk7XG5cbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgYW55IHJlaW1idXJzZW1lbnQgZGF0YSByZXRyaWV2ZWQsIHRoZW4gcmV0dXJuIGl0IGFjY29yZGluZ2x5XG4gICAgICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0Lmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgLy8gY29udmVydCB0aGUgRHluYW1vIERCIGRhdGEgZnJvbSBEeW5hbW8gREIgSlNPTiBmb3JtYXQgdG8gYSBNb29uYmVhbSBSZWltYnVyc2VtZW50IGRhdGEgZm9ybWF0XG4gICAgICAgICAgICBjb25zdCByZWltYnVyc2VtZW50RGF0YTogUmVpbWJ1cnNlbWVudFtdID0gW107XG4gICAgICAgICAgICByZXN1bHQuZm9yRWFjaChyZWltYnVyc2VtZW50UmVzdWx0ID0+IHtcbiAgICAgICAgICAgICAgICAvLyBmaXJzdCBidWlsZCB0aGUgdHJhbnNhY3Rpb24gYXJyYXkgZGF0YSB0byByZXR1cm4gZm9yIHJlaW1idXJzZW1lbnRzXG4gICAgICAgICAgICAgICAgY29uc3QgdHJhbnNhY3Rpb25zOiBUcmFuc2FjdGlvbltdID0gW107XG4gICAgICAgICAgICAgICAgcmVpbWJ1cnNlbWVudFJlc3VsdC50cmFuc2FjdGlvbnMuTCAmJiByZWltYnVyc2VtZW50UmVzdWx0LnRyYW5zYWN0aW9ucy5MIS5mb3JFYWNoKHRyYW5zYWN0aW9uUmVzdWx0ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3VHJhbnNhY3Rpb246IFRyYW5zYWN0aW9uID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJhbmRJZDogdHJhbnNhY3Rpb25SZXN1bHQuTSEuYnJhbmRJZC5TISxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRJZDogdHJhbnNhY3Rpb25SZXN1bHQuTSEuY2FyZElkLlMhLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnk6IHRyYW5zYWN0aW9uUmVzdWx0Lk0hLmNhdGVnb3J5LlMhLFxuICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0OiB0cmFuc2FjdGlvblJlc3VsdC5NIS5jcmVhdGVkQXQuUyEsXG4gICAgICAgICAgICAgICAgICAgICAgICBjcmVkaXRlZENhc2hiYWNrQW1vdW50OiBOdW1iZXIodHJhbnNhY3Rpb25SZXN1bHQuTSEuY3JlZGl0ZWRDYXNoYmFja0Ftb3VudC5OISksXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW5jeUNvZGU6IHRyYW5zYWN0aW9uUmVzdWx0Lk0hLmN1cnJlbmN5Q29kZS5TISBhcyBDdXJyZW5jeUNvZGVUeXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHRyYW5zYWN0aW9uUmVzdWx0Lk0hLmlkLlMhLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVtYmVySWQ6IHRyYW5zYWN0aW9uUmVzdWx0Lk0hLm1lbWJlcklkLlMhLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGVuZGluZ0Nhc2hiYWNrQW1vdW50OiBOdW1iZXIodHJhbnNhY3Rpb25SZXN1bHQuTSEucGVuZGluZ0Nhc2hiYWNrQW1vdW50Lk4hKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJld2FyZEFtb3VudDogTnVtYmVyKHRyYW5zYWN0aW9uUmVzdWx0Lk0hLnJld2FyZEFtb3VudC5OISksXG4gICAgICAgICAgICAgICAgICAgICAgICBzdG9yZUlkOiB0cmFuc2FjdGlvblJlc3VsdC5NIS5zdG9yZUlkLlMhLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiBOdW1iZXIodHJhbnNhY3Rpb25SZXN1bHQuTSEudGltZXN0YW1wLk4hKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsQW1vdW50OiBOdW1iZXIodHJhbnNhY3Rpb25SZXN1bHQuTSEudG90YWxBbW91bnQuTiEpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZEFkZHJlc3M6IHRyYW5zYWN0aW9uUmVzdWx0Lk0hLnRyYW5zYWN0aW9uQnJhbmRBZGRyZXNzLlMhLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZExvZ29Vcmw6IHRyYW5zYWN0aW9uUmVzdWx0Lk0hLnRyYW5zYWN0aW9uQnJhbmRMb2dvVXJsLlMhLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZE5hbWU6IHRyYW5zYWN0aW9uUmVzdWx0Lk0hLnRyYW5zYWN0aW9uQnJhbmROYW1lLlMhLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZFVSTEFkZHJlc3M6IHRyYW5zYWN0aW9uUmVzdWx0Lk0hLnRyYW5zYWN0aW9uQnJhbmRVUkxBZGRyZXNzLlMhLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25JZDogdHJhbnNhY3Rpb25SZXN1bHQuTSEudHJhbnNhY3Rpb25JZC5TISxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uSXNPbmxpbmU6IHRyYW5zYWN0aW9uUmVzdWx0Lk0hLnRyYW5zYWN0aW9uSXNPbmxpbmUuQk9PTCEsXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvblN0YXR1czogdHJhbnNhY3Rpb25SZXN1bHQuTSEudHJhbnNhY3Rpb25TdGF0dXMuUyEgYXMgVHJhbnNhY3Rpb25zU3RhdHVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25UeXBlOiB0cmFuc2FjdGlvblJlc3VsdC5NIS50cmFuc2FjdGlvblR5cGUuUyEgYXMgVHJhbnNhY3Rpb25UeXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEF0OiB0cmFuc2FjdGlvblJlc3VsdC5NIS51cGRhdGVkQXQuUyFcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbnMucHVzaChuZXdUcmFuc2FjdGlvbik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgLy8gYnVpbGQgb3V0IGVhY2ggcmVpbWJ1cnNlbWVudCBvYmplY3QgdG8gcmV0dXJuXG4gICAgICAgICAgICAgICAgY29uc3QgcmVpbWJ1cnNlbWVudDogUmVpbWJ1cnNlbWVudCA9IHtcbiAgICAgICAgICAgICAgICAgICAgYW1vdW50OiBOdW1iZXIocmVpbWJ1cnNlbWVudFJlc3VsdC5hbW91bnQuTiEpLFxuICAgICAgICAgICAgICAgICAgICBjYXJkSWQ6IHJlaW1idXJzZW1lbnRSZXN1bHQuY2FyZElkLlMhLFxuICAgICAgICAgICAgICAgICAgICBjYXJkTGFzdDQ6IHJlaW1idXJzZW1lbnRSZXN1bHQuY2FyZExhc3Q0LlMhLFxuICAgICAgICAgICAgICAgICAgICBjYXJkVHlwZTogcmVpbWJ1cnNlbWVudFJlc3VsdC5jYXJkVHlwZS5TISBhcyBDYXJkVHlwZSxcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0OiByZWltYnVyc2VtZW50UmVzdWx0LmNyZWF0ZWRBdC5TISxcbiAgICAgICAgICAgICAgICAgICAgaWQ6IHJlaW1idXJzZW1lbnRSZXN1bHQuaWQuUyEsXG4gICAgICAgICAgICAgICAgICAgIHJlaW1idXJzZW1lbnRJZDogcmVpbWJ1cnNlbWVudFJlc3VsdC5yZWltYnVyc2VtZW50SWQuUyEsXG4gICAgICAgICAgICAgICAgICAgIHN0YXR1czogcmVpbWJ1cnNlbWVudFJlc3VsdC5zdGF0dXMuUyEgYXMgUmVpbWJ1cnNlbWVudFN0YXR1cyxcbiAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiBOdW1iZXIocmVpbWJ1cnNlbWVudFJlc3VsdC50aW1lc3RhbXAuTiEpLFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbnM6IHRyYW5zYWN0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEF0OiByZWltYnVyc2VtZW50UmVzdWx0LnVwZGF0ZWRBdC5TISxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gYWRkIGVhY2ggcmVpbWJ1cnNlbWVudCBvYmplY3QgdG8gdGhlIHJlaW1idXJzZW1lbnRzIGFycmF5IHRvIGJlIHJldHVybmVkXG4gICAgICAgICAgICAgICAgcmVpbWJ1cnNlbWVudERhdGEucHVzaChyZWltYnVyc2VtZW50KTtcbiAgICAgICAgICAgIH0pO1xuXG5cbiAgICAgICAgICAgIC8vIHJldHVybiB0aGUgcmV0cmlldmVkIHJlaW1idXJzZW1lbnRzXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRhdGE6IHJlaW1idXJzZW1lbnREYXRhXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgUmVpbWJ1cnNlbWVudHMgZGF0YSBub3QgZm91bmQgZm9yICR7Z2V0UmVpbWJ1cnNlbWVudHNJbnB1dC5pZH0sIGFuZCAke2dldFJlaW1idXJzZW1lbnRzSW5wdXQuZW5kRGF0ZX1gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBkYXRhOiBbXSxcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFJlaW1idXJzZW1lbnRzRXJyb3JUeXBlLk5vbmVPckFic2VudFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nICR7ZmllbGROYW1lfSBxdWVyeSAke2Vycn1gO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICBlcnJvclR5cGU6IFJlaW1idXJzZW1lbnRzRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICB9O1xuICAgIH1cbn1cbiJdfQ==