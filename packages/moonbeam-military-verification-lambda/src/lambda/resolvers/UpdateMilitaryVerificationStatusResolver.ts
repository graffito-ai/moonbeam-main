import {DynamoDBClient, GetItemCommand, UpdateItemCommand} from "@aws-sdk/client-dynamodb";
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

        // check to see if there is a military verification object to update. If there's none, then return an error accordingly.
        const preExistingVerificationObject =  await dynamoDbClient.send(new GetItemCommand({
            TableName: process.env.MILITARY_VERIFICATION_TABLE!,
            Key: {
                id: {
                    S: updateMilitaryVerificationInput.id
                }
            }
        }));

        // if there is an item retrieved to be updated, then we proceed accordingly. Otherwise, we throw an error.
        if (preExistingVerificationObject && preExistingVerificationObject.Item) {
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
        } else {
            const errorMessage = `Unknown military verification object to update!`;
            console.log(errorMessage);

            return {
                errorMessage: errorMessage,
                errorType: MilitaryVerificationErrorType.NoneOrAbsent
            }
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
