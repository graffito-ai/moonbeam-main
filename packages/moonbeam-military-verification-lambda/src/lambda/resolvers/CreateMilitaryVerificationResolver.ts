import {DynamoDBClient, PutItemCommand} from "@aws-sdk/client-dynamodb";
import {
    CreateMilitaryVerificationInput, CreateMilitaryVerificationResponse,
    MilitaryVerificationErrorType,
    MilitaryVerificationInformation,
} from "@moonbeam/moonbeam-models";

/**
 * CreateMilitaryVerification resolver
 *
 * @param createMilitaryVerificationInput military verification object to be created
 * @returns {@link Promise} of {@link MilitaryVerificationResponse}
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
                    S: createMilitaryVerificationInput.militaryVerificationStatus
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
            data: createMilitaryVerificationInput as MilitaryVerificationInformation
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
