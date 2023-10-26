"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const CreateNotificationReminderResolver_1 = require("./resolvers/CreateNotificationReminderResolver");
const GetNotificationReminderResolver_1 = require("./resolvers/GetNotificationReminderResolver");
const UpdateNotificationReminderResolver_1 = require("./resolvers/UpdateNotificationReminderResolver");
/**
 * Lambda Function handler, handling incoming events,
 * depending on the AppSync field name.
 *
 * @param event AppSync even to be passed in the handler
 * @returns a {@link Promise} containing a {@link NotificationReminderResponse}
 */
exports.handler = async (event) => {
    console.log(`Received new Notification Reminder event for operation [${event.info.fieldName}], with arguments ${JSON.stringify(event.arguments)}`);
    switch (event.info.fieldName) {
        case "getNotificationReminders":
            return await (0, GetNotificationReminderResolver_1.getNotificationReminders)(event.info.fieldName);
        case "createNotificationReminder":
            return await (0, CreateNotificationReminderResolver_1.createNotificationReminder)(event.info.fieldName, event.arguments.createNotificationReminderInput);
        case "updateNotificationReminder":
            return await (0, UpdateNotificationReminderResolver_1.updateNotificationReminder)(event.info.fieldName, event.arguments.updateNotificationReminderInput);
        default:
            const errorMessage = `Unexpected field name: ${event.info.fieldName}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.NotificationReminderErrorType.UnexpectedError
            };
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9sYW1iZGEvbWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtEQUltQztBQUNuQyx1R0FBMEY7QUFDMUYsaUdBQXFGO0FBQ3JGLHVHQUE0RjtBQW1CNUY7Ozs7OztHQU1HO0FBQ0gsT0FBTyxDQUFDLE9BQU8sR0FBRyxLQUFLLEVBQUUsS0FBbUIsRUFBeUMsRUFBRTtJQUNuRixPQUFPLENBQUMsR0FBRyxDQUFDLDJEQUEyRCxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMscUJBQXFCLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNuSixRQUFRLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFO1FBQzFCLEtBQUssMEJBQTBCO1lBQzNCLE9BQU8sTUFBTSxJQUFBLDBEQUF3QixFQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDaEUsS0FBSyw0QkFBNEI7WUFDN0IsT0FBTyxNQUFNLElBQUEsK0RBQTBCLEVBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO1FBQ25ILEtBQUssNEJBQTRCO1lBQzdCLE9BQU8sTUFBTSxJQUFBLCtEQUEwQixFQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsK0JBQStCLENBQUMsQ0FBQztRQUNuSDtZQUNJLE1BQU0sWUFBWSxHQUFHLDBCQUEwQixLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ3RFLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDMUIsT0FBTztnQkFDSCxZQUFZLEVBQUUsWUFBWTtnQkFDMUIsU0FBUyxFQUFFLCtDQUE2QixDQUFDLGVBQWU7YUFDM0QsQ0FBQztLQUNUO0FBQ0wsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBDcmVhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0LFxuICAgIE5vdGlmaWNhdGlvblJlbWluZGVyRXJyb3JUeXBlLFxuICAgIE5vdGlmaWNhdGlvblJlbWluZGVyUmVzcG9uc2UsIFVwZGF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXRcbn0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcbmltcG9ydCB7Y3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJ9IGZyb20gXCIuL3Jlc29sdmVycy9DcmVhdGVOb3RpZmljYXRpb25SZW1pbmRlclJlc29sdmVyXCI7XG5pbXBvcnQge2dldE5vdGlmaWNhdGlvblJlbWluZGVyc30gZnJvbSBcIi4vcmVzb2x2ZXJzL0dldE5vdGlmaWNhdGlvblJlbWluZGVyUmVzb2x2ZXJcIjtcbmltcG9ydCB7IHVwZGF0ZU5vdGlmaWNhdGlvblJlbWluZGVyIH0gZnJvbSBcIi4vcmVzb2x2ZXJzL1VwZGF0ZU5vdGlmaWNhdGlvblJlbWluZGVyUmVzb2x2ZXJcIjtcblxuLyoqXG4gKiBNYXBwaW5nIG91dCB0aGUgQXBwIFN5bmMgZXZlbnQgdHlwZSwgc28gd2UgY2FuIHVzZSBpdCBhcyBhIHR5cGUgaW4gdGhlIExhbWJkYSBIYW5kbGVyXG4gKi9cbnR5cGUgQXBwU3luY0V2ZW50ID0ge1xuICAgIGluZm86IHtcbiAgICAgICAgZmllbGROYW1lOiBzdHJpbmdcbiAgICB9LFxuICAgIGFyZ3VtZW50czoge1xuICAgICAgICBjcmVhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0OiBDcmVhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0XG4gICAgICAgIHVwZGF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQ6IFVwZGF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXRcbiAgICB9LFxuICAgIGlkZW50aXR5OiB7XG4gICAgICAgIHN1Yjogc3RyaW5nO1xuICAgICAgICB1c2VybmFtZTogc3RyaW5nO1xuICAgIH1cbn1cblxuLyoqXG4gKiBMYW1iZGEgRnVuY3Rpb24gaGFuZGxlciwgaGFuZGxpbmcgaW5jb21pbmcgZXZlbnRzLFxuICogZGVwZW5kaW5nIG9uIHRoZSBBcHBTeW5jIGZpZWxkIG5hbWUuXG4gKlxuICogQHBhcmFtIGV2ZW50IEFwcFN5bmMgZXZlbiB0byBiZSBwYXNzZWQgaW4gdGhlIGhhbmRsZXJcbiAqIEByZXR1cm5zIGEge0BsaW5rIFByb21pc2V9IGNvbnRhaW5pbmcgYSB7QGxpbmsgTm90aWZpY2F0aW9uUmVtaW5kZXJSZXNwb25zZX1cbiAqL1xuZXhwb3J0cy5oYW5kbGVyID0gYXN5bmMgKGV2ZW50OiBBcHBTeW5jRXZlbnQpOiBQcm9taXNlPE5vdGlmaWNhdGlvblJlbWluZGVyUmVzcG9uc2U+ID0+IHtcbiAgICBjb25zb2xlLmxvZyhgUmVjZWl2ZWQgbmV3IE5vdGlmaWNhdGlvbiBSZW1pbmRlciBldmVudCBmb3Igb3BlcmF0aW9uIFske2V2ZW50LmluZm8uZmllbGROYW1lfV0sIHdpdGggYXJndW1lbnRzICR7SlNPTi5zdHJpbmdpZnkoZXZlbnQuYXJndW1lbnRzKX1gKTtcbiAgICBzd2l0Y2ggKGV2ZW50LmluZm8uZmllbGROYW1lKSB7XG4gICAgICAgIGNhc2UgXCJnZXROb3RpZmljYXRpb25SZW1pbmRlcnNcIjpcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCBnZXROb3RpZmljYXRpb25SZW1pbmRlcnMoZXZlbnQuaW5mby5maWVsZE5hbWUpO1xuICAgICAgICBjYXNlIFwiY3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJcIjpcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCBjcmVhdGVOb3RpZmljYXRpb25SZW1pbmRlcihldmVudC5pbmZvLmZpZWxkTmFtZSwgZXZlbnQuYXJndW1lbnRzLmNyZWF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQpO1xuICAgICAgICBjYXNlIFwidXBkYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJcIjpcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCB1cGRhdGVOb3RpZmljYXRpb25SZW1pbmRlcihldmVudC5pbmZvLmZpZWxkTmFtZSwgZXZlbnQuYXJndW1lbnRzLnVwZGF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQpO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZmllbGQgbmFtZTogJHtldmVudC5pbmZvLmZpZWxkTmFtZX1gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25SZW1pbmRlckVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgIH07XG4gICAgfVxufVxuXG4iXX0=