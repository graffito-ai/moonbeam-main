"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const GetStorageResolver_1 = require("./resolvers/GetStorageResolver");
const PutMilitaryVerificationReportResolver_1 = require("./resolvers/PutMilitaryVerificationReportResolver");
const GetFilesForUserResolver_1 = require("./resolvers/GetFilesForUserResolver");
/**
 * Lambda Function handler, handling incoming events,
 * depending on the AppSync field name.
 *
 * @param event AppSync event to be passed in the handler
 * @returns a {@link Promise} containing a {@link StorageResponse}, {@link MilitaryVerificationReportResponse} or {@link FilesForUserResponse}
 */
exports.handler = async (event) => {
    console.log(`Received new storage event for operation [${event.info.fieldName}], with arguments ${JSON.stringify(event.arguments)}`);
    switch (event.info.fieldName) {
        case "getFilesForUser":
            return await (0, GetFilesForUserResolver_1.getFilesForUser)(event.info.fieldName, event.arguments.getFilesForUserInput);
        case "getStorage":
            return await (0, GetStorageResolver_1.getStorage)(event.info.fieldName, event.arguments.getStorageInput);
        case "putMilitaryVerificationReport":
            return await (0, PutMilitaryVerificationReportResolver_1.putMilitaryVerificationReport)(event.info.fieldName, event.arguments.putMilitaryVerificationReportInput);
        default:
            const errorMessage = `Unexpected field name: ${event.info.fieldName}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.StorageErrorType.UnexpectedError
            };
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9sYW1iZGEvbWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtEQVFtQztBQUNuQyx1RUFBMEQ7QUFDMUQsNkdBQWdHO0FBQ2hHLGlGQUFvRTtBQW9CcEU7Ozs7OztHQU1HO0FBQ0gsT0FBTyxDQUFDLE9BQU8sR0FBRyxLQUFLLEVBQUUsS0FBbUIsRUFBd0YsRUFBRTtJQUNsSSxPQUFPLENBQUMsR0FBRyxDQUFDLDZDQUE2QyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMscUJBQXFCLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNySSxRQUFRLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFO1FBQzFCLEtBQUssaUJBQWlCO1lBQ2xCLE9BQU8sTUFBTSxJQUFBLHlDQUFlLEVBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBQzdGLEtBQUssWUFBWTtZQUNiLE9BQU8sTUFBTSxJQUFBLCtCQUFVLEVBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUNuRixLQUFLLCtCQUErQjtZQUNoQyxPQUFPLE1BQU0sSUFBQSxxRUFBNkIsRUFBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7UUFDekg7WUFDSSxNQUFNLFlBQVksR0FBRywwQkFBMEIsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUN0RSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQzFCLE9BQU87Z0JBQ0gsWUFBWSxFQUFFLFlBQVk7Z0JBQzFCLFNBQVMsRUFBRSxrQ0FBZ0IsQ0FBQyxlQUFlO2FBQzlDLENBQUM7S0FDVDtBQUNMLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gICAgRmlsZXNGb3JVc2VyUmVzcG9uc2UsXG4gICAgR2V0RmlsZXNGb3JVc2VySW5wdXQsXG4gICAgR2V0U3RvcmFnZUlucHV0LFxuICAgIE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0UmVzcG9uc2UsXG4gICAgUHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRJbnB1dCxcbiAgICBTdG9yYWdlRXJyb3JUeXBlLFxuICAgIFN0b3JhZ2VSZXNwb25zZVxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuaW1wb3J0IHtnZXRTdG9yYWdlfSBmcm9tIFwiLi9yZXNvbHZlcnMvR2V0U3RvcmFnZVJlc29sdmVyXCI7XG5pbXBvcnQge3B1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0fSBmcm9tIFwiLi9yZXNvbHZlcnMvUHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRSZXNvbHZlclwiO1xuaW1wb3J0IHtnZXRGaWxlc0ZvclVzZXJ9IGZyb20gXCIuL3Jlc29sdmVycy9HZXRGaWxlc0ZvclVzZXJSZXNvbHZlclwiO1xuXG4vKipcbiAqIE1hcHBpbmcgb3V0IHRoZSBBcHAgU3luYyBldmVudCB0eXBlLCBzbyB3ZSBjYW4gdXNlIGl0IGFzIGEgdHlwZSBpbiB0aGUgTGFtYmRhIEhhbmRsZXJcbiAqL1xudHlwZSBBcHBTeW5jRXZlbnQgPSB7XG4gICAgaW5mbzoge1xuICAgICAgICBmaWVsZE5hbWU6IHN0cmluZ1xuICAgIH0sXG4gICAgYXJndW1lbnRzOiB7XG4gICAgICAgIGdldFN0b3JhZ2VJbnB1dDogR2V0U3RvcmFnZUlucHV0LFxuICAgICAgICBnZXRGaWxlc0ZvclVzZXJJbnB1dDogR2V0RmlsZXNGb3JVc2VySW5wdXQsXG4gICAgICAgIHB1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0SW5wdXQ6IFB1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0SW5wdXRcbiAgICB9LFxuICAgIGlkZW50aXR5OiB7XG4gICAgICAgIHN1Yjogc3RyaW5nO1xuICAgICAgICB1c2VybmFtZTogc3RyaW5nO1xuICAgIH1cbn1cblxuLyoqXG4gKiBMYW1iZGEgRnVuY3Rpb24gaGFuZGxlciwgaGFuZGxpbmcgaW5jb21pbmcgZXZlbnRzLFxuICogZGVwZW5kaW5nIG9uIHRoZSBBcHBTeW5jIGZpZWxkIG5hbWUuXG4gKlxuICogQHBhcmFtIGV2ZW50IEFwcFN5bmMgZXZlbnQgdG8gYmUgcGFzc2VkIGluIHRoZSBoYW5kbGVyXG4gKiBAcmV0dXJucyBhIHtAbGluayBQcm9taXNlfSBjb250YWluaW5nIGEge0BsaW5rIFN0b3JhZ2VSZXNwb25zZX0sIHtAbGluayBNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydFJlc3BvbnNlfSBvciB7QGxpbmsgRmlsZXNGb3JVc2VyUmVzcG9uc2V9XG4gKi9cbmV4cG9ydHMuaGFuZGxlciA9IGFzeW5jIChldmVudDogQXBwU3luY0V2ZW50KTogUHJvbWlzZTxTdG9yYWdlUmVzcG9uc2UgfCBNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydFJlc3BvbnNlIHwgRmlsZXNGb3JVc2VyUmVzcG9uc2U+ID0+IHtcbiAgICBjb25zb2xlLmxvZyhgUmVjZWl2ZWQgbmV3IHN0b3JhZ2UgZXZlbnQgZm9yIG9wZXJhdGlvbiBbJHtldmVudC5pbmZvLmZpZWxkTmFtZX1dLCB3aXRoIGFyZ3VtZW50cyAke0pTT04uc3RyaW5naWZ5KGV2ZW50LmFyZ3VtZW50cyl9YCk7XG4gICAgc3dpdGNoIChldmVudC5pbmZvLmZpZWxkTmFtZSkge1xuICAgICAgICBjYXNlIFwiZ2V0RmlsZXNGb3JVc2VyXCI6XG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgZ2V0RmlsZXNGb3JVc2VyKGV2ZW50LmluZm8uZmllbGROYW1lLCBldmVudC5hcmd1bWVudHMuZ2V0RmlsZXNGb3JVc2VySW5wdXQpO1xuICAgICAgICBjYXNlIFwiZ2V0U3RvcmFnZVwiOlxuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IGdldFN0b3JhZ2UoZXZlbnQuaW5mby5maWVsZE5hbWUsIGV2ZW50LmFyZ3VtZW50cy5nZXRTdG9yYWdlSW5wdXQpO1xuICAgICAgICBjYXNlIFwicHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRcIjpcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCBwdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydChldmVudC5pbmZvLmZpZWxkTmFtZSwgZXZlbnQuYXJndW1lbnRzLnB1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0SW5wdXQpO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZmllbGQgbmFtZTogJHtldmVudC5pbmZvLmZpZWxkTmFtZX1gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBTdG9yYWdlRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgfTtcbiAgICB9XG59XG5cbiJdfQ==