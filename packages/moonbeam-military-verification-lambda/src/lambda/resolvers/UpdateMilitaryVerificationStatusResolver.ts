import {DynamoDBClient, GetItemCommand, UpdateItemCommand} from "@aws-sdk/client-dynamodb";
import {
    MilitaryVerificationErrorType, MilitaryVerificationStatusType,
    MoonbeamClient,
    UpdateMilitaryVerificationInput,
    UpdateMilitaryVerificationResponse,
} from "@moonbeam/moonbeam-models";
import {APIGatewayProxyResult} from "aws-lambda";

/**
 * UpdateMilitaryVerificationStatus resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param updateMilitaryVerificationInput military verification input, used to update an existent one
 * @returns {@link Promise} of {@link UpdateMilitaryVerificationResponse}
 */
export const updateMilitaryVerificationStatus = async (fieldName: string, updateMilitaryVerificationInput: UpdateMilitaryVerificationInput): Promise<UpdateMilitaryVerificationResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        // update the timestamps accordingly
        const updatedAt = new Date().toISOString();
        updateMilitaryVerificationInput.updatedAt = updateMilitaryVerificationInput.updatedAt ? updateMilitaryVerificationInput.updatedAt : updatedAt;

        // check to see if there is a military verification object to update. If there's none, then return an error accordingly.
        const preExistingVerificationObject = await dynamoDbClient.send(new GetItemCommand({
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

            /**
             * once the military verification status has been successfully updated, send a notification accordingly,
             * by triggering the military verification update producer accordingly.
             *
             * call the POST/militaryVerificationUpdatesAcknowledgment Moonbeam internal endpoint
             */
            const response: APIGatewayProxyResult = await new MoonbeamClient(process.env.ENV_NAME!, region).militaryVerificationUpdatesAcknowledgment({
                id: updateMilitaryVerificationInput.id,
                newMilitaryVerificationStatus: updateMilitaryVerificationInput.militaryVerificationStatus,
                originalMilitaryVerificationStatus: preExistingVerificationObject.Item.militaryVerificationStatus.S! as MilitaryVerificationStatusType,
                addressLine: preExistingVerificationObject.Item.addressLine.S!,
                city: preExistingVerificationObject.Item.city.S!,
                dateOfBirth: preExistingVerificationObject.Item.dateOfBirth.S!,
                enlistmentYear: preExistingVerificationObject.Item.enlistmentYear.S!,
                firstName: preExistingVerificationObject.Item.firstName.S!,
                lastName: preExistingVerificationObject.Item.lastName.S!,
                state: preExistingVerificationObject.Item.state.S!,
                zipCode: preExistingVerificationObject.Item.zipCode.S!,
            });

            // check to see if the military verification update acknowledgment call was executed successfully
            if (response.statusCode === 202 && response.body !== null && response.body !== undefined &&
                response.body === "Military verification update acknowledged!") {
                console.log(`Successfully acknowledged military verification status update for user - ${updateMilitaryVerificationInput.id}!`);

                // return the updated military verification status
                return {
                    id: updateMilitaryVerificationInput.id,
                    militaryVerificationStatus: updateMilitaryVerificationInput.militaryVerificationStatus
                }
            } else {
                // for military status updates which won't trigger a notification, acknowledge that but don't return an error
                if (response.statusCode === 400 && response.body !== null && response.body !== undefined &&
                    response.body.includes("Invalid military verification status transition for notification process to get triggered!")) {
                    console.log(`Not necessary to acknowledge the military verification status update for user - ${updateMilitaryVerificationInput.id}!`);

                    // return the updated military verification status
                    return {
                        id: updateMilitaryVerificationInput.id,
                        militaryVerificationStatus: updateMilitaryVerificationInput.militaryVerificationStatus
                    }
                } else {
                    /**
                     * for any users which the military verification status update has not been acknowledged for, return the errors accordingly.
                     */
                    const errorMessage = `Unexpected response structure returned from the military verification status update acknowledgment call!`;
                    console.log(`${errorMessage} ${response && JSON.stringify(response)}`);

                    return {
                        errorMessage: errorMessage,
                        errorType: MilitaryVerificationErrorType.UnexpectedError
                    }
                }
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
        const errorMessage = `Unexpected error while executing ${fieldName} mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: MilitaryVerificationErrorType.UnexpectedError
        }
    }
}
