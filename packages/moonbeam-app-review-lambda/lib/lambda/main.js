"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const CreateAppReviewResolver_1 = require("./resolvers/CreateAppReviewResolver");
const GetAppReviewEligibilityResolver_1 = require("./resolvers/GetAppReviewEligibilityResolver");
/**
 * Lambda Function handler, handling incoming events,
 * depending on the AppSync field name.
 *
 * @param event AppSync even to be passed in the handler
 * @returns a {@link Promise} containing a {@link GetAppReviewEligibilityResponse} or {@link AppReviewResponse}
 */
exports.handler = async (event) => {
    console.log(`Received new App Review event for operation [${event.info.fieldName}], with arguments ${JSON.stringify(event.arguments)}`);
    switch (event.info.fieldName) {
        case "getAppReviewEligibility":
            return await (0, GetAppReviewEligibilityResolver_1.getAppReviewEligibility)(event.info.fieldName, event.arguments.getAppReviewEligibilityInput);
        case "createAppReview":
            return await (0, CreateAppReviewResolver_1.createAppReview)(event.info.fieldName, event.arguments.createAppReviewInput);
        default:
            const errorMessage = `Unexpected field name: ${event.info.fieldName}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.AppReviewErrorType.UnexpectedError
            };
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9sYW1iZGEvbWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtEQU1tQztBQUNuQyxpRkFBb0U7QUFDcEUsaUdBQW9GO0FBbUJwRjs7Ozs7O0dBTUc7QUFDSCxPQUFPLENBQUMsT0FBTyxHQUFHLEtBQUssRUFBRSxLQUFtQixFQUFnRSxFQUFFO0lBQzFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0RBQWdELEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxxQkFBcUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3hJLFFBQVEsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUU7UUFDMUIsS0FBSyx5QkFBeUI7WUFDMUIsT0FBTyxNQUFNLElBQUEseURBQXVCLEVBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1FBQzdHLEtBQUssaUJBQWlCO1lBQ2xCLE9BQU8sTUFBTSxJQUFBLHlDQUFlLEVBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBQzdGO1lBQ0ksTUFBTSxZQUFZLEdBQUcsMEJBQTBCLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDdEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUMxQixPQUFPO2dCQUNILFlBQVksRUFBRSxZQUFZO2dCQUMxQixTQUFTLEVBQUUsb0NBQWtCLENBQUMsZUFBZTthQUNoRCxDQUFDO0tBQ1Q7QUFDTCxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIEFwcFJldmlld0Vycm9yVHlwZSxcbiAgICBBcHBSZXZpZXdSZXNwb25zZSxcbiAgICBDcmVhdGVBcHBSZXZpZXdJbnB1dCxcbiAgICBHZXRBcHBSZXZpZXdFbGlnaWJpbGl0eUlucHV0LFxuICAgIEdldEFwcFJldmlld0VsaWdpYmlsaXR5UmVzcG9uc2Vcbn0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcbmltcG9ydCB7Y3JlYXRlQXBwUmV2aWV3fSBmcm9tIFwiLi9yZXNvbHZlcnMvQ3JlYXRlQXBwUmV2aWV3UmVzb2x2ZXJcIjtcbmltcG9ydCB7Z2V0QXBwUmV2aWV3RWxpZ2liaWxpdHl9IGZyb20gXCIuL3Jlc29sdmVycy9HZXRBcHBSZXZpZXdFbGlnaWJpbGl0eVJlc29sdmVyXCI7XG5cbi8qKlxuICogTWFwcGluZyBvdXQgdGhlIEFwcCBTeW5jIGV2ZW50IHR5cGUsIHNvIHdlIGNhbiB1c2UgaXQgYXMgYSB0eXBlIGluIHRoZSBMYW1iZGEgSGFuZGxlclxuICovXG50eXBlIEFwcFN5bmNFdmVudCA9IHtcbiAgICBpbmZvOiB7XG4gICAgICAgIGZpZWxkTmFtZTogc3RyaW5nXG4gICAgfSxcbiAgICBhcmd1bWVudHM6IHtcbiAgICAgICAgZ2V0QXBwUmV2aWV3RWxpZ2liaWxpdHlJbnB1dDogR2V0QXBwUmV2aWV3RWxpZ2liaWxpdHlJbnB1dCxcbiAgICAgICAgY3JlYXRlQXBwUmV2aWV3SW5wdXQ6IENyZWF0ZUFwcFJldmlld0lucHV0XG4gICAgfSxcbiAgICBpZGVudGl0eToge1xuICAgICAgICBzdWI6IHN0cmluZztcbiAgICAgICAgdXNlcm5hbWU6IHN0cmluZztcbiAgICB9XG59XG5cbi8qKlxuICogTGFtYmRhIEZ1bmN0aW9uIGhhbmRsZXIsIGhhbmRsaW5nIGluY29taW5nIGV2ZW50cyxcbiAqIGRlcGVuZGluZyBvbiB0aGUgQXBwU3luYyBmaWVsZCBuYW1lLlxuICpcbiAqIEBwYXJhbSBldmVudCBBcHBTeW5jIGV2ZW4gdG8gYmUgcGFzc2VkIGluIHRoZSBoYW5kbGVyXG4gKiBAcmV0dXJucyBhIHtAbGluayBQcm9taXNlfSBjb250YWluaW5nIGEge0BsaW5rIEdldEFwcFJldmlld0VsaWdpYmlsaXR5UmVzcG9uc2V9IG9yIHtAbGluayBBcHBSZXZpZXdSZXNwb25zZX1cbiAqL1xuZXhwb3J0cy5oYW5kbGVyID0gYXN5bmMgKGV2ZW50OiBBcHBTeW5jRXZlbnQpOiBQcm9taXNlPEFwcFJldmlld1Jlc3BvbnNlIHwgR2V0QXBwUmV2aWV3RWxpZ2liaWxpdHlSZXNwb25zZT4gPT4ge1xuICAgIGNvbnNvbGUubG9nKGBSZWNlaXZlZCBuZXcgQXBwIFJldmlldyBldmVudCBmb3Igb3BlcmF0aW9uIFske2V2ZW50LmluZm8uZmllbGROYW1lfV0sIHdpdGggYXJndW1lbnRzICR7SlNPTi5zdHJpbmdpZnkoZXZlbnQuYXJndW1lbnRzKX1gKTtcbiAgICBzd2l0Y2ggKGV2ZW50LmluZm8uZmllbGROYW1lKSB7XG4gICAgICAgIGNhc2UgXCJnZXRBcHBSZXZpZXdFbGlnaWJpbGl0eVwiOlxuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IGdldEFwcFJldmlld0VsaWdpYmlsaXR5KGV2ZW50LmluZm8uZmllbGROYW1lLCBldmVudC5hcmd1bWVudHMuZ2V0QXBwUmV2aWV3RWxpZ2liaWxpdHlJbnB1dCk7XG4gICAgICAgIGNhc2UgXCJjcmVhdGVBcHBSZXZpZXdcIjpcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCBjcmVhdGVBcHBSZXZpZXcoZXZlbnQuaW5mby5maWVsZE5hbWUsIGV2ZW50LmFyZ3VtZW50cy5jcmVhdGVBcHBSZXZpZXdJbnB1dCk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBmaWVsZCBuYW1lOiAke2V2ZW50LmluZm8uZmllbGROYW1lfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IEFwcFJldmlld0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgIH07XG4gICAgfVxufVxuXG4iXX0=