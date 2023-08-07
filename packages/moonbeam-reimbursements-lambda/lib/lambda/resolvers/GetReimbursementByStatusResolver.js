"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReimbursementByStatus = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const util_dynamodb_1 = require("@aws-sdk/util-dynamodb");
/**
 * GetReimbursementByStatus resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getReimbursementByStatusInput get reimbursement by status input object, used to retrieve reimbursement information,
 *                                    based on status.
 *
 * @returns {@link Promise} of {@link ReimbursementByStatusResponse}
 */
const getReimbursementByStatus = async (fieldName, getReimbursementByStatusInput) => {
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
             * retrieve all the reimbursements with a specific status, given the global secondary index
             *
             * Limit of 1 MB per paginated response data (in our case 55 items). An average size for an Item is about 13674 bytes, for a
             * reimbursement containing about 100 transactions (with an average of .20 cents earned per transaction), which means that we
             * won't need to do pagination here, since we actually retrieve all users in a looped format, and we account for
             * paginated responses.
             *
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.Pagination.html}
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html}
             */
            retrievedData = await dynamoDbClient.send(new client_dynamodb_1.QueryCommand({
                TableName: process.env.REIMBURSEMENTS_TABLE,
                IndexName: `${process.env.REIMBURSEMENTS_STATUS_LOCAL_INDEX}-${process.env.ENV_NAME}-${region}`,
                ...(exclusiveStartKey && { ExclusiveStartKey: exclusiveStartKey }),
                Limit: 55,
                ExpressionAttributeNames: {
                    '#id': 'id',
                    '#st': 'reimbursementStatus'
                },
                ExpressionAttributeValues: {
                    ":id": {
                        S: getReimbursementByStatusInput.id
                    },
                    ":st": {
                        S: getReimbursementByStatusInput.reimbursementStatus
                    }
                },
                KeyConditionExpression: '#id = :id AND #st = :st'
            }));
            exclusiveStartKey = retrievedData.LastEvaluatedKey;
            result = result.concat(retrievedData.Items);
        } while (retrievedData && retrievedData.Count && retrievedData.Items &&
            retrievedData.Items.length && retrievedData.Count !== 0 &&
            retrievedData.Items.length !== 0 && retrievedData.LastEvaluatedKey);
        // if there are eligible reimbursements retrieved, then return them accordingly
        if (result && result.length !== 0) {
            // convert the Dynamo DB data from Dynamo DB JSON format to a Moonbeam reimbursement by status object
            const reimbursementByStatusData = [];
            result.forEach(reimbursementByStatusResult => {
                // unmarshall the DynamoDB record to an actual Reimbursement object, to be user later
                const unmarshalledReimbursement = (0, util_dynamodb_1.unmarshall)(reimbursementByStatusResult);
                const unmarshalledTransactionsList = unmarshalledReimbursement.transactions;
                const reimbursement = {
                    cardId: reimbursementByStatusResult.cardId.S,
                    ...(reimbursementByStatusResult.clientId && {
                        clientId: reimbursementByStatusResult.clientId.S
                    }),
                    createdAt: reimbursementByStatusResult.createdAt.S,
                    creditedCashbackAmount: Number(reimbursementByStatusResult.creditedCashbackAmount.N),
                    currencyCode: reimbursementByStatusResult.currencyCode.S,
                    id: reimbursementByStatusResult.id.S,
                    ...(reimbursementByStatusResult.paymentGatewayId && {
                        paymentGatewayId: reimbursementByStatusResult.paymentGatewayId.S
                    }),
                    pendingCashbackAmount: Number(reimbursementByStatusResult.pendingCashbackAmount.N),
                    ...(reimbursementByStatusResult.processingMessage && {
                        processingMessage: reimbursementByStatusResult.processingMessage.S
                    }),
                    reimbursementId: reimbursementByStatusResult.reimbursementId.S,
                    reimbursementStatus: reimbursementByStatusResult.reimbursementStatus.S,
                    ...(reimbursementByStatusResult.succeeded !== undefined && reimbursementByStatusResult.succeeded !== null && {
                        succeeded: reimbursementByStatusResult.succeeded.BOOL
                    }),
                    timestamp: Number(reimbursementByStatusResult.timestamp.N),
                    transactions: unmarshalledTransactionsList,
                    updatedAt: reimbursementByStatusResult.createdAt.S
                };
                reimbursementByStatusData.push(reimbursement);
            });
            // return the list of filtered reimbursements
            return {
                data: reimbursementByStatusData
            };
        }
        else {
            const errorMessage = `Transactions with status ${getReimbursementByStatusInput.reimbursementStatus} for user ${getReimbursementByStatusInput.id} not found!`;
            console.log(errorMessage);
            return {
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
exports.getReimbursementByStatus = getReimbursementByStatus;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0UmVpbWJ1cnNlbWVudEJ5U3RhdHVzUmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL3Jlc29sdmVycy9HZXRSZWltYnVyc2VtZW50QnlTdGF0dXNSZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw4REFBc0Y7QUFDdEYsK0RBT21DO0FBQ25DLDBEQUFrRDtBQUVsRDs7Ozs7Ozs7R0FRRztBQUNJLE1BQU0sd0JBQXdCLEdBQUcsS0FBSyxFQUFFLFNBQWlCLEVBQUUsNkJBQTRELEVBQTBDLEVBQUU7SUFDdEssSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qyw0Q0FBNEM7UUFDNUMsTUFBTSxjQUFjLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFFNUQ7Ozs7V0FJRztRQUNILElBQUksTUFBTSxHQUFxQyxFQUFFLENBQUM7UUFDbEQsSUFBSSxpQkFBaUIsRUFBRSxhQUFhLENBQUM7UUFFckMsR0FBRztZQUNDOzs7Ozs7Ozs7O2VBVUc7WUFDSCxhQUFhLEdBQUcsTUFBTSxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksOEJBQVksQ0FBQztnQkFDdkQsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQXFCO2dCQUM1QyxTQUFTLEVBQUUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGlDQUFrQyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUyxJQUFJLE1BQU0sRUFBRTtnQkFDakcsR0FBRyxDQUFDLGlCQUFpQixJQUFJLEVBQUMsaUJBQWlCLEVBQUUsaUJBQWlCLEVBQUMsQ0FBQztnQkFDaEUsS0FBSyxFQUFFLEVBQUU7Z0JBQ1Qsd0JBQXdCLEVBQUU7b0JBQ3RCLEtBQUssRUFBRSxJQUFJO29CQUNYLEtBQUssRUFBRSxx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QyxDQUFDO1lBQ0gsNkNBQTZDO1lBQzdDLE9BQU87Z0JBQ0gsSUFBSSxFQUFFLHlCQUF5QjthQUNsQyxDQUFBO1NBQ0o7YUFBTTtZQUNILE1BQU0sWUFBWSxHQUFHLDRCQUE0Qiw2QkFBNkIsQ0FBQyxtQkFBbUIsYUFBYSw2QkFBNkIsQ0FBQyxFQUFFLGFBQWEsQ0FBQztZQUM3SixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRTFCLE9BQU87Z0JBQ0gsWUFBWSxFQUFFLFlBQVk7Z0JBQzFCLFNBQVMsRUFBRSx5Q0FBdUIsQ0FBQyxZQUFZO2FBQ2xELENBQUE7U0FDSjtLQUNKO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVixNQUFNLFlBQVksR0FBRyxvQ0FBb0MsU0FBUyxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ2xGLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUIsT0FBTztZQUNILFlBQVksRUFBRSxZQUFZO1lBQzFCLFNBQVMsRUFBRSx5Q0FBdUIsQ0FBQyxlQUFlO1NBQ3JELENBQUM7S0FDTDtBQUNMLENBQUMsQ0FBQTtBQTlHWSxRQUFBLHdCQUF3Qiw0QkE4R3BDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBdHRyaWJ1dGVWYWx1ZSwgRHluYW1vREJDbGllbnQsIFF1ZXJ5Q29tbWFuZH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1keW5hbW9kYlwiO1xuaW1wb3J0IHtcbiAgICBDdXJyZW5jeUNvZGVUeXBlLFxuICAgIEdldFJlaW1idXJzZW1lbnRCeVN0YXR1c0lucHV0LFxuICAgIFJlaW1idXJzZW1lbnQsXG4gICAgUmVpbWJ1cnNlbWVudEJ5U3RhdHVzUmVzcG9uc2UsXG4gICAgUmVpbWJ1cnNlbWVudHNFcnJvclR5cGUsXG4gICAgUmVpbWJ1cnNlbWVudFN0YXR1cywgUmVpbWJ1cnNlbWVudFRyYW5zYWN0aW9uXG59IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5pbXBvcnQge3VubWFyc2hhbGx9IGZyb20gXCJAYXdzLXNkay91dGlsLWR5bmFtb2RiXCI7XG5cbi8qKlxuICogR2V0UmVpbWJ1cnNlbWVudEJ5U3RhdHVzIHJlc29sdmVyXG4gKlxuICogQHBhcmFtIGZpZWxkTmFtZSBuYW1lIG9mIHRoZSByZXNvbHZlciBwYXRoIGZyb20gdGhlIEFwcFN5bmMgZXZlbnRcbiAqIEBwYXJhbSBnZXRSZWltYnVyc2VtZW50QnlTdGF0dXNJbnB1dCBnZXQgcmVpbWJ1cnNlbWVudCBieSBzdGF0dXMgaW5wdXQgb2JqZWN0LCB1c2VkIHRvIHJldHJpZXZlIHJlaW1idXJzZW1lbnQgaW5mb3JtYXRpb24sXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhc2VkIG9uIHN0YXR1cy5cbiAqXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIFJlaW1idXJzZW1lbnRCeVN0YXR1c1Jlc3BvbnNlfVxuICovXG5leHBvcnQgY29uc3QgZ2V0UmVpbWJ1cnNlbWVudEJ5U3RhdHVzID0gYXN5bmMgKGZpZWxkTmFtZTogc3RyaW5nLCBnZXRSZWltYnVyc2VtZW50QnlTdGF0dXNJbnB1dDogR2V0UmVpbWJ1cnNlbWVudEJ5U3RhdHVzSW5wdXQpOiBQcm9taXNlPFJlaW1idXJzZW1lbnRCeVN0YXR1c1Jlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLy8gaW5pdGlhbGl6aW5nIHRoZSBEeW5hbW9EQiBkb2N1bWVudCBjbGllbnRcbiAgICAgICAgY29uc3QgZHluYW1vRGJDbGllbnQgPSBuZXcgRHluYW1vREJDbGllbnQoe3JlZ2lvbjogcmVnaW9ufSk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIHRoZSBkYXRhIHRvIGJlIHJldHJpZXZlZCBmcm9tIHRoZSBRdWVyeSBDb21tYW5kXG4gICAgICAgICAqIHRoZSBlbGlnaWJsZSB1c2VyIEl0ZW1zIHJldHVybmVkIGZyb20gdGhlIFF1ZXJ5IENvbW1hbmQsIGFsbCBhZ2dyZWdhdGVkIHRvZ2V0aGVyXG4gICAgICAgICAqIHRoZSBsYXN0IGV2YWx1YXRlZCBrZXksIHRvIGhlbHAgd2l0aCB0aGUgcGFnaW5hdGlvbiBvZiByZXN1bHRzXG4gICAgICAgICAqL1xuICAgICAgICBsZXQgcmVzdWx0OiBSZWNvcmQ8c3RyaW5nLCBBdHRyaWJ1dGVWYWx1ZT5bXSA9IFtdO1xuICAgICAgICBsZXQgZXhjbHVzaXZlU3RhcnRLZXksIHJldHJpZXZlZERhdGE7XG5cbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiByZXRyaWV2ZSBhbGwgdGhlIHJlaW1idXJzZW1lbnRzIHdpdGggYSBzcGVjaWZpYyBzdGF0dXMsIGdpdmVuIHRoZSBnbG9iYWwgc2Vjb25kYXJ5IGluZGV4XG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogTGltaXQgb2YgMSBNQiBwZXIgcGFnaW5hdGVkIHJlc3BvbnNlIGRhdGEgKGluIG91ciBjYXNlIDU1IGl0ZW1zKS4gQW4gYXZlcmFnZSBzaXplIGZvciBhbiBJdGVtIGlzIGFib3V0IDEzNjc0IGJ5dGVzLCBmb3IgYVxuICAgICAgICAgICAgICogcmVpbWJ1cnNlbWVudCBjb250YWluaW5nIGFib3V0IDEwMCB0cmFuc2FjdGlvbnMgKHdpdGggYW4gYXZlcmFnZSBvZiAuMjAgY2VudHMgZWFybmVkIHBlciB0cmFuc2FjdGlvbiksIHdoaWNoIG1lYW5zIHRoYXQgd2VcbiAgICAgICAgICAgICAqIHdvbid0IG5lZWQgdG8gZG8gcGFnaW5hdGlvbiBoZXJlLCBzaW5jZSB3ZSBhY3R1YWxseSByZXRyaWV2ZSBhbGwgdXNlcnMgaW4gYSBsb29wZWQgZm9ybWF0LCBhbmQgd2UgYWNjb3VudCBmb3JcbiAgICAgICAgICAgICAqIHBhZ2luYXRlZCByZXNwb25zZXMuXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogQGxpbmsge2h0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9hbWF6b25keW5hbW9kYi9sYXRlc3QvZGV2ZWxvcGVyZ3VpZGUvUXVlcnkuUGFnaW5hdGlvbi5odG1sfVxuICAgICAgICAgICAgICogQGxpbmsge2h0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9hbWF6b25keW5hbW9kYi9sYXRlc3QvZGV2ZWxvcGVyZ3VpZGUvUXVlcnkuaHRtbH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgcmV0cmlldmVkRGF0YSA9IGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IFF1ZXJ5Q29tbWFuZCh7XG4gICAgICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5SRUlNQlVSU0VNRU5UU19UQUJMRSEsXG4gICAgICAgICAgICAgICAgSW5kZXhOYW1lOiBgJHtwcm9jZXNzLmVudi5SRUlNQlVSU0VNRU5UU19TVEFUVVNfTE9DQUxfSU5ERVghfS0ke3Byb2Nlc3MuZW52LkVOVl9OQU1FIX0tJHtyZWdpb259YCxcbiAgICAgICAgICAgICAgICAuLi4oZXhjbHVzaXZlU3RhcnRLZXkgJiYge0V4Y2x1c2l2ZVN0YXJ0S2V5OiBleGNsdXNpdmVTdGFydEtleX0pLFxuICAgICAgICAgICAgICAgIExpbWl0OiA1NSwgLy8gNTUgKiAxMyw2NzQgIGJ5dGVzID0gNzUyLDA3MCBieXRlcyA9IDAuNzUyIE1CIChsZWF2ZSBhIG1hcmdpbiBvZiBlcnJvciBoZXJlIHVwIHRvIDEgTUIpXG4gICAgICAgICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICcjaWQnOiAnaWQnLFxuICAgICAgICAgICAgICAgICAgICAnI3N0JzogJ3JlaW1idXJzZW1lbnRTdGF0dXMnXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlVmFsdWVzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiOmlkXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IGdldFJlaW1idXJzZW1lbnRCeVN0YXR1c0lucHV0LmlkXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIFwiOnN0XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IGdldFJlaW1idXJzZW1lbnRCeVN0YXR1c0lucHV0LnJlaW1idXJzZW1lbnRTdGF0dXNcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgS2V5Q29uZGl0aW9uRXhwcmVzc2lvbjogJyNpZCA9IDppZCBBTkQgI3N0ID0gOnN0J1xuICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICBleGNsdXNpdmVTdGFydEtleSA9IHJldHJpZXZlZERhdGEuTGFzdEV2YWx1YXRlZEtleTtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQocmV0cmlldmVkRGF0YS5JdGVtcyk7XG4gICAgICAgIH0gd2hpbGUgKHJldHJpZXZlZERhdGEgJiYgcmV0cmlldmVkRGF0YS5Db3VudCAmJiByZXRyaWV2ZWREYXRhLkl0ZW1zICYmXG4gICAgICAgIHJldHJpZXZlZERhdGEuSXRlbXMubGVuZ3RoICYmIHJldHJpZXZlZERhdGEuQ291bnQgIT09IDAgJiZcbiAgICAgICAgcmV0cmlldmVkRGF0YS5JdGVtcy5sZW5ndGggIT09IDAgJiYgcmV0cmlldmVkRGF0YS5MYXN0RXZhbHVhdGVkS2V5KTtcblxuICAgICAgICAvLyBpZiB0aGVyZSBhcmUgZWxpZ2libGUgcmVpbWJ1cnNlbWVudHMgcmV0cmlldmVkLCB0aGVuIHJldHVybiB0aGVtIGFjY29yZGluZ2x5XG4gICAgICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0Lmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgLy8gY29udmVydCB0aGUgRHluYW1vIERCIGRhdGEgZnJvbSBEeW5hbW8gREIgSlNPTiBmb3JtYXQgdG8gYSBNb29uYmVhbSByZWltYnVyc2VtZW50IGJ5IHN0YXR1cyBvYmplY3RcbiAgICAgICAgICAgIGNvbnN0IHJlaW1idXJzZW1lbnRCeVN0YXR1c0RhdGE6IFJlaW1idXJzZW1lbnRbXSA9IFtdO1xuICAgICAgICAgICAgcmVzdWx0LmZvckVhY2gocmVpbWJ1cnNlbWVudEJ5U3RhdHVzUmVzdWx0ID0+IHtcbiAgICAgICAgICAgICAgICAvLyB1bm1hcnNoYWxsIHRoZSBEeW5hbW9EQiByZWNvcmQgdG8gYW4gYWN0dWFsIFJlaW1idXJzZW1lbnQgb2JqZWN0LCB0byBiZSB1c2VyIGxhdGVyXG4gICAgICAgICAgICAgICAgY29uc3QgdW5tYXJzaGFsbGVkUmVpbWJ1cnNlbWVudCA9IHVubWFyc2hhbGwocmVpbWJ1cnNlbWVudEJ5U3RhdHVzUmVzdWx0KTtcbiAgICAgICAgICAgICAgICBjb25zdCB1bm1hcnNoYWxsZWRUcmFuc2FjdGlvbnNMaXN0OiBSZWltYnVyc2VtZW50VHJhbnNhY3Rpb25bXSA9IHVubWFyc2hhbGxlZFJlaW1idXJzZW1lbnQudHJhbnNhY3Rpb25zO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlaW1idXJzZW1lbnQ6IFJlaW1idXJzZW1lbnQgPSB7XG4gICAgICAgICAgICAgICAgICAgIGNhcmRJZDogcmVpbWJ1cnNlbWVudEJ5U3RhdHVzUmVzdWx0LmNhcmRJZC5TISxcbiAgICAgICAgICAgICAgICAgICAgLi4uKHJlaW1idXJzZW1lbnRCeVN0YXR1c1Jlc3VsdC5jbGllbnRJZCAmJiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGllbnRJZDogcmVpbWJ1cnNlbWVudEJ5U3RhdHVzUmVzdWx0LmNsaWVudElkLlMhXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IHJlaW1idXJzZW1lbnRCeVN0YXR1c1Jlc3VsdC5jcmVhdGVkQXQuUyEsXG4gICAgICAgICAgICAgICAgICAgIGNyZWRpdGVkQ2FzaGJhY2tBbW91bnQ6IE51bWJlcihyZWltYnVyc2VtZW50QnlTdGF0dXNSZXN1bHQuY3JlZGl0ZWRDYXNoYmFja0Ftb3VudC5OISksXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbmN5Q29kZTogcmVpbWJ1cnNlbWVudEJ5U3RhdHVzUmVzdWx0LmN1cnJlbmN5Q29kZS5TISBhcyBDdXJyZW5jeUNvZGVUeXBlLFxuICAgICAgICAgICAgICAgICAgICBpZDogcmVpbWJ1cnNlbWVudEJ5U3RhdHVzUmVzdWx0LmlkLlMhLFxuICAgICAgICAgICAgICAgICAgICAuLi4ocmVpbWJ1cnNlbWVudEJ5U3RhdHVzUmVzdWx0LnBheW1lbnRHYXRld2F5SWQgJiYge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGF5bWVudEdhdGV3YXlJZDogcmVpbWJ1cnNlbWVudEJ5U3RhdHVzUmVzdWx0LnBheW1lbnRHYXRld2F5SWQuUyFcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIHBlbmRpbmdDYXNoYmFja0Ftb3VudDogTnVtYmVyKHJlaW1idXJzZW1lbnRCeVN0YXR1c1Jlc3VsdC5wZW5kaW5nQ2FzaGJhY2tBbW91bnQuTiEpLFxuICAgICAgICAgICAgICAgICAgICAuLi4ocmVpbWJ1cnNlbWVudEJ5U3RhdHVzUmVzdWx0LnByb2Nlc3NpbmdNZXNzYWdlICYmIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2Nlc3NpbmdNZXNzYWdlOiByZWltYnVyc2VtZW50QnlTdGF0dXNSZXN1bHQucHJvY2Vzc2luZ01lc3NhZ2UuUyFcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIHJlaW1idXJzZW1lbnRJZDogcmVpbWJ1cnNlbWVudEJ5U3RhdHVzUmVzdWx0LnJlaW1idXJzZW1lbnRJZC5TISxcbiAgICAgICAgICAgICAgICAgICAgcmVpbWJ1cnNlbWVudFN0YXR1czogcmVpbWJ1cnNlbWVudEJ5U3RhdHVzUmVzdWx0LnJlaW1idXJzZW1lbnRTdGF0dXMuUyEgYXMgUmVpbWJ1cnNlbWVudFN0YXR1cyxcbiAgICAgICAgICAgICAgICAgICAgLi4uKHJlaW1idXJzZW1lbnRCeVN0YXR1c1Jlc3VsdC5zdWNjZWVkZWQgIT09IHVuZGVmaW5lZCAmJiByZWltYnVyc2VtZW50QnlTdGF0dXNSZXN1bHQuc3VjY2VlZGVkICE9PSBudWxsICYmIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2NlZWRlZDogcmVpbWJ1cnNlbWVudEJ5U3RhdHVzUmVzdWx0LnN1Y2NlZWRlZC5CT09MIVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiBOdW1iZXIocmVpbWJ1cnNlbWVudEJ5U3RhdHVzUmVzdWx0LnRpbWVzdGFtcC5OISksXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uczogdW5tYXJzaGFsbGVkVHJhbnNhY3Rpb25zTGlzdCxcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEF0OiByZWltYnVyc2VtZW50QnlTdGF0dXNSZXN1bHQuY3JlYXRlZEF0LlMhXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICByZWltYnVyc2VtZW50QnlTdGF0dXNEYXRhLnB1c2gocmVpbWJ1cnNlbWVudCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIHJldHVybiB0aGUgbGlzdCBvZiBmaWx0ZXJlZCByZWltYnVyc2VtZW50c1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBkYXRhOiByZWltYnVyc2VtZW50QnlTdGF0dXNEYXRhXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVHJhbnNhY3Rpb25zIHdpdGggc3RhdHVzICR7Z2V0UmVpbWJ1cnNlbWVudEJ5U3RhdHVzSW5wdXQucmVpbWJ1cnNlbWVudFN0YXR1c30gZm9yIHVzZXIgJHtnZXRSZWltYnVyc2VtZW50QnlTdGF0dXNJbnB1dC5pZH0gbm90IGZvdW5kIWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogUmVpbWJ1cnNlbWVudHNFcnJvclR5cGUuTm9uZU9yQWJzZW50XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nICR7ZmllbGROYW1lfSBxdWVyeSAke2Vycn1gO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICBlcnJvclR5cGU6IFJlaW1idXJzZW1lbnRzRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICB9O1xuICAgIH1cbn1cbiJdfQ==