import React, {useRef} from "react";
import {WebView} from "react-native-webview";
import queryString from "query-string";
import Constants from 'expo-constants';
import {LinkErrorCode, LinkErrorType, LinkExitMetadataStatus} from "react-native-plaid-link-sdk";

/**
 * Plaid Link component implement using webview
 */
export default function PlaidLink({linkToken, onEvent, onExit, onSuccess, oAuthUri}) {
    const injectedJavaScript = `(function() {
        window.postMessage = function(data) {
            window.ReactNativeWebView.postMessage(data);
        };
    })()`;

    // @ts-ignore
    let webviewRef = useRef();

    const handleNavigationStateChange = (event) => {
        if (event.url.startsWith("plaidlink://")) {
            const eventParams = queryString.parse(event.url.replace(/.*\?/, ""));

            const linkSessionId = eventParams.link_session_id;
            const mfaType = eventParams.mfa_type;
            const requestId = eventParams.request_id;
            const viewName = eventParams.view_name;
            const errorCode = eventParams.error_code;
            const errorMessage = eventParams.error_message;
            const errorType = eventParams.error_type;
            const exitStatus = eventParams.exist_status;
            const institutionId = eventParams.institution_id;
            const institutionName = eventParams.institution_name;
            const institutionSearchQuery = eventParams.institution_search_query;
            const timestamp = eventParams.timestamp;

            if (!linkToken) {
                console.warn("No link token provided.");
            }

            if (event.url.startsWith("plaidlink://event") && onEvent) {
                onEvent({
                    eventName: eventParams.event_name,
                    metadata: {
                        linkSessionId,
                        mfaType,
                        requestId,
                        viewName,
                        errorCode,
                        errorMessage,
                        errorType,
                        exitStatus,
                        institutionId,
                        institutionName,
                        institutionSearchQuery,
                        timestamp,
                    },
                });
            } else if (event.url.startsWith("plaidlink://exit") && onExit) {
                onExit({
                    error: {
                        // @ts-ignore
                        errorCode: LinkErrorCode[errorCode],
                        errorMessage: eventParams.error_message,
                        // @ts-ignore
                        errorType: LinkErrorType[errorType],
                    },
                    metadata: {
                        // @ts-ignore
                        status: LinkExitMetadataStatus[exitStatus],
                        institution: {
                            id: institutionId,
                            name: institutionName,
                        },
                        linkSessionId,
                        requestId,
                    },
                });
            } else if (event.url.startsWith("plaidlink://connected") && onSuccess) {
                const publicToken = eventParams.public_token;
                // @ts-ignore
                const accounts = JSON.parse(eventParams.accounts);
                onSuccess({
                    publicToken,
                    metadata: {
                        institution: {
                            id: institutionId,
                            name: institutionName,
                        },
                        accounts,
                        linkSessionId,
                    },
                });
            }
            return false;
        }
        return true;
    };

    return (
        <WebView
            useWebKit
            source={oAuthUri !== "" ? {
                    uri: `https://cdn.plaid.com/link/v2/stable/link.html?isWebview=true&token=${linkToken}&receivedRedirectUri=${encodeURIComponent(oAuthUri)}`,
                } :
                {
                    uri: `https://cdn.plaid.com/link/v2/stable/link.html?isWebview=true&token=${linkToken}`,
                }
            }
            style={{
                flex: 1,
                marginTop: Constants.statusBarHeight,
            }}
            // @ts-ignore
            ref={(ref) => (webviewRef = ref)}
            injectedJavaScript={injectedJavaScript}
            originWhitelist={['http://*', 'https://*', 'plaidlink://*']}
            onShouldStartLoadWithRequest={handleNavigationStateChange}
            onNavigationStateChange={handleNavigationStateChange}
            setSupportMultipleWindows={false}
            onError={() => {
                // @ts-ignore
                webViewRef.current.goBack();
            }}
        />
    );
}
