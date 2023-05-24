import {DynamoDBClient, GetItemCommand} from "@aws-sdk/client-dynamodb";
import {
    GetMilitaryVerificationInput,
    MilitaryVerificationErrorType, MilitaryVerificationResponse,
    MilitaryVerificationStatusType
} from "@moonbeam/moonbeam-models";

/**
 * GetMilitaryVerificationStatus resolver
 *
 * @param getMilitaryVerificationInput military verification input used for the verification status to be retrieved
 * @returns {@link Promise} of {@link GetMilitaryVerificationResponse}
 */
export const getMilitaryVerificationStatus = async (getMilitaryVerificationInput: GetMilitaryVerificationInput): Promise<MilitaryVerificationResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        // retrieve the military verification status given the verification input object
        const retrievedData =  await dynamoDbClient.send(new GetItemCommand({
            TableName: process.env.MILITARY_VERIFICATION_TABLE!,
            Key: {
                id: {
                    S: getMilitaryVerificationInput.id
                }
            }
        }));

        // if there is an item retrieved, then return its verification status
        if (retrievedData && retrievedData.Item) {
            // return the retrieved verification status
            return {
                data: {
                    militaryVerificationStatus: retrievedData.Item.militaryVerificationStatus.S! as MilitaryVerificationStatusType
                }
            }
        } else {
            const errorMessage = `Verification object not found for ${getMilitaryVerificationInput.id}`;
            console.log(errorMessage);

            return {
                errorMessage: errorMessage,
                errorType: MilitaryVerificationErrorType.NoneOrAbsent
            }
        }

    } catch (err) {
        const errorMessage = `Unexpected error while executing getMilitaryVerificationStatus query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: MilitaryVerificationErrorType.UnexpectedError
        };
    }
}
