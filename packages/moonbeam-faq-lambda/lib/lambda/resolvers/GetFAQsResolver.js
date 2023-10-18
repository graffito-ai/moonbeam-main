"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFAQs = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * GetFAQs resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @returns {@link Promise} of {@link FaqResponse}
 */
const getFAQs = async (fieldName) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // initializing the DynamoDB document client
        const dynamoDbClient = new client_dynamodb_1.DynamoDBClient({ region: region });
        /**
         * the data to be retrieved from the Query Command
         * the eligible user Items returned from the Query Command, all aggregated together
         * the last evaluated key, to help with the pagination of results
         */
        let result = [];
        let retrievedData;
        do {
            /**
             * retrieve all the FAQs
             *
             * Limit of 1 MB per paginated response data, but we won't have that many FAQs anyway for now, which means that we won't
             * need to do pagination here.
             *
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.Pagination.html}
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html}
             */
            retrievedData = await dynamoDbClient.send(new client_dynamodb_1.ScanCommand({
                TableName: process.env.FAQ_TABLE,
                Limit: 1000, // for now, we don't need to worry about this limit
            }));
            result = result.concat(retrievedData.Items);
        } while (retrievedData && retrievedData.Count && retrievedData.Items &&
            retrievedData.Items.length && retrievedData.Count !== 0 &&
            retrievedData.Items.length !== 0 && retrievedData.LastEvaluatedKey);
        // if there are eligible users retrieved, then return them accordingly
        if (result && result.length !== 0) {
            // convert the Dynamo DB data from Dynamo DB JSON format to a FAQ data format
            const faqsData = [];
            result.forEach(faqResult => {
                const facts = [];
                faqResult.facts.L && faqResult.facts.L.forEach(fact => {
                    const newFact = {
                        description: fact.M.description.S,
                        ...(fact.M.linkableKeyword && {
                            linkableKeyword: fact.M.linkableKeyword.S
                        }),
                        ...(fact.M.linkLocation && {
                            linkLocation: fact.M.linkLocation.S
                        }),
                        type: fact.M.type.S
                    };
                    facts.push(newFact);
                });
                const faq = {
                    id: faqResult.id.S,
                    title: faqResult.title.S,
                    facts: facts,
                    createdAt: faqResult.createdAt.S,
                    updatedAt: faqResult.updatedAt.S,
                };
                faqsData.push(faq);
            });
            // return the list of FAQs retrieved
            return {
                data: faqsData
            };
        }
        else {
            const errorMessage = `No FAQs found!`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.FaqErrorType.NoneOrAbsent
            };
        }
    }
    catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.FaqErrorType.UnexpectedError
        };
    }
};
exports.getFAQs = getFAQs;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0RkFRc1Jlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvR2V0RkFRc1Jlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDhEQUFxRjtBQUNyRiwrREFBeUY7QUFFekY7Ozs7O0dBS0c7QUFDSSxNQUFNLE9BQU8sR0FBRyxLQUFLLEVBQUUsU0FBaUIsRUFBd0IsRUFBRTtJQUNyRSxJQUFJO1FBQ0EseUNBQXlDO1FBQ3pDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVyxDQUFDO1FBRXZDLDRDQUE0QztRQUM1QyxNQUFNLGNBQWMsR0FBRyxJQUFJLGdDQUFjLENBQUMsRUFBQyxNQUFNLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQztRQUU1RDs7OztXQUlHO1FBQ0gsSUFBSSxNQUFNLEdBQXFDLEVBQUUsQ0FBQztRQUNsRCxJQUFJLGFBQWEsQ0FBQztRQUVsQixHQUFHO1lBQ0M7Ozs7Ozs7O2VBUUc7WUFDSCxhQUFhLEdBQUcsTUFBTSxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksNkJBQVcsQ0FBQztnQkFDdEQsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBVTtnQkFDakMsS0FBSyxFQUFFLElBQUksRUFBRSxtREFBbUQ7YUFDbkUsQ0FBQyxDQUFDLENBQUM7WUFFSixNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDL0MsUUFBUSxhQUFhLElBQUksYUFBYSxDQUFDLEtBQUssSUFBSSxhQUFhLENBQUMsS0FBSztZQUNwRSxhQUFhLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBSSxhQUFhLENBQUMsS0FBSyxLQUFLLENBQUM7WUFDdkQsYUFBYSxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLGFBQWEsQ0FBQyxnQkFBZ0IsRUFBRTtRQUVwRSxzRUFBc0U7UUFDdEUsSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDL0IsNkVBQTZFO1lBQzdFLE1BQU0sUUFBUSxHQUFVLEVBQUUsQ0FBQztZQUMzQixNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUN2QixNQUFNLEtBQUssR0FBVyxFQUFFLENBQUM7Z0JBQ3pCLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDbkQsTUFBTSxPQUFPLEdBQVM7d0JBQ2xCLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBRSxDQUFDLFdBQVcsQ0FBQyxDQUFFO3dCQUNuQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUUsQ0FBQyxlQUFlLElBQUk7NEJBQzNCLGVBQWUsRUFBRSxJQUFJLENBQUMsQ0FBRSxDQUFDLGVBQWUsQ0FBQyxDQUFFO3lCQUM5QyxDQUFDO3dCQUNGLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBRSxDQUFDLFlBQVksSUFBSTs0QkFDeEIsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFFLENBQUMsWUFBWSxDQUFDLENBQUU7eUJBQ3hDLENBQUM7d0JBQ0YsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFFLENBQUMsSUFBSSxDQUFDLENBQWM7cUJBQ3BDLENBQUE7b0JBQ0QsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDeEIsQ0FBQyxDQUFDLENBQUE7Z0JBQ0YsTUFBTSxHQUFHLEdBQVE7b0JBQ2IsRUFBRSxFQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBRTtvQkFDbkIsS0FBSyxFQUFFLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBRTtvQkFDekIsS0FBSyxFQUFFLEtBQUs7b0JBQ1osU0FBUyxFQUFFLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBRTtvQkFDakMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBRTtpQkFDcEMsQ0FBQztnQkFDRixRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3ZCLENBQUMsQ0FBQyxDQUFDO1lBQ0gsb0NBQW9DO1lBQ3BDLE9BQU87Z0JBQ0gsSUFBSSxFQUFFLFFBQVE7YUFDakIsQ0FBQTtTQUNKO2FBQU07WUFDSCxNQUFNLFlBQVksR0FBRyxnQkFBZ0IsQ0FBQztZQUN0QyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRTFCLE9BQU87Z0JBQ0gsWUFBWSxFQUFFLFlBQVk7Z0JBQzFCLFNBQVMsRUFBRSw4QkFBWSxDQUFDLFlBQVk7YUFDdkMsQ0FBQTtTQUNKO0tBQ0o7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLE1BQU0sWUFBWSxHQUFHLG9DQUFvQyxTQUFTLFVBQVUsR0FBRyxFQUFFLENBQUM7UUFDbEYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMxQixPQUFPO1lBQ0gsWUFBWSxFQUFFLFlBQVk7WUFDMUIsU0FBUyxFQUFFLDhCQUFZLENBQUMsZUFBZTtTQUMxQyxDQUFDO0tBQ0w7QUFDTCxDQUFDLENBQUE7QUFyRlksUUFBQSxPQUFPLFdBcUZuQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QXR0cmlidXRlVmFsdWUsIER5bmFtb0RCQ2xpZW50LCBTY2FuQ29tbWFuZH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1keW5hbW9kYlwiO1xuaW1wb3J0IHtGYWN0LCBGYWN0VHlwZSwgRmFxLCBGYXFFcnJvclR5cGUsIEZhcVJlc3BvbnNlfSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuXG4vKipcbiAqIEdldEZBUXMgcmVzb2x2ZXJcbiAqXG4gKiBAcGFyYW0gZmllbGROYW1lIG5hbWUgb2YgdGhlIHJlc29sdmVyIHBhdGggZnJvbSB0aGUgQXBwU3luYyBldmVudFxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBGYXFSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGdldEZBUXMgPSBhc3luYyAoZmllbGROYW1lOiBzdHJpbmcpOiBQcm9taXNlPEZhcVJlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLy8gaW5pdGlhbGl6aW5nIHRoZSBEeW5hbW9EQiBkb2N1bWVudCBjbGllbnRcbiAgICAgICAgY29uc3QgZHluYW1vRGJDbGllbnQgPSBuZXcgRHluYW1vREJDbGllbnQoe3JlZ2lvbjogcmVnaW9ufSk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIHRoZSBkYXRhIHRvIGJlIHJldHJpZXZlZCBmcm9tIHRoZSBRdWVyeSBDb21tYW5kXG4gICAgICAgICAqIHRoZSBlbGlnaWJsZSB1c2VyIEl0ZW1zIHJldHVybmVkIGZyb20gdGhlIFF1ZXJ5IENvbW1hbmQsIGFsbCBhZ2dyZWdhdGVkIHRvZ2V0aGVyXG4gICAgICAgICAqIHRoZSBsYXN0IGV2YWx1YXRlZCBrZXksIHRvIGhlbHAgd2l0aCB0aGUgcGFnaW5hdGlvbiBvZiByZXN1bHRzXG4gICAgICAgICAqL1xuICAgICAgICBsZXQgcmVzdWx0OiBSZWNvcmQ8c3RyaW5nLCBBdHRyaWJ1dGVWYWx1ZT5bXSA9IFtdO1xuICAgICAgICBsZXQgcmV0cmlldmVkRGF0YTtcblxuICAgICAgICBkbyB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIHJldHJpZXZlIGFsbCB0aGUgRkFRc1xuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIExpbWl0IG9mIDEgTUIgcGVyIHBhZ2luYXRlZCByZXNwb25zZSBkYXRhLCBidXQgd2Ugd29uJ3QgaGF2ZSB0aGF0IG1hbnkgRkFRcyBhbnl3YXkgZm9yIG5vdywgd2hpY2ggbWVhbnMgdGhhdCB3ZSB3b24ndFxuICAgICAgICAgICAgICogbmVlZCB0byBkbyBwYWdpbmF0aW9uIGhlcmUuXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogQGxpbmsge2h0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9hbWF6b25keW5hbW9kYi9sYXRlc3QvZGV2ZWxvcGVyZ3VpZGUvUXVlcnkuUGFnaW5hdGlvbi5odG1sfVxuICAgICAgICAgICAgICogQGxpbmsge2h0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9hbWF6b25keW5hbW9kYi9sYXRlc3QvZGV2ZWxvcGVyZ3VpZGUvUXVlcnkuaHRtbH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgcmV0cmlldmVkRGF0YSA9IGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IFNjYW5Db21tYW5kKHtcbiAgICAgICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LkZBUV9UQUJMRSEsXG4gICAgICAgICAgICAgICAgTGltaXQ6IDEwMDAsIC8vIGZvciBub3csIHdlIGRvbid0IG5lZWQgdG8gd29ycnkgYWJvdXQgdGhpcyBsaW1pdFxuICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KHJldHJpZXZlZERhdGEuSXRlbXMpO1xuICAgICAgICB9IHdoaWxlIChyZXRyaWV2ZWREYXRhICYmIHJldHJpZXZlZERhdGEuQ291bnQgJiYgcmV0cmlldmVkRGF0YS5JdGVtcyAmJlxuICAgICAgICByZXRyaWV2ZWREYXRhLkl0ZW1zLmxlbmd0aCAmJiByZXRyaWV2ZWREYXRhLkNvdW50ICE9PSAwICYmXG4gICAgICAgIHJldHJpZXZlZERhdGEuSXRlbXMubGVuZ3RoICE9PSAwICYmIHJldHJpZXZlZERhdGEuTGFzdEV2YWx1YXRlZEtleSk7XG5cbiAgICAgICAgLy8gaWYgdGhlcmUgYXJlIGVsaWdpYmxlIHVzZXJzIHJldHJpZXZlZCwgdGhlbiByZXR1cm4gdGhlbSBhY2NvcmRpbmdseVxuICAgICAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgIC8vIGNvbnZlcnQgdGhlIER5bmFtbyBEQiBkYXRhIGZyb20gRHluYW1vIERCIEpTT04gZm9ybWF0IHRvIGEgRkFRIGRhdGEgZm9ybWF0XG4gICAgICAgICAgICBjb25zdCBmYXFzRGF0YTogRmFxW10gPSBbXTtcbiAgICAgICAgICAgIHJlc3VsdC5mb3JFYWNoKGZhcVJlc3VsdCA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZmFjdHM6IEZhY3RbXSA9IFtdO1xuICAgICAgICAgICAgICAgIGZhcVJlc3VsdC5mYWN0cy5MICYmIGZhcVJlc3VsdC5mYWN0cy5MIS5mb3JFYWNoKGZhY3QgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdGYWN0OiBGYWN0ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGZhY3QuTSEuZGVzY3JpcHRpb24uUyEsXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi4oZmFjdC5NIS5saW5rYWJsZUtleXdvcmQgJiYge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmthYmxlS2V5d29yZDogZmFjdC5NIS5saW5rYWJsZUtleXdvcmQuUyFcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uKGZhY3QuTSEubGlua0xvY2F0aW9uICYmIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5rTG9jYXRpb246IGZhY3QuTSEubGlua0xvY2F0aW9uLlMhXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IGZhY3QuTSEudHlwZS5TISBhcyBGYWN0VHlwZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZhY3RzLnB1c2gobmV3RmFjdCk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBjb25zdCBmYXE6IEZhcSA9IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGZhcVJlc3VsdC5pZC5TISxcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGZhcVJlc3VsdC50aXRsZS5TISxcbiAgICAgICAgICAgICAgICAgICAgZmFjdHM6IGZhY3RzLFxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IGZhcVJlc3VsdC5jcmVhdGVkQXQuUyEsXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBdDogZmFxUmVzdWx0LnVwZGF0ZWRBdC5TISxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGZhcXNEYXRhLnB1c2goZmFxKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBsaXN0IG9mIEZBUXMgcmV0cmlldmVkXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRhdGE6IGZhcXNEYXRhXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm8gRkFRcyBmb3VuZCFgO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IEZhcUVycm9yVHlwZS5Ob25lT3JBYnNlbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgJHtmaWVsZE5hbWV9IHF1ZXJ5ICR7ZXJyfWA7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIGVycm9yVHlwZTogRmFxRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICB9O1xuICAgIH1cbn1cbiJdfQ==