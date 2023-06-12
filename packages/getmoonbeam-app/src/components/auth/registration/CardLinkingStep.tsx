import React, {useEffect, useState} from "react";
import {SafeAreaView, StyleSheet, TouchableOpacity} from "react-native";
import WebView from "react-native-webview";
import {useRecoilState} from "recoil";
import {cardLinkingStatusState} from "../../../recoil/AuthAtom";
import {Modal, Portal, Text} from "react-native-paper";
import {commonStyles} from '../../../styles/common.module';
import {styles} from '../../../styles/registration.module';

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

        console.log(JSON.stringify(linkingData));

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
     * More information can be found at {@link https://developer.oliveltd.com/docs/2-enroll-your-customer-in-olive-programs}.
     *
     * We use a custom script, which wraps the script mentioned in their documentation,
     * and we store it in S3 to make Olive's IFrame more UI/UX friendly.
     */
    const oliveIframeContent =
        `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="utf-8" />
            <title></title>
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0')">
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        </head>
        <body>
                <div id="olive-sdk-container" 
                     style="display: grid;
                            grid-template-columns: repeat(auto-fill, calc(100vw*0.50));
                            grid-template-rows: repeat(auto-fit, calc(100vh));
                     "
                 />
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
                        src="https://moonbeam-public-files-bucket-dev-us-west-2.s3.us-west-2.amazonaws.com/customized-moonbeam-olive-script.js"
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
                       contentContainerStyle={commonStyles.modalContainer}>
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
                style={[StyleSheet.absoluteFill, styles.cardLinkingParentView]}>
                <WebView
                    onMessage={onCardLinkAction}
                    scrollEnabled={false}
                    originWhitelist={['*']}
                    source={{html: oliveIframeContent}}
                    style={styles.cardLinkingIframeView}
                    scalesPageToFit={true}
                    setSupportMultipleWindows={false}
                    nestedScrollEnabled={true}
                    startInLoadingState={true}
                />
            </SafeAreaView>
        </>
    );
}
