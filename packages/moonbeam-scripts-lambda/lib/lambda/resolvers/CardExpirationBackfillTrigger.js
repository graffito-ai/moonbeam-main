"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerCardExpirationBackFill = void 0;
/**
 * Function used to handle the back-fill of the all the cards'
 * expiration dates.
 *
 * @returns a {@link Promise} of {@link void}, since the EventBridger
 * event trigger, will execute a cron job and not return anything.
 */
const triggerCardExpirationBackFill = async () => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        /**
         * The overall card expiration data back-fill cron triggering, will be made up of the following steps:
         *
         * 1) Call the
         *
         */
    }
    catch (error) {
        /**
         * no need for further actions, since this error will be logged and nothing will execute further.
         * in the future we might need some alerts and metrics emitting here
         */
        console.log(`Unexpected error while processing the card expiration back-fill cron event ${error}`);
    }
};
exports.triggerCardExpirationBackFill = triggerCardExpirationBackFill;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FyZEV4cGlyYXRpb25CYWNrZmlsbFRyaWdnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL3Jlc29sdmVycy9DYXJkRXhwaXJhdGlvbkJhY2tmaWxsVHJpZ2dlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQTs7Ozs7O0dBTUc7QUFDSSxNQUFNLDZCQUE2QixHQUFHLEtBQUssSUFBbUIsRUFBRTtJQUNuRSxJQUFJO1FBQ0EseUNBQXlDO1FBQ3pDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVyxDQUFDO1FBRXZDOzs7OztXQUtHO0tBRU47SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNaOzs7V0FHRztRQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsOEVBQThFLEtBQUssRUFBRSxDQUFDLENBQUM7S0FDdEc7QUFDTCxDQUFDLENBQUE7QUFuQlksUUFBQSw2QkFBNkIsaUNBbUJ6QyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogRnVuY3Rpb24gdXNlZCB0byBoYW5kbGUgdGhlIGJhY2stZmlsbCBvZiB0aGUgYWxsIHRoZSBjYXJkcydcbiAqIGV4cGlyYXRpb24gZGF0ZXMuXG4gKlxuICogQHJldHVybnMgYSB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIHZvaWR9LCBzaW5jZSB0aGUgRXZlbnRCcmlkZ2VyXG4gKiBldmVudCB0cmlnZ2VyLCB3aWxsIGV4ZWN1dGUgYSBjcm9uIGpvYiBhbmQgbm90IHJldHVybiBhbnl0aGluZy5cbiAqL1xuZXhwb3J0IGNvbnN0IHRyaWdnZXJDYXJkRXhwaXJhdGlvbkJhY2tGaWxsID0gYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgb3ZlcmFsbCBjYXJkIGV4cGlyYXRpb24gZGF0YSBiYWNrLWZpbGwgY3JvbiB0cmlnZ2VyaW5nLCB3aWxsIGJlIG1hZGUgdXAgb2YgdGhlIGZvbGxvd2luZyBzdGVwczpcbiAgICAgICAgICpcbiAgICAgICAgICogMSkgQ2FsbCB0aGVcbiAgICAgICAgICpcbiAgICAgICAgICovXG5cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAvKipcbiAgICAgICAgICogbm8gbmVlZCBmb3IgZnVydGhlciBhY3Rpb25zLCBzaW5jZSB0aGlzIGVycm9yIHdpbGwgYmUgbG9nZ2VkIGFuZCBub3RoaW5nIHdpbGwgZXhlY3V0ZSBmdXJ0aGVyLlxuICAgICAgICAgKiBpbiB0aGUgZnV0dXJlIHdlIG1pZ2h0IG5lZWQgc29tZSBhbGVydHMgYW5kIG1ldHJpY3MgZW1pdHRpbmcgaGVyZVxuICAgICAgICAgKi9cbiAgICAgICAgY29uc29sZS5sb2coYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgcHJvY2Vzc2luZyB0aGUgY2FyZCBleHBpcmF0aW9uIGJhY2stZmlsbCBjcm9uIGV2ZW50ICR7ZXJyb3J9YCk7XG4gICAgfVxufVxuIl19