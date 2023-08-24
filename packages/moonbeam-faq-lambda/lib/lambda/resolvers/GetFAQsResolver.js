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
             * need to do pagination here, since we actually retrieve all users in a looped format, and we account for
             * paginated responses.
             *
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.Pagination.html}
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html}
             */
            retrievedData = await dynamoDbClient.send(new client_dynamodb_1.QueryCommand({
                TableName: process.env.FAQ_TABLE,
                Limit: 1000, // for now, we don't need to worry about this limit
            }));
            result = result.concat(retrievedData.Items);
        } while (retrievedData && retrievedData.Count && retrievedData.Items &&
            retrievedData.Items.length && retrievedData.Count !== 0 &&
            retrievedData.Items.length !== 0 && retrievedData.LastEvaluatedKey);
        // if there are eligible users retrieved, then return them accordingly
        if (result && result.length !== 0) {
            // convert the Dynamo DB data from Dynamo DB JSON format to an FAQ data format
            const faqsData = [];
            result.forEach(faqResult => {
                const facts = [];
                faqResult.facts.L && faqResult.facts.L.forEach(fact => {
                    const newFact = {
                        description: fact.M.description.S,
                        ...(fact.M.linkableKeyword.S && {
                            linkableKeyword: fact.M.linkableKeyword.S
                        }),
                        ...(fact.M.linkLocation.S && {
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
            const errorMessage = `No FAQs not found!`;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0RkFRc1Jlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvR2V0RkFRc1Jlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDhEQUFzRjtBQUN0RiwrREFBeUY7QUFFekY7Ozs7O0dBS0c7QUFDSSxNQUFNLE9BQU8sR0FBRyxLQUFLLEVBQUUsU0FBaUIsRUFBd0IsRUFBRTtJQUNyRSxJQUFJO1FBQ0EseUNBQXlDO1FBQ3pDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVyxDQUFDO1FBRXZDLDRDQUE0QztRQUM1QyxNQUFNLGNBQWMsR0FBRyxJQUFJLGdDQUFjLENBQUMsRUFBQyxNQUFNLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQztRQUU1RDs7OztXQUlHO1FBQ0gsSUFBSSxNQUFNLEdBQXFDLEVBQUUsQ0FBQztRQUNsRCxJQUFJLGFBQWEsQ0FBQztRQUVsQixHQUFHO1lBQ0M7Ozs7Ozs7OztlQVNHO1lBQ0gsYUFBYSxHQUFHLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLDhCQUFZLENBQUM7Z0JBQ3ZELFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVU7Z0JBQ2pDLEtBQUssRUFBRSxJQUFJLEVBQUUsbURBQW1EO2FBQ25FLENBQUMsQ0FBQyxDQUFDO1lBRUosTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQy9DLFFBQVEsYUFBYSxJQUFJLGFBQWEsQ0FBQyxLQUFLLElBQUksYUFBYSxDQUFDLEtBQUs7WUFDcEUsYUFBYSxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksYUFBYSxDQUFDLEtBQUssS0FBSyxDQUFDO1lBQ3ZELGFBQWEsQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxhQUFhLENBQUMsZ0JBQWdCLEVBQUU7UUFFcEUsc0VBQXNFO1FBQ3RFLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQy9CLDhFQUE4RTtZQUM5RSxNQUFNLFFBQVEsR0FBVSxFQUFFLENBQUM7WUFDM0IsTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRTtnQkFDdkIsTUFBTSxLQUFLLEdBQVcsRUFBRSxDQUFDO2dCQUN6QixTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQ25ELE1BQU0sT0FBTyxHQUFTO3dCQUNsQixXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBRTt3QkFDbkMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFFLENBQUMsZUFBZSxDQUFDLENBQUUsSUFBSTs0QkFDOUIsZUFBZSxFQUFFLElBQUksQ0FBQyxDQUFFLENBQUMsZUFBZSxDQUFDLENBQUU7eUJBQzlDLENBQUM7d0JBQ0YsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFFLENBQUMsWUFBWSxDQUFDLENBQUUsSUFBSTs0QkFDM0IsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFFLENBQUMsWUFBWSxDQUFDLENBQUU7eUJBQ3hDLENBQUM7d0JBQ0YsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFFLENBQUMsSUFBSSxDQUFDLENBQWM7cUJBQ3BDLENBQUE7b0JBQ0QsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDeEIsQ0FBQyxDQUFDLENBQUE7Z0JBQ0YsTUFBTSxHQUFHLEdBQVE7b0JBQ2IsRUFBRSxFQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBRTtvQkFDbkIsS0FBSyxFQUFFLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBRTtvQkFDekIsS0FBSyxFQUFFLEtBQUs7b0JBQ1osU0FBUyxFQUFFLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBRTtvQkFDakMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBRTtpQkFDcEMsQ0FBQztnQkFDRixRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3ZCLENBQUMsQ0FBQyxDQUFDO1lBQ0gsb0NBQW9DO1lBQ3BDLE9BQU87Z0JBQ0gsSUFBSSxFQUFFLFFBQVE7YUFDakIsQ0FBQTtTQUNKO2FBQU07WUFDSCxNQUFNLFlBQVksR0FBRyxvQkFBb0IsQ0FBQztZQUMxQyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRTFCLE9BQU87Z0JBQ0gsWUFBWSxFQUFFLFlBQVk7Z0JBQzFCLFNBQVMsRUFBRSw4QkFBWSxDQUFDLFlBQVk7YUFDdkMsQ0FBQTtTQUNKO0tBQ0o7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLE1BQU0sWUFBWSxHQUFHLG9DQUFvQyxTQUFTLFVBQVUsR0FBRyxFQUFFLENBQUM7UUFDbEYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMxQixPQUFPO1lBQ0gsWUFBWSxFQUFFLFlBQVk7WUFDMUIsU0FBUyxFQUFFLDhCQUFZLENBQUMsZUFBZTtTQUMxQyxDQUFDO0tBQ0w7QUFDTCxDQUFDLENBQUE7QUF0RlksUUFBQSxPQUFPLFdBc0ZuQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QXR0cmlidXRlVmFsdWUsIER5bmFtb0RCQ2xpZW50LCBRdWVyeUNvbW1hbmR9IGZyb20gXCJAYXdzLXNkay9jbGllbnQtZHluYW1vZGJcIjtcbmltcG9ydCB7RmFjdCwgRmFjdFR5cGUsIEZhcSwgRmFxRXJyb3JUeXBlLCBGYXFSZXNwb25zZX0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcblxuLyoqXG4gKiBHZXRGQVFzIHJlc29sdmVyXG4gKlxuICogQHBhcmFtIGZpZWxkTmFtZSBuYW1lIG9mIHRoZSByZXNvbHZlciBwYXRoIGZyb20gdGhlIEFwcFN5bmMgZXZlbnRcbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgRmFxUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRGQVFzID0gYXN5bmMgKGZpZWxkTmFtZTogc3RyaW5nKTogUHJvbWlzZTxGYXFSZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIGluaXRpYWxpemluZyB0aGUgRHluYW1vREIgZG9jdW1lbnQgY2xpZW50XG4gICAgICAgIGNvbnN0IGR5bmFtb0RiQ2xpZW50ID0gbmV3IER5bmFtb0RCQ2xpZW50KHtyZWdpb246IHJlZ2lvbn0pO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiB0aGUgZGF0YSB0byBiZSByZXRyaWV2ZWQgZnJvbSB0aGUgUXVlcnkgQ29tbWFuZFxuICAgICAgICAgKiB0aGUgZWxpZ2libGUgdXNlciBJdGVtcyByZXR1cm5lZCBmcm9tIHRoZSBRdWVyeSBDb21tYW5kLCBhbGwgYWdncmVnYXRlZCB0b2dldGhlclxuICAgICAgICAgKiB0aGUgbGFzdCBldmFsdWF0ZWQga2V5LCB0byBoZWxwIHdpdGggdGhlIHBhZ2luYXRpb24gb2YgcmVzdWx0c1xuICAgICAgICAgKi9cbiAgICAgICAgbGV0IHJlc3VsdDogUmVjb3JkPHN0cmluZywgQXR0cmlidXRlVmFsdWU+W10gPSBbXTtcbiAgICAgICAgbGV0IHJldHJpZXZlZERhdGE7XG5cbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiByZXRyaWV2ZSBhbGwgdGhlIEZBUXNcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBMaW1pdCBvZiAxIE1CIHBlciBwYWdpbmF0ZWQgcmVzcG9uc2UgZGF0YSwgYnV0IHdlIHdvbid0IGhhdmUgdGhhdCBtYW55IEZBUXMgYW55d2F5IGZvciBub3csIHdoaWNoIG1lYW5zIHRoYXQgd2Ugd29uJ3RcbiAgICAgICAgICAgICAqIG5lZWQgdG8gZG8gcGFnaW5hdGlvbiBoZXJlLCBzaW5jZSB3ZSBhY3R1YWxseSByZXRyaWV2ZSBhbGwgdXNlcnMgaW4gYSBsb29wZWQgZm9ybWF0LCBhbmQgd2UgYWNjb3VudCBmb3JcbiAgICAgICAgICAgICAqIHBhZ2luYXRlZCByZXNwb25zZXMuXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogQGxpbmsge2h0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9hbWF6b25keW5hbW9kYi9sYXRlc3QvZGV2ZWxvcGVyZ3VpZGUvUXVlcnkuUGFnaW5hdGlvbi5odG1sfVxuICAgICAgICAgICAgICogQGxpbmsge2h0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9hbWF6b25keW5hbW9kYi9sYXRlc3QvZGV2ZWxvcGVyZ3VpZGUvUXVlcnkuaHRtbH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgcmV0cmlldmVkRGF0YSA9IGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IFF1ZXJ5Q29tbWFuZCh7XG4gICAgICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5GQVFfVEFCTEUhLFxuICAgICAgICAgICAgICAgIExpbWl0OiAxMDAwLCAvLyBmb3Igbm93LCB3ZSBkb24ndCBuZWVkIHRvIHdvcnJ5IGFib3V0IHRoaXMgbGltaXRcbiAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdChyZXRyaWV2ZWREYXRhLkl0ZW1zKTtcbiAgICAgICAgfSB3aGlsZSAocmV0cmlldmVkRGF0YSAmJiByZXRyaWV2ZWREYXRhLkNvdW50ICYmIHJldHJpZXZlZERhdGEuSXRlbXMgJiZcbiAgICAgICAgcmV0cmlldmVkRGF0YS5JdGVtcy5sZW5ndGggJiYgcmV0cmlldmVkRGF0YS5Db3VudCAhPT0gMCAmJlxuICAgICAgICByZXRyaWV2ZWREYXRhLkl0ZW1zLmxlbmd0aCAhPT0gMCAmJiByZXRyaWV2ZWREYXRhLkxhc3RFdmFsdWF0ZWRLZXkpO1xuXG4gICAgICAgIC8vIGlmIHRoZXJlIGFyZSBlbGlnaWJsZSB1c2VycyByZXRyaWV2ZWQsIHRoZW4gcmV0dXJuIHRoZW0gYWNjb3JkaW5nbHlcbiAgICAgICAgaWYgKHJlc3VsdCAmJiByZXN1bHQubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAvLyBjb252ZXJ0IHRoZSBEeW5hbW8gREIgZGF0YSBmcm9tIER5bmFtbyBEQiBKU09OIGZvcm1hdCB0byBhbiBGQVEgZGF0YSBmb3JtYXRcbiAgICAgICAgICAgIGNvbnN0IGZhcXNEYXRhOiBGYXFbXSA9IFtdO1xuICAgICAgICAgICAgcmVzdWx0LmZvckVhY2goZmFxUmVzdWx0ID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBmYWN0czogRmFjdFtdID0gW107XG4gICAgICAgICAgICAgICAgZmFxUmVzdWx0LmZhY3RzLkwgJiYgZmFxUmVzdWx0LmZhY3RzLkwhLmZvckVhY2goZmFjdCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld0ZhY3Q6IEZhY3QgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogZmFjdC5NIS5kZXNjcmlwdGlvbi5TISxcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLihmYWN0Lk0hLmxpbmthYmxlS2V5d29yZC5TISAmJiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlua2FibGVLZXl3b3JkOiBmYWN0Lk0hLmxpbmthYmxlS2V5d29yZC5TIVxuICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi4oZmFjdC5NIS5saW5rTG9jYXRpb24uUyEgJiYge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmtMb2NhdGlvbjogZmFjdC5NIS5saW5rTG9jYXRpb24uUyFcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogZmFjdC5NIS50eXBlLlMhIGFzIEZhY3RUeXBlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZmFjdHMucHVzaChuZXdGYWN0KTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIGNvbnN0IGZhcTogRmFxID0ge1xuICAgICAgICAgICAgICAgICAgICBpZDogZmFxUmVzdWx0LmlkLlMhLFxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogZmFxUmVzdWx0LnRpdGxlLlMhLFxuICAgICAgICAgICAgICAgICAgICBmYWN0czogZmFjdHMsXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDogZmFxUmVzdWx0LmNyZWF0ZWRBdC5TISxcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEF0OiBmYXFSZXN1bHQudXBkYXRlZEF0LlMhLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgZmFxc0RhdGEucHVzaChmYXEpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyByZXR1cm4gdGhlIGxpc3Qgb2YgRkFRcyByZXRyaWV2ZWRcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGF0YTogZmFxc0RhdGFcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyBGQVFzIG5vdCBmb3VuZCFgO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IEZhcUVycm9yVHlwZS5Ob25lT3JBYnNlbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgJHtmaWVsZE5hbWV9IHF1ZXJ5ICR7ZXJyfWA7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIGVycm9yVHlwZTogRmFxRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICB9O1xuICAgIH1cbn1cbiJdfQ==