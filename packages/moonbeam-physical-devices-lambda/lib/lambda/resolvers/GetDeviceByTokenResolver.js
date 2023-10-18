"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeviceByToken = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
/**
 * GetDeviceByToken resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getDeviceByTokenInput device by token input used for the physical device
 * for a particular user, to be retrieved
 * @returns {@link Promise} of {@link UserDeviceResponse}
 */
const getDeviceByToken = async (fieldName, getDeviceByTokenInput) => {
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
             * retrieve all the physical device, given the global secondary index
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
                IndexName: `${process.env.PHYSICAL_DEVICES_TOKEN_ID_GLOBAL_INDEX}-${process.env.ENV_NAME}-${region}`,
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
                    ":tId": {
                        S: getDeviceByTokenInput.tokenId
                    }
                },
                KeyConditionExpression: '#tId = :tId'
            }));
            exclusiveStartKey = retrievedData.LastEvaluatedKey;
            result = result.concat(retrievedData.Items);
        } while (retrievedData && retrievedData.Count && retrievedData.Items &&
            retrievedData.Items.length && retrievedData.Count !== 0 &&
            retrievedData.Items.length !== 0 && retrievedData.LastEvaluatedKey);
        // if there is a physical device retrieved, then return it accordingly
        if (result && result.length !== 0) {
            // convert the Dynamo DB data from Dynamo DB JSON format to a Moonbeam push device data format
            let pushDeviceData = [];
            result.forEach(pushDeviceResult => {
                // only retrieve the push device that's in an ACTIVE state (if it exists) - should only be one
                if (pushDeviceResult.deviceState.S === moonbeam_models_1.UserDeviceState.Active) {
                    const pushDevice = {
                        id: pushDeviceResult.id.S,
                        tokenId: pushDeviceResult.tokenId.S,
                        deviceState: pushDeviceResult.deviceState.S,
                        lastLoginDate: pushDeviceResult.lastLoginDate.S
                    };
                    pushDeviceData.push(pushDevice);
                }
            });
            // only return if we found an active physical device (ignore the inactive entries)
            if (pushDeviceData.length !== 0) {
                // return the physical device
                return {
                    data: pushDeviceData[0]
                };
            }
            else {
                const errorMessage = `Active Physical Device with token ${getDeviceByTokenInput.tokenId} not found!`;
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: moonbeam_models_1.UserDeviceErrorType.NoneOrAbsent
                };
            }
        }
        else {
            const errorMessage = `Physical Device with token ${getDeviceByTokenInput.tokenId} not found!`;
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
exports.getDeviceByToken = getDeviceByToken;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0RGV2aWNlQnlUb2tlblJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvR2V0RGV2aWNlQnlUb2tlblJlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtEQU1tQztBQUNuQyw4REFBc0Y7QUFFdEY7Ozs7Ozs7R0FPRztBQUNJLE1BQU0sZ0JBQWdCLEdBQUcsS0FBSyxFQUFFLFNBQWlCLEVBQUUscUJBQTRDLEVBQStCLEVBQUU7SUFDbkksSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qyw0Q0FBNEM7UUFDNUMsTUFBTSxjQUFjLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFFNUQ7Ozs7V0FJRztRQUNILElBQUksTUFBTSxHQUFxQyxFQUFFLENBQUM7UUFDbEQsSUFBSSxpQkFBaUIsRUFBRSxhQUFhLENBQUM7UUFFckMsR0FBRztZQUNDOzs7Ozs7Ozs7ZUFTRztZQUNILGFBQWEsR0FBRyxNQUFNLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSw4QkFBWSxDQUFDO2dCQUN2RCxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBdUI7Z0JBQzlDLFNBQVMsRUFBRSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0NBQXVDLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFTLElBQUksTUFBTSxFQUFFO2dCQUN0RyxHQUFHLENBQUMsaUJBQWlCLElBQUksRUFBQyxpQkFBaUIsRUFBRSxpQkFBaUIsRUFBQyxDQUFDO2dCQUNoRSxLQUFLLEVBQUUsSUFBSTtnQkFDWDs7Ozs7bUJBS0c7Z0JBQ0gsb0JBQW9CLEVBQUUseUJBQXlCO2dCQUMvQyx3QkFBd0IsRUFBRTtvQkFDdEIsTUFBTSxFQUFFLElBQUk7b0JBQ1os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dmljZSxcbiAgICBVc2VyRGV2aWNlRXJyb3JUeXBlLFxuICAgIFVzZXJEZXZpY2VSZXNwb25zZSxcbiAgICBVc2VyRGV2aWNlU3RhdGVcbn0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcbmltcG9ydCB7QXR0cmlidXRlVmFsdWUsIER5bmFtb0RCQ2xpZW50LCBRdWVyeUNvbW1hbmR9IGZyb20gXCJAYXdzLXNkay9jbGllbnQtZHluYW1vZGJcIjtcblxuLyoqXG4gKiBHZXREZXZpY2VCeVRva2VuIHJlc29sdmVyXG4gKlxuICogQHBhcmFtIGZpZWxkTmFtZSBuYW1lIG9mIHRoZSByZXNvbHZlciBwYXRoIGZyb20gdGhlIEFwcFN5bmMgZXZlbnRcbiAqIEBwYXJhbSBnZXREZXZpY2VCeVRva2VuSW5wdXQgZGV2aWNlIGJ5IHRva2VuIGlucHV0IHVzZWQgZm9yIHRoZSBwaHlzaWNhbCBkZXZpY2VcbiAqIGZvciBhIHBhcnRpY3VsYXIgdXNlciwgdG8gYmUgcmV0cmlldmVkXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIFVzZXJEZXZpY2VSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGdldERldmljZUJ5VG9rZW4gPSBhc3luYyAoZmllbGROYW1lOiBzdHJpbmcsIGdldERldmljZUJ5VG9rZW5JbnB1dDogR2V0RGV2aWNlQnlUb2tlbklucHV0KTogUHJvbWlzZTxVc2VyRGV2aWNlUmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvLyBpbml0aWFsaXppbmcgdGhlIER5bmFtb0RCIGRvY3VtZW50IGNsaWVudFxuICAgICAgICBjb25zdCBkeW5hbW9EYkNsaWVudCA9IG5ldyBEeW5hbW9EQkNsaWVudCh7cmVnaW9uOiByZWdpb259KTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogdGhlIGRhdGEgdG8gYmUgcmV0cmlldmVkIGZyb20gdGhlIFF1ZXJ5IENvbW1hbmRcbiAgICAgICAgICogdGhlIGVsaWdpYmxlIHVzZXIgSXRlbXMgcmV0dXJuZWQgZnJvbSB0aGUgUXVlcnkgQ29tbWFuZCwgYWxsIGFnZ3JlZ2F0ZWQgdG9nZXRoZXJcbiAgICAgICAgICogdGhlIGxhc3QgZXZhbHVhdGVkIGtleSwgdG8gaGVscCB3aXRoIHRoZSBwYWdpbmF0aW9uIG9mIHJlc3VsdHNcbiAgICAgICAgICovXG4gICAgICAgIGxldCByZXN1bHQ6IFJlY29yZDxzdHJpbmcsIEF0dHJpYnV0ZVZhbHVlPltdID0gW107XG4gICAgICAgIGxldCBleGNsdXNpdmVTdGFydEtleSwgcmV0cmlldmVkRGF0YTtcblxuICAgICAgICBkbyB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIHJldHJpZXZlIGFsbCB0aGUgcGh5c2ljYWwgZGV2aWNlLCBnaXZlbiB0aGUgZ2xvYmFsIHNlY29uZGFyeSBpbmRleFxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIExpbWl0IG9mIDEgTUIgcGVyIHBhZ2luYXRlZCByZXNwb25zZSBkYXRhIChpbiBvdXIgY2FzZSA3LDAwMCBpdGVtcykuIEFuIGF2ZXJhZ2Ugc2l6ZSBmb3IgYW4gSXRlbSBpcyBhYm91dCAxMTAgYnl0ZXMsIHdoaWNoIG1lYW5zIHRoYXQgd2Ugd29uJ3RcbiAgICAgICAgICAgICAqIG5lZWQgdG8gZG8gcGFnaW5hdGlvbiBoZXJlLCBzaW5jZSB3ZSBhY3R1YWxseSByZXRyaWV2ZSBhbGwgdXNlcnMgaW4gYSBsb29wZWQgZm9ybWF0LCBhbmQgd2UgYWNjb3VudCBmb3JcbiAgICAgICAgICAgICAqIHBhZ2luYXRlZCByZXNwb25zZXMuXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogQGxpbmsge2h0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9hbWF6b25keW5hbW9kYi9sYXRlc3QvZGV2ZWxvcGVyZ3VpZGUvUXVlcnkuUGFnaW5hdGlvbi5odG1sfVxuICAgICAgICAgICAgICogQGxpbmsge2h0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9hbWF6b25keW5hbW9kYi9sYXRlc3QvZGV2ZWxvcGVyZ3VpZGUvUXVlcnkuaHRtbH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgcmV0cmlldmVkRGF0YSA9IGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IFF1ZXJ5Q29tbWFuZCh7XG4gICAgICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5QSFlTSUNBTF9ERVZJQ0VTX1RBQkxFISxcbiAgICAgICAgICAgICAgICBJbmRleE5hbWU6IGAke3Byb2Nlc3MuZW52LlBIWVNJQ0FMX0RFVklDRVNfVE9LRU5fSURfR0xPQkFMX0lOREVYIX0tJHtwcm9jZXNzLmVudi5FTlZfTkFNRSF9LSR7cmVnaW9ufWAsXG4gICAgICAgICAgICAgICAgLi4uKGV4Y2x1c2l2ZVN0YXJ0S2V5ICYmIHtFeGNsdXNpdmVTdGFydEtleTogZXhjbHVzaXZlU3RhcnRLZXl9KSxcbiAgICAgICAgICAgICAgICBMaW1pdDogNzAwMCwgLy8gNzAwMCAqIDExMTAgYnl0ZXMgPSA3NzAsMDAwIGJ5dGVzID0gMC43NzcgTUIgKGxlYXZlIGEgbWFyZ2luIG9mIGVycm9yIGhlcmUgdXAgdG8gMSBNQilcbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiB3ZSdyZSBub3QgaW50ZXJlc3RlZCBpbiBnZXR0aW5nIGFsbCB0aGUgZGF0YSBmb3IgdGhpcyBjYWxsLCBqdXN0IHRoZSBtaW5pbXVtIGZvciB1cyB0byByZXR1cm4gdGhlIG5lY2Vzc2FyeSBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2FtYXpvbmR5bmFtb2RiL2xhdGVzdC9kZXZlbG9wZXJndWlkZS9SZXNlcnZlZFdvcmRzLmh0bWxcbiAgICAgICAgICAgICAgICAgKiBAbGluayBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL0V4cHJlc3Npb25zLkV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lcy5odG1sXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgUHJvamVjdGlvbkV4cHJlc3Npb246ICcjaWRmLCAjdElkLCAjZHN0LCAjbGxvZycsXG4gICAgICAgICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICcjaWRmJzogJ2lkJyxcbiAgICAgICAgICAgICAgICAgICAgJyN0SWQnOiAndG9rZW5JZCcsXG4gICAgICAgICAgICAgICAgICAgICcjZHN0JzogJ2RldmljZVN0YXRlJyxcbiAgICAgICAgICAgICAgICAgICAgJyNsbG9nJzogJ2xhc3RMb2dpbkRhdGUnXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlVmFsdWVzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiOnRJZFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiBnZXREZXZpY2VCeVRva2VuSW5wdXQudG9rZW5JZFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBLZXlDb25kaXRpb25FeHByZXNzaW9uOiAnI3RJZCA9IDp0SWQnXG4gICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgIGV4Y2x1c2l2ZVN0YXJ0S2V5ID0gcmV0cmlldmVkRGF0YS5MYXN0RXZhbHVhdGVkS2V5O1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdChyZXRyaWV2ZWREYXRhLkl0ZW1zKTtcbiAgICAgICAgfSB3aGlsZSAocmV0cmlldmVkRGF0YSAmJiByZXRyaWV2ZWREYXRhLkNvdW50ICYmIHJldHJpZXZlZERhdGEuSXRlbXMgJiZcbiAgICAgICAgcmV0cmlldmVkRGF0YS5JdGVtcy5sZW5ndGggJiYgcmV0cmlldmVkRGF0YS5Db3VudCAhPT0gMCAmJlxuICAgICAgICByZXRyaWV2ZWREYXRhLkl0ZW1zLmxlbmd0aCAhPT0gMCAmJiByZXRyaWV2ZWREYXRhLkxhc3RFdmFsdWF0ZWRLZXkpO1xuXG4gICAgICAgIC8vIGlmIHRoZXJlIGlzIGEgcGh5c2ljYWwgZGV2aWNlIHJldHJpZXZlZCwgdGhlbiByZXR1cm4gaXQgYWNjb3JkaW5nbHlcbiAgICAgICAgaWYgKHJlc3VsdCAmJiByZXN1bHQubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAvLyBjb252ZXJ0IHRoZSBEeW5hbW8gREIgZGF0YSBmcm9tIER5bmFtbyBEQiBKU09OIGZvcm1hdCB0byBhIE1vb25iZWFtIHB1c2ggZGV2aWNlIGRhdGEgZm9ybWF0XG4gICAgICAgICAgICBsZXQgcHVzaERldmljZURhdGE6IFB1c2hEZXZpY2VbXSA9IFtdO1xuICAgICAgICAgICAgcmVzdWx0LmZvckVhY2gocHVzaERldmljZVJlc3VsdCA9PiB7XG4gICAgICAgICAgICAgICAgLy8gb25seSByZXRyaWV2ZSB0aGUgcHVzaCBkZXZpY2UgdGhhdCdzIGluIGFuIEFDVElWRSBzdGF0ZSAoaWYgaXQgZXhpc3RzKSAtIHNob3VsZCBvbmx5IGJlIG9uZVxuICAgICAgICAgICAgICAgIGlmIChwdXNoRGV2aWNlUmVzdWx0LmRldmljZVN0YXRlLlMhIGFzIFVzZXJEZXZpY2VTdGF0ZSA9PT0gVXNlckRldmljZVN0YXRlLkFjdGl2ZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwdXNoRGV2aWNlOiBQdXNoRGV2aWNlID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHB1c2hEZXZpY2VSZXN1bHQuaWQuUyEsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b2tlbklkOiBwdXNoRGV2aWNlUmVzdWx0LnRva2VuSWQuUyEsXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXZpY2VTdGF0ZTogcHVzaERldmljZVJlc3VsdC5kZXZpY2VTdGF0ZS5TISBhcyBVc2VyRGV2aWNlU3RhdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0TG9naW5EYXRlOiBwdXNoRGV2aWNlUmVzdWx0Lmxhc3RMb2dpbkRhdGUuUyFcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgcHVzaERldmljZURhdGEucHVzaChwdXNoRGV2aWNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gb25seSByZXR1cm4gaWYgd2UgZm91bmQgYW4gYWN0aXZlIHBoeXNpY2FsIGRldmljZSAoaWdub3JlIHRoZSBpbmFjdGl2ZSBlbnRyaWVzKVxuICAgICAgICAgICAgaWYgKHB1c2hEZXZpY2VEYXRhLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgcGh5c2ljYWwgZGV2aWNlXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogcHVzaERldmljZURhdGFbMF1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBBY3RpdmUgUGh5c2ljYWwgRGV2aWNlIHdpdGggdG9rZW4gJHtnZXREZXZpY2VCeVRva2VuSW5wdXQudG9rZW5JZH0gbm90IGZvdW5kIWA7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFVzZXJEZXZpY2VFcnJvclR5cGUuTm9uZU9yQWJzZW50XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFBoeXNpY2FsIERldmljZSB3aXRoIHRva2VuICR7Z2V0RGV2aWNlQnlUb2tlbklucHV0LnRva2VuSWR9IG5vdCBmb3VuZCFgO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFVzZXJEZXZpY2VFcnJvclR5cGUuTm9uZU9yQWJzZW50XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nICR7ZmllbGROYW1lfSBxdWVyeSAke2Vycn1gO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICBlcnJvclR5cGU6IFVzZXJEZXZpY2VFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH07XG4gICAgfVxufVxuIl19