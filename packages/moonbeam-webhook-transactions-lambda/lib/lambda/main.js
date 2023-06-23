"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Lambda Function handler, handling incoming events,
 * depending on the type of http method and path, mapped by API Gateway.
 *
 * @param event APIGateway event to be passed in the handler
 * @returns a {@link Promise} containing a {@link APIGatewayProxyResult}
 */
exports.handler = async (event) => {
    console.log(`Received new storage event for operation [${event.httpMethod}] [${event.path}], with arguments ${JSON.stringify(event.body)}`);
    // return a dummy response for testing purposes
    return {
        statusCode: 200,
        body: JSON.stringify({
            data: 'hello world'
        })
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9sYW1iZGEvbWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBOzs7Ozs7R0FNRztBQUNILE9BQU8sQ0FBQyxPQUFPLEdBQUcsS0FBSyxFQUFFLEtBQTJCLEVBQWtDLEVBQUU7SUFDcEYsT0FBTyxDQUFDLEdBQUcsQ0FBQyw2Q0FBNkMsS0FBSyxDQUFDLFVBQVUsTUFBTSxLQUFLLENBQUMsSUFBSSxxQkFBcUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBRTVJLCtDQUErQztJQUMvQyxPQUFPO1FBQ0gsVUFBVSxFQUFFLEdBQUc7UUFDZixJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztZQUNqQixJQUFJLEVBQUUsYUFBYTtTQUN0QixDQUFDO0tBQ0wsQ0FBQTtBQUNMLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QVBJR2F0ZXdheVByb3h5RXZlbnQsIEFQSUdhdGV3YXlQcm94eVJlc3VsdH0gZnJvbSBcImF3cy1sYW1iZGEvdHJpZ2dlci9hcGktZ2F0ZXdheS1wcm94eVwiO1xuXG4vKipcbiAqIExhbWJkYSBGdW5jdGlvbiBoYW5kbGVyLCBoYW5kbGluZyBpbmNvbWluZyBldmVudHMsXG4gKiBkZXBlbmRpbmcgb24gdGhlIHR5cGUgb2YgaHR0cCBtZXRob2QgYW5kIHBhdGgsIG1hcHBlZCBieSBBUEkgR2F0ZXdheS5cbiAqXG4gKiBAcGFyYW0gZXZlbnQgQVBJR2F0ZXdheSBldmVudCB0byBiZSBwYXNzZWQgaW4gdGhlIGhhbmRsZXJcbiAqIEByZXR1cm5zIGEge0BsaW5rIFByb21pc2V9IGNvbnRhaW5pbmcgYSB7QGxpbmsgQVBJR2F0ZXdheVByb3h5UmVzdWx0fVxuICovXG5leHBvcnRzLmhhbmRsZXIgPSBhc3luYyAoZXZlbnQ6IEFQSUdhdGV3YXlQcm94eUV2ZW50KTogUHJvbWlzZTxBUElHYXRld2F5UHJveHlSZXN1bHQ+ID0+IHtcbiAgICBjb25zb2xlLmxvZyhgUmVjZWl2ZWQgbmV3IHN0b3JhZ2UgZXZlbnQgZm9yIG9wZXJhdGlvbiBbJHtldmVudC5odHRwTWV0aG9kfV0gWyR7ZXZlbnQucGF0aH1dLCB3aXRoIGFyZ3VtZW50cyAke0pTT04uc3RyaW5naWZ5KGV2ZW50LmJvZHkpfWApO1xuXG4gICAgLy8gcmV0dXJuIGEgZHVtbXkgcmVzcG9uc2UgZm9yIHRlc3RpbmcgcHVycG9zZXNcbiAgICByZXR1cm4ge1xuICAgICAgICBzdGF0dXNDb2RlOiAyMDAsXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgIGRhdGE6ICdoZWxsbyB3b3JsZCdcbiAgICAgICAgfSlcbiAgICB9XG59XG5cbiJdfQ==