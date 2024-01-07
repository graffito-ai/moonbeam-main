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
                (getMilitaryVerificationInformationInput.endDate !== undefined && getMilitaryVerificationInformationInput.endDate !== null))) {
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
                let resultingRecords = [];
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
                        resultingRecords = [...resultingRecords, ...reportingInformationRecords];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvblJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvR2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvblJlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDhEQUFzRztBQUN0RywrREFTbUM7QUFFbkM7Ozs7Ozs7O0dBUUc7QUFDSSxNQUFNLGtDQUFrQyxHQUFHLEtBQUssRUFBRSxTQUFpQixFQUFFLHVDQUFnRixFQUE2RCxFQUFFO0lBQ3ZOLElBQUk7UUFDQTs7Ozs7V0FLRztRQUNILElBQUksQ0FBQyx1Q0FBdUMsQ0FBQyxFQUFFLEtBQUssU0FBUyxJQUFJLHVDQUF1QyxDQUFDLEVBQUUsS0FBSyxJQUFJLENBQUM7WUFDakgsQ0FDSSxDQUFDLHVDQUF1QyxDQUFDLFNBQVMsS0FBSyxTQUFTLElBQUksdUNBQXVDLENBQUMsU0FBUyxLQUFLLElBQUksQ0FBQztnQkFDL0gsQ0FBQyx1Q0FBdUMsQ0FBQyxPQUFPLEtBQUssU0FBUyxJQUFJLHVDQUF1QyxDQUFDLE9BQU8sS0FBSyxJQUFJLENBQUMsQ0FDOUgsRUFDSDtZQUNFLE1BQU0sWUFBWSxHQUFHLHFGQUFxRixDQUFDO1lBQzNHLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFMUIsT0FBTztnQkFDSCxZQUFZLEVBQUUsWUFBWTtnQkFDMUIsU0FBUyxFQUFFLHdEQUFzQyxDQUFDLGVBQWU7YUFDcEUsQ0FBQTtTQUNKO2FBQU0sSUFDSCxDQUFDLHVDQUF1QyxDQUFDLEVBQUUsS0FBSyxTQUFTLElBQUksdUNBQXVDLENBQUMsRUFBRSxLQUFLLElBQUksQ0FBQztZQUNqSCxDQUNJLENBQUMsdUNBQXVDLENBQUMsU0FBUyxLQUFLLFNBQVMsSUFBSSx1Q0FBdUMsQ0FBQyxTQUFTLEtBQUssSUFBSSxDQUFDO2dCQUMvSCxDQUFD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QUMsY0FBYyxDQUFDLENBQW9CO2dDQUN6RixrQkFBa0IsRUFBRSxxQ0FBcUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUF3QjtnQ0FDckcsMEJBQTBCLEVBQUUscUNBQXFDLENBQUMsMEJBQTBCLENBQUMsQ0FBb0M7Z0NBQ2pJLEtBQUssRUFBRSxxQ0FBcUMsQ0FBQyxLQUFLLENBQUMsQ0FBRTtnQ0FDckQsU0FBUyxFQUFFLHFDQUFxQyxDQUFDLFNBQVMsQ0FBQyxDQUFFO2dDQUM3RCxPQUFPLEVBQUUscUNBQXFDLENBQUMsT0FBTyxDQUFDLENBQUU7NkJBQzVELENBQUM7NEJBQ0YsMkJBQTJCLENBQUMsSUFBSSxDQUFDLHFDQUFxQyxDQUFDLENBQUM7d0JBQzVFLENBQUMsQ0FBQyxDQUFDO3dCQUNILDhGQUE4Rjt3QkFDOUYsZ0JBQWdCLEdBQUcsQ0FBQyxHQUFHLGdCQUFnQixFQUFFLEdBQUcsMkJBQTJCLENBQUMsQ0FBQztxQkFDNUU7eUJBQU07d0JBQ0gsTUFBTSxZQUFZLEdBQUcseURBQXlELE1BQU0sYUFBYSxDQUFDO3dCQUNsRyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO3FCQUM3QjtpQkFDSjtnQkFDRCx3REFBd0Q7Z0JBQ3hELE9BQU87b0JBQ0gsSUFBSSxFQUFFLGdCQUFnQjtpQkFDekIsQ0FBQTthQUNKO1NBQ0o7S0FDSjtJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsTUFBTSxZQUFZLEdBQUcsb0NBQW9DLFNBQVMsVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNsRixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFCLE9BQU87WUFDSCxZQUFZLEVBQUUsWUFBWTtZQUMxQixTQUFTLEVBQUUsd0RBQXNDLENBQUMsZUFBZTtTQUNwRSxDQUFDO0tBQ0w7QUFDTCxDQUFDLENBQUE7QUFwTVksUUFBQSxrQ0FBa0Msc0NBb005QyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QXR0cmlidXRlVmFsdWUsIER5bmFtb0RCQ2xpZW50LCBHZXRJdGVtQ29tbWFuZCwgUXVlcnlDb21tYW5kfSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWR5bmFtb2RiXCI7XG5pbXBvcnQge1xuICAgIEdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb25JbnB1dCxcbiAgICBNaWxpdGFyeUFmZmlsaWF0aW9uLFxuICAgIE1pbGl0YXJ5QnJhbmNoLFxuICAgIE1pbGl0YXJ5RHV0eVN0YXR1cyxcbiAgICBNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydGluZ0Vycm9yVHlwZSxcbiAgICBNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydGluZ0luZm9ybWF0aW9uLFxuICAgIE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0aW5nSW5mb3JtYXRpb25SZXNwb25zZSxcbiAgICBNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1R5cGVcbn0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcblxuLyoqXG4gKiBHZXRNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uIHJlc29sdmVyXG4gKlxuICogQHBhcmFtIGZpZWxkTmFtZSBuYW1lIG9mIHRoZSByZXNvbHZlciBwYXRoIGZyb20gdGhlIEFwcFN5bmMgZXZlbnRcbiAqIEBwYXJhbSBnZXRNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uSW5wdXQgbWlsaXRhcnkgdmVyaWZpY2F0aW9uIGluZm9ybWF0aW9uIGlucHV0IHVzZWQgZm9yIHRoZSBtaWxpdGFyeSB2ZXJpZmljYXRpb25cbiAqIGluZm9ybWF0aW9uIHRvIGJlIHJldHJpZXZlZFxuICpcbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgTWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRpbmdJbmZvcm1hdGlvblJlc3BvbnNlfVxuICovXG5leHBvcnQgY29uc3QgZ2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbiA9IGFzeW5jIChmaWVsZE5hbWU6IHN0cmluZywgZ2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbklucHV0OiBHZXRNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uSW5wdXQpOiBQcm9taXNlPE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0aW5nSW5mb3JtYXRpb25SZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBmaXJzdCB2ZXJpZnkgdGhhdCB0aGUgaW5wdXQgaGFzIHRoZSByaWdodCBsZXZlbCBvZiBmaWx0ZXJpbmcsIG1lYW5pbmc6XG4gICAgICAgICAqIC0gd2UgaGF2ZSB0byBhdCBsZWFzdCBoYXZlIG9uZSBmaWx0ZXIgaW5cbiAgICAgICAgICogLSB3ZSBjYW4gb25seSBoYXZlIG9uZSBvZiBpZCBPUiBkYXRlcyBwYXNzZWQgaW4sIG5vdCBib3RoXG4gICAgICAgICAqIC0gaWYgd2UgaGF2ZSBhIGRhdGUgcGFzc2VkIGluLCB3ZSBnb3QgdG8gaGF2ZSB0aGUgb3RoZXIgYXMgd2VsbCAoc3RhcnQgKyBlbmQgZGF0ZXMpXG4gICAgICAgICAqL1xuICAgICAgICBpZiAoKGdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb25JbnB1dC5pZCA9PT0gdW5kZWZpbmVkIHx8IGdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb25JbnB1dC5pZCA9PT0gbnVsbCkgJiZcbiAgICAgICAgICAgIChcbiAgICAgICAgICAgICAgICAoZ2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbklucHV0LnN0YXJ0RGF0ZSA9PT0gdW5kZWZpbmVkIHx8IGdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb25JbnB1dC5zdGFydERhdGUgPT09IG51bGwpIHx8XG4gICAgICAgICAgICAgICAgKGdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb25JbnB1dC5lbmREYXRlID09PSB1bmRlZmluZWQgfHwgZ2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbklucHV0LmVuZERhdGUgPT09IG51bGwpXG4gICAgICAgICAgICApXG4gICAgICAgICkge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFlvdSBtdXN0IGhhdmUgYXQgbGVhc3Qgb25lIG9mOiBpZCBPUiAoc3RhcnREYXRlLGVuZERhdGUpIHBhc3NlZCBpbiBhcyB5b3VyIGZpbHRlcnMhYDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydGluZ0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgIChnZXRNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uSW5wdXQuaWQgIT09IHVuZGVmaW5lZCAmJiBnZXRNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uSW5wdXQuaWQgIT09IG51bGwpICYmXG4gICAgICAgICAgICAoXG4gICAgICAgICAgICAgICAgKGdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb25JbnB1dC5zdGFydERhdGUgIT09IHVuZGVmaW5lZCAmJiBnZXRNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uSW5wdXQuc3RhcnREYXRlICE9PSBudWxsKSB8fFxuICAgICAgICAgICAgICAgIChnZXRNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uSW5wdXQuZW5kRGF0ZSAhPT0gdW5kZWZpbmVkICYmIGdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb25JbnB1dC5lbmREYXRlICE9PSBudWxsKVxuICAgICAgICAgICAgKVxuICAgICAgICApIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBZb3UgY2FuIG9ubHkgaGF2ZSBleGFjdGx5IG9uZSBvZjogaWQgT1IgKHN0YXJ0RGF0ZSwgZW5kRGF0ZSkgcGFzc2VkIGluIGFzIHlvdXIgZmlsdGVycyFgO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRpbmdFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgICAgIC8vIGluaXRpYWxpemluZyB0aGUgRHluYW1vREIgZG9jdW1lbnQgY2xpZW50XG4gICAgICAgICAgICBjb25zdCBkeW5hbW9EYkNsaWVudCA9IG5ldyBEeW5hbW9EQkNsaWVudCh7cmVnaW9uOiByZWdpb259KTtcblxuICAgICAgICAgICAgLy8gZmlsdGVyIGJhc2VkIG9uIGlkXG4gICAgICAgICAgICBpZiAoZ2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbklucHV0LmlkICE9PSB1bmRlZmluZWQgJiYgZ2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbklucHV0LmlkICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiBpbmZvcm1hdGlvbiBnaXZlbiB0aGUgaWQgb2YgdGhlIHVzZXJcbiAgICAgICAgICAgICAgICBjb25zdCByZXRyaWV2ZWREYXRhID0gYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgR2V0SXRlbUNvbW1hbmQoe1xuICAgICAgICAgICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52Lk1JTElUQVJZX1ZFUklGSUNBVElPTl9UQUJMRSEsXG4gICAgICAgICAgICAgICAgICAgIEtleToge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBnZXRNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uSW5wdXQuaWRcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICAvLyBpZiB0aGVyZSBpcyBhbiBpdGVtIGZvdW5kLCB0aGVuIHJldHVybiBpdHMgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAgICBpZiAocmV0cmlldmVkRGF0YSAmJiByZXRyaWV2ZWREYXRhLkl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSByZXRyaWV2ZWQgbWlsaXRhcnkgdmVyaWZpY2F0aW9uIGluZm9ybWF0aW9uIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkcmVzc0xpbmU6IHJldHJpZXZlZERhdGEuSXRlbS5hZGRyZXNzTGluZS5TISxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2l0eTogcmV0cmlldmVkRGF0YS5JdGVtLmNpdHkuUyEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDogcmV0cmlldmVkRGF0YS5JdGVtLmNyZWF0ZWRBdC5TISxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0ZU9mQmlydGg6IHJldHJpZXZlZERhdGEuSXRlbS5kYXRlT2ZCaXJ0aC5TISxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5saXN0bWVudFllYXI6IHJldHJpZXZlZERhdGEuSXRlbS5lbmxpc3RtZW50WWVhci5TISxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3ROYW1lOiByZXRyaWV2ZWREYXRhLkl0ZW0uZmlyc3ROYW1lLlMhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogcmV0cmlldmVkRGF0YS5JdGVtLmlkLlMhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0TmFtZTogcmV0cmlldmVkRGF0YS5JdGVtLmxhc3ROYW1lLlMhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaWxpdGFyeUFmZmlsaWF0aW9uOiByZXRyaWV2ZWREYXRhLkl0ZW0ubWlsaXRhcnlBZmZpbGlhdGlvbi5TISBhcyBNaWxpdGFyeUFmZmlsaWF0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaWxpdGFyeUJyYW5jaDogcmV0cmlldmVkRGF0YS5JdGVtLm1pbGl0YXJ5QnJhbmNoLlMhIGFzIE1pbGl0YXJ5QnJhbmNoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaWxpdGFyeUR1dHlTdGF0dXM6IHJldHJpZXZlZERhdGEuSXRlbS5taWxpdGFyeUR1dHlTdGF0dXMuUyEgYXMgTWlsaXRhcnlEdXR5U3RhdHVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1czogcmV0cmlldmVkRGF0YS5JdGVtLm1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzLlMhIGFzIE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGU6IHJldHJpZXZlZERhdGEuSXRlbS5zdGF0ZS5TISxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEF0OiByZXRyaWV2ZWREYXRhLkl0ZW0udXBkYXRlZEF0LlMhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB6aXBDb2RlOiByZXRyaWV2ZWREYXRhLkl0ZW0uemlwQ29kZS5TIVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBWZXJpZmljYXRpb24gb2JqZWN0IG5vdCBmb3VuZCBmb3IgJHtnZXRNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uSW5wdXQuaWR9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0aW5nRXJyb3JUeXBlLk5vbmVPckFic2VudFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyB3ZSB3aWxsIGV4ZWN1dGUgc2VwYXJhdGUgcXVlcmllcyBmb3IgZWFjaCBvbmUgb2Ygb3VyIHBvc3NpYmxlIHN0YXR1c2VzOiBWRVJJRklFRCwgUEVORElORywgUkVKRUNURURcbiAgICAgICAgICAgICAgICBjb25zdCBzdGF0dXNlcyA9IFtNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1R5cGUuVmVyaWZpZWQsIE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZS5QZW5kaW5nLCBNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1R5cGUuUmVqZWN0ZWRdO1xuICAgICAgICAgICAgICAgIGxldCByZXN1bHRpbmdSZWNvcmRzOiBNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydGluZ0luZm9ybWF0aW9uW10gPSBbXTtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHN0YXR1cyBvZiBzdGF0dXNlcykge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogdGhlIGRhdGEgdG8gYmUgcmV0cmlldmVkIGZyb20gdGhlIFF1ZXJ5IENvbW1hbmRcbiAgICAgICAgICAgICAgICAgICAgICogdGhlIGVsaWdpYmxlIHVzZXIgSXRlbXMgcmV0dXJuZWQgZnJvbSB0aGUgUXVlcnkgQ29tbWFuZCwgYWxsIGFnZ3JlZ2F0ZWQgdG9nZXRoZXJcbiAgICAgICAgICAgICAgICAgICAgICogdGhlIGxhc3QgZXZhbHVhdGVkIGtleSwgdG8gaGVscCB3aXRoIHRoZSBwYWdpbmF0aW9uIG9mIHJlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGxldCByZXN1bHQ6IFJlY29yZDxzdHJpbmcsIEF0dHJpYnV0ZVZhbHVlPltdID0gW107XG4gICAgICAgICAgICAgICAgICAgIGxldCBleGNsdXNpdmVTdGFydEtleSwgcmV0cmlldmVkRmlsdGVyZWREYXRhO1xuXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBOT1RFOiB0aGUgbGltaXQgZm9yIHRoZSBRdWVyeSBjb21tYW5kIGJlbG93LCBpcyBhYm91dCAyLDE1MCByZWNvcmRzIHBlciBydW4sIHdoaWNoIG1lYW5zIHRoYXQgd2UgY2FuXG4gICAgICAgICAgICAgICAgICAgICAqIG9ubHkgcmV0cmlldmUgdXB0IG90IHRoYXQgYW1vdW50IG9mIHJlY29yZHMgaW4gYSBydW4sIGZvciBhIHBhcnRpY3VsYXIgc3RhdHVzLlxuICAgICAgICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICAgICAgKiBFeGFtcGxlOlxuICAgICAgICAgICAgICAgICAgICAgKiBBc3N1bWUgd2UgZXhlY3V0ZSA2IHJ1bnMgYSBkYXkgKGV2ZXJ5IDQgaG91cnMpLCB0aGF0IG1lYW5zIHRoYXQgd2UgY2FuIG9ubHkgcHJvY2VzcyB1cCB0bzpcbiAgICAgICAgICAgICAgICAgICAgICogMiwxNTAgKiA2ID0gMTIsOTAwIHZlcmlmaWNhdGlvbiByZWNvcmRzIGluIGEgZGF5LCBmb3IgZWFjaCBzdGF0dXMsXG4gICAgICAgICAgICAgICAgICAgICAqICgxMiw5MDAgZm9yIFBFTkRJTkcsIDEyLDkwMCBmb3IgVkVSSUZJRUQsIDEyLDkwMCBmb3IgUkVKRUNURUQpXG4gICAgICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgICAgICAqIElmIHdlIHdhbnQgdG8gaW5jcmVhc2UgdGhpcyBsaW1pdCwgd2Ugd2lsbCBuZWVkIHRvIGluY3JlYXNlIHRoZSBudW1iZXIgb2YgcnVucyB0aGF0IHdpbGwgdHJpZ2dlclxuICAgICAgICAgICAgICAgICAgICAgKiB0aGlzIHJlc29sdmVyIGRhaWx5LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiByZXRyaWV2ZSBhbGwgdGhlIG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiBpbmZvcm1hdGlvbiByZWNvcmRzLCBnaXZlbiB0aGUgZGF0ZSBmaWx0ZXJzIHRocm91Z2ggYVxuICAgICAgICAgICAgICAgICAgICAgICAgICogZ2xvYmFsIHNlY29uZGFyeSBpbmRleFxuICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIExpbWl0IG9mIDEgTUIgcGVyIHBhZ2luYXRlZCByZXNwb25zZSBkYXRhIChpbiBvdXIgY2FzZSAyLDE1MCBpdGVtcykuIEFuIGF2ZXJhZ2Ugc2l6ZSBmb3IgYW4gSXRlbSBpcyBhYm91dCAzNjEgYnl0ZXMsIHdoaWNoIG1lYW5zIHRoYXQgd2Ugd29uJ3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIG5lZWQgdG8gZG8gcGFnaW5hdGlvbiBoZXJlLCBzaW5jZSB3ZSBhY3R1YWxseSByZXRyaWV2ZSBhbGwgdmVyaWZpY2F0aW9uIGluZm9ybWF0aW9uIHJlY29yZHMgaW4gYSBsb29wZWQgZm9ybWF0LCBhbmQgd2UgYWNjb3VudCBmb3IgcGFnaW5hdGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiByZXNwb25zZXMuXG4gICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogQGxpbmsge2h0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9hbWF6b25keW5hbW9kYi9sYXRlc3QvZGV2ZWxvcGVyZ3VpZGUvUXVlcnkuUGFnaW5hdGlvbi5odG1sfVxuICAgICAgICAgICAgICAgICAgICAgICAgICogQGxpbmsge2h0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9hbWF6b25keW5hbW9kYi9sYXRlc3QvZGV2ZWxvcGVyZ3VpZGUvUXVlcnkuaHRtbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0cmlldmVkRmlsdGVyZWREYXRhID0gYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgUXVlcnlDb21tYW5kKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52Lk1JTElUQVJZX1ZFUklGSUNBVElPTl9UQUJMRSEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgSW5kZXhOYW1lOiBgJHtwcm9jZXNzLmVudi5NSUxJVEFSWV9WRVJJRklDQVRJT05fU1RBVFVTX0dMT0JBTF9JTkRFWCF9LSR7cHJvY2Vzcy5lbnYuRU5WX05BTUUhfS0ke3JlZ2lvbn1gLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLihleGNsdXNpdmVTdGFydEtleSAmJiB7RXhjbHVzaXZlU3RhcnRLZXk6IGV4Y2x1c2l2ZVN0YXJ0S2V5fSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTGltaXQ6IDIxNTAsIC8vIDIxNTAgKiAzNjEgYnl0ZXMgPSA3NzYsMTUwIGJ5dGVzID0gMC43NzYgTUIgKGxlYXZlIGEgbWFyZ2luIG9mIGVycm9yIGhlcmUgdXAgdG8gMSBNQilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlTmFtZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyNtdlN0JzogJ21pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyNjYXQnOiAnY3JlYXRlZEF0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjptdlN0XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IHN0YXR1c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjpjYXRcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogZ2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbklucHV0LnN0YXJ0RGF0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnOmVuZCc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb25JbnB1dC5lbmREYXRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEtleUNvbmRpdGlvbkV4cHJlc3Npb246ICcjbXZTdCA9IDptdlN0IEFORCAjY2F0IEJFVFdFRU4gOmNhdCBBTkQgOmVuZCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgZXhjbHVzaXZlU3RhcnRLZXkgPSByZXRyaWV2ZWRGaWx0ZXJlZERhdGEuTGFzdEV2YWx1YXRlZEtleTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQocmV0cmlldmVkRmlsdGVyZWREYXRhLkl0ZW1zKTtcbiAgICAgICAgICAgICAgICAgICAgfSB3aGlsZSAocmV0cmlldmVkRmlsdGVyZWREYXRhICYmIHJldHJpZXZlZEZpbHRlcmVkRGF0YS5Db3VudCAmJiByZXRyaWV2ZWRGaWx0ZXJlZERhdGEuSXRlbXMgJiZcbiAgICAgICAgICAgICAgICAgICAgcmV0cmlldmVkRmlsdGVyZWREYXRhLkl0ZW1zLmxlbmd0aCAmJiByZXRyaWV2ZWRGaWx0ZXJlZERhdGEuQ291bnQgIT09IDAgJiZcbiAgICAgICAgICAgICAgICAgICAgcmV0cmlldmVkRmlsdGVyZWREYXRhLkl0ZW1zLmxlbmd0aCAhPT0gMCAmJiByZXRyaWV2ZWRGaWx0ZXJlZERhdGEuTGFzdEV2YWx1YXRlZEtleSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgdGhlcmUgYXJlIGVsaWdpYmxlIG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiByZWNvcmRzIHJldHJpZXZlZCwgdGhlbiBhZGQgdGhlbSB0byB0aGUgcmVzdWx0aW5nIHJlY29yZHMgYXJyYXlcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdCAmJiByZXN1bHQubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjb252ZXJ0IHRoZSBEeW5hbW8gREIgZGF0YSBmcm9tIER5bmFtbyBEQiBKU09OIGZvcm1hdCB0byBhIE1vb25iZWFtIHZlcmlmaWNhdGlvbiByZXBvcnRpbmcgaW5mb3JtYXRpb24gb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZXBvcnRpbmdJbmZvcm1hdGlvblJlY29yZHM6IE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0aW5nSW5mb3JtYXRpb25bXSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LmZvckVhY2gobW9vbmJlYW1WZXJpZmljYXRpb25JbmZvcm1hdGlvblJlc3VsdCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbW9vbmJlYW1WZXJpZmljYXRpb25JbmZvcm1hdGlvblJlY29yZDogTWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRpbmdJbmZvcm1hdGlvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkcmVzc0xpbmU6IG1vb25iZWFtVmVyaWZpY2F0aW9uSW5mb3JtYXRpb25SZXN1bHQuYWRkcmVzc0xpbmUuUyEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNpdHk6IG1vb25iZWFtVmVyaWZpY2F0aW9uSW5mb3JtYXRpb25SZXN1bHQuY2l0eS5TISxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0OiBtb29uYmVhbVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uUmVzdWx0LmNyZWF0ZWRBdC5TISxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0ZU9mQmlydGg6IG1vb25iZWFtVmVyaWZpY2F0aW9uSW5mb3JtYXRpb25SZXN1bHQuZGF0ZU9mQmlydGguUyEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVubGlzdG1lbnRZZWFyOiBtb29uYmVhbVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uUmVzdWx0LmVubGlzdG1lbnRZZWFyLlMhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXJzdE5hbWU6IG1vb25iZWFtVmVyaWZpY2F0aW9uSW5mb3JtYXRpb25SZXN1bHQuZmlyc3ROYW1lLlMhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogbW9vbmJlYW1WZXJpZmljYXRpb25JbmZvcm1hdGlvblJlc3VsdC5pZC5TISxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdE5hbWU6IG1vb25iZWFtVmVyaWZpY2F0aW9uSW5mb3JtYXRpb25SZXN1bHQubGFzdE5hbWUuUyEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pbGl0YXJ5QWZmaWxpYXRpb246IG1vb25iZWFtVmVyaWZpY2F0aW9uSW5mb3JtYXRpb25SZXN1bHQubWlsaXRhcnlBZmZpbGlhdGlvbi5TISBhcyBNaWxpdGFyeUFmZmlsaWF0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaWxpdGFyeUJyYW5jaDogbW9vbmJlYW1WZXJpZmljYXRpb25JbmZvcm1hdGlvblJlc3VsdC5taWxpdGFyeUJyYW5jaC5TISBhcyBNaWxpdGFyeUJyYW5jaCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWlsaXRhcnlEdXR5U3RhdHVzOiBtb29uYmVhbVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uUmVzdWx0Lm1pbGl0YXJ5RHV0eVN0YXR1cy5TISBhcyBNaWxpdGFyeUR1dHlTdGF0dXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzOiBtb29uYmVhbVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uUmVzdWx0Lm1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzLlMhIGFzIE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGU6IG1vb25iZWFtVmVyaWZpY2F0aW9uSW5mb3JtYXRpb25SZXN1bHQuc3RhdGUuUyEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBdDogbW9vbmJlYW1WZXJpZmljYXRpb25JbmZvcm1hdGlvblJlc3VsdC51cGRhdGVkQXQuUyEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHppcENvZGU6IG1vb25iZWFtVmVyaWZpY2F0aW9uSW5mb3JtYXRpb25SZXN1bHQuemlwQ29kZS5TIVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwb3J0aW5nSW5mb3JtYXRpb25SZWNvcmRzLnB1c2gobW9vbmJlYW1WZXJpZmljYXRpb25JbmZvcm1hdGlvblJlY29yZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFkZCB0aGVzZSBxdWVyaWVzIG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiBpbmZvcm1hdGlvbiByZWNvcmRzIGJ5IHR5cGUsIHRvIHRoZSBvdmVyYWxsIHJlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdGluZ1JlY29yZHMgPSBbLi4ucmVzdWx0aW5nUmVjb3JkcywgLi4ucmVwb3J0aW5nSW5mb3JtYXRpb25SZWNvcmRzXTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBNaWxpdGFyeSB2ZXJpZmljYXRpb24gaW5mb3JtYXRpb24gcmVjb3JkcyB3aXRoIHN0YXR1cyAke3N0YXR1c30gbm90IGZvdW5kIWA7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIHJldHVybiBhbGwgcmVzdWx0aW5nIHJlY29yZHMgZm9yIGFsbCBzdGF0dXNlcyBxdWVyaWVkXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogcmVzdWx0aW5nUmVjb3Jkc1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgJHtmaWVsZE5hbWV9IHF1ZXJ5ICR7ZXJyfWA7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIGVycm9yVHlwZTogTWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRpbmdFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH07XG4gICAgfVxufVxuIl19