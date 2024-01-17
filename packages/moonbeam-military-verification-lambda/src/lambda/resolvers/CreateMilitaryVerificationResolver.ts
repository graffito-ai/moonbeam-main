import {DynamoDBClient, PutItemCommand} from "@aws-sdk/client-dynamodb";
import {
    CreateMilitaryVerificationInput,
    CreateMilitaryVerificationResponse,
    MilitaryAffiliation,
    MilitaryBranch,
    MilitaryDutyStatus,
    MilitaryVerificationErrorType,
    MilitaryVerificationInformation,
    MilitaryVerificationStatusType,
} from "@moonbeam/moonbeam-models";
import {VAClient} from "../clients/VAClient";
import {QuandisClient} from "../clients/QuandisClient";

/**
 * CreateMilitaryVerification resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param createMilitaryVerificationInput military verification object to be created
 * @returns {@link Promise} of {@link CreateMilitaryVerificationResponse}
 */
export const createMilitaryVerification = async (fieldName: string, createMilitaryVerificationInput: CreateMilitaryVerificationInput): Promise<CreateMilitaryVerificationResponse> => {
    try {
        /**
         * verify that the appropriate type of input is being passed in:
         *
         * - for now, we only support a military affiliation of FAMILY_SPOUSE
         * or SERVICE_MEMBER.
         *
         * - for the FAMILY_SPOUSE military affiliation type we need to have
         * a personal identifier field passed in AND the military branch and
         * military duty status should be of type NOT_APPLICABLE
         *
         * - for the SERVICE_MEMBER military affiliation type we cannot have a
         * personal identifier field passed in AND we cannot have a military branch
         * and military duty status of type NOT_APPLICABLE
         */
        switch (createMilitaryVerificationInput.militaryAffiliation) {
            case MilitaryAffiliation.ServiceMember:
            case MilitaryAffiliation.FamilySpouse:
                if (createMilitaryVerificationInput.militaryAffiliation === MilitaryAffiliation.ServiceMember &&
                    (
                        // make sure there's a valid status for branch and status, with no personal identifier
                        (createMilitaryVerificationInput.personalIdentifier) ||
                        (createMilitaryVerificationInput.militaryBranch === MilitaryBranch.NotApplicable || createMilitaryVerificationInput.militaryDutyStatus === MilitaryDutyStatus.NotApplicable)
                    )
                ) {
                    const errorMessage = `Input not valid for ${createMilitaryVerificationInput.militaryAffiliation} military affiliation type!`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: MilitaryVerificationErrorType.ValidationError
                    }
                } else if (createMilitaryVerificationInput.militaryAffiliation === MilitaryAffiliation.FamilySpouse &&
                    (
                        // make sure there's a valid personal identifier passed in, and a valid branch and duty status
                        (!createMilitaryVerificationInput.personalIdentifier) ||
                        (createMilitaryVerificationInput.militaryBranch !== MilitaryBranch.NotApplicable || createMilitaryVerificationInput.militaryDutyStatus !== MilitaryDutyStatus.NotApplicable)
                    )
                ) {
                    const errorMessage = `Input not valid for ${createMilitaryVerificationInput.militaryAffiliation} military affiliation type!`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: MilitaryVerificationErrorType.ValidationError
                    }
                } else {
                    // retrieving the current function region
                    const region = process.env.AWS_REGION!;

                    // initializing the DynamoDB document client
                    const dynamoDbClient = new DynamoDBClient({region: region});

                    // update the timestamps accordingly
                    const createdAt = new Date().toISOString();
                    createMilitaryVerificationInput.createdAt = createMilitaryVerificationInput.createdAt ? createMilitaryVerificationInput.createdAt : createdAt;
                    createMilitaryVerificationInput.updatedAt = createMilitaryVerificationInput.updatedAt ? createMilitaryVerificationInput.updatedAt : createdAt;

                    /**
                     * call the verification Client APIs here, in order to get the appropriate initial verification status for the object.
                     *
                     * start with the Quandis API. If that status is not VERIFIED, then proceed with the VA Lighthouse API call, accordingly.
                     */
                    const quandisClient = new QuandisClient(createMilitaryVerificationInput as MilitaryVerificationInformation & { personalIdentifier: string | undefined }, process.env.ENV_NAME!, region);
                    const quandisVerificationStatus = createMilitaryVerificationInput.militaryAffiliation === MilitaryAffiliation.ServiceMember
                        ? await quandisClient.verifyServiceMember()
                        : await quandisClient.verifyMemberSpouse();
                    console.log(`Quandis status for ${createMilitaryVerificationInput.militaryAffiliation} - ${quandisVerificationStatus}`);

                    // only call the Lighthouse API, if the status above is not VERIFIED, otherwise there's no reason for another network call.
                    let lighthouseVerificationStatus: MilitaryVerificationStatusType = MilitaryVerificationStatusType.Pending;
                    if (quandisVerificationStatus !== MilitaryVerificationStatusType.Verified) {
                        const lighthouseClient = new VAClient(createMilitaryVerificationInput as MilitaryVerificationInformation & { personalIdentifier: string | undefined }, process.env.ENV_NAME!, region);
                        // for now, we call the same API whether you are a member or not. We need to check with Lighthouse to see if we need another API call for it or not.
                        lighthouseVerificationStatus = createMilitaryVerificationInput.militaryAffiliation === MilitaryAffiliation.ServiceMember
                            ? await lighthouseClient.verifyServiceMember()
                            : await lighthouseClient.verifyServiceMember();
                        console.log(`Lighthouse status for ${createMilitaryVerificationInput.militaryAffiliation} - ${lighthouseVerificationStatus}`);
                    }

                    // resolve the resulting status accordingly
                    let verificationStatus: MilitaryVerificationStatusType;
                    if (lighthouseVerificationStatus === MilitaryVerificationStatusType.Verified || quandisVerificationStatus === MilitaryVerificationStatusType.Verified) {
                        verificationStatus = MilitaryVerificationStatusType.Verified;
                    } else {
                        verificationStatus = MilitaryVerificationStatusType.Pending;
                    }

                    // store the military verification object
                    await dynamoDbClient.send(new PutItemCommand({
                        TableName: process.env.MILITARY_VERIFICATION_TABLE!,
                        Item: {
                            id: {
                                S: createMilitaryVerificationInput.id
                            },
                            firstName: {
                                S: createMilitaryVerificationInput.firstName
                            },
                            lastName: {
                                S: createMilitaryVerificationInput.lastName
                            },
                            dateOfBirth: {
                                S: createMilitaryVerificationInput.dateOfBirth
                            },
                            enlistmentYear: {
                                S: createMilitaryVerificationInput.enlistmentYear
                            },
                            addressLine: {
                                S: createMilitaryVerificationInput.addressLine
                            },
                            city: {
                                S: createMilitaryVerificationInput.city
                            },
                            state: {
                                S: createMilitaryVerificationInput.state
                            },
                            zipCode: {
                                S: createMilitaryVerificationInput.zipCode
                            },
                            militaryAffiliation: {
                                S: createMilitaryVerificationInput.militaryAffiliation
                            },
                            militaryBranch: {
                                S: createMilitaryVerificationInput.militaryBranch
                            },
                            militaryDutyStatus: {
                                S: createMilitaryVerificationInput.militaryDutyStatus
                            },
                            militaryVerificationStatus: {
                                S: verificationStatus
                            },
                            createdAt: {
                                S: createMilitaryVerificationInput.createdAt
                            },
                            updatedAt: {
                                S: createMilitaryVerificationInput.updatedAt
                            }
                        },
                    }));

                    // return the military verification object
                    return {
                        data: {
                            ...createMilitaryVerificationInput,
                            militaryVerificationStatus: verificationStatus
                        } as MilitaryVerificationInformation
                    }
                }
            default:
                const errorMessage = `Military affiliation type ${createMilitaryVerificationInput.militaryAffiliation} not supported`;
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: MilitaryVerificationErrorType.ValidationError
                }
        }
    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: MilitaryVerificationErrorType.UnexpectedError
        }
    }
}
