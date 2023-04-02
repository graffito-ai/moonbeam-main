import React, {useEffect, useState} from 'react';
import WebView from 'react-native-webview';
// @ts-ignore
import HomeDashboardLogo from "../../../assets/login-logo.png";
import {Dimensions, SafeAreaView, View} from "react-native";
import {styles} from "../../styles/documentViewer.module";
import {Button, Divider, Modal, Portal, Text} from "react-native-paper";
import {commonStyles} from "../../styles/common.module";
import * as Sharing from "expo-sharing";
import {DocumentViewerRootProps} from "../../models/RootProps";
import {fetchFile} from '../../utils/File';
import {DocumentViewerDocumentCenterProps} from "../../models/DocumentsStackProps";

/**
 * DocumentViewer component.
 */
export const DocumentViewer = ({route, navigation}: DocumentViewerDocumentCenterProps | DocumentViewerRootProps) => {
    // state driven key-value pairs for UI related elements
    const [documentViewerErrorModalVisible, setDocumentViewerErrorModalVisible] = useState<boolean>(false);
    const [documentViewerErrorModalMessage, setDocumentViewerErrorModalMessage] = useState<string>('');

    // state driven key-value pairs for any specific data values
    const [documentShareURI, setDocumentShareURI] = useState<string>('');

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        route.params.setIsDrawerHeaderShown && route.params.setIsDrawerHeaderShown(false);

        // retrieving the document link from either local cache, or from storage
        fetchFile(route.params.name, route.params.privacyFlag).then(([returnFlag, shareURI]) => {
            if (!returnFlag) {
                // show error modal, go back on dismiss
                setDocumentViewerErrorModalMessage(`${route.params.name}`);
                setDocumentViewerErrorModalVisible(true);
            }
            // setting the URI to be used in sharing the document.
            setDocumentShareURI(shareURI!);
        })
    }, [route, documentShareURI]);

    // return the component for the DocumentViewer component
    return (
        <SafeAreaView style={{flex: 1}}>
            <Portal>
                <Modal dismissable={false} visible={documentViewerErrorModalVisible}
                       onDismiss={() => setDocumentViewerErrorModalVisible(false)}
                       contentContainerStyle={styles.modalContainer}>
                    <Text style={styles.modalParagraph}>Unable to
                        retrieve {documentViewerErrorModalMessage} document!</Text>
                    <Button
                        uppercase={false}
                        style={styles.modalButton}
                        icon={'redo-variant'}
                        textColor={"red"}
                        buttonColor={"#f2f2f2"}
                        mode="outlined"
                        labelStyle={{fontSize: 15}}
                        onPress={() => {
                            setDocumentViewerErrorModalVisible(false);
                            navigation.goBack();
                        }}>
                        Dismiss
                    </Button>
                </Modal>
            </Portal>
            {documentShareURI &&
                <>
                    <WebView
                        style={{flex: 1, backgroundColor: '#f2f2f2'}}
                        startInLoadingState={true}
                        containerStyle={{
                            flex: 1,
                            width: Dimensions.get('window').width,
                            height: Dimensions.get('window').height
                        }}
                        originWhitelist={['*']}
                        source={{uri: `${documentShareURI!}`}}
                        bounce={false}
                        scrollEnabled={false}
                    />
                </>
            }
            <View style={styles.bottomView}>
                <Divider style={[commonStyles.divider, {width: Dimensions.get('window').width}]}/>
                <Button
                    onPress={async () => {
                        // share the document
                        await Sharing.shareAsync(documentShareURI!);
                    }}
                    uppercase={false}
                    style={styles.shareButton}
                    textColor={"#f2f2f2"}
                    buttonColor={"#2A3779"}
                    mode="outlined"
                    labelStyle={{fontSize: 18}}
                    icon={"download"}>
                    Share
                </Button>
            </View>
        </SafeAreaView>
    );
};

