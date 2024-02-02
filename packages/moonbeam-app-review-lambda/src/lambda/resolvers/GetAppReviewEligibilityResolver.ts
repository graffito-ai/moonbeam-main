import {DynamoDBClient, GetItemCommand} from "@aws-sdk/client-dynamodb";
import {
    AppReviewErrorType,
    GetAppReviewEligibilityInput,
    GetAppReviewEligibilityResponse
} from "@moonbeam/moonbeam-models";

/**
 * GetAppReviewEligibility resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getAppReviewEligibilityInput the input passed in, used to retrieve a user's
 * eligibility in terms of App Store reviews.
 *
 * @returns {@link Promise} of {@link GetAppReviewEligibilityResponse}
 */
export const getAppReviewEligibility = async (fieldName: string, getAppReviewEligibilityInput: GetAppReviewEligibilityInput): Promise<GetAppReviewEligibilityResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        /**
         * check to see if there is an existing App Review for the user.
         */
        const preExistingAppReview = getAppReviewEligibilityInput.id && await dynamoDbClient.send(new GetItemCommand({
            TableName: process.env.APP_REVIEW_TABLE!,
            Key: {
                id: {
                    S: getAppReviewEligibilityInput.id
                }
            }
        }));

        /**
         * if there is an item retrieved, then evaluate whether the user is eligible given the information retrieved.
         * Otherwise, just return that the user is eligible for a new App Review, given that they do not have one associated with them.
         */
        if (preExistingAppReview && preExistingAppReview.Item) {
            /**
             * we establish that a user is eligible for a new App Review, if the updatedAt date/time of an existent
             * App Review record for a user, is at least 3 months from today's date/time.
             *
             * first retrieve the retrieved record's updatedAt timestamp.
             */
            const preExistingUpdateAtDate = new Date(preExistingAppReview.Item.updatedAt.S!);

            // get today's date/time
            const dateNow = new Date();

            // compare today's date with the pre-existing record's updateAt timestamp
            var months;
            months = (dateNow.getFullYear() - preExistingUpdateAtDate.getFullYear()) * 12;
            months -= preExistingUpdateAtDate.getMonth();
            months += dateNow.getMonth();
            months = months <= 0 ? 0 : months;
            // 3 months is the cutoff for receiving another App Review notification
            if (months > 3) {
                const message = `User ${getAppReviewEligibilityInput.id} has not received done App Review in the past 3 months. User is therefore ELIGIBLE`;
                console.log(message);
                return {
                    data: true
                }
            } else {
                const message = `User ${getAppReviewEligibilityInput.id} has already received done App Review in the past 3 months. User is therefore NOT ELIGIBLE`;
                console.log(message);
                return {
                    data: false
                }
            }
        } else {
            const message = `No App Review associated with user ${getAppReviewEligibilityInput.id}. User is therefore ELIGIBLE!`;
            console.log(message);
            return {
                data: true
            };
        }
    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: AppReviewErrorType.UnexpectedError
        };
    }
}
