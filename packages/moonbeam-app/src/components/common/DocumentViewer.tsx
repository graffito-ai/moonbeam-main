import React, {useEffect, useState} from 'react';
import WebView from 'react-native-webview';
// @ts-ignore
import HomeDashboardLogo from "../../../assets/login-logo.png";
import {Dimensions, View} from "react-native";
import {styles} from "../../styles/documentViewer.module";
import {Button, Modal, Portal, Text, IconButton} from "react-native-paper";
import {DocumentViewerRootProps} from "../../models/RootProps";
import {fetchFile} from '../../utils/File';
import {DocumentViewerDocumentCenterProps} from "../../models/DocumentsStackProps";
import {Spinner} from "../../common/Spinner";
import {SafeAreaView} from 'react-native-safe-area-context';
import * as Sharing from "expo-sharing";

/**
 * DocumentViewer component.
 */
export const DocumentViewer = ({route, navigation}: DocumentViewerDocumentCenterProps | DocumentViewerRootProps) => {
    // state driven key-value pairs for UI related elements
    const [isReady, setIsReady] = useState<boolean>(true);
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
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

        setIsReady(false);
        // retrieving the document link from either local cache, or from storage
        fetchFile(route.params.name, route.params.privacyFlag).then(([returnFlag, shareURI]) => {
            if (!returnFlag) {
                // show error modal, go back on dismiss
                setDocumentViewerErrorModalMessage(`${route.params.name}`);
                setDocumentViewerErrorModalVisible(true);
            }
            // setting the URI to be used in sharing the document.
            setDocumentShareURI(shareURI!);
            setIsReady(true);
        })
    }, [route, documentShareURI]);

    // return the component for the DocumentViewer component
    return (
        <>
            {
                !isReady ?
                    <Spinner loadingSpinnerShown={loadingSpinnerShown} setLoadingSpinnerShown={setLoadingSpinnerShown}/>
                    :
                    <SafeAreaView edges={['right', 'left']} style={{ flex: 1, backgroundColor: '#f2f2f2'}}>
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
                                <View style={styles.topBar}>
                                    <View style={styles.containerView}>
                                        <IconButton
                                            rippleColor={'#ecebeb'}
                                            icon="chevron-left"
                                            iconColor={"#2A3779"}
                                            size={Dimensions.get('window').height/30}
                                            style={styles.backButton}
                                            onPress={() => {
                                                route.params.setIsDrawerHeaderShown && route.params.setIsDrawerHeaderShown(true);
                                                navigation.goBack();
                                            }}
                                        />
                                        <IconButton
                                            rippleColor={'#ecebeb'}
                                            icon="file-download-outline"
                                            iconColor={"#2A3779"}
                                            size={Dimensions.get('window').height/30}
                                            style={styles.shareButton}
                                            onPress={async () => {
                                                // share the document
                                                await Sharing.shareAsync(documentShareURI!);
                                            }}
                                        />
                                    </View>
                                </View>
                                <WebView
                                    style={{backgroundColor: '#f2f2f2'}}
                                    scalesPageToFit={true}
                                    automaticallyAdjustContentInsets={true}
                                    startInLoadingState={true}
                                    source={{uri: `${documentShareURI!}`}}
                                    originWhitelist={['*']}
                                    bounce={false}
                                    scrollEnabled={true}
                                />
                            </>
                        }
                    </SafeAreaView>
            }
        </>
    );
};

