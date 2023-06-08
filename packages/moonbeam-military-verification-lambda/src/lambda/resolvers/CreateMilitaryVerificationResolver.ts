import {DynamoDBClient, PutItemCommand} from "@aws-sdk/client-dynamodb";
import {
    CreateMilitaryVerificationInput,
    CreateMilitaryVerificationResponse,
    MilitaryVerificationErrorType,
    MilitaryVerificationInformation,
    MilitaryVerificationStatusType,
} from "@moonbeam/moonbeam-models";
import {VAClient} from "../clients/VAClient";
import {QuandisClient} from "../clients/QuandisClient";

/**
 * CreateMilitaryVerification resolver
 *
 * @param createMilitaryVerificationInput military verification object to be created
 * @returns {@link Promise} of {@link CreateMilitaryVerificationResponse}
 */
export const createMilitaryVerification = async (createMilitaryVerificationInput: CreateMilitaryVerificationInput): Promise<CreateMilitaryVerificationResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        // update the timestamps accordingly
        const createdAt = new Date().toISOString();
        createMilitaryVerificationInput.createdAt = createMilitaryVerificationInput.createdAt ? createMilitaryVerificationInput.createdAt : createdAt;
        createMilitaryVerificationInput.updatedAt = createMilitaryVerificationInput.updatedAt ? createMilitaryVerificationInput.updatedAt : createdAt;

        // call the verification Client APIs here, in order to get the appropriate initial verification status for the object
        const lighthouseClient = new VAClient(createMilitaryVerificationInput as MilitaryVerificationInformation, process.env.ENV_NAME!, region);
        const lighthouseVerificationStatus = await lighthouseClient.verify();
        console.log(`Lighthouse status ${lighthouseVerificationStatus}`);

        const quandisClient = new QuandisClient(createMilitaryVerificationInput as MilitaryVerificationInformation, process.env.ENV_NAME!, region);
        const quandisVerificationStatus = await quandisClient.verify();
        console.log(`Quandis status ${quandisVerificationStatus}`);

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
    } catch (err) {
        const errorMessage = `Unexpected error while executing createMilitaryVerification mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: MilitaryVerificationErrorType.UnexpectedError
        }
    }
}
