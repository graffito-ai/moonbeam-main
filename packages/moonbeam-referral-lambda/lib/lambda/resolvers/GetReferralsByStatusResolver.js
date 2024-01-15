"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReferralsByStatus = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
/**
 * GetReferralsByStatus resolver
 *
 * @param getReferralsByStatusInput the input needed to create a new referral
 * @param fieldName name of the resolver path from the AppSync event
 * @returns {@link Promise} of {@link ReferralResponse}
 */
const getReferralsByStatus = async (fieldName, getReferralsByStatusInput) => {
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
             * retrieve all referrals by status, given the global secondary index, as well as the status to be queried by
             *
             * Limit of 1 MB per paginated response data (in our case 5,700 items). An average size for an Item is about 133 bytes, which means that we won't
             * need to do pagination here, since we actually retrieve all users in a looped format, and we account for
             * paginated responses.
             *
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.Pagination.html}
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html}
             */
            retrievedData = await dynamoDbClient.send(new client_dynamodb_1.QueryCommand({
                TableName: process.env.REFERRAL_TABLE,
                IndexName: `${process.env.REFERRAL_STATUS_GLOBAL_INDEX}-${process.env.ENV_NAME}-${region}`,
                ...(exclusiveStartKey && { ExclusiveStartKey: exclusiveStartKey }),
                Limit: 5700,
                ExpressionAttributeNames: {
                    '#st': 'status'
                },
                ExpressionAttributeValues: {
                    ":st": {
                        S: getReferralsByStatusInput.status
                    }
                },
                KeyConditionExpression: '#st = :st'
            }));
            exclusiveStartKey = retrievedData.LastEvaluatedKey;
            result = result.concat(retrievedData.Items);
        } while (retrievedData && retrievedData.Count && retrievedData.Items &&
            retrievedData.Items.length && retrievedData.Count !== 0 &&
            retrievedData.Items.length !== 0 && retrievedData.LastEvaluatedKey);
        // if there are referrals retrieved, then return all of them accordingly
        if (result && result.length !== 0) {
            // convert the Dynamo DB data from Dynamo DB JSON format to a Moonbeam Referral data format
            const referralData = [];
            result.forEach(referralResult => {
                const referral = {
                    fromId: referralResult.fromId.S,
                    timestamp: Number(referralResult.timestamp.N),
                    toId: referralResult.toId.S,
                    status: getReferralsByStatusInput.status,
                    campaignCode: referralResult.campaignCode.S,
                    createdAt: referralResult.createdAt.S,
                    updatedAt: referralResult.updatedAt.S
                };
                referralData.push(referral);
            });
            // return the list of referrals
            return {
                data: referralData
            };
        }
        else {
            const errorMessage = `No matching referrals found!`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.ReferralErrorType.NoneOrAbsent
            };
        }
    }
    catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.ReferralErrorType.UnexpectedError
        };
    }
};
exports.getReferralsByStatus = getReferralsByStatus;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0UmVmZXJyYWxzQnlTdGF0dXNSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL0dldFJlZmVycmFsc0J5U3RhdHVzUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0RBTW1DO0FBQ25DLDhEQUFzRjtBQUV0Rjs7Ozs7O0dBTUc7QUFDSSxNQUFNLG9CQUFvQixHQUFHLEtBQUssRUFBRSxTQUFpQixFQUFFLHlCQUFvRCxFQUE2QixFQUFFO0lBQzdJLElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsNENBQTRDO1FBQzVDLE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBRTVEOzs7O1dBSUc7UUFDSCxJQUFJLE1BQU0sR0FBcUMsRUFBRSxDQUFDO1FBQ2xELElBQUksaUJBQWlCLEVBQUUsYUFBYSxDQUFDO1FBRXJDLEdBQUc7WUFDQzs7Ozs7Ozs7O2VBU0c7WUFDSCxhQUFhLEdBQUcsTUFBTSxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksOEJBQVksQ0FBQztnQkFDdkQsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBZTtnQkFDdEMsU0FBUyxFQUFFLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0QkFBNkIsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVMsSUFBSSxNQUFNLEVBQUU7Z0JBQzVGLEdBQUcsQ0FBQyxpQkFBaUIsSUFBSSxFQUFDLGlCQUFpQixFQUFFLGlCQUFpQixFQUFDLENBQUM7Z0JBQ2hFLEtBQUssRUFBRSxJQUFJO2dCQUNYLHdCQUF3QixFQUFFO29CQUN0QixLQUFLLEVBQUUsUUFBUTtpQkFDbEI7Z0JBQ0QseUJBQXlCLEVBQUU7b0JBQ3ZCLEtBQUssRUFBRTt3QkFDSCxDQUFDLEVBQUUseUJBQXlCLENBQUMsTUFBTTtxQkFDdEM7aUJBQ0o7Z0JBQ0Qsc0JBQXNCLEVBQUUsV0FBVzthQUN0QyxDQUFDLENBQUMsQ0FBQztZQUVKLGlCQUFpQixHQUFHLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQztZQUNuRCxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDL0MsUUFBUSxhQUFhLElBQUksYUFBYSxDQUFDLEtBQUssSUFBSSxhQUFhLENBQUMsS0FBSztZQUNwRSxhQUFhLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBSSxhQUFhLENBQUMsS0FBSyxLQUFLLENBQUM7WUFDdkQsYUFBYSxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLGFBQWEsQ0FBQyxnQkFBZ0IsRUFBRTtRQUVwRSx3RUFBd0U7UUFDeEUsSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDL0IsMkZBQTJGO1lBQzNGLE1BQU0sWUFBWSxHQUFlLEVBQUUsQ0FBQztZQUNwQyxNQUFNLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxFQUFFO2dCQUM1QixNQUFNLFFBQVEsR0FBYTtvQkFDdkIsTUFBTSxFQUFFLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBRTtvQkFDaEMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUUsQ0FBQztvQkFDOUMsSUFBSSxFQUFFLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBRTtvQkFDNUIsTUFBTSxFQUFFLHlCQUF5QixDQUFDLE1BQU07b0JBQ3hDLFlBQVksRUFBRSxjQUFjLENBQUMsWUFBWSxDQUFDLENBQTJCO29CQUNyRSxTQUFTLEVBQUUsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFFO29CQUN0QyxTQUFTLEVBQUUsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFFO2lCQUN6QyxDQUFDO2dCQUNGLFlBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDaEMsQ0FBQyxDQUFDLENBQUM7WUFDSCwrQkFBK0I7WUFDL0IsT0FBTztnQkFDSCxJQUFJLEVBQUUsWUFBWTthQUNyQixDQUFBO1NBQ0o7YUFBTTtZQUNILE1BQU0sWUFBWSxHQUFHLDhCQUE4QixDQUFDO1lBQ3BELE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFMUIsT0FBTztnQkFDSCxZQUFZLEVBQUUsWUFBWTtnQkFDMUIsU0FBUyxFQUFFLG1DQUFpQixDQUFDLFlBQVk7YUFDNUMsQ0FBQTtTQUNKO0tBQ0o7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLE1BQU0sWUFBWSxHQUFHLG9DQUFvQyxTQUFTLFVBQVUsR0FBRyxFQUFFLENBQUM7UUFDbEYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMxQixPQUFPO1lBQ0gsWUFBWSxFQUFFLFlBQVk7WUFDMUIsU0FBUyxFQUFFLG1DQUFpQixDQUFDLGVBQWU7U0FDL0MsQ0FBQztLQUNMO0FBQ0wsQ0FBQyxDQUFBO0FBdEZZLFFBQUEsb0JBQW9CLHdCQXNGaEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIEdldFJlZmVycmFsc0J5U3RhdHVzSW5wdXQsXG4gICAgTWFya2V0aW5nQ2FtcGFpZ25Db2RlLFxuICAgIFJlZmVycmFsLFxuICAgIFJlZmVycmFsRXJyb3JUeXBlLFxuICAgIFJlZmVycmFsUmVzcG9uc2Vcbn0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcbmltcG9ydCB7QXR0cmlidXRlVmFsdWUsIER5bmFtb0RCQ2xpZW50LCBRdWVyeUNvbW1hbmR9IGZyb20gXCJAYXdzLXNkay9jbGllbnQtZHluYW1vZGJcIjtcblxuLyoqXG4gKiBHZXRSZWZlcnJhbHNCeVN0YXR1cyByZXNvbHZlclxuICpcbiAqIEBwYXJhbSBnZXRSZWZlcnJhbHNCeVN0YXR1c0lucHV0IHRoZSBpbnB1dCBuZWVkZWQgdG8gY3JlYXRlIGEgbmV3IHJlZmVycmFsXG4gKiBAcGFyYW0gZmllbGROYW1lIG5hbWUgb2YgdGhlIHJlc29sdmVyIHBhdGggZnJvbSB0aGUgQXBwU3luYyBldmVudFxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBSZWZlcnJhbFJlc3BvbnNlfVxuICovXG5leHBvcnQgY29uc3QgZ2V0UmVmZXJyYWxzQnlTdGF0dXMgPSBhc3luYyAoZmllbGROYW1lOiBzdHJpbmcsIGdldFJlZmVycmFsc0J5U3RhdHVzSW5wdXQ6IEdldFJlZmVycmFsc0J5U3RhdHVzSW5wdXQpOiBQcm9taXNlPFJlZmVycmFsUmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvLyBpbml0aWFsaXppbmcgdGhlIER5bmFtb0RCIGRvY3VtZW50IGNsaWVudFxuICAgICAgICBjb25zdCBkeW5hbW9EYkNsaWVudCA9IG5ldyBEeW5hbW9EQkNsaWVudCh7cmVnaW9uOiByZWdpb259KTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogdGhlIGRhdGEgdG8gYmUgcmV0cmlldmVkIGZyb20gdGhlIFF1ZXJ5IENvbW1hbmRcbiAgICAgICAgICogdGhlIGVsaWdpYmxlIHVzZXIgSXRlbXMgcmV0dXJuZWQgZnJvbSB0aGUgUXVlcnkgQ29tbWFuZCwgYWxsIGFnZ3JlZ2F0ZWQgdG9nZXRoZXJcbiAgICAgICAgICogdGhlIGxhc3QgZXZhbHVhdGVkIGtleSwgdG8gaGVscCB3aXRoIHRoZSBwYWdpbmF0aW9uIG9mIHJlc3VsdHNcbiAgICAgICAgICovXG4gICAgICAgIGxldCByZXN1bHQ6IFJlY29yZDxzdHJpbmcsIEF0dHJpYnV0ZVZhbHVlPltdID0gW107XG4gICAgICAgIGxldCBleGNsdXNpdmVTdGFydEtleSwgcmV0cmlldmVkRGF0YTtcblxuICAgICAgICBkbyB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIHJldHJpZXZlIGFsbCByZWZlcnJhbHMgYnkgc3RhdHVzLCBnaXZlbiB0aGUgZ2xvYmFsIHNlY29uZGFyeSBpbmRleCwgYXMgd2VsbCBhcyB0aGUgc3RhdHVzIHRvIGJlIHF1ZXJpZWQgYnlcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBMaW1pdCBvZiAxIE1CIHBlciBwYWdpbmF0ZWQgcmVzcG9uc2UgZGF0YSAoaW4gb3VyIGNhc2UgNSw3MDAgaXRlbXMpLiBBbiBhdmVyYWdlIHNpemUgZm9yIGFuIEl0ZW0gaXMgYWJvdXQgMTMzIGJ5dGVzLCB3aGljaCBtZWFucyB0aGF0IHdlIHdvbid0XG4gICAgICAgICAgICAgKiBuZWVkIHRvIGRvIHBhZ2luYXRpb24gaGVyZSwgc2luY2Ugd2UgYWN0dWFsbHkgcmV0cmlldmUgYWxsIHVzZXJzIGluIGEgbG9vcGVkIGZvcm1hdCwgYW5kIHdlIGFjY291bnQgZm9yXG4gICAgICAgICAgICAgKiBwYWdpbmF0ZWQgcmVzcG9uc2VzLlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIEBsaW5rIHtodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL1F1ZXJ5LlBhZ2luYXRpb24uaHRtbH1cbiAgICAgICAgICAgICAqIEBsaW5rIHtodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL1F1ZXJ5Lmh0bWx9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHJldHJpZXZlZERhdGEgPSBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBRdWVyeUNvbW1hbmQoe1xuICAgICAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuUkVGRVJSQUxfVEFCTEUhLFxuICAgICAgICAgICAgICAgIEluZGV4TmFtZTogYCR7cHJvY2Vzcy5lbnYuUkVGRVJSQUxfU1RBVFVTX0dMT0JBTF9JTkRFWCF9LSR7cHJvY2Vzcy5lbnYuRU5WX05BTUUhfS0ke3JlZ2lvbn1gLFxuICAgICAgICAgICAgICAgIC4uLihleGNsdXNpdmVTdGFydEtleSAmJiB7RXhjbHVzaXZlU3RhcnRLZXk6IGV4Y2x1c2l2ZVN0YXJ0S2V5fSksXG4gICAgICAgICAgICAgICAgTGltaXQ6IDU3MDAsIC8vIDUsNzAwICogMTMzIGJ5dGVzID0gNzU4LDEwMCBieXRlcyA9IDAuNzU4MSBNQiAobGVhdmUgYSBtYXJnaW4gb2YgZXJyb3IgaGVyZSB1cCB0byAxIE1CKVxuICAgICAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lczoge1xuICAgICAgICAgICAgICAgICAgICAnI3N0JzogJ3N0YXR1cydcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCI6c3RcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogZ2V0UmVmZXJyYWxzQnlTdGF0dXNJbnB1dC5zdGF0dXNcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgS2V5Q29uZGl0aW9uRXhwcmVzc2lvbjogJyNzdCA9IDpzdCdcbiAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgZXhjbHVzaXZlU3RhcnRLZXkgPSByZXRyaWV2ZWREYXRhLkxhc3RFdmFsdWF0ZWRLZXk7XG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KHJldHJpZXZlZERhdGEuSXRlbXMpO1xuICAgICAgICB9IHdoaWxlIChyZXRyaWV2ZWREYXRhICYmIHJldHJpZXZlZERhdGEuQ291bnQgJiYgcmV0cmlldmVkRGF0YS5JdGVtcyAmJlxuICAgICAgICByZXRyaWV2ZWREYXRhLkl0ZW1zLmxlbmd0aCAmJiByZXRyaWV2ZWREYXRhLkNvdW50ICE9PSAwICYmXG4gICAgICAgIHJldHJpZXZlZERhdGEuSXRlbXMubGVuZ3RoICE9PSAwICYmIHJldHJpZXZlZERhdGEuTGFzdEV2YWx1YXRlZEtleSk7XG5cbiAgICAgICAgLy8gaWYgdGhlcmUgYXJlIHJlZmVycmFscyByZXRyaWV2ZWQsIHRoZW4gcmV0dXJuIGFsbCBvZiB0aGVtIGFjY29yZGluZ2x5XG4gICAgICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0Lmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgLy8gY29udmVydCB0aGUgRHluYW1vIERCIGRhdGEgZnJvbSBEeW5hbW8gREIgSlNPTiBmb3JtYXQgdG8gYSBNb29uYmVhbSBSZWZlcnJhbCBkYXRhIGZvcm1hdFxuICAgICAgICAgICAgY29uc3QgcmVmZXJyYWxEYXRhOiBSZWZlcnJhbFtdID0gW107XG4gICAgICAgICAgICByZXN1bHQuZm9yRWFjaChyZWZlcnJhbFJlc3VsdCA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVmZXJyYWw6IFJlZmVycmFsID0ge1xuICAgICAgICAgICAgICAgICAgICBmcm9tSWQ6IHJlZmVycmFsUmVzdWx0LmZyb21JZC5TISxcbiAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiBOdW1iZXIocmVmZXJyYWxSZXN1bHQudGltZXN0YW1wLk4hKSxcbiAgICAgICAgICAgICAgICAgICAgdG9JZDogcmVmZXJyYWxSZXN1bHQudG9JZC5TISxcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiBnZXRSZWZlcnJhbHNCeVN0YXR1c0lucHV0LnN0YXR1cyxcbiAgICAgICAgICAgICAgICAgICAgY2FtcGFpZ25Db2RlOiByZWZlcnJhbFJlc3VsdC5jYW1wYWlnbkNvZGUuUyEgYXMgTWFya2V0aW5nQ2FtcGFpZ25Db2RlLFxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IHJlZmVycmFsUmVzdWx0LmNyZWF0ZWRBdC5TISxcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEF0OiByZWZlcnJhbFJlc3VsdC51cGRhdGVkQXQuUyFcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHJlZmVycmFsRGF0YS5wdXNoKHJlZmVycmFsKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBsaXN0IG9mIHJlZmVycmFsc1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBkYXRhOiByZWZlcnJhbERhdGFcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyBtYXRjaGluZyByZWZlcnJhbHMgZm91bmQhYDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBSZWZlcnJhbEVycm9yVHlwZS5Ob25lT3JBYnNlbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgJHtmaWVsZE5hbWV9IHF1ZXJ5ICR7ZXJyfWA7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIGVycm9yVHlwZTogUmVmZXJyYWxFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH07XG4gICAgfVxufVxuIl19