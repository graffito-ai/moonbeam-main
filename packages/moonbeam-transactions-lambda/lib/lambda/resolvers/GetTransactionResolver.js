"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransaction = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const util_dynamodb_1 = require("@aws-sdk/util-dynamodb");
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * GetTransactionResolver resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getTransactionInput get transaction input object, used to retrieve transactional information,
 * based on particular filters.
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
             * Limit of 1 MB per response data. An average size for an Item is about 500 KB, which means that we won't
             * need to do pagination, until we actually decide to display transactions in a statement format.
             *
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.Pagination.html}
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html}
             */
            retrievedData = await dynamoDbClient.send(new client_dynamodb_1.QueryCommand({
                TableName: process.env.CARD_LINKING_TABLE,
                ...(exclusiveStartKey && { ExclusiveStartKey: exclusiveStartKey }),
                Limit: 100,
                ExpressionAttributeNames: {
                    '#idf': 'id',
                    '#t': 'timestamp'
                },
                ExpressionAttributeValues: {
                    ":idf": {
                        S: getTransactionInput.id
                    },
                    ":tEnd": {
                        S: endDateTimestamp
                    },
                    ...(startDateTimestamp && {
                        ":tStart": {
                            S: startDateTimestamp
                        }
                    })
                },
                KeyConditionExpression: conditionalExpression
            }));
            exclusiveStartKey = retrievedData.LastEvaluatedKey;
            result.push(retrievedData.Items);
        } while ((retrievedData && retrievedData.Count && retrievedData.Items &&
            retrievedData.Items.length && retrievedData.Count !== 0 &&
            retrievedData.Items.length !== 0) || retrievedData.LastEvaluatedKey);
        // if there is any transactional data retrieved, then return it accordingly
        if (result && result.length !== 0) {
            // convert the Dynamo DB data from Dynamo DB JSON format to regular JSON format
            const unmarshalledTransactionalData = result.map((item) => {
                return (0, util_dynamodb_1.unmarshall)(item);
            });
            // return the retrieved card linking object
            return {
                data: unmarshalledTransactionalData
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0VHJhbnNhY3Rpb25SZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL0dldFRyYW5zYWN0aW9uUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOERBQXNGO0FBQ3RGLDBEQUFrRDtBQUNsRCwrREFLbUM7QUFFbkM7Ozs7Ozs7R0FPRztBQUNJLE1BQU0sY0FBYyxHQUFHLEtBQUssRUFBRSxTQUFpQixFQUFFLG1CQUF3QyxFQUF5QyxFQUFFO0lBQ3ZJLElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsNENBQTRDO1FBQzVDLE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBRTVELG9IQUFvSDtRQUNwSCxNQUFNLGtCQUFrQixHQUFHLG1CQUFtQixDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFDOUgsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFFekY7OztXQUdHO1FBQ0gsTUFBTSxxQkFBcUIsR0FBRyxrQkFBa0I7WUFDNUMsQ0FBQyxDQUFDLDhDQUE4QztZQUNoRCxDQUFDLENBQUMsNkJBQTZCLENBQUM7UUFFcEM7Ozs7V0FJRztRQUNILElBQUksTUFBTSxHQUFxQyxFQUFFLENBQUM7UUFDbEQsSUFBSSxpQkFBaUIsRUFBRSxhQUFhLENBQUM7UUFFckMsR0FBRztZQUNDOzs7Ozs7OztlQVFHO1lBQ0gsYUFBYSxHQUFHLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLDhCQUFZLENBQUM7Z0JBQ3ZELFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFtQjtnQkFDMUMsR0FBRyxDQUFDLGlCQUFpQixJQUFJLEVBQUMsaUJBQWlCLEVBQUUsaUJBQWlCLEVBQUMsQ0FBQztnQkFDaEUsS0FBSyxFQUFFLEdBQUc7Z0JBQ1Ysd0JBQXdCLEVBQUU7b0JBQ3RCLE1BQU0sRUFBRSxJQUFJO29CQUNaLElBQUksRUFBRSxXQUFXO2lCQUNwQjtnQkFDRCx5QkFBeUIsRUFBRTtvQkFDdkIsTUFBTSxFQUFFO3dCQUNKLENBQUMsRUFBRSxtQkFBbUIsQ0FBQyxFQUFFO3FCQUM1QjtvQkFDRCxPQUFPLEVBQUU7d0JBQ0wsQ0FBQyxFQUFFLGdCQUFnQjtxQkFDdEI7b0JBQ0QsR0FBRyxDQUFDLGtCQUFrQixJQUFJO3dCQUN0QixTQUFTLEVBQUU7NEJBQ1AsQ0FBQyxFQUFFLGtCQUFrQjt5QkFDeEI7cUJBQ0osQ0FBQztpQkFDTDtnQkFDRCxzQkFBc0IsRUFBRSxxQkFBcUI7YUFDaEQsQ0FBQyxDQUFDLENBQUM7WUFFSixpQkFBaUIsR0FBRyxhQUFhLENBQUMsZ0JBQWdCLENBQUM7WUFDbkQsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDcEMsUUFBUSxDQUFDLGFBQWEsSUFBSSxhQUFhLENBQUMsS0FBSyxJQUFJLGFBQWEsQ0FBQyxLQUFLO1lBQ2pFLGFBQWEsQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLGFBQWEsQ0FBQyxLQUFLLEtBQUssQ0FBQztZQUN2RCxhQUFhLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsSUFBSSxhQUFhLENBQUMsZ0JBQWdCLEVBQUU7UUFFekUsMkVBQTJFO1FBQzNFLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQy9CLCtFQUErRTtZQUMvRSxNQUFNLDZCQUE2QixHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRTtnQkFDdkQsT0FBTyxJQUFBLDBCQUFVLEVBQUMsSUFBSSxDQUF3QixDQUFDO1lBQ25ELENBQUMsQ0FBQyxDQUFDO1lBRUgsMkNBQTJDO1lBQzNDLE9BQU87Z0JBQ0gsSUFBSSxFQUFFLDZCQUE2QjthQUN0QyxDQUFBO1NBQ0o7YUFBTTtZQUNILE1BQU0sWUFBWSxHQUFHLG9DQUFvQyxtQkFBbUIsQ0FBQyxFQUFFLFNBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLENBQUM7WUFDOUgsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUUxQixPQUFPO2dCQUNILFlBQVksRUFBRSxZQUFZO2dCQUMxQixTQUFTLEVBQUUsdUNBQXFCLENBQUMsWUFBWTthQUNoRCxDQUFBO1NBQ0o7S0FFSjtJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsTUFBTSxZQUFZLEdBQUcsb0NBQW9DLFNBQVMsVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNsRixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFCLE9BQU87WUFDSCxZQUFZLEVBQUUsWUFBWTtZQUMxQixTQUFTLEVBQUUsdUNBQXFCLENBQUMsZUFBZTtTQUNuRCxDQUFDO0tBQ0w7QUFDTCxDQUFDLENBQUE7QUFqR1ksUUFBQSxjQUFjLGtCQWlHMUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0F0dHJpYnV0ZVZhbHVlLCBEeW5hbW9EQkNsaWVudCwgUXVlcnlDb21tYW5kfSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWR5bmFtb2RiXCI7XG5pbXBvcnQge3VubWFyc2hhbGx9IGZyb20gXCJAYXdzLXNkay91dGlsLWR5bmFtb2RiXCI7XG5pbXBvcnQge1xuICAgIEdldFRyYW5zYWN0aW9uSW5wdXQsXG4gICAgTW9vbmJlYW1UcmFuc2FjdGlvbixcbiAgICBNb29uYmVhbVRyYW5zYWN0aW9uc1Jlc3BvbnNlLFxuICAgIFRyYW5zYWN0aW9uc0Vycm9yVHlwZVxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuXG4vKipcbiAqIEdldFRyYW5zYWN0aW9uUmVzb2x2ZXIgcmVzb2x2ZXJcbiAqXG4gKiBAcGFyYW0gZmllbGROYW1lIG5hbWUgb2YgdGhlIHJlc29sdmVyIHBhdGggZnJvbSB0aGUgQXBwU3luYyBldmVudFxuICogQHBhcmFtIGdldFRyYW5zYWN0aW9uSW5wdXQgZ2V0IHRyYW5zYWN0aW9uIGlucHV0IG9iamVjdCwgdXNlZCB0byByZXRyaWV2ZSB0cmFuc2FjdGlvbmFsIGluZm9ybWF0aW9uLFxuICogYmFzZWQgb24gcGFydGljdWxhciBmaWx0ZXJzLlxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBNb29uYmVhbVRyYW5zYWN0aW9uUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRUcmFuc2FjdGlvbiA9IGFzeW5jIChmaWVsZE5hbWU6IHN0cmluZywgZ2V0VHJhbnNhY3Rpb25JbnB1dDogR2V0VHJhbnNhY3Rpb25JbnB1dCk6IFByb21pc2U8TW9vbmJlYW1UcmFuc2FjdGlvbnNSZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIGluaXRpYWxpemluZyB0aGUgRHluYW1vREIgZG9jdW1lbnQgY2xpZW50XG4gICAgICAgIGNvbnN0IGR5bmFtb0RiQ2xpZW50ID0gbmV3IER5bmFtb0RCQ2xpZW50KHtyZWdpb246IHJlZ2lvbn0pO1xuXG4gICAgICAgIC8vIGNvbnZlcnRpbmcgdGhlIEFXU0RhdGVUaW1lIHRvIFRpbWVzdGFtcCwgZm9yIGNvbXBhcmlzb24gYW5kIHNvcnRpbmcgcHVycG9zZXMsIGJhc2VkIG9uIHRoZSBwcmltYXJ5IGtleSdzIHNvcnQga2V5XG4gICAgICAgIGNvbnN0IHN0YXJ0RGF0ZVRpbWVzdGFtcCA9IGdldFRyYW5zYWN0aW9uSW5wdXQuc3RhcnREYXRlICYmIERhdGUucGFyc2UobmV3IERhdGUoZ2V0VHJhbnNhY3Rpb25JbnB1dC5zdGFydERhdGUpLnRvSVNPU3RyaW5nKCkpO1xuICAgICAgICBjb25zdCBlbmREYXRlVGltZXN0YW1wID0gRGF0ZS5wYXJzZShuZXcgRGF0ZShnZXRUcmFuc2FjdGlvbklucHV0LmVuZERhdGUpLnRvSVNPU3RyaW5nKCkpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBkZXRlcm1pbmUgd2hldGhlciB0aGlzIHJhbmdlIG9mIGNyZWF0aW9uIHRpbWUgb2YgYSB0cmFuc2FjdGlvbiwgZmFsbHMgd2l0aGluIHBhcnRpY3VsYXJcbiAgICAgICAgICogdXBwZXIgYW5kIGxvd2VyIGJvdW5kcywgb3IganVzdCB3aXRoaW4gYSBwYXJ0aWN1bGFyIGJvdW5kLlxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgY29uZGl0aW9uYWxFeHByZXNzaW9uID0gc3RhcnREYXRlVGltZXN0YW1wXG4gICAgICAgICAgICA/ICcjaWRmID0gOmlkZiBhbmQgI3QgQkVUV0VFTiA6dFN0YXJ0IGFuZCA6dEVuZCdcbiAgICAgICAgICAgIDogJyNpZGYgPSA6aWRmIGFuZCAjdCA8PSA6dEVuZCc7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIHRoZSBkYXRhIHRvIGJlIHJldHJpZXZlZCBmcm9tIHRoZSBRdWVyeSBDb21tYW5kXG4gICAgICAgICAqIHRoZSB0cmFuc2FjdGlvbmFsIEl0ZW1zIHJldHVybmVkIGZyb20gdGhlIFF1ZXJ5IENvbW1hbmQsIGFsbCBhZ2dyZWdhdGVkIHRvZ2V0aGVyXG4gICAgICAgICAqIHRoZSBsYXN0IGV2YWx1YXRlZCBrZXksIHRvIGhlbHAgd2l0aCB0aGUgcGFnaW5hdGlvbiBvZiByZXN1bHRzXG4gICAgICAgICAqL1xuICAgICAgICBsZXQgcmVzdWx0OiBSZWNvcmQ8c3RyaW5nLCBBdHRyaWJ1dGVWYWx1ZT5bXSA9IFtdO1xuICAgICAgICBsZXQgZXhjbHVzaXZlU3RhcnRLZXksIHJldHJpZXZlZERhdGE7XG5cbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiByZXRyaWV2ZSB0aGUgdHJhbnNhY3Rpb25hbCBkYXRhLCBnaXZlbiB0aGUgZ2V0IHRyYW5zYWN0aW9uYWwgaW5wdXQgZmlsdGVyaW5nL2luZm9ybWF0aW9uXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogTGltaXQgb2YgMSBNQiBwZXIgcmVzcG9uc2UgZGF0YS4gQW4gYXZlcmFnZSBzaXplIGZvciBhbiBJdGVtIGlzIGFib3V0IDUwMCBLQiwgd2hpY2ggbWVhbnMgdGhhdCB3ZSB3b24ndFxuICAgICAgICAgICAgICogbmVlZCB0byBkbyBwYWdpbmF0aW9uLCB1bnRpbCB3ZSBhY3R1YWxseSBkZWNpZGUgdG8gZGlzcGxheSB0cmFuc2FjdGlvbnMgaW4gYSBzdGF0ZW1lbnQgZm9ybWF0LlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIEBsaW5rIHtodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL1F1ZXJ5LlBhZ2luYXRpb24uaHRtbH1cbiAgICAgICAgICAgICAqIEBsaW5rIHtodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL1F1ZXJ5Lmh0bWx9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHJldHJpZXZlZERhdGEgPSBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBRdWVyeUNvbW1hbmQoe1xuICAgICAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuQ0FSRF9MSU5LSU5HX1RBQkxFISxcbiAgICAgICAgICAgICAgICAuLi4oZXhjbHVzaXZlU3RhcnRLZXkgJiYge0V4Y2x1c2l2ZVN0YXJ0S2V5OiBleGNsdXNpdmVTdGFydEtleX0pLFxuICAgICAgICAgICAgICAgIExpbWl0OiAxMDAsXG4gICAgICAgICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICcjaWRmJzogJ2lkJyxcbiAgICAgICAgICAgICAgICAgICAgJyN0JzogJ3RpbWVzdGFtcCdcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCI6aWRmXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IGdldFRyYW5zYWN0aW9uSW5wdXQuaWRcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgXCI6dEVuZFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiBlbmREYXRlVGltZXN0YW1wXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIC4uLihzdGFydERhdGVUaW1lc3RhbXAgJiYge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCI6dFN0YXJ0XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBzdGFydERhdGVUaW1lc3RhbXBcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIEtleUNvbmRpdGlvbkV4cHJlc3Npb246IGNvbmRpdGlvbmFsRXhwcmVzc2lvblxuICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICBleGNsdXNpdmVTdGFydEtleSA9IHJldHJpZXZlZERhdGEuTGFzdEV2YWx1YXRlZEtleTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKHJldHJpZXZlZERhdGEuSXRlbXMpO1xuICAgICAgICB9IHdoaWxlICgocmV0cmlldmVkRGF0YSAmJiByZXRyaWV2ZWREYXRhLkNvdW50ICYmIHJldHJpZXZlZERhdGEuSXRlbXMgJiZcbiAgICAgICAgICAgIHJldHJpZXZlZERhdGEuSXRlbXMubGVuZ3RoICYmIHJldHJpZXZlZERhdGEuQ291bnQgIT09IDAgJiZcbiAgICAgICAgICAgIHJldHJpZXZlZERhdGEuSXRlbXMubGVuZ3RoICE9PSAwKSB8fCByZXRyaWV2ZWREYXRhLkxhc3RFdmFsdWF0ZWRLZXkpO1xuXG4gICAgICAgIC8vIGlmIHRoZXJlIGlzIGFueSB0cmFuc2FjdGlvbmFsIGRhdGEgcmV0cmlldmVkLCB0aGVuIHJldHVybiBpdCBhY2NvcmRpbmdseVxuICAgICAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgIC8vIGNvbnZlcnQgdGhlIER5bmFtbyBEQiBkYXRhIGZyb20gRHluYW1vIERCIEpTT04gZm9ybWF0IHRvIHJlZ3VsYXIgSlNPTiBmb3JtYXRcbiAgICAgICAgICAgIGNvbnN0IHVubWFyc2hhbGxlZFRyYW5zYWN0aW9uYWxEYXRhID0gcmVzdWx0Lm1hcCggKGl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5tYXJzaGFsbChpdGVtKSBhcyBNb29uYmVhbVRyYW5zYWN0aW9uO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIHJldHVybiB0aGUgcmV0cmlldmVkIGNhcmQgbGlua2luZyBvYmplY3RcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGF0YTogdW5tYXJzaGFsbGVkVHJhbnNhY3Rpb25hbERhdGFcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBUcmFuc2FjdGlvbmFsIGRhdGEgbm90IGZvdW5kIGZvciAke2dldFRyYW5zYWN0aW9uSW5wdXQuaWR9LCBhbmQgJHtKU09OLnN0cmluZ2lmeShnZXRUcmFuc2FjdGlvbklucHV0KX1gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5Ob25lT3JBYnNlbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyAke2ZpZWxkTmFtZX0gcXVlcnkgJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH07XG4gICAgfVxufVxuIl19