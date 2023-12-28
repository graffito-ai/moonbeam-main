"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const CreateLogEventResolver_1 = require("./resolvers/CreateLogEventResolver");
/**
 * Lambda Function handler, handling incoming events,
 * depending on the AppSync field name.
 *
 * @param event AppSync even to be passed in the handler
 * @returns a {@link Promise} containing a {@link LoggingResponse}
 */
exports.handler = async (event) => {
    console.log(`Received new log event for operation [${event.info.fieldName}], with arguments ${JSON.stringify(event.arguments)}`);
    switch (event.info.fieldName) {
        case "createLogEvent":
            return await (0, CreateLogEventResolver_1.createLogEvent)(event.info.fieldName, event.arguments.createLogEventInput);
        default:
            const errorMessage = `Unexpected field name: ${event.info.fieldName}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.LoggingErrorType.UnexpectedError
            };
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9sYW1iZGEvbWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtEQUFpRztBQUNqRywrRUFBb0U7QUFrQnBFOzs7Ozs7R0FNRztBQUNILE9BQU8sQ0FBQyxPQUFPLEdBQUcsS0FBSyxFQUFFLEtBQW1CLEVBQTRCLEVBQUU7SUFDdEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5Q0FBeUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLHFCQUFxQixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDakksUUFBUSxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtRQUMxQixLQUFLLGdCQUFnQjtZQUNqQixPQUFPLE1BQU0sSUFBQSx1Q0FBYyxFQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUMzRjtZQUNJLE1BQU0sWUFBWSxHQUFHLDBCQUEwQixLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ3RFLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDMUIsT0FBTztnQkFDSCxZQUFZLEVBQUUsWUFBWTtnQkFDMUIsU0FBUyxFQUFFLGtDQUFnQixDQUFDLGVBQWU7YUFDOUMsQ0FBQztLQUNUO0FBQ0wsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDcmVhdGVMb2dFdmVudElucHV0LCBMb2dnaW5nRXJyb3JUeXBlLCBMb2dnaW5nUmVzcG9uc2V9IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5pbXBvcnQgeyBjcmVhdGVMb2dFdmVudCB9IGZyb20gXCIuL3Jlc29sdmVycy9DcmVhdGVMb2dFdmVudFJlc29sdmVyXCI7XG5cbi8qKlxuICogTWFwcGluZyBvdXQgdGhlIEFwcCBTeW5jIGV2ZW50IHR5cGUsIHNvIHdlIGNhbiB1c2UgaXQgYXMgYSB0eXBlIGluIHRoZSBMYW1iZGEgSGFuZGxlclxuICovXG50eXBlIEFwcFN5bmNFdmVudCA9IHtcbiAgICBpbmZvOiB7XG4gICAgICAgIGZpZWxkTmFtZTogc3RyaW5nXG4gICAgfSxcbiAgICBhcmd1bWVudHM6IHtcbiAgICAgICAgY3JlYXRlTG9nRXZlbnRJbnB1dDogQ3JlYXRlTG9nRXZlbnRJbnB1dFxuICAgIH0sXG4gICAgaWRlbnRpdHk6IHtcbiAgICAgICAgc3ViOiBzdHJpbmc7XG4gICAgICAgIHVzZXJuYW1lOiBzdHJpbmc7XG4gICAgfVxufVxuXG4vKipcbiAqIExhbWJkYSBGdW5jdGlvbiBoYW5kbGVyLCBoYW5kbGluZyBpbmNvbWluZyBldmVudHMsXG4gKiBkZXBlbmRpbmcgb24gdGhlIEFwcFN5bmMgZmllbGQgbmFtZS5cbiAqXG4gKiBAcGFyYW0gZXZlbnQgQXBwU3luYyBldmVuIHRvIGJlIHBhc3NlZCBpbiB0aGUgaGFuZGxlclxuICogQHJldHVybnMgYSB7QGxpbmsgUHJvbWlzZX0gY29udGFpbmluZyBhIHtAbGluayBMb2dnaW5nUmVzcG9uc2V9XG4gKi9cbmV4cG9ydHMuaGFuZGxlciA9IGFzeW5jIChldmVudDogQXBwU3luY0V2ZW50KTogUHJvbWlzZTxMb2dnaW5nUmVzcG9uc2U+ID0+IHtcbiAgICBjb25zb2xlLmxvZyhgUmVjZWl2ZWQgbmV3IGxvZyBldmVudCBmb3Igb3BlcmF0aW9uIFske2V2ZW50LmluZm8uZmllbGROYW1lfV0sIHdpdGggYXJndW1lbnRzICR7SlNPTi5zdHJpbmdpZnkoZXZlbnQuYXJndW1lbnRzKX1gKTtcbiAgICBzd2l0Y2ggKGV2ZW50LmluZm8uZmllbGROYW1lKSB7XG4gICAgICAgIGNhc2UgXCJjcmVhdGVMb2dFdmVudFwiOlxuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IGNyZWF0ZUxvZ0V2ZW50KGV2ZW50LmluZm8uZmllbGROYW1lLCBldmVudC5hcmd1bWVudHMuY3JlYXRlTG9nRXZlbnRJbnB1dCk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBmaWVsZCBuYW1lOiAke2V2ZW50LmluZm8uZmllbGROYW1lfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IExvZ2dpbmdFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICB9O1xuICAgIH1cbn1cblxuIl19