import React, {useEffect, useState} from "react";
import {Dimensions, SafeAreaView, TouchableOpacity} from "react-native";
import WebView from "react-native-webview";
import {useRecoilState} from "recoil";
import {cardLinkingStatusState} from "../../../recoil/AuthAtom";
import {Modal, Portal, Text} from "react-native-paper";
import {commonStyles} from '../../../styles/common.module';

/**
 * CardLinkingStep component.
 */
export const CardLinkingStep = () => {
    // constants used to keep track of shared states
    const [modalVisible, setModalVisible] = useState<boolean>(false);

    // constants used to keep track of shared states
    const [, setCardLinkingStatus] = useRecoilState(cardLinkingStatusState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {

    }, []);

    /**
     * Function used to keep track of the card linking action executed inside
     * the card linking form.
     *
     * @param data data to be passed in from the webview form.
     */
    function onCardLinkAction(data) {
        const linkingData = JSON.parse(data.nativeEvent.data);

        // check to see if there were any errors during the card linking step
        if (!linkingData.data || linkingData.error || !linkingData.success) {
            // if there were errors, then display a modal prompting the user to retry linking their card
            console.log(`Error while linking card ${linkingData.error}`);
            setCardLinkingStatus(false);
            setModalVisible(true);
        } else {
            /**
             * If there are no errors to display, then retrieve the token and timestamp of their terms & conditions
             * acceptance, and call our internal card linking API to complete the linking process.
             */




        }
    }

    /**
     * Content of the Olive iFrame, used to display the card linking form.
     * More information can be found at {@link https://developer.oliveltd.com/docs/2-enroll-your-customer-in-olive-programs}
     */
    const oliveIframeContent =
        `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8" />
            <title></title>
            <meta content="width=width, initial-scale=1, maximum-scale=1" name="viewport"></meta>
        </head>
        <body>
            <div id="olive-sdk-container" style="height: ${Dimensions.get('window').height}px; width: ${Dimensions.get('window').width * 1.2}px"></div>
            <script>
                function callback(pmData, error, successFlag) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        data: pmData,
                        error: error,
                        success: successFlag 
                    }));
                }
            </script>
            <script type="application/javascript"
                    id="olive-link-card-form"
                    src="https://oliveaddcardsdkjs.blob.core.windows.net/script/olive-add-card-sdk.js"
                    data-public-key=Zlltp0W5jB09Us0kkOPN6edVwfy1JYGO
                    data-container-div="olive-sdk-container"
                    data-environment="sandbox"
                    data-auto-open=true>
            </script>
        </body>    
        </html>
        `;

    // return the component for the CardLinkinStep, part of the Registration page
    return (
        <>
            <Portal>
                <Modal dismissable={false} visible={modalVisible} onDismiss={() => setModalVisible(false)}
                       contentContainerStyle={[commonStyles.modalContainer, {borderColor: 'green'}]}>
                    <Text style={commonStyles.modalParagraph}>There was an error while linking your card!</Text>
                    <TouchableOpacity
                        style={commonStyles.modalButton}
                        onPress={() => {
                            setModalVisible(false);
                        }}
                    >
                        <Text style={commonStyles.modalButtonText}>Try again!</Text>
                    </TouchableOpacity>
                </Modal>
            </Portal>
            <SafeAreaView
                style={{flex: 1, backgroundColor: '#313030'}}>
                <WebView
                    onMessage={onCardLinkAction}
                    scrollEnabled={true}
                    originWhitelist={['*']}
                    source={{html: oliveIframeContent}}
                    style={{
                        right: Dimensions.get('window').width / 9,
                        backgroundColor: 'transparent',
                        height: Dimensions.get('window').height,
                        width: Dimensions.get('window').width * 1.2
                    }}
                    scalesPageToFit
                    setSupportMultipleWindows={false}
                    nestedScrollEnabled={true}
                    startInLoadingState={true}
                />
            </SafeAreaView>
        </>
    );
}
