import {DynamoDBClient, UpdateItemCommand} from "@aws-sdk/client-dynamodb";
import {
    MilitaryVerificationErrorType,
    UpdateMilitaryVerificationInput,
    UpdateMilitaryVerificationResponse,
} from "@moonbeam/moonbeam-models";

/**
 * UpdateMilitaryVerificationStatus resolver
 *
 * @param updateMilitaryVerificationInput military verification input, used to update an existent one
 * @returns {@link Promise} of {@link UpdateMilitaryVerificationResponse}
 */
export const updateMilitaryVerificationStatus = async (updateMilitaryVerificationInput: UpdateMilitaryVerificationInput): Promise<UpdateMilitaryVerificationResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        // update the timestamps accordingly
        const updatedAt = new Date().toISOString();
        updateMilitaryVerificationInput.updatedAt = updateMilitaryVerificationInput.updatedAt ? updateMilitaryVerificationInput.updatedAt : updatedAt;

        // update the military verification object based on the passed in object
        await dynamoDbClient.send(new UpdateItemCommand({
            TableName: process.env.MILITARY_VERIFICATION_TABLE!,
            Key: {
                id: {
                    S: updateMilitaryVerificationInput.id
                }
            },
            ExpressionAttributeNames: {
                "#MVS": "militaryVerificationStatus",
                "#UA": "updatedAt"
            },
            ExpressionAttributeValues: {
                ":mvs": {
                    S: updateMilitaryVerificationInput.militaryVerificationStatus
                },
                ":ua": {
                    S: updateMilitaryVerificationInput.updatedAt
                }
            },
            UpdateExpression: "SET #MVS = :mvs, #UA = :ua",
            ReturnValues: "UPDATED_NEW"
        }));

        // return the updated military verification status
        return {
            id: updateMilitaryVerificationInput.id,
            militaryVerificationStatus: updateMilitaryVerificationInput.militaryVerificationStatus
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
