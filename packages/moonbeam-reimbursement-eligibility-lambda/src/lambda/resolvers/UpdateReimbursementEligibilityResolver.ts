import {DynamoDBClient, GetItemCommand, UpdateItemCommand} from "@aws-sdk/client-dynamodb";
import {
    ReimbursementEligibility,
    ReimbursementEligibilityResponse,
    ReimbursementResponse,
    ReimbursementsErrorType,
    UpdateReimbursementEligibilityInput,
} from "@moonbeam/moonbeam-models";

/**
 * UpdateReimbursementEligibility resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param updateReimbursementEligibilityInput update reimbursement eligibility input, used to update an existent reimbursement eligibility
 * @returns {@link Promise} of {@link ReimbursementResponse}
 */
export const updateReimbursementEligibility = async (fieldName: string, updateReimbursementEligibilityInput: UpdateReimbursementEligibilityInput): Promise<ReimbursementEligibilityResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        // update the timestamps accordingly
        const updatedAt = new Date().toISOString();
        updateReimbursementEligibilityInput.updatedAt = updateReimbursementEligibilityInput.updatedAt ? updateReimbursementEligibilityInput.updatedAt : updatedAt;

        // check to see if there is a reimbursement eligibility object to update. If there's none, then return an error accordingly.
        const preExistingReimbursementEligibilityObject = await dynamoDbClient.send(new GetItemCommand({
            TableName: process.env.REIMBURSEMENT_ELIGIBILITY_TABLE!,
            Key: {
                id: {
                    S: updateReimbursementEligibilityInput.id
                }
            },
            /**
             * we're not interested in getting all the data for this call, just the minimum for us to determine whether this is a duplicate or not
             *
             * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html
             * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeNames.html
             */
            ProjectionExpression: '#idf',
            ExpressionAttributeNames: {
                '#idf': 'id'
            }
        }));

        // if there is an item retrieved, then we need to check its contents
        if (preExistingReimbursementEligibilityObject && preExistingReimbursementEligibilityObject.Item) {
            // update the reimbursement eligibility object based on the passed in object
            await dynamoDbClient.send(new UpdateItemCommand({
                TableName: process.env.REIMBURSEMENT_ELIGIBILITY_TABLE!,
                Key: {
                    id: {
                        S: updateReimbursementEligibilityInput.id
                    }
                },
                ExpressionAttributeNames: {
                    "#estat": "eligibilityStatus",
                    "#uat": "updatedAt"
                },
                ExpressionAttributeValues: {
                    ":estat": {
                        S: updateReimbursementEligibilityInput.eligibilityStatus
                    },
                    ":uat": {
                        S: updateReimbursementEligibilityInput.updatedAt
                    }
                },
                UpdateExpression: "SET #estat = :estat, #uat = :uat",
                ReturnValues: "UPDATED_NEW"
            }));

            // return the updated reimbursement eligibility object
            return {
                id: updateReimbursementEligibilityInput.id,
                data: updateReimbursementEligibilityInput as ReimbursementEligibility
            }
        } else {
            const errorMessage = `Unknown reimbursement eligibility object to update!`;
            console.log(errorMessage);

            return {
                errorMessage: errorMessage,
                errorType: ReimbursementsErrorType.NoneOrAbsent
            }
        }
    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: ReimbursementsErrorType.UnexpectedError
        }
    }
}
