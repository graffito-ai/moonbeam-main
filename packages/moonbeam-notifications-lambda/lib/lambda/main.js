"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const CreateNotificationResolver_1 = require("./resolvers/CreateNotificationResolver");
/**
 * Lambda Function handler, handling incoming events,
 * depending on the AppSync field name.
 *
 * @param event AppSync event to be passed in the handler
 * @returns a {@link Promise} containing a {@link CreateNotificationResponse}
 */
exports.handler = async (event) => {
    console.log(`Received new notification event for operation [${event.info.fieldName}], with arguments ${JSON.stringify(event.arguments)}`);
    switch (event.info.fieldName) {
        case "createNotification":
            return await (0, CreateNotificationResolver_1.createNotification)(event.info.fieldName, event.arguments.createNotificationInput);
        default:
            const errorMessage = `Unexpected field name: ${event.info.fieldName}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.NotificationsErrorType.UnexpectedError
            };
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9sYW1iZGEvbWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtEQUFzSDtBQUN0SCx1RkFBMEU7QUFrQjFFOzs7Ozs7R0FNRztBQUNILE9BQU8sQ0FBQyxPQUFPLEdBQUcsS0FBSyxFQUFFLEtBQW1CLEVBQXVDLEVBQUU7SUFDakYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrREFBa0QsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLHFCQUFxQixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDMUksUUFBUSxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtRQUMxQixLQUFLLG9CQUFvQjtZQUNyQixPQUFPLE1BQU0sSUFBQSwrQ0FBa0IsRUFBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLHVCQUF1QixDQUFDLENBQUM7UUFDbkc7WUFDSSxNQUFNLFlBQVksR0FBRywwQkFBMEIsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUN0RSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQzFCLE9BQU87Z0JBQ0gsWUFBWSxFQUFFLFlBQVk7Z0JBQzFCLFNBQVMsRUFBRSx3Q0FBc0IsQ0FBQyxlQUFlO2FBQ3BELENBQUM7S0FDVDtBQUNMLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q3JlYXRlTm90aWZpY2F0aW9uSW5wdXQsIENyZWF0ZU5vdGlmaWNhdGlvblJlc3BvbnNlLCBOb3RpZmljYXRpb25zRXJyb3JUeXBlfSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuaW1wb3J0IHtjcmVhdGVOb3RpZmljYXRpb259IGZyb20gXCIuL3Jlc29sdmVycy9DcmVhdGVOb3RpZmljYXRpb25SZXNvbHZlclwiO1xuXG4vKipcbiAqIE1hcHBpbmcgb3V0IHRoZSBBcHAgU3luYyBldmVudCB0eXBlLCBzbyB3ZSBjYW4gdXNlIGl0IGFzIGEgdHlwZSBpbiB0aGUgTGFtYmRhIEhhbmRsZXJcbiAqL1xudHlwZSBBcHBTeW5jRXZlbnQgPSB7XG4gICAgaW5mbzoge1xuICAgICAgICBmaWVsZE5hbWU6IHN0cmluZ1xuICAgIH0sXG4gICAgYXJndW1lbnRzOiB7XG4gICAgICAgIGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0OiBDcmVhdGVOb3RpZmljYXRpb25JbnB1dFxuICAgIH0sXG4gICAgaWRlbnRpdHk6IHtcbiAgICAgICAgc3ViOiBzdHJpbmc7XG4gICAgICAgIHVzZXJuYW1lOiBzdHJpbmc7XG4gICAgfVxufVxuXG4vKipcbiAqIExhbWJkYSBGdW5jdGlvbiBoYW5kbGVyLCBoYW5kbGluZyBpbmNvbWluZyBldmVudHMsXG4gKiBkZXBlbmRpbmcgb24gdGhlIEFwcFN5bmMgZmllbGQgbmFtZS5cbiAqXG4gKiBAcGFyYW0gZXZlbnQgQXBwU3luYyBldmVudCB0byBiZSBwYXNzZWQgaW4gdGhlIGhhbmRsZXJcbiAqIEByZXR1cm5zIGEge0BsaW5rIFByb21pc2V9IGNvbnRhaW5pbmcgYSB7QGxpbmsgQ3JlYXRlTm90aWZpY2F0aW9uUmVzcG9uc2V9XG4gKi9cbmV4cG9ydHMuaGFuZGxlciA9IGFzeW5jIChldmVudDogQXBwU3luY0V2ZW50KTogUHJvbWlzZTxDcmVhdGVOb3RpZmljYXRpb25SZXNwb25zZT4gPT4ge1xuICAgIGNvbnNvbGUubG9nKGBSZWNlaXZlZCBuZXcgbm90aWZpY2F0aW9uIGV2ZW50IGZvciBvcGVyYXRpb24gWyR7ZXZlbnQuaW5mby5maWVsZE5hbWV9XSwgd2l0aCBhcmd1bWVudHMgJHtKU09OLnN0cmluZ2lmeShldmVudC5hcmd1bWVudHMpfWApO1xuICAgIHN3aXRjaCAoZXZlbnQuaW5mby5maWVsZE5hbWUpIHtcbiAgICAgICAgY2FzZSBcImNyZWF0ZU5vdGlmaWNhdGlvblwiOlxuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IGNyZWF0ZU5vdGlmaWNhdGlvbihldmVudC5pbmZvLmZpZWxkTmFtZSwgZXZlbnQuYXJndW1lbnRzLmNyZWF0ZU5vdGlmaWNhdGlvbklucHV0KTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGZpZWxkIG5hbWU6ICR7ZXZlbnQuaW5mby5maWVsZE5hbWV9YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgIH07XG4gICAgfVxufVxuXG4iXX0=