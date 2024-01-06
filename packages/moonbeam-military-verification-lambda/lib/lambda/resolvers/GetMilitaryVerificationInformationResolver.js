"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMilitaryVerificationInformation = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * GetMilitaryVerificationInformation resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getMilitaryVerificationInformationInput military verification information input used for the military verification
 * information to be retrieved
 *
 * @returns {@link Promise} of {@link MilitaryVerificationReportingInformationResponse}
 */
const getMilitaryVerificationInformation = async (fieldName, getMilitaryVerificationInformationInput) => {
    try {
        /**
         * first verify that the input has the right level of filtering, meaning:
         * - we have to at least have one filter in
         * - we can only have one of id OR dates passed in, not both
         * - if we have a date passed in, we got to have the other as well (start + end dates)
         */
        if ((getMilitaryVerificationInformationInput.id === undefined || getMilitaryVerificationInformationInput.id === null) &&
            ((getMilitaryVerificationInformationInput.startDate === undefined || getMilitaryVerificationInformationInput.startDate === null) ||
                (getMilitaryVerificationInformationInput.endDate === undefined || getMilitaryVerificationInformationInput.endDate === null))) {
            const errorMessage = `You must have at least one of: id OR (startDate,endDate) passed in as your filters!`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.MilitaryVerificationReportingErrorType.ValidationError
            };
        }
        else if ((getMilitaryVerificationInformationInput.id !== undefined && getMilitaryVerificationInformationInput.id !== null) &&
            ((getMilitaryVerificationInformationInput.startDate !== undefined && getMilitaryVerificationInformationInput.startDate !== null) ||
                (getMilitaryVerificationInformationInput.startDate !== undefined && getMilitaryVerificationInformationInput.startDate !== null))) {
            const errorMessage = `You can only have exactly one of: id OR (startDate, endDate) passed in as your filters!`;
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.MilitaryVerificationReportingErrorType.ValidationError
            };
        }
        else {
            // retrieving the current function region
            const region = process.env.AWS_REGION;
            // initializing the DynamoDB document client
            const dynamoDbClient = new client_dynamodb_1.DynamoDBClient({ region: region });
            // filter based on id
            if (getMilitaryVerificationInformationInput.id !== undefined && getMilitaryVerificationInformationInput.id !== null) {
                // retrieve the military verification information given the id of the user
                const retrievedData = await dynamoDbClient.send(new client_dynamodb_1.GetItemCommand({
                    TableName: process.env.MILITARY_VERIFICATION_TABLE,
                    Key: {
                        id: {
                            S: getMilitaryVerificationInformationInput.id
                        }
                    }
                }));
                // if there is an item found, then return its information
                if (retrievedData && retrievedData.Item) {
                    // return the retrieved military verification information object
                    return {
                        data: [
                            {
                                addressLine: retrievedData.Item.addressLine.S,
                                city: retrievedData.Item.city.S,
                                createdAt: retrievedData.Item.createdAt.S,
                                dateOfBirth: retrievedData.Item.dateOfBirth.S,
                                enlistmentYear: retrievedData.Item.enlistmentYear.S,
                                firstName: retrievedData.Item.firstName.S,
                                id: retrievedData.Item.id.S,
                                lastName: retrievedData.Item.lastName.S,
                                militaryAffiliation: retrievedData.Item.militaryAffiliation.S,
                                militaryBranch: retrievedData.Item.militaryBranch.S,
                                militaryDutyStatus: retrievedData.Item.militaryDutyStatus.S,
                                militaryVerificationStatus: retrievedData.Item.militaryVerificationStatus.S,
                                state: retrievedData.Item.state.S,
                                updatedAt: retrievedData.Item.updatedAt.S,
                                zipCode: retrievedData.Item.zipCode.S
                            }
                        ]
                    };
                }
                else {
                    const errorMessage = `Verification object not found for ${getMilitaryVerificationInformationInput.id}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: moonbeam_models_1.MilitaryVerificationReportingErrorType.NoneOrAbsent
                    };
                }
            }
            else {
                // we will execute separate queries for each one of our possible statuses: VERIFIED, PENDING, REJECTED
                const statuses = [moonbeam_models_1.MilitaryVerificationStatusType.Verified, moonbeam_models_1.MilitaryVerificationStatusType.Pending, moonbeam_models_1.MilitaryVerificationStatusType.Rejected];
                const resultingRecords = [];
                for (const status of statuses) {
                    /**
                     * the data to be retrieved from the Query Command
                     * the eligible user Items returned from the Query Command, all aggregated together
                     * the last evaluated key, to help with the pagination of results
                     */
                    let result = [];
                    let exclusiveStartKey, retrievedFilteredData;
                    /**
                     * NOTE: the limit for the Query command below, is about 2,150 records per run, which means that we can
                     * only retrieve upt ot that amount of records in a run, for a particular status.
                     *
                     * Example:
                     * Assume we execute 6 runs a day (every 4 hours), that means that we can only process up to:
                     * 2,150 * 6 = 12,900 verification records in a day, for each status,
                     * (12,900 for PENDING, 12,900 for VERIFIED, 12,900 for REJECTED)
                     *
                     * If we want to increase this limit, we will need to increase the number of runs that will trigger
                     * this resolver daily.
                     */
                    do {
                        /**
                         * retrieve all the military verification information records, given the date filters through a
                         * global secondary index
                         *
                         * Limit of 1 MB per paginated response data (in our case 2,150 items). An average size for an Item is about 361 bytes, which means that we won't
                         * need to do pagination here, since we actually retrieve all verification information records in a looped format, and we account for paginated
                         * responses.
                         *
                         * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.Pagination.html}
                         * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html}
                         */
                        retrievedFilteredData = await dynamoDbClient.send(new client_dynamodb_1.QueryCommand({
                            TableName: process.env.MILITARY_VERIFICATION_TABLE,
                            IndexName: `${process.env.MILITARY_VERIFICATION_STATUS_GLOBAL_INDEX}-${process.env.ENV_NAME}-${region}`,
                            ...(exclusiveStartKey && { ExclusiveStartKey: exclusiveStartKey }),
                            Limit: 2150,
                            ExpressionAttributeNames: {
                                '#mvSt': 'militaryVerificationStatus',
                                '#cat': 'createdAt'
                            },
                            ExpressionAttributeValues: {
                                ":mvSt": {
                                    S: status
                                },
                                ":cat": {
                                    S: getMilitaryVerificationInformationInput.startDate
                                },
                                ':end': {
                                    S: getMilitaryVerificationInformationInput.endDate
                                }
                            },
                            KeyConditionExpression: '#mvSt = :mvSt AND #cat BETWEEN :cat AND :end'
                        }));
                        exclusiveStartKey = retrievedFilteredData.LastEvaluatedKey;
                        result = result.concat(retrievedFilteredData.Items);
                    } while (retrievedFilteredData && retrievedFilteredData.Count && retrievedFilteredData.Items &&
                        retrievedFilteredData.Items.length && retrievedFilteredData.Count !== 0 &&
                        retrievedFilteredData.Items.length !== 0 && retrievedFilteredData.LastEvaluatedKey);
                    // if there are eligible military verification records retrieved, then add them to the resulting records array
                    if (result && result.length !== 0) {
                        // convert the Dynamo DB data from Dynamo DB JSON format to a Moonbeam verification reporting information object
                        const reportingInformationRecords = [];
                        result.forEach(moonbeamVerificationInformationResult => {
                            const moonbeamVerificationInformationRecord = {
                                addressLine: moonbeamVerificationInformationResult.addressLine.S,
                                city: moonbeamVerificationInformationResult.city.S,
                                createdAt: moonbeamVerificationInformationResult.createdAt.S,
                                dateOfBirth: moonbeamVerificationInformationResult.dateOfBirth.S,
                                enlistmentYear: moonbeamVerificationInformationResult.enlistmentYear.S,
                                firstName: moonbeamVerificationInformationResult.firstName.S,
                                id: moonbeamVerificationInformationResult.id.S,
                                lastName: moonbeamVerificationInformationResult.lastName.S,
                                militaryAffiliation: moonbeamVerificationInformationResult.militaryAffiliation.S,
                                militaryBranch: moonbeamVerificationInformationResult.militaryBranch.S,
                                militaryDutyStatus: moonbeamVerificationInformationResult.militaryDutyStatus.S,
                                militaryVerificationStatus: moonbeamVerificationInformationResult.militaryVerificationStatus.S,
                                state: moonbeamVerificationInformationResult.state.S,
                                updatedAt: moonbeamVerificationInformationResult.updatedAt.S,
                                zipCode: moonbeamVerificationInformationResult.zipCode.S
                            };
                            reportingInformationRecords.push(moonbeamVerificationInformationRecord);
                        });
                        // add these queries military verification information records by type, to the overall results
                        resultingRecords.concat(reportingInformationRecords);
                    }
                    else {
                        const errorMessage = `Military verification information records with status ${status} not found!`;
                        console.log(errorMessage);
                    }
                }
                // return all resulting records for all statuses queried
                return {
                    data: resultingRecords
                };
            }
        }
    }
    catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.MilitaryVerificationReportingErrorType.UnexpectedError
        };
    }
};
exports.getMilitaryVerificationInformation = getMilitaryVerificationInformation;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvblJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvR2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvblJlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDhEQUFzRztBQUN0RywrREFTbUM7QUFFbkM7Ozs7Ozs7O0dBUUc7QUFDSSxNQUFNLGtDQUFrQyxHQUFHLEtBQUssRUFBRSxTQUFpQixFQUFFLHVDQUFnRixFQUE2RCxFQUFFO0lBQ3ZOLElBQUk7UUFDQTs7Ozs7V0FLRztRQUNILElBQUksQ0FBQyx1Q0FBdUMsQ0FBQyxFQUFFLEtBQUssU0FBUyxJQUFJLHVDQUF1QyxDQUFDLEVBQUUsS0FBSyxJQUFJLENBQUM7WUFDakgsQ0FDSSxDQUFDLHVDQUF1QyxDQUFDLFNBQVMsS0FBSyxTQUFTLElBQUksdUNBQXVDLENBQUMsU0FBUyxLQUFLLElBQUksQ0FBQztnQkFDL0gsQ0FBQyx1Q0FBdUMsQ0FBQyxPQUFPLEtBQUssU0FBUyxJQUFJLHVDQUF1QyxDQUFDLE9BQU8sS0FBSyxJQUFJLENBQUMsQ0FDOUgsRUFDSDtZQUNFLE1BQU0sWUFBWSxHQUFHLHFGQUFxRixDQUFDO1lBQzNHLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFMUIsT0FBTztnQkFDSCxZQUFZLEVBQUUsWUFBWTtnQkFDMUIsU0FBUyxFQUFFLHdEQUFzQyxDQUFDLGVBQWU7YUFDcEUsQ0FBQTtTQUNKO2FBQU0sSUFDSCxDQUFDLHVDQUF1QyxDQUFDLEVBQUUsS0FBSyxTQUFTLElBQUksdUNBQXVDLENBQUMsRUFBRSxLQUFLLElBQUksQ0FBQztZQUNqSCxDQUNJLENBQUMsdUNBQXVDLENBQUMsU0FBUyxLQUFLLFNBQVMsSUFBSSx1Q0FBdUMsQ0FBQyxTQUFTLEtBQUssSUFBSSxDQUFDO2dCQUMvSCxDQUFD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QUMsY0FBYyxDQUFDLENBQW9CO2dDQUN6RixrQkFBa0IsRUFBRSxxQ0FBcUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUF3QjtnQ0FDckcsMEJBQTBCLEVBQUUscUNBQXFDLENBQUMsMEJBQTBCLENBQUMsQ0FBb0M7Z0NBQ2pJLEtBQUssRUFBRSxxQ0FBcUMsQ0FBQyxLQUFLLENBQUMsQ0FBRTtnQ0FDckQsU0FBUyxFQUFFLHFDQUFxQyxDQUFDLFNBQVMsQ0FBQyxDQUFFO2dDQUM3RCxPQUFPLEVBQUUscUNBQXFDLENBQUMsT0FBTyxDQUFDLENBQUU7NkJBQzVELENBQUM7NEJBQ0YsMkJBQTJCLENBQUMsSUFBSSxDQUFDLHFDQUFxQyxDQUFDLENBQUM7d0JBQzVFLENBQUMsQ0FBQyxDQUFDO3dCQUNILDhGQUE4Rjt3QkFDOUYsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLDJCQUEyQixDQUFDLENBQUM7cUJBQ3hEO3lCQUFNO3dCQUNILE1BQU0sWUFBWSxHQUFHLHlEQUF5RCxNQUFNLGFBQWEsQ0FBQzt3QkFDbEcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztxQkFDN0I7aUJBQ0o7Z0JBQ0Qsd0RBQXdEO2dCQUN4RCxPQUFPO29CQUNILElBQUksRUFBRSxnQkFBZ0I7aUJBQ3pCLENBQUE7YUFDSjtTQUNKO0tBQ0o7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLE1BQU0sWUFBWSxHQUFHLG9DQUFvQyxTQUFTLFVBQVUsR0FBRyxFQUFFLENBQUM7UUFDbEYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMxQixPQUFPO1lBQ0gsWUFBWSxFQUFFLFlBQVk7WUFDMUIsU0FBUyxFQUFFLHdEQUFzQyxDQUFDLGVBQWU7U0FDcEUsQ0FBQztLQUNMO0FBQ0wsQ0FBQyxDQUFBO0FBcE1ZLFFBQUEsa0NBQWtDLHNDQW9NOUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0F0dHJpYnV0ZVZhbHVlLCBEeW5hbW9EQkNsaWVudCwgR2V0SXRlbUNvbW1hbmQsIFF1ZXJ5Q29tbWFuZH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1keW5hbW9kYlwiO1xuaW1wb3J0IHtcbiAgICBHZXRNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uSW5wdXQsXG4gICAgTWlsaXRhcnlBZmZpbGlhdGlvbixcbiAgICBNaWxpdGFyeUJyYW5jaCxcbiAgICBNaWxpdGFyeUR1dHlTdGF0dXMsXG4gICAgTWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRpbmdFcnJvclR5cGUsXG4gICAgTWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRpbmdJbmZvcm1hdGlvbixcbiAgICBNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydGluZ0luZm9ybWF0aW9uUmVzcG9uc2UsXG4gICAgTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlXG59IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5cbi8qKlxuICogR2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbiByZXNvbHZlclxuICpcbiAqIEBwYXJhbSBmaWVsZE5hbWUgbmFtZSBvZiB0aGUgcmVzb2x2ZXIgcGF0aCBmcm9tIHRoZSBBcHBTeW5jIGV2ZW50XG4gKiBAcGFyYW0gZ2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbklucHV0IG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiBpbmZvcm1hdGlvbiBpbnB1dCB1c2VkIGZvciB0aGUgbWlsaXRhcnkgdmVyaWZpY2F0aW9uXG4gKiBpbmZvcm1hdGlvbiB0byBiZSByZXRyaWV2ZWRcbiAqXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0aW5nSW5mb3JtYXRpb25SZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb24gPSBhc3luYyAoZmllbGROYW1lOiBzdHJpbmcsIGdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb25JbnB1dDogR2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbklucHV0KTogUHJvbWlzZTxNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydGluZ0luZm9ybWF0aW9uUmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvKipcbiAgICAgICAgICogZmlyc3QgdmVyaWZ5IHRoYXQgdGhlIGlucHV0IGhhcyB0aGUgcmlnaHQgbGV2ZWwgb2YgZmlsdGVyaW5nLCBtZWFuaW5nOlxuICAgICAgICAgKiAtIHdlIGhhdmUgdG8gYXQgbGVhc3QgaGF2ZSBvbmUgZmlsdGVyIGluXG4gICAgICAgICAqIC0gd2UgY2FuIG9ubHkgaGF2ZSBvbmUgb2YgaWQgT1IgZGF0ZXMgcGFzc2VkIGluLCBub3QgYm90aFxuICAgICAgICAgKiAtIGlmIHdlIGhhdmUgYSBkYXRlIHBhc3NlZCBpbiwgd2UgZ290IHRvIGhhdmUgdGhlIG90aGVyIGFzIHdlbGwgKHN0YXJ0ICsgZW5kIGRhdGVzKVxuICAgICAgICAgKi9cbiAgICAgICAgaWYgKChnZXRNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uSW5wdXQuaWQgPT09IHVuZGVmaW5lZCB8fCBnZXRNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uSW5wdXQuaWQgPT09IG51bGwpICYmXG4gICAgICAgICAgICAoXG4gICAgICAgICAgICAgICAgKGdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb25JbnB1dC5zdGFydERhdGUgPT09IHVuZGVmaW5lZCB8fCBnZXRNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uSW5wdXQuc3RhcnREYXRlID09PSBudWxsKSB8fFxuICAgICAgICAgICAgICAgIChnZXRNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uSW5wdXQuZW5kRGF0ZSA9PT0gdW5kZWZpbmVkIHx8IGdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb25JbnB1dC5lbmREYXRlID09PSBudWxsKVxuICAgICAgICAgICAgKVxuICAgICAgICApIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBZb3UgbXVzdCBoYXZlIGF0IGxlYXN0IG9uZSBvZjogaWQgT1IgKHN0YXJ0RGF0ZSxlbmREYXRlKSBwYXNzZWQgaW4gYXMgeW91ciBmaWx0ZXJzIWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRpbmdFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICAoZ2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbklucHV0LmlkICE9PSB1bmRlZmluZWQgJiYgZ2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbklucHV0LmlkICE9PSBudWxsKSAmJlxuICAgICAgICAgICAgKFxuICAgICAgICAgICAgICAgIChnZXRNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uSW5wdXQuc3RhcnREYXRlICE9PSB1bmRlZmluZWQgJiYgZ2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbklucHV0LnN0YXJ0RGF0ZSAhPT0gbnVsbCkgfHxcbiAgICAgICAgICAgICAgICAoZ2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbklucHV0LnN0YXJ0RGF0ZSAhPT0gdW5kZWZpbmVkICYmIGdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb25JbnB1dC5zdGFydERhdGUgIT09IG51bGwpXG4gICAgICAgICAgICApXG4gICAgICAgICkge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFlvdSBjYW4gb25seSBoYXZlIGV4YWN0bHkgb25lIG9mOiBpZCBPUiAoc3RhcnREYXRlLCBlbmREYXRlKSBwYXNzZWQgaW4gYXMgeW91ciBmaWx0ZXJzIWA7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydGluZ0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAgICAgLy8gaW5pdGlhbGl6aW5nIHRoZSBEeW5hbW9EQiBkb2N1bWVudCBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IGR5bmFtb0RiQ2xpZW50ID0gbmV3IER5bmFtb0RCQ2xpZW50KHtyZWdpb246IHJlZ2lvbn0pO1xuXG4gICAgICAgICAgICAvLyBmaWx0ZXIgYmFzZWQgb24gaWRcbiAgICAgICAgICAgIGlmIChnZXRNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uSW5wdXQuaWQgIT09IHVuZGVmaW5lZCAmJiBnZXRNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uSW5wdXQuaWQgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgbWlsaXRhcnkgdmVyaWZpY2F0aW9uIGluZm9ybWF0aW9uIGdpdmVuIHRoZSBpZCBvZiB0aGUgdXNlclxuICAgICAgICAgICAgICAgIGNvbnN0IHJldHJpZXZlZERhdGEgPSBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBHZXRJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuTUlMSVRBUllfVkVSSUZJQ0FUSU9OX1RBQkxFISxcbiAgICAgICAgICAgICAgICAgICAgS2V5OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb25JbnB1dC5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIC8vIGlmIHRoZXJlIGlzIGFuIGl0ZW0gZm91bmQsIHRoZW4gcmV0dXJuIGl0cyBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICAgIGlmIChyZXRyaWV2ZWREYXRhICYmIHJldHJpZXZlZERhdGEuSXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIHJldHJpZXZlZCBtaWxpdGFyeSB2ZXJpZmljYXRpb24gaW5mb3JtYXRpb24gb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRyZXNzTGluZTogcmV0cmlldmVkRGF0YS5JdGVtLmFkZHJlc3NMaW5lLlMhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaXR5OiByZXRyaWV2ZWREYXRhLkl0ZW0uY2l0eS5TISxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0OiByZXRyaWV2ZWREYXRhLkl0ZW0uY3JlYXRlZEF0LlMhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRlT2ZCaXJ0aDogcmV0cmlldmVkRGF0YS5JdGVtLmRhdGVPZkJpcnRoLlMhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmxpc3RtZW50WWVhcjogcmV0cmlldmVkRGF0YS5JdGVtLmVubGlzdG1lbnRZZWFyLlMhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXJzdE5hbWU6IHJldHJpZXZlZERhdGEuSXRlbS5maXJzdE5hbWUuUyEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiByZXRyaWV2ZWREYXRhLkl0ZW0uaWQuUyEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3ROYW1lOiByZXRyaWV2ZWREYXRhLkl0ZW0ubGFzdE5hbWUuUyEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pbGl0YXJ5QWZmaWxpYXRpb246IHJldHJpZXZlZERhdGEuSXRlbS5taWxpdGFyeUFmZmlsaWF0aW9uLlMhIGFzIE1pbGl0YXJ5QWZmaWxpYXRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pbGl0YXJ5QnJhbmNoOiByZXRyaWV2ZWREYXRhLkl0ZW0ubWlsaXRhcnlCcmFuY2guUyEgYXMgTWlsaXRhcnlCcmFuY2gsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pbGl0YXJ5RHV0eVN0YXR1czogcmV0cmlldmVkRGF0YS5JdGVtLm1pbGl0YXJ5RHV0eVN0YXR1cy5TISBhcyBNaWxpdGFyeUR1dHlTdGF0dXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzOiByZXRyaWV2ZWREYXRhLkl0ZW0ubWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXMuUyEgYXMgTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZTogcmV0cmlldmVkRGF0YS5JdGVtLnN0YXRlLlMhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQXQ6IHJldHJpZXZlZERhdGEuSXRlbS51cGRhdGVkQXQuUyEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHppcENvZGU6IHJldHJpZXZlZERhdGEuSXRlbS56aXBDb2RlLlMhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFZlcmlmaWNhdGlvbiBvYmplY3Qgbm90IGZvdW5kIGZvciAke2dldE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb25JbnB1dC5pZH1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRpbmdFcnJvclR5cGUuTm9uZU9yQWJzZW50XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIHdlIHdpbGwgZXhlY3V0ZSBzZXBhcmF0ZSBxdWVyaWVzIGZvciBlYWNoIG9uZSBvZiBvdXIgcG9zc2libGUgc3RhdHVzZXM6IFZFUklGSUVELCBQRU5ESU5HLCBSRUpFQ1RFRFxuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXR1c2VzID0gW01pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZS5WZXJpZmllZCwgTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlLlBlbmRpbmcsIE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZS5SZWplY3RlZF07XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0aW5nUmVjb3JkczogTWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRpbmdJbmZvcm1hdGlvbltdID0gW107XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBzdGF0dXMgb2Ygc3RhdHVzZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIHRoZSBkYXRhIHRvIGJlIHJldHJpZXZlZCBmcm9tIHRoZSBRdWVyeSBDb21tYW5kXG4gICAgICAgICAgICAgICAgICAgICAqIHRoZSBlbGlnaWJsZSB1c2VyIEl0ZW1zIHJldHVybmVkIGZyb20gdGhlIFF1ZXJ5IENvbW1hbmQsIGFsbCBhZ2dyZWdhdGVkIHRvZ2V0aGVyXG4gICAgICAgICAgICAgICAgICAgICAqIHRoZSBsYXN0IGV2YWx1YXRlZCBrZXksIHRvIGhlbHAgd2l0aCB0aGUgcGFnaW5hdGlvbiBvZiByZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBsZXQgcmVzdWx0OiBSZWNvcmQ8c3RyaW5nLCBBdHRyaWJ1dGVWYWx1ZT5bXSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBsZXQgZXhjbHVzaXZlU3RhcnRLZXksIHJldHJpZXZlZEZpbHRlcmVkRGF0YTtcblxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogTk9URTogdGhlIGxpbWl0IGZvciB0aGUgUXVlcnkgY29tbWFuZCBiZWxvdywgaXMgYWJvdXQgMiwxNTAgcmVjb3JkcyBwZXIgcnVuLCB3aGljaCBtZWFucyB0aGF0IHdlIGNhblxuICAgICAgICAgICAgICAgICAgICAgKiBvbmx5IHJldHJpZXZlIHVwdCBvdCB0aGF0IGFtb3VudCBvZiByZWNvcmRzIGluIGEgcnVuLCBmb3IgYSBwYXJ0aWN1bGFyIHN0YXR1cy5cbiAgICAgICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAgICAgICogRXhhbXBsZTpcbiAgICAgICAgICAgICAgICAgICAgICogQXNzdW1lIHdlIGV4ZWN1dGUgNiBydW5zIGEgZGF5IChldmVyeSA0IGhvdXJzKSwgdGhhdCBtZWFucyB0aGF0IHdlIGNhbiBvbmx5IHByb2Nlc3MgdXAgdG86XG4gICAgICAgICAgICAgICAgICAgICAqIDIsMTUwICogNiA9IDEyLDkwMCB2ZXJpZmljYXRpb24gcmVjb3JkcyBpbiBhIGRheSwgZm9yIGVhY2ggc3RhdHVzLFxuICAgICAgICAgICAgICAgICAgICAgKiAoMTIsOTAwIGZvciBQRU5ESU5HLCAxMiw5MDAgZm9yIFZFUklGSUVELCAxMiw5MDAgZm9yIFJFSkVDVEVEKVxuICAgICAgICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICAgICAgKiBJZiB3ZSB3YW50IHRvIGluY3JlYXNlIHRoaXMgbGltaXQsIHdlIHdpbGwgbmVlZCB0byBpbmNyZWFzZSB0aGUgbnVtYmVyIG9mIHJ1bnMgdGhhdCB3aWxsIHRyaWdnZXJcbiAgICAgICAgICAgICAgICAgICAgICogdGhpcyByZXNvbHZlciBkYWlseS5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogcmV0cmlldmUgYWxsIHRoZSBtaWxpdGFyeSB2ZXJpZmljYXRpb24gaW5mb3JtYXRpb24gcmVjb3JkcywgZ2l2ZW4gdGhlIGRhdGUgZmlsdGVycyB0aHJvdWdoIGFcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIGdsb2JhbCBzZWNvbmRhcnkgaW5kZXhcbiAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBMaW1pdCBvZiAxIE1CIHBlciBwYWdpbmF0ZWQgcmVzcG9uc2UgZGF0YSAoaW4gb3VyIGNhc2UgMiwxNTAgaXRlbXMpLiBBbiBhdmVyYWdlIHNpemUgZm9yIGFuIEl0ZW0gaXMgYWJvdXQgMzYxIGJ5dGVzLCB3aGljaCBtZWFucyB0aGF0IHdlIHdvbid0XG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBuZWVkIHRvIGRvIHBhZ2luYXRpb24gaGVyZSwgc2luY2Ugd2UgYWN0dWFsbHkgcmV0cmlldmUgYWxsIHZlcmlmaWNhdGlvbiBpbmZvcm1hdGlvbiByZWNvcmRzIGluIGEgbG9vcGVkIGZvcm1hdCwgYW5kIHdlIGFjY291bnQgZm9yIHBhZ2luYXRlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICogcmVzcG9uc2VzLlxuICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEBsaW5rIHtodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL1F1ZXJ5LlBhZ2luYXRpb24uaHRtbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEBsaW5rIHtodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL1F1ZXJ5Lmh0bWx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHJpZXZlZEZpbHRlcmVkRGF0YSA9IGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IFF1ZXJ5Q29tbWFuZCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5NSUxJVEFSWV9WRVJJRklDQVRJT05fVEFCTEUhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEluZGV4TmFtZTogYCR7cHJvY2Vzcy5lbnYuTUlMSVRBUllfVkVSSUZJQ0FUSU9OX1NUQVRVU19HTE9CQUxfSU5ERVghfS0ke3Byb2Nlc3MuZW52LkVOVl9OQU1FIX0tJHtyZWdpb259YCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi4oZXhjbHVzaXZlU3RhcnRLZXkgJiYge0V4Y2x1c2l2ZVN0YXJ0S2V5OiBleGNsdXNpdmVTdGFydEtleX0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIExpbWl0OiAyMTUwLCAvLyAyMTUwICogMzYxIGJ5dGVzID0gNzc2LDE1MCBieXRlcyA9IDAuNzc2IE1CIChsZWF2ZSBhIG1hcmdpbiBvZiBlcnJvciBoZXJlIHVwIHRvIDEgTUIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcjbXZTdCc6ICdtaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1cycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcjY2F0JzogJ2NyZWF0ZWRBdCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCI6bXZTdFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBzdGF0dXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCI6Y2F0XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb25JbnB1dC5zdGFydERhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJzplbmQnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBnZXRNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uSW5wdXQuZW5kRGF0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBLZXlDb25kaXRpb25FeHByZXNzaW9uOiAnI212U3QgPSA6bXZTdCBBTkQgI2NhdCBCRVRXRUVOIDpjYXQgQU5EIDplbmQnXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGV4Y2x1c2l2ZVN0YXJ0S2V5ID0gcmV0cmlldmVkRmlsdGVyZWREYXRhLkxhc3RFdmFsdWF0ZWRLZXk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KHJldHJpZXZlZEZpbHRlcmVkRGF0YS5JdGVtcyk7XG4gICAgICAgICAgICAgICAgICAgIH0gd2hpbGUgKHJldHJpZXZlZEZpbHRlcmVkRGF0YSAmJiByZXRyaWV2ZWRGaWx0ZXJlZERhdGEuQ291bnQgJiYgcmV0cmlldmVkRmlsdGVyZWREYXRhLkl0ZW1zICYmXG4gICAgICAgICAgICAgICAgICAgIHJldHJpZXZlZEZpbHRlcmVkRGF0YS5JdGVtcy5sZW5ndGggJiYgcmV0cmlldmVkRmlsdGVyZWREYXRhLkNvdW50ICE9PSAwICYmXG4gICAgICAgICAgICAgICAgICAgIHJldHJpZXZlZEZpbHRlcmVkRGF0YS5JdGVtcy5sZW5ndGggIT09IDAgJiYgcmV0cmlldmVkRmlsdGVyZWREYXRhLkxhc3RFdmFsdWF0ZWRLZXkpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIHRoZXJlIGFyZSBlbGlnaWJsZSBtaWxpdGFyeSB2ZXJpZmljYXRpb24gcmVjb3JkcyByZXRyaWV2ZWQsIHRoZW4gYWRkIHRoZW0gdG8gdGhlIHJlc3VsdGluZyByZWNvcmRzIGFycmF5XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0Lmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29udmVydCB0aGUgRHluYW1vIERCIGRhdGEgZnJvbSBEeW5hbW8gREIgSlNPTiBmb3JtYXQgdG8gYSBNb29uYmVhbSB2ZXJpZmljYXRpb24gcmVwb3J0aW5nIGluZm9ybWF0aW9uIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVwb3J0aW5nSW5mb3JtYXRpb25SZWNvcmRzOiBNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydGluZ0luZm9ybWF0aW9uW10gPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5mb3JFYWNoKG1vb25iZWFtVmVyaWZpY2F0aW9uSW5mb3JtYXRpb25SZXN1bHQgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1vb25iZWFtVmVyaWZpY2F0aW9uSW5mb3JtYXRpb25SZWNvcmQ6IE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0aW5nSW5mb3JtYXRpb24gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZHJlc3NMaW5lOiBtb29uYmVhbVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uUmVzdWx0LmFkZHJlc3NMaW5lLlMhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaXR5OiBtb29uYmVhbVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uUmVzdWx0LmNpdHkuUyEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDogbW9vbmJlYW1WZXJpZmljYXRpb25JbmZvcm1hdGlvblJlc3VsdC5jcmVhdGVkQXQuUyEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGVPZkJpcnRoOiBtb29uYmVhbVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uUmVzdWx0LmRhdGVPZkJpcnRoLlMhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmxpc3RtZW50WWVhcjogbW9vbmJlYW1WZXJpZmljYXRpb25JbmZvcm1hdGlvblJlc3VsdC5lbmxpc3RtZW50WWVhci5TISxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3ROYW1lOiBtb29uYmVhbVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uUmVzdWx0LmZpcnN0TmFtZS5TISxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IG1vb25iZWFtVmVyaWZpY2F0aW9uSW5mb3JtYXRpb25SZXN1bHQuaWQuUyEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3ROYW1lOiBtb29uYmVhbVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uUmVzdWx0Lmxhc3ROYW1lLlMhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaWxpdGFyeUFmZmlsaWF0aW9uOiBtb29uYmVhbVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uUmVzdWx0Lm1pbGl0YXJ5QWZmaWxpYXRpb24uUyEgYXMgTWlsaXRhcnlBZmZpbGlhdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWlsaXRhcnlCcmFuY2g6IG1vb25iZWFtVmVyaWZpY2F0aW9uSW5mb3JtYXRpb25SZXN1bHQubWlsaXRhcnlCcmFuY2guUyEgYXMgTWlsaXRhcnlCcmFuY2gsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pbGl0YXJ5RHV0eVN0YXR1czogbW9vbmJlYW1WZXJpZmljYXRpb25JbmZvcm1hdGlvblJlc3VsdC5taWxpdGFyeUR1dHlTdGF0dXMuUyEgYXMgTWlsaXRhcnlEdXR5U3RhdHVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1czogbW9vbmJlYW1WZXJpZmljYXRpb25JbmZvcm1hdGlvblJlc3VsdC5taWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1cy5TISBhcyBNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1R5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlOiBtb29uYmVhbVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uUmVzdWx0LnN0YXRlLlMhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQXQ6IG1vb25iZWFtVmVyaWZpY2F0aW9uSW5mb3JtYXRpb25SZXN1bHQudXBkYXRlZEF0LlMhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB6aXBDb2RlOiBtb29uYmVhbVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uUmVzdWx0LnppcENvZGUuUyFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcG9ydGluZ0luZm9ybWF0aW9uUmVjb3Jkcy5wdXNoKG1vb25iZWFtVmVyaWZpY2F0aW9uSW5mb3JtYXRpb25SZWNvcmQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBhZGQgdGhlc2UgcXVlcmllcyBtaWxpdGFyeSB2ZXJpZmljYXRpb24gaW5mb3JtYXRpb24gcmVjb3JkcyBieSB0eXBlLCB0byB0aGUgb3ZlcmFsbCByZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRpbmdSZWNvcmRzLmNvbmNhdChyZXBvcnRpbmdJbmZvcm1hdGlvblJlY29yZHMpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE1pbGl0YXJ5IHZlcmlmaWNhdGlvbiBpbmZvcm1hdGlvbiByZWNvcmRzIHdpdGggc3RhdHVzICR7c3RhdHVzfSBub3QgZm91bmQhYDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gcmV0dXJuIGFsbCByZXN1bHRpbmcgcmVjb3JkcyBmb3IgYWxsIHN0YXR1c2VzIHF1ZXJpZWRcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiByZXN1bHRpbmdSZWNvcmRzXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyAke2ZpZWxkTmFtZX0gcXVlcnkgJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydGluZ0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfTtcbiAgICB9XG59XG4iXX0=