"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const CreateDeviceResolver_1 = require("./resolvers/CreateDeviceResolver");
const GetDeviceResolver_1 = require("./resolvers/GetDeviceResolver");
const GetDevicesForUserResolver_1 = require("./resolvers/GetDevicesForUserResolver");
const UpdateDeviceResolver_1 = require("./resolvers/UpdateDeviceResolver");
const GetDeviceByTokenResolver_1 = require("./resolvers/GetDeviceByTokenResolver");
/**
 * Lambda Function handler, handling incoming events,
 * depending on the AppSync field name.
 *
 * @param event AppSync event to be passed in the handler
 * @returns a {@link Promise} containing a {@link UserDeviceResponse} or {@link UserDevicesResponse}
 */
exports.handler = async (event) => {
    console.log(`Received new physical device event for operation [${event.info.fieldName}], with arguments ${JSON.stringify(event.arguments)}`);
    switch (event.info.fieldName) {
        case "getDevice":
            return await (0, GetDeviceResolver_1.getDevice)(event.info.fieldName, event.arguments.getDeviceInput);
        case "getDeviceByToken":
            return await (0, GetDeviceByTokenResolver_1.getDeviceByToken)(event.info.fieldName, event.arguments.getDeviceByTokenInput);
        case "getDevicesForUser":
            return await (0, GetDevicesForUserResolver_1.getDevicesForUser)(event.info.fieldName, event.arguments.getDevicesForUserInput);
        case "createDevice":
            return await (0, CreateDeviceResolver_1.createDevice)(event.info.fieldName, event.arguments.createDeviceInput);
        case "updateDevice":
            return await (0, UpdateDeviceResolver_1.updateDevice)(event.info.fieldName, event.arguments.updateDeviceInput);
        default:
            const errorMessage = `Unexpected field name: ${event.info.fieldName}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.UserDeviceErrorType.UnexpectedError
            };
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9sYW1iZGEvbWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtEQU1tQztBQUNuQywyRUFBZ0U7QUFDaEUscUVBQTBEO0FBQzFELHFGQUEwRTtBQUMxRSwyRUFBOEQ7QUFDOUQsbUZBQXNFO0FBdUJ0RTs7Ozs7O0dBTUc7QUFDSCxPQUFPLENBQUMsT0FBTyxHQUFHLEtBQUssRUFBRSxLQUFtQixFQUFxRCxFQUFFO0lBQy9GLE9BQU8sQ0FBQyxHQUFHLENBQUMscURBQXFELEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxxQkFBcUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzdJLFFBQVEsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUU7UUFDMUIsS0FBSyxXQUFXO1lBQ1osT0FBTyxNQUFNLElBQUEsNkJBQVMsRUFBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ2pGLEtBQUssa0JBQWtCO1lBQ25CLE9BQU8sTUFBTSxJQUFBLDJDQUFnQixFQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUMvRixLQUFLLG1CQUFtQjtZQUNwQixPQUFPLE1BQU0sSUFBQSw2Q0FBaUIsRUFBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFDakcsS0FBSyxjQUFjO1lBQ2YsT0FBTyxNQUFNLElBQUEsbUNBQVksRUFBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDdkYsS0FBSyxjQUFjO1lBQ2YsT0FBTyxNQUFNLElBQUEsbUNBQVksRUFBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDdkY7WUFDSSxNQUFNLFlBQVksR0FBRywwQkFBMEIsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUN0RSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQzFCLE9BQU87Z0JBQ0gsWUFBWSxFQUFFLFlBQVk7Z0JBQzFCLFNBQVMsRUFBRSxxQ0FBbUIsQ0FBQyxlQUFlO2FBQ2pELENBQUM7S0FDVDtBQUNMLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gICAgQ3JlYXRlRGV2aWNlSW5wdXQsIEdldERldmljZUJ5VG9rZW5JbnB1dCwgR2V0RGV2aWNlc0ZvclVzZXJJbnB1dCwgVXBkYXRlRGV2aWNlSW5wdXQsXG4gICAgR2V0RGV2aWNlSW5wdXQsXG4gICAgVXNlckRldmljZUVycm9yVHlwZSxcbiAgICBVc2VyRGV2aWNlUmVzcG9uc2UsXG4gICAgVXNlckRldmljZXNSZXNwb25zZVxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuaW1wb3J0IHsgY3JlYXRlRGV2aWNlIH0gZnJvbSBcIi4vcmVzb2x2ZXJzL0NyZWF0ZURldmljZVJlc29sdmVyXCI7XG5pbXBvcnQgeyBnZXREZXZpY2UgfSBmcm9tIFwiLi9yZXNvbHZlcnMvR2V0RGV2aWNlUmVzb2x2ZXJcIjtcbmltcG9ydCB7IGdldERldmljZXNGb3JVc2VyIH0gZnJvbSBcIi4vcmVzb2x2ZXJzL0dldERldmljZXNGb3JVc2VyUmVzb2x2ZXJcIjtcbmltcG9ydCB7dXBkYXRlRGV2aWNlfSBmcm9tIFwiLi9yZXNvbHZlcnMvVXBkYXRlRGV2aWNlUmVzb2x2ZXJcIjtcbmltcG9ydCB7Z2V0RGV2aWNlQnlUb2tlbn0gZnJvbSBcIi4vcmVzb2x2ZXJzL0dldERldmljZUJ5VG9rZW5SZXNvbHZlclwiO1xuXG4vKipcbiAqIE1hcHBpbmcgb3V0IHRoZSBBcHAgU3luYyBldmVudCB0eXBlLCBzbyB3ZSBjYW4gdXNlIGl0IGFzIGEgdHlwZSBpbiB0aGUgTGFtYmRhIEhhbmRsZXJcbiAqL1xudHlwZSBBcHBTeW5jRXZlbnQgPSB7XG4gICAgaW5mbzoge1xuICAgICAgICBmaWVsZE5hbWU6IHN0cmluZ1xuICAgIH0sXG4gICAgYXJndW1lbnRzOiB7XG4gICAgICAgIGNyZWF0ZURldmljZUlucHV0OiBDcmVhdGVEZXZpY2VJbnB1dCxcbiAgICAgICAgdXBkYXRlRGV2aWNlSW5wdXQ6IFVwZGF0ZURldmljZUlucHV0LFxuICAgICAgICBnZXREZXZpY2VJbnB1dDogR2V0RGV2aWNlSW5wdXQsXG4gICAgICAgIGdldERldmljZUJ5VG9rZW5JbnB1dDogR2V0RGV2aWNlQnlUb2tlbklucHV0LFxuICAgICAgICBnZXREZXZpY2VzRm9yVXNlcklucHV0OiBHZXREZXZpY2VzRm9yVXNlcklucHV0XG4gICAgfSxcbiAgICBpZGVudGl0eToge1xuICAgICAgICBzdWI6IHN0cmluZztcbiAgICAgICAgdXNlcm5hbWU6IHN0cmluZztcbiAgICB9XG59XG5cblxuLyoqXG4gKiBMYW1iZGEgRnVuY3Rpb24gaGFuZGxlciwgaGFuZGxpbmcgaW5jb21pbmcgZXZlbnRzLFxuICogZGVwZW5kaW5nIG9uIHRoZSBBcHBTeW5jIGZpZWxkIG5hbWUuXG4gKlxuICogQHBhcmFtIGV2ZW50IEFwcFN5bmMgZXZlbnQgdG8gYmUgcGFzc2VkIGluIHRoZSBoYW5kbGVyXG4gKiBAcmV0dXJucyBhIHtAbGluayBQcm9taXNlfSBjb250YWluaW5nIGEge0BsaW5rIFVzZXJEZXZpY2VSZXNwb25zZX0gb3Ige0BsaW5rIFVzZXJEZXZpY2VzUmVzcG9uc2V9XG4gKi9cbmV4cG9ydHMuaGFuZGxlciA9IGFzeW5jIChldmVudDogQXBwU3luY0V2ZW50KTogUHJvbWlzZTxVc2VyRGV2aWNlUmVzcG9uc2UgfCBVc2VyRGV2aWNlc1Jlc3BvbnNlPiA9PiB7XG4gICAgY29uc29sZS5sb2coYFJlY2VpdmVkIG5ldyBwaHlzaWNhbCBkZXZpY2UgZXZlbnQgZm9yIG9wZXJhdGlvbiBbJHtldmVudC5pbmZvLmZpZWxkTmFtZX1dLCB3aXRoIGFyZ3VtZW50cyAke0pTT04uc3RyaW5naWZ5KGV2ZW50LmFyZ3VtZW50cyl9YCk7XG4gICAgc3dpdGNoIChldmVudC5pbmZvLmZpZWxkTmFtZSkge1xuICAgICAgICBjYXNlIFwiZ2V0RGV2aWNlXCI6XG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgZ2V0RGV2aWNlKGV2ZW50LmluZm8uZmllbGROYW1lLCBldmVudC5hcmd1bWVudHMuZ2V0RGV2aWNlSW5wdXQpO1xuICAgICAgICBjYXNlIFwiZ2V0RGV2aWNlQnlUb2tlblwiOlxuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IGdldERldmljZUJ5VG9rZW4oZXZlbnQuaW5mby5maWVsZE5hbWUsIGV2ZW50LmFyZ3VtZW50cy5nZXREZXZpY2VCeVRva2VuSW5wdXQpO1xuICAgICAgICBjYXNlIFwiZ2V0RGV2aWNlc0ZvclVzZXJcIjpcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCBnZXREZXZpY2VzRm9yVXNlcihldmVudC5pbmZvLmZpZWxkTmFtZSwgZXZlbnQuYXJndW1lbnRzLmdldERldmljZXNGb3JVc2VySW5wdXQpO1xuICAgICAgICBjYXNlIFwiY3JlYXRlRGV2aWNlXCI6XG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgY3JlYXRlRGV2aWNlKGV2ZW50LmluZm8uZmllbGROYW1lLCBldmVudC5hcmd1bWVudHMuY3JlYXRlRGV2aWNlSW5wdXQpO1xuICAgICAgICBjYXNlIFwidXBkYXRlRGV2aWNlXCI6XG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgdXBkYXRlRGV2aWNlKGV2ZW50LmluZm8uZmllbGROYW1lLCBldmVudC5hcmd1bWVudHMudXBkYXRlRGV2aWNlSW5wdXQpO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZmllbGQgbmFtZTogJHtldmVudC5pbmZvLmZpZWxkTmFtZX1gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBVc2VyRGV2aWNlRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgfTtcbiAgICB9XG59XG4iXX0=