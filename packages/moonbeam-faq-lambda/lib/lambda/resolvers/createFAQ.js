"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFAQ = void 0;
const AWS = __importStar(require("aws-sdk"));
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * CreateFAQ resolver
 *
 * @param createFaqInput object to be used when creating a new FAQ object
 * @returns {@link Promise} of {@link FaqResponse}
 */
const createFAQ = async (createFaqInput) => {
    try {
        // initializing the DynamoDB document client
        const docClient = new AWS.DynamoDB.DocumentClient();
    }
    catch (err) {
        console.log(`Unexpected error while executing createFAQ mutation {}`, err);
        return {
            errorMessage: `Unexpected error while executing createFAQ mutation ${err}`,
            errorType: moonbeam_models_1.FaqErrorType.UnexpectedError
        };
    }
};
exports.createFAQ = createFAQ;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlRkFRLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvY3JlYXRlRkFRLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNkNBQStCO0FBQy9CLCtEQUFvRjtBQUVwRjs7Ozs7R0FLRztBQUNJLE1BQU0sU0FBUyxHQUFHLEtBQUssRUFBRSxjQUE4QixFQUF3QixFQUFFO0lBQ3BGLElBQUk7UUFDQSw0Q0FBNEM7UUFDNUMsTUFBTSxTQUFTLEdBQUcsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDO0tBS3ZEO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVixPQUFPLENBQUMsR0FBRyxDQUFDLHdEQUF3RCxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzNFLE9BQU87WUFDSCxZQUFZLEVBQUUsdURBQXVELEdBQUcsRUFBRTtZQUMxRSxTQUFTLEVBQUUsOEJBQVksQ0FBQyxlQUFlO1NBQzFDLENBQUM7S0FDTDtBQUNMLENBQUMsQ0FBQTtBQWZZLFFBQUEsU0FBUyxhQWVyQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIEFXUyBmcm9tICdhd3Mtc2RrJztcbmltcG9ydCB7Q3JlYXRlRmFxSW5wdXQsIEZhcUVycm9yVHlwZSwgRmFxUmVzcG9uc2V9IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5cbi8qKlxuICogQ3JlYXRlRkFRIHJlc29sdmVyXG4gKlxuICogQHBhcmFtIGNyZWF0ZUZhcUlucHV0IG9iamVjdCB0byBiZSB1c2VkIHdoZW4gY3JlYXRpbmcgYSBuZXcgRkFRIG9iamVjdFxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBGYXFSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGNyZWF0ZUZBUSA9IGFzeW5jIChjcmVhdGVGYXFJbnB1dDogQ3JlYXRlRmFxSW5wdXQpOiBQcm9taXNlPEZhcVJlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gaW5pdGlhbGl6aW5nIHRoZSBEeW5hbW9EQiBkb2N1bWVudCBjbGllbnRcbiAgICAgICAgY29uc3QgZG9jQ2xpZW50ID0gbmV3IEFXUy5EeW5hbW9EQi5Eb2N1bWVudENsaWVudCgpO1xuXG5cblxuXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyBjcmVhdGVGQVEgbXV0YXRpb24ge31gLCBlcnIpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgY3JlYXRlRkFRIG11dGF0aW9uICR7ZXJyfWAsXG4gICAgICAgICAgICBlcnJvclR5cGU6IEZhcUVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfTtcbiAgICB9XG59XG4iXX0=