"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDevicesForUser = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
/**
 * GetDevicesForUser resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getDevicesForUserInput devices for user input used for the physical devices
 * for a particular user, to be retrieved
 * @returns {@link Promise} of {@link UserDevicesResponse}
 */
const getDevicesForUser = async (fieldName, getDevicesForUserInput) => {
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
             * retrieve all the physical devices for a particular user, given the global secondary index
             *
             * Limit of 1 MB per paginated response data (in our case 7,000 items). An average size for an Item is about 110 bytes, which means that we won't
             * need to do pagination here, since we actually retrieve all users in a looped format, and we account for
             * paginated responses.
             *
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.Pagination.html}
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html}
             */
            retrievedData = await dynamoDbClient.send(new client_dynamodb_1.QueryCommand({
                TableName: process.env.PHYSICAL_DEVICES_TABLE,
                IndexName: `${process.env.PHYSICAL_DEVICES_ID_GLOBAL_INDEX}-${process.env.ENV_NAME}-${region}`,
                ...(exclusiveStartKey && { ExclusiveStartKey: exclusiveStartKey }),
                Limit: 7000,
                /**
                 * we're not interested in getting all the data for this call, just the minimum for us to return the necessary information
                 *
                 * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html
                 * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeNames.html
                 */
                ProjectionExpression: '#idf, #tId, #dst, #llog',
                ExpressionAttributeNames: {
                    '#idf': 'id',
                    '#tId': 'tokenId',
                    '#dst': 'deviceState',
                    '#llog': 'lastLoginDate'
                },
                ExpressionAttributeValues: {
                    ":idf": {
                        S: getDevicesForUserInput.id
                    }
                },
                KeyConditionExpression: '#idf = :idf'
            }));
            exclusiveStartKey = retrievedData.LastEvaluatedKey;
            result = result.concat(retrievedData.Items);
        } while (retrievedData && retrievedData.Count && retrievedData.Items &&
            retrievedData.Items.length && retrievedData.Count !== 0 &&
            retrievedData.Items.length !== 0 && retrievedData.LastEvaluatedKey);
        // if there are physical devices retrieved, then return them accordingly
        if (result && result.length !== 0) {
            // convert the Dynamo DB data from Dynamo DB JSON format to a Moonbeam push device  data format
            const pushDevicesData = [];
            result.forEach(pushDeviceResult => {
                const pushDevice = {
                    id: pushDeviceResult.id.S,
                    tokenId: pushDeviceResult.tokenId.S,
                    deviceState: pushDeviceResult.deviceState.S,
                    lastLoginDate: pushDeviceResult.lastLoginDate.S
                };
                pushDevicesData.push(pushDevice);
            });
            // return the list of physical devices for user
            return {
                data: pushDevicesData
            };
        }
        else {
            const errorMessage = `Physical Devices for user ${getDevicesForUserInput.id} not found!`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.UserDeviceErrorType.NoneOrAbsent
            };
        }
    }
    catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.UserDeviceErrorType.UnexpectedError
        };
    }
};
exports.getDevicesForUser = getDevicesForUser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0RGV2aWNlc0ZvclVzZXJSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL0dldERldmljZXNGb3JVc2VyUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0RBTW1DO0FBQ25DLDhEQUFzRjtBQUV0Rjs7Ozs7OztHQU9HO0FBQ0ksTUFBTSxpQkFBaUIsR0FBRyxLQUFLLEVBQUUsU0FBaUIsRUFBRSxzQkFBOEMsRUFBZ0MsRUFBRTtJQUN2SSxJQUFJO1FBQ0EseUNBQXlDO1FBQ3pDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVyxDQUFDO1FBRXZDLDRDQUE0QztRQUM1QyxNQUFNLGNBQWMsR0FBRyxJQUFJLGdDQUFjLENBQUMsRUFBQyxNQUFNLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQztRQUU1RDs7OztXQUlHO1FBQ0gsSUFBSSxNQUFNLEdBQXFDLEVBQUUsQ0FBQztRQUNsRCxJQUFJLGlCQUFpQixFQUFFLGFBQWEsQ0FBQztRQUVyQyxHQUFHO1lBQ0M7Ozs7Ozs7OztlQVNHO1lBQ0gsYUFBYSxHQUFHLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLDhCQUFZLENBQUM7Z0JBQ3ZELFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUF1QjtnQkFDOUMsU0FBUyxFQUFFLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQ0FBaUMsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVMsSUFBSSxNQUFNLEVBQUU7Z0JBQ2hHLEdBQUcsQ0FBQyxpQkFBaUIsSUFBSSxFQUFDLGlCQUFpQixFQUFFLGlCQUFpQixFQUFDLENBQUM7Z0JBQ2hFLEtBQUssRUFBRSxJQUFJO2dCQUNYOzs7OzttQkFLRztnQkFDSCxvQkFBb0IsRUFBRSx5QkFBeUI7Z0JBQy9DLHdCQUF3QixFQUFFO29CQUN0QixNQUFNLEVBQUUsSUFBSTtvQkFDWixNQUFNLEVBQUUsU0FBUztvQkFDakIsTUFBTSxFQUFFLGFBQWE7b0JBQ3JCLE9BQU8sRUFBRSxlQUFlO2lCQUMzQjtnQkFDRCx5QkFBeUIsRUFBRTtvQkFDdkIsTUFBTSxFQUFFO3dCQUNKLENBQUMsRUFBRSxzQkFBc0IsQ0FBQyxFQUFFO3FCQUMvQjtpQkFDSjtnQkFDRCxzQkFBc0IsRUFBRSxhQUFhO2FBQ3hDLENBQUMsQ0FBQyxDQUFDO1lBRUosaUJBQWlCLEdBQUcsYUFBYSxDQUFDLGdCQUFnQixDQUFDO1lBQ25ELE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUMvQyxRQUFRLGFBQWEsSUFBSSxhQUFhLENBQUMsS0FBSyxJQUFJLGFBQWEsQ0FBQyxLQUFLO1lBQ3BFLGFBQWEsQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLGFBQWEsQ0FBQyxLQUFLLEtBQUssQ0FBQztZQUN2RCxhQUFhLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksYUFBYSxDQUFDLGdCQUFnQixFQUFFO1FBRXBFLHdFQUF3RTtRQUN4RSxJQUFJLE1BQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUMvQiwrRkFBK0Y7WUFDL0YsTUFBTSxlQUFlLEdBQWlCLEVBQUUsQ0FBQztZQUN6QyxNQUFNLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLEVBQUU7Z0JBQzlCLE1BQU0sVUFBVSxHQUFlO29CQUMzQixFQUFFLEVBQUUsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLENBQUU7b0JBQzFCLE9BQU8sRUFBRSxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBRTtvQkFDcEMsV0FBVyxFQUFFLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFxQjtvQkFDL0QsYUFBYSxFQUFFLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFFO2lCQUNuRCxDQUFDO2dCQUNGLGVBQWUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDckMsQ0FBQyxDQUFDLENBQUM7WUFDSCwrQ0FBK0M7WUFDL0MsT0FBTztnQkFDSCxJQUFJLEVBQUUsZUFBZTthQUN4QixDQUFBO1NBQ0o7YUFBTTtZQUNILE1BQU0sWUFBWSxHQUFHLDZCQUE2QixzQkFBc0IsQ0FBQyxFQUFFLGFBQWEsQ0FBQztZQUN6RixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRTFCLE9BQU87Z0JBQ0gsWUFBWSxFQUFFLFlBQVk7Z0JBQzFCLFNBQVMsRUFBRSxxQ0FBbUIsQ0FBQyxZQUFZO2FBQzlDLENBQUE7U0FDSjtLQUNKO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVixNQUFNLFlBQVksR0FBRyxvQ0FBb0MsU0FBUyxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ2xGLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUIsT0FBTztZQUNILFlBQVksRUFBRSxZQUFZO1lBQzFCLFNBQVMsRUFBRSxxQ0FBbUIsQ0FBQyxlQUFlO1NBQ2pELENBQUM7S0FDTDtBQUNMLENBQUMsQ0FBQTtBQTdGWSxRQUFBLGlCQUFpQixxQkE2RjdCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBHZXREZXZpY2VzRm9yVXNlcklucHV0LFxuICAgIFB1c2hEZXZpY2UsXG4gICAgVXNlckRldmljZUVycm9yVHlwZSxcbiAgICBVc2VyRGV2aWNlc1Jlc3BvbnNlLFxuICAgIFVzZXJEZXZpY2VTdGF0ZVxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuaW1wb3J0IHtBdHRyaWJ1dGVWYWx1ZSwgRHluYW1vREJDbGllbnQsIFF1ZXJ5Q29tbWFuZH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1keW5hbW9kYlwiO1xuXG4vKipcbiAqIEdldERldmljZXNGb3JVc2VyIHJlc29sdmVyXG4gKlxuICogQHBhcmFtIGZpZWxkTmFtZSBuYW1lIG9mIHRoZSByZXNvbHZlciBwYXRoIGZyb20gdGhlIEFwcFN5bmMgZXZlbnRcbiAqIEBwYXJhbSBnZXREZXZpY2VzRm9yVXNlcklucHV0IGRldmljZXMgZm9yIHVzZXIgaW5wdXQgdXNlZCBmb3IgdGhlIHBoeXNpY2FsIGRldmljZXNcbiAqIGZvciBhIHBhcnRpY3VsYXIgdXNlciwgdG8gYmUgcmV0cmlldmVkXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIFVzZXJEZXZpY2VzUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBnZXREZXZpY2VzRm9yVXNlciA9IGFzeW5jIChmaWVsZE5hbWU6IHN0cmluZywgZ2V0RGV2aWNlc0ZvclVzZXJJbnB1dDogR2V0RGV2aWNlc0ZvclVzZXJJbnB1dCk6IFByb21pc2U8VXNlckRldmljZXNSZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIGluaXRpYWxpemluZyB0aGUgRHluYW1vREIgZG9jdW1lbnQgY2xpZW50XG4gICAgICAgIGNvbnN0IGR5bmFtb0RiQ2xpZW50ID0gbmV3IER5bmFtb0RCQ2xpZW50KHtyZWdpb246IHJlZ2lvbn0pO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiB0aGUgZGF0YSB0byBiZSByZXRyaWV2ZWQgZnJvbSB0aGUgUXVlcnkgQ29tbWFuZFxuICAgICAgICAgKiB0aGUgZWxpZ2libGUgdXNlciBJdGVtcyByZXR1cm5lZCBmcm9tIHRoZSBRdWVyeSBDb21tYW5kLCBhbGwgYWdncmVnYXRlZCB0b2dldGhlclxuICAgICAgICAgKiB0aGUgbGFzdCBldmFsdWF0ZWQga2V5LCB0byBoZWxwIHdpdGggdGhlIHBhZ2luYXRpb24gb2YgcmVzdWx0c1xuICAgICAgICAgKi9cbiAgICAgICAgbGV0IHJlc3VsdDogUmVjb3JkPHN0cmluZywgQXR0cmlidXRlVmFsdWU+W10gPSBbXTtcbiAgICAgICAgbGV0IGV4Y2x1c2l2ZVN0YXJ0S2V5LCByZXRyaWV2ZWREYXRhO1xuXG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogcmV0cmlldmUgYWxsIHRoZSBwaHlzaWNhbCBkZXZpY2VzIGZvciBhIHBhcnRpY3VsYXIgdXNlciwgZ2l2ZW4gdGhlIGdsb2JhbCBzZWNvbmRhcnkgaW5kZXhcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBMaW1pdCBvZiAxIE1CIHBlciBwYWdpbmF0ZWQgcmVzcG9uc2UgZGF0YSAoaW4gb3VyIGNhc2UgNywwMDAgaXRlbXMpLiBBbiBhdmVyYWdlIHNpemUgZm9yIGFuIEl0ZW0gaXMgYWJvdXQgMTEwIGJ5dGVzLCB3aGljaCBtZWFucyB0aGF0IHdlIHdvbid0XG4gICAgICAgICAgICAgKiBuZWVkIHRvIGRvIHBhZ2luYXRpb24gaGVyZSwgc2luY2Ugd2UgYWN0dWFsbHkgcmV0cmlldmUgYWxsIHVzZXJzIGluIGEgbG9vcGVkIGZvcm1hdCwgYW5kIHdlIGFjY291bnQgZm9yXG4gICAgICAgICAgICAgKiBwYWdpbmF0ZWQgcmVzcG9uc2VzLlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIEBsaW5rIHtodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL1F1ZXJ5LlBhZ2luYXRpb24uaHRtbH1cbiAgICAgICAgICAgICAqIEBsaW5rIHtodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL1F1ZXJ5Lmh0bWx9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHJldHJpZXZlZERhdGEgPSBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBRdWVyeUNvbW1hbmQoe1xuICAgICAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuUEhZU0lDQUxfREVWSUNFU19UQUJMRSEsXG4gICAgICAgICAgICAgICAgSW5kZXhOYW1lOiBgJHtwcm9jZXNzLmVudi5QSFlTSUNBTF9ERVZJQ0VTX0lEX0dMT0JBTF9JTkRFWCF9LSR7cHJvY2Vzcy5lbnYuRU5WX05BTUUhfS0ke3JlZ2lvbn1gLFxuICAgICAgICAgICAgICAgIC4uLihleGNsdXNpdmVTdGFydEtleSAmJiB7RXhjbHVzaXZlU3RhcnRLZXk6IGV4Y2x1c2l2ZVN0YXJ0S2V5fSksXG4gICAgICAgICAgICAgICAgTGltaXQ6IDcwMDAsIC8vIDcwMDAgKiAxMTEwIGJ5dGVzID0gNzcwLDAwMCBieXRlcyA9IDAuNzc3IE1CIChsZWF2ZSBhIG1hcmdpbiBvZiBlcnJvciBoZXJlIHVwIHRvIDEgTUIpXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogd2UncmUgbm90IGludGVyZXN0ZWQgaW4gZ2V0dGluZyBhbGwgdGhlIGRhdGEgZm9yIHRoaXMgY2FsbCwganVzdCB0aGUgbWluaW11bSBmb3IgdXMgdG8gcmV0dXJuIHRoZSBuZWNlc3NhcnkgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9hbWF6b25keW5hbW9kYi9sYXRlc3QvZGV2ZWxvcGVyZ3VpZGUvUmVzZXJ2ZWRXb3Jkcy5odG1sXG4gICAgICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2FtYXpvbmR5bmFtb2RiL2xhdGVzdC9kZXZlbG9wZXJndWlkZS9FeHByZXNzaW9ucy5FeHByZXNzaW9uQXR0cmlidXRlTmFtZXMuaHRtbFxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIFByb2plY3Rpb25FeHByZXNzaW9uOiAnI2lkZiwgI3RJZCwgI2RzdCwgI2xsb2cnLFxuICAgICAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lczoge1xuICAgICAgICAgICAgICAgICAgICAnI2lkZic6ICdpZCcsXG4gICAgICAgICAgICAgICAgICAgICcjdElkJzogJ3Rva2VuSWQnLFxuICAgICAgICAgICAgICAgICAgICAnI2RzdCc6ICdkZXZpY2VTdGF0ZScsXG4gICAgICAgICAgICAgICAgICAgICcjbGxvZyc6ICdsYXN0TG9naW5EYXRlJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlczoge1xuICAgICAgICAgICAgICAgICAgICBcIjppZGZcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogZ2V0RGV2aWNlc0ZvclVzZXJJbnB1dC5pZFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBLZXlDb25kaXRpb25FeHByZXNzaW9uOiAnI2lkZiA9IDppZGYnXG4gICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgIGV4Y2x1c2l2ZVN0YXJ0S2V5ID0gcmV0cmlldmVkRGF0YS5MYXN0RXZhbHVhdGVkS2V5O1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdChyZXRyaWV2ZWREYXRhLkl0ZW1zKTtcbiAgICAgICAgfSB3aGlsZSAocmV0cmlldmVkRGF0YSAmJiByZXRyaWV2ZWREYXRhLkNvdW50ICYmIHJldHJpZXZlZERhdGEuSXRlbXMgJiZcbiAgICAgICAgcmV0cmlldmVkRGF0YS5JdGVtcy5sZW5ndGggJiYgcmV0cmlldmVkRGF0YS5Db3VudCAhPT0gMCAmJlxuICAgICAgICByZXRyaWV2ZWREYXRhLkl0ZW1zLmxlbmd0aCAhPT0gMCAmJiByZXRyaWV2ZWREYXRhLkxhc3RFdmFsdWF0ZWRLZXkpO1xuXG4gICAgICAgIC8vIGlmIHRoZXJlIGFyZSBwaHlzaWNhbCBkZXZpY2VzIHJldHJpZXZlZCwgdGhlbiByZXR1cm4gdGhlbSBhY2NvcmRpbmdseVxuICAgICAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgIC8vIGNvbnZlcnQgdGhlIER5bmFtbyBEQiBkYXRhIGZyb20gRHluYW1vIERCIEpTT04gZm9ybWF0IHRvIGEgTW9vbmJlYW0gcHVzaCBkZXZpY2UgIGRhdGEgZm9ybWF0XG4gICAgICAgICAgICBjb25zdCBwdXNoRGV2aWNlc0RhdGE6IFB1c2hEZXZpY2VbXSA9IFtdO1xuICAgICAgICAgICAgcmVzdWx0LmZvckVhY2gocHVzaERldmljZVJlc3VsdCA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcHVzaERldmljZTogUHVzaERldmljZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IHB1c2hEZXZpY2VSZXN1bHQuaWQuUyEsXG4gICAgICAgICAgICAgICAgICAgIHRva2VuSWQ6IHB1c2hEZXZpY2VSZXN1bHQudG9rZW5JZC5TISxcbiAgICAgICAgICAgICAgICAgICAgZGV2aWNlU3RhdGU6IHB1c2hEZXZpY2VSZXN1bHQuZGV2aWNlU3RhdGUuUyEgYXMgVXNlckRldmljZVN0YXRlLFxuICAgICAgICAgICAgICAgICAgICBsYXN0TG9naW5EYXRlOiBwdXNoRGV2aWNlUmVzdWx0Lmxhc3RMb2dpbkRhdGUuUyFcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHB1c2hEZXZpY2VzRGF0YS5wdXNoKHB1c2hEZXZpY2UpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyByZXR1cm4gdGhlIGxpc3Qgb2YgcGh5c2ljYWwgZGV2aWNlcyBmb3IgdXNlclxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBkYXRhOiBwdXNoRGV2aWNlc0RhdGFcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBQaHlzaWNhbCBEZXZpY2VzIGZvciB1c2VyICR7Z2V0RGV2aWNlc0ZvclVzZXJJbnB1dC5pZH0gbm90IGZvdW5kIWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVXNlckRldmljZUVycm9yVHlwZS5Ob25lT3JBYnNlbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgJHtmaWVsZE5hbWV9IHF1ZXJ5ICR7ZXJyfWA7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIGVycm9yVHlwZTogVXNlckRldmljZUVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfTtcbiAgICB9XG59XG4iXX0=