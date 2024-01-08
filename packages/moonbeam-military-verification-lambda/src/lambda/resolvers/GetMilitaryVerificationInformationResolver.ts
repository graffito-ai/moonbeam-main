import {AttributeValue, DynamoDBClient, GetItemCommand, QueryCommand} from "@aws-sdk/client-dynamodb";
import {
    GetMilitaryVerificationInformationInput,
    MilitaryAffiliation,
    MilitaryBranch,
    MilitaryDutyStatus,
    MilitaryVerificationReportingErrorType,
    MilitaryVerificationReportingInformation,
    MilitaryVerificationReportingInformationResponse,
    MilitaryVerificationStatusType
} from "@moonbeam/moonbeam-models";

/**
 * GetMilitaryVerificationInformation resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getMilitaryVerificationInformationInput military verification information input used for the military verification
 * information to be retrieved
 *
 * @returns {@link Promise} of {@link MilitaryVerificationReportingInformationResponse}
 */
export const getMilitaryVerificationInformation = async (fieldName: string, getMilitaryVerificationInformationInput: GetMilitaryVerificationInformationInput): Promise<MilitaryVerificationReportingInformationResponse> => {
    try {
        /**
         * first verify that the input has the right level of filtering, meaning:
         * - we have to at least have one filter in
         * - we can only have one of id OR dates passed in, not both
         * - if we have a date passed in, we got to have the other as well (start + end dates)
         */
        if ((getMilitaryVerificationInformationInput.id === undefined || getMilitaryVerificationInformationInput.id === null) &&
            (
                (getMilitaryVerificationInformationInput.startDate === undefined || getMilitaryVerificationInformationInput.startDate === null) ||
                (getMilitaryVerificationInformationInput.endDate === undefined || getMilitaryVerificationInformationInput.endDate === null)
            )
        ) {
            const errorMessage = `You must have at least one of: id OR (startDate,endDate) passed in as your filters!`;
            console.log(errorMessage);

            return {
                errorMessage: errorMessage,
                errorType: MilitaryVerificationReportingErrorType.ValidationError
            }
        } else if (
            (getMilitaryVerificationInformationInput.id !== undefined && getMilitaryVerificationInformationInput.id !== null) &&
            (
                (getMilitaryVerificationInformationInput.startDate !== undefined && getMilitaryVerificationInformationInput.startDate !== null) ||
                (getMilitaryVerificationInformationInput.endDate !== undefined && getMilitaryVerificationInformationInput.endDate !== null)
            )
        ) {
            const errorMessage = `You can only have exactly one of: id OR (startDate, endDate) passed in as your filters!`;

            return {
                errorMessage: errorMessage,
                errorType: MilitaryVerificationReportingErrorType.ValidationError
            }
        } else {
            // retrieving the current function region
            const region = process.env.AWS_REGION!;

            // initializing the DynamoDB document client
            const dynamoDbClient = new DynamoDBClient({region: region});

            // filter based on id
            if (getMilitaryVerificationInformationInput.id !== undefined && getMilitaryVerificationInformationInput.id !== null) {
                // retrieve the military verification information given the id of the user
                const retrievedData = await dynamoDbClient.send(new GetItemCommand({
                    TableName: process.env.MILITARY_VERIFICATION_TABLE!,
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
                                addressLine: retrievedData.Item.addressLine.S!,
                                city: retrievedData.Item.city.S!,
                                createdAt: retrievedData.Item.createdAt.S!,
                                dateOfBirth: retrievedData.Item.dateOfBirth.S!,
                                enlistmentYear: retrievedData.Item.enlistmentYear.S!,
                                firstName: retrievedData.Item.firstName.S!,
                                id: retrievedData.Item.id.S!,
                                lastName: retrievedData.Item.lastName.S!,
                                militaryAffiliation: retrievedData.Item.militaryAffiliation.S! as MilitaryAffiliation,
                                militaryBranch: retrievedData.Item.militaryBranch.S! as MilitaryBranch,
                                militaryDutyStatus: retrievedData.Item.militaryDutyStatus.S! as MilitaryDutyStatus,
                                militaryVerificationStatus: retrievedData.Item.militaryVerificationStatus.S! as MilitaryVerificationStatusType,
                                state: retrievedData.Item.state.S!,
                                updatedAt: retrievedData.Item.updatedAt.S!,
                                zipCode: retrievedData.Item.zipCode.S!
                            }
                        ]
                    }
                } else {
                    const errorMessage = `Verification object not found for ${getMilitaryVerificationInformationInput.id}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: MilitaryVerificationReportingErrorType.NoneOrAbsent
                    }
                }
            } else {
                // we will execute separate queries for each one of our possible statuses: VERIFIED, PENDING, REJECTED
                const statuses = [MilitaryVerificationStatusType.Verified, MilitaryVerificationStatusType.Pending, MilitaryVerificationStatusType.Rejected];
                let resultingRecords: MilitaryVerificationReportingInformation[] = [];
                for (const status of statuses) {
                    /**
                     * the data to be retrieved from the Query Command
                     * the eligible user Items returned from the Query Command, all aggregated together
                     * the last evaluated key, to help with the pagination of results
                     */
                    let result: Record<string, AttributeValue>[] = [];
                    let exclusiveStartKey, retrievedFilteredData;

                    /**
                     * NOTE: the limit for the Query command below, is about 2,150 records per run, which means that we can
                     * only retrieve upt ot that amount of records in a run, for a particular status.
                     *
                     * Example:
                     * Assume we execute 8 runs a day (every 3 hours), that means that we can only process up to:
                     * 2,150 * 8 = 17,200 verification records in a day, for each status,
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
                        retrievedFilteredData = await dynamoDbClient.send(new QueryCommand({
                            TableName: process.env.MILITARY_VERIFICATION_TABLE!,
                            IndexName: `${process.env.MILITARY_VERIFICATION_STATUS_GLOBAL_INDEX!}-${process.env.ENV_NAME!}-${region}`,
                            ...(exclusiveStartKey && {ExclusiveStartKey: exclusiveStartKey}),
                            Limit: 2150, // 2150 * 361 bytes = 776,150 bytes = 0.776 MB (leave a margin of error here up to 1 MB)
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
                        const reportingInformationRecords: MilitaryVerificationReportingInformation[] = [];
                        result.forEach(moonbeamVerificationInformationResult => {
                            const moonbeamVerificationInformationRecord: MilitaryVerificationReportingInformation = {
                                addressLine: moonbeamVerificationInformationResult.addressLine.S!,
                                city: moonbeamVerificationInformationResult.city.S!,
                                createdAt: moonbeamVerificationInformationResult.createdAt.S!,
                                dateOfBirth: moonbeamVerificationInformationResult.dateOfBirth.S!,
                                enlistmentYear: moonbeamVerificationInformationResult.enlistmentYear.S!,
                                firstName: moonbeamVerificationInformationResult.firstName.S!,
                                id: moonbeamVerificationInformationResult.id.S!,
                                lastName: moonbeamVerificationInformationResult.lastName.S!,
                                militaryAffiliation: moonbeamVerificationInformationResult.militaryAffiliation.S! as MilitaryAffiliation,
                                militaryBranch: moonbeamVerificationInformationResult.militaryBranch.S! as MilitaryBranch,
                                militaryDutyStatus: moonbeamVerificationInformationResult.militaryDutyStatus.S! as MilitaryDutyStatus,
                                militaryVerificationStatus: moonbeamVerificationInformationResult.militaryVerificationStatus.S! as MilitaryVerificationStatusType,
                                state: moonbeamVerificationInformationResult.state.S!,
                                updatedAt: moonbeamVerificationInformationResult.updatedAt.S!,
                                zipCode: moonbeamVerificationInformationResult.zipCode.S!
                            };
                            reportingInformationRecords.push(moonbeamVerificationInformationRecord);
                        });
                        // add these queries military verification information records by type, to the overall results
                        resultingRecords = [...resultingRecords, ...reportingInformationRecords];
                    } else {
                        const errorMessage = `Military verification information records with status ${status} not found!`;
                        console.log(errorMessage);
                    }
                }
                // return all resulting records for all statuses queried
                return {
                    data: resultingRecords
                }
            }
        }
    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: MilitaryVerificationReportingErrorType.UnexpectedError
        };
    }
}
