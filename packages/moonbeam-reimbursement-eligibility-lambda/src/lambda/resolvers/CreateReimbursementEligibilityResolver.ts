import {DynamoDBClient, GetItemCommand, PutItemCommand} from "@aws-sdk/client-dynamodb";
import {
    CreateReimbursementEligibilityInput,
    ReimbursementEligibility,
    ReimbursementEligibilityResponse,
    ReimbursementEligibilityStatus,
    ReimbursementsErrorType
} from "@moonbeam/moonbeam-models";

/**
 * CreateReimbursementEligibility resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param createReimbursementEligibilityInput create reimbursement eligibility input object, used to create a reimbursement
 * eligibility based on a triggered cron event.
 * @returns {@link Promise} of {@link ReimbursementEligibilityResponse}
 */
export const createReimbursementEligibility = async (fieldName: string, createReimbursementEligibilityInput: CreateReimbursementEligibilityInput): Promise<ReimbursementEligibilityResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        // update the timestamps accordingly
        const createdAt = new Date().toISOString();
        createReimbursementEligibilityInput.createdAt = createReimbursementEligibilityInput.createdAt ? createReimbursementEligibilityInput.createdAt : createdAt;
        createReimbursementEligibilityInput.updatedAt = createReimbursementEligibilityInput.updatedAt ? createReimbursementEligibilityInput.updatedAt : createdAt;

        /**
         * check to see if the reimbursement eligibility already exists in the DB. Although this is a very rare situation, since we have so many resilient
         * methods (such as Dead-Letter-Queue, retries, etc.) we want to put a safeguard around duplicates even here.
         */
        const preExistingReimbursementEligibility = await dynamoDbClient.send(new GetItemCommand({
            TableName: process.env.REIMBURSEMENT_ELIGIBILITY_TABLE!,
            Key: {
                id: {
                    S: createReimbursementEligibilityInput.id
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
        if (preExistingReimbursementEligibility && preExistingReimbursementEligibility.Item) {
            /**
             * if there is a pre-existing reimbursement eligibility with the same primary key,
             * then we cannot duplicate that, so we will return an error.
             */
            const errorMessage = `Duplicate reimbursement eligibility found!`;
            console.log(errorMessage);

            return {
                errorMessage: errorMessage,
                errorType: ReimbursementsErrorType.DuplicateObjectFound
            }
        } else {
            // store the reimbursement eligibility object
            await dynamoDbClient.send(new PutItemCommand({
                TableName: process.env.REIMBURSEMENT_ELIGIBILITY_TABLE!,
                Item: {
                    id: {
                        S: createReimbursementEligibilityInput.id
                    },
                    eligibilityStatus: {
                        S: createReimbursementEligibilityInput.eligibilityStatus as ReimbursementEligibilityStatus
                    },
                    createdAt: {
                        S: createReimbursementEligibilityInput.createdAt!
                    },
                    updatedAt: {
                        S: createReimbursementEligibilityInput.updatedAt!
                    }
                },
            }));

            // return the reimbursement eligibility object
            return {
                id: createReimbursementEligibilityInput.id,
                data: createReimbursementEligibilityInput as ReimbursementEligibility
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
