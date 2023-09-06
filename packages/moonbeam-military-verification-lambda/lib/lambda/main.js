"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const CreateMilitaryVerificationResolver_1 = require("./resolvers/CreateMilitaryVerificationResolver");
const GetMilitaryVerificationStatusResolver_1 = require("./resolvers/GetMilitaryVerificationStatusResolver");
const UpdateMilitaryVerificationStatusResolver_1 = require("./resolvers/UpdateMilitaryVerificationStatusResolver");
/**
 * Lambda Function handler, handling incoming events,
 * depending on the AppSync field name.
 *
 * @param event AppSync event to be passed in the handler
 * @returns a {@link Promise} containing a {@link CreateMilitaryVerificationResponse} or {@link GetMilitaryVerificationResponse} or {@link UpdateMilitaryVerificationResponse}
 */
exports.handler = async (event) => {
    console.log(`Received new storage event for operation [${event.info.fieldName}], with arguments ${JSON.stringify(event.arguments)}`);
    switch (event.info.fieldName) {
        case "getMilitaryVerificationStatus":
            return await (0, GetMilitaryVerificationStatusResolver_1.getMilitaryVerificationStatus)(event.info.fieldName, event.arguments.getMilitaryVerificationInput);
        case "updateMilitaryVerificationStatus":
            return await (0, UpdateMilitaryVerificationStatusResolver_1.updateMilitaryVerificationStatus)(event.info.fieldName, event.arguments.updateMilitaryVerificationInput);
        case "createMilitaryVerification":
            return await (0, CreateMilitaryVerificationResolver_1.createMilitaryVerification)(event.info.fieldName, event.arguments.createMilitaryVerificationInput);
        default:
            const errorMessage = `Unexpected field name: ${event.info.fieldName}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.MilitaryVerificationErrorType.UnexpectedError
            };
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9sYW1iZGEvbWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtEQVFtQztBQUNuQyx1R0FBMEY7QUFDMUYsNkdBQWdHO0FBQ2hHLG1IQUFzRztBQW9CdEc7Ozs7OztHQU1HO0FBQ0gsT0FBTyxDQUFDLE9BQU8sR0FBRyxLQUFLLEVBQUUsS0FBbUIsRUFBc0gsRUFBRTtJQUNoSyxPQUFPLENBQUMsR0FBRyxDQUFDLDZDQUE2QyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMscUJBQXFCLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNySSxRQUFRLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFO1FBQzFCLEtBQUssK0JBQStCO1lBQ2hDLE9BQU8sTUFBTSxJQUFBLHFFQUE2QixFQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsNEJBQTRCLENBQUMsQ0FBQztRQUNuSCxLQUFLLGtDQUFrQztZQUNuQyxPQUFPLE1BQU0sSUFBQSwyRUFBZ0MsRUFBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLCtCQUErQixDQUFDLENBQUM7UUFDekgsS0FBSyw0QkFBNEI7WUFDN0IsT0FBTyxNQUFNLElBQUEsK0RBQTBCLEVBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO1FBQ25IO1lBQ0ksTUFBTSxZQUFZLEdBQUcsMEJBQTBCLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDdEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUMxQixPQUFPO2dCQUNILFlBQVksRUFBRSxZQUFZO2dCQUMxQixTQUFTLEVBQUUsK0NBQTZCLENBQUMsZUFBZTthQUMzRCxDQUFDO0tBQ1Q7QUFDTCxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIENyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQsXG4gICAgQ3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25SZXNwb25zZSxcbiAgICBHZXRNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0LFxuICAgIEdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVzcG9uc2UsXG4gICAgTWlsaXRhcnlWZXJpZmljYXRpb25FcnJvclR5cGUsXG4gICAgVXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dCxcbiAgICBVcGRhdGVNaWxpdGFyeVZlcmlmaWNhdGlvblJlc3BvbnNlXG59IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5pbXBvcnQge2NyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9ufSBmcm9tIFwiLi9yZXNvbHZlcnMvQ3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25SZXNvbHZlclwiO1xuaW1wb3J0IHtnZXRNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c30gZnJvbSBcIi4vcmVzb2x2ZXJzL0dldE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzUmVzb2x2ZXJcIjtcbmltcG9ydCB7dXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXN9IGZyb20gXCIuL3Jlc29sdmVycy9VcGRhdGVNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1Jlc29sdmVyXCI7XG5cbi8qKlxuICogTWFwcGluZyBvdXQgdGhlIEFwcCBTeW5jIGV2ZW50IHR5cGUsIHNvIHdlIGNhbiB1c2UgaXQgYXMgYSB0eXBlIGluIHRoZSBMYW1iZGEgSGFuZGxlclxuICovXG50eXBlIEFwcFN5bmNFdmVudCA9IHtcbiAgICBpbmZvOiB7XG4gICAgICAgIGZpZWxkTmFtZTogc3RyaW5nXG4gICAgfSxcbiAgICBhcmd1bWVudHM6IHtcbiAgICAgICAgZ2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dDogR2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dCxcbiAgICAgICAgdXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dDogVXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dFxuICAgICAgICBjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0OiBDcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0XG4gICAgfSxcbiAgICBpZGVudGl0eToge1xuICAgICAgICBzdWIgOiBzdHJpbmc7XG4gICAgICAgIHVzZXJuYW1lIDogc3RyaW5nO1xuICAgIH1cbn1cblxuLyoqXG4gKiBMYW1iZGEgRnVuY3Rpb24gaGFuZGxlciwgaGFuZGxpbmcgaW5jb21pbmcgZXZlbnRzLFxuICogZGVwZW5kaW5nIG9uIHRoZSBBcHBTeW5jIGZpZWxkIG5hbWUuXG4gKlxuICogQHBhcmFtIGV2ZW50IEFwcFN5bmMgZXZlbnQgdG8gYmUgcGFzc2VkIGluIHRoZSBoYW5kbGVyXG4gKiBAcmV0dXJucyBhIHtAbGluayBQcm9taXNlfSBjb250YWluaW5nIGEge0BsaW5rIENyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVzcG9uc2V9IG9yIHtAbGluayBHZXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlc3BvbnNlfSBvciB7QGxpbmsgVXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25SZXNwb25zZX1cbiAqL1xuZXhwb3J0cy5oYW5kbGVyID0gYXN5bmMgKGV2ZW50OiBBcHBTeW5jRXZlbnQpOiBQcm9taXNlPENyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVzcG9uc2UgfCBHZXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlc3BvbnNlIHwgVXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25SZXNwb25zZT4gPT4ge1xuICAgIGNvbnNvbGUubG9nKGBSZWNlaXZlZCBuZXcgc3RvcmFnZSBldmVudCBmb3Igb3BlcmF0aW9uIFske2V2ZW50LmluZm8uZmllbGROYW1lfV0sIHdpdGggYXJndW1lbnRzICR7SlNPTi5zdHJpbmdpZnkoZXZlbnQuYXJndW1lbnRzKX1gKTtcbiAgICBzd2l0Y2ggKGV2ZW50LmluZm8uZmllbGROYW1lKSB7XG4gICAgICAgIGNhc2UgXCJnZXRNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1wiOlxuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IGdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzKGV2ZW50LmluZm8uZmllbGROYW1lLCBldmVudC5hcmd1bWVudHMuZ2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dCk7XG4gICAgICAgIGNhc2UgXCJ1cGRhdGVNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1wiOlxuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHVwZGF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzKGV2ZW50LmluZm8uZmllbGROYW1lLCBldmVudC5hcmd1bWVudHMudXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dCk7XG4gICAgICAgIGNhc2UgXCJjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvblwiOlxuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uKGV2ZW50LmluZm8uZmllbGROYW1lLCBldmVudC5hcmd1bWVudHMuY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dCk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBmaWVsZCBuYW1lOiAke2V2ZW50LmluZm8uZmllbGROYW1lfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE1pbGl0YXJ5VmVyaWZpY2F0aW9uRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgfTtcbiAgICB9XG59XG5cbiJdfQ==