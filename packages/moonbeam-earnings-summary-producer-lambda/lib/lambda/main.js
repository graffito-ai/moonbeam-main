"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EarningsDailySummaryTrigger_1 = require("./handlers/EarningsDailySummaryTrigger");
/**
 * Lambda Function handler, handling incoming cron earnings summary events,
 * to be used to then trigger the earnings summary processing/creation process.
 *
 * @param event EventBridge cron-based event to be passed in the handler
 */
exports.handler = async (event) => {
    // information on the event bridge trigger event
    console.log(`Received new earnings daily summary schedule cron trigger event, through EventBridge, with event detail [${JSON.stringify(event["detail-type"])}] and event type [${event["detail"].eventType}]`);
    // handle the earnings daily summary triggered event
    switch (event["detail"].eventType) {
        case "EarningsDailySummaryEvent":
            await (0, EarningsDailySummaryTrigger_1.triggerEarningsDailySummariesCreation)();
            break;
        default:
            console.log(`Unknown event type received ${event["detail"].eventType}.\nUnable to trigger any earnings daily summary process!`);
            break;
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9sYW1iZGEvbWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHdGQUErRjtBQUUvRjs7Ozs7R0FLRztBQUNILE9BQU8sQ0FBQyxPQUFPLEdBQUcsS0FBSyxFQUFFLEtBQW9GLEVBQWlCLEVBQUU7SUFDNUgsZ0RBQWdEO0lBQ2hELE9BQU8sQ0FBQyxHQUFHLENBQUMsNEdBQTRHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDLHFCQUFxQixLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztJQUUvTSxvREFBb0Q7SUFDcEQsUUFBUSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxFQUFFO1FBQy9CLEtBQUssMkJBQTJCO1lBQzVCLE1BQU0sSUFBQSxtRUFBcUMsR0FBRSxDQUFDO1lBQzlDLE1BQU07UUFDVjtZQUNJLE9BQU8sQ0FBQyxHQUFHLENBQUMsK0JBQStCLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLDBEQUEwRCxDQUFDLENBQUM7WUFDaEksTUFBTTtLQUNiO0FBQ0wsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtFdmVudEJyaWRnZUV2ZW50fSBmcm9tIFwiYXdzLWxhbWJkYVwiO1xuaW1wb3J0IHsgdHJpZ2dlckVhcm5pbmdzRGFpbHlTdW1tYXJpZXNDcmVhdGlvbiB9IGZyb20gXCIuL2hhbmRsZXJzL0Vhcm5pbmdzRGFpbHlTdW1tYXJ5VHJpZ2dlclwiO1xuXG4vKipcbiAqIExhbWJkYSBGdW5jdGlvbiBoYW5kbGVyLCBoYW5kbGluZyBpbmNvbWluZyBjcm9uIGVhcm5pbmdzIHN1bW1hcnkgZXZlbnRzLFxuICogdG8gYmUgdXNlZCB0byB0aGVuIHRyaWdnZXIgdGhlIGVhcm5pbmdzIHN1bW1hcnkgcHJvY2Vzc2luZy9jcmVhdGlvbiBwcm9jZXNzLlxuICpcbiAqIEBwYXJhbSBldmVudCBFdmVudEJyaWRnZSBjcm9uLWJhc2VkIGV2ZW50IHRvIGJlIHBhc3NlZCBpbiB0aGUgaGFuZGxlclxuICovXG5leHBvcnRzLmhhbmRsZXIgPSBhc3luYyAoZXZlbnQ6IEV2ZW50QnJpZGdlRXZlbnQ8J1NjaGVkdWxlZCBFdmVudCcsIHtldmVudFR5cGU6ICdFYXJuaW5nc0RhaWx5U3VtbWFyeUV2ZW50J30+KTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgLy8gaW5mb3JtYXRpb24gb24gdGhlIGV2ZW50IGJyaWRnZSB0cmlnZ2VyIGV2ZW50XG4gICAgY29uc29sZS5sb2coYFJlY2VpdmVkIG5ldyBlYXJuaW5ncyBkYWlseSBzdW1tYXJ5IHNjaGVkdWxlIGNyb24gdHJpZ2dlciBldmVudCwgdGhyb3VnaCBFdmVudEJyaWRnZSwgd2l0aCBldmVudCBkZXRhaWwgWyR7SlNPTi5zdHJpbmdpZnkoZXZlbnRbXCJkZXRhaWwtdHlwZVwiXSl9XSBhbmQgZXZlbnQgdHlwZSBbJHtldmVudFtcImRldGFpbFwiXS5ldmVudFR5cGV9XWApO1xuXG4gICAgLy8gaGFuZGxlIHRoZSBlYXJuaW5ncyBkYWlseSBzdW1tYXJ5IHRyaWdnZXJlZCBldmVudFxuICAgIHN3aXRjaCAoZXZlbnRbXCJkZXRhaWxcIl0uZXZlbnRUeXBlKSB7XG4gICAgICAgIGNhc2UgXCJFYXJuaW5nc0RhaWx5U3VtbWFyeUV2ZW50XCI6XG4gICAgICAgICAgICBhd2FpdCB0cmlnZ2VyRWFybmluZ3NEYWlseVN1bW1hcmllc0NyZWF0aW9uKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBVbmtub3duIGV2ZW50IHR5cGUgcmVjZWl2ZWQgJHtldmVudFtcImRldGFpbFwiXS5ldmVudFR5cGV9LlxcblVuYWJsZSB0byB0cmlnZ2VyIGFueSBlYXJuaW5ncyBkYWlseSBzdW1tYXJ5IHByb2Nlc3MhYCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG59XG4iXX0=