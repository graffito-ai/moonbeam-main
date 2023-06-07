import React from "react";
import {Dimensions} from "react-native";
import RenderHTML from "react-native-render-html";
import IframeRenderer from "@native-html/iframe-plugin";
import WebView from "react-native-webview";

/**
 * CardLinking component.
 */
export const CardLinking = () => {
    const renderers = {
        iframe: IframeRenderer,
    };

    let content =
        `
            <div id="olive-sdk-container" scrolling="no" style="width:520px; height:480px; overflow:hidden"></div>
            <script>
              function callback(pmData, error, successFlag) {
                var params = {
                  'token': pmData.token
                  };
                post('/addCard', params, 'post');
                }
            </script>
            <script id="olive-link-card-form"
              type="application/javascript" src="https://oliveaddcardsdkjs.blob.core.windows.net/script/olive-add-card-sdk.js"
              data-public-key="Zlltp0W5jB09Us0kkOPN6edVwfy1JYGO"
              data-container-div="olive-sdk-container"
              data-environment="sandbox"
              data-auto-open="true">
            </script>
        `;

    // return the component for the CardLinking, part of the Registration page
    return (
        <>
            <RenderHTML
                renderers={renderers}
                WebView={WebView}
                source={{
                    html: content,
                }}
                contentWidth={Dimensions.get("screen").width}
                defaultWebViewProps={{}}
                renderersProps={{
                    iframe: {
                        scalesPageToFit: true,
                        webViewProps: {
                            allowsFullScreen: true,
                        },
                    },
                }}
            />
        </>
    );
}
