import React, {useEffect, useState} from 'react';
import WebView from 'react-native-webview';
// @ts-ignore
import HomeDashboardLogo from "../../../assets/login-logo.png";
import {Platform, View} from "react-native";
import {styles} from "../../styles/documentViewer.module";
import {Dialog, IconButton, Portal, Text} from "react-native-paper";
import {fetchFile} from '../../utils/File';
import {Spinner} from "./Spinner";
import {SafeAreaView} from 'react-native-safe-area-context';
import * as Sharing from "expo-sharing";
import {DocumentsViewerProps} from "../../models/props/DocumentsProps";
import {commonStyles} from "../../styles/common.module";
import {Button} from '@rneui/base';
import {useRecoilState} from "recoil";
import {appDrawerHeaderShownState, drawerSwipeState} from "../../recoil/AppDrawerAtom";
import {AuthenticationDocumentsViewerProps} from "../../models/props/AuthenticationProps";
import {AppDrawerDocumentsViewerProps} from "../../models/props/AppDrawerProps";
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';

/**
 * DocumentsViewer component.
 *
 * @param route route object to be passed in from the parent navigator.
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component
 */
export const DocumentsViewer = ({
                                    route,
                                    navigation
                                }: DocumentsViewerProps | AuthenticationDocumentsViewerProps | AppDrawerDocumentsViewerProps) => {
    // constants used to keep track of local component state
    const [isReady, setIsReady] = useState<boolean>(false);
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    const [documentViewerErrorModalVisible, setDocumentViewerErrorModalVisible] = useState<boolean>(false);
    const [documentViewerErrorModalMessage, setDocumentViewerErrorModalMessage] = useState<string>('');
    // constants used to keep track of shared states
    const [, setDrawerHeaderShown] = useRecoilState(appDrawerHeaderShownState);
    const [, setDrawerSwipeEnabled] = useRecoilState(drawerSwipeState);

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
        // disable the drawer swipe
        setDrawerSwipeEnabled(false);

        // hide the drawer header
        setDrawerHeaderShown(false);

        // retrieving the document link from either local cache, or from storage
        // @ts-ignore
        documentShareURI === '' && fetchFile(route.params.name, route.params.privacyFlag, false, true).then(([returnFlag, shareURI]) => {
            if (!returnFlag) {
                // show error modal, go back on dismiss
                setDocumentViewerErrorModalMessage(`${route.params.name}`);
                setDocumentViewerErrorModalVisible(true);
            }
            // setting the URI to be used in sharing the document.
            shareURI !== null && setDocumentShareURI(shareURI!);
            setIsReady(true);
        });
    }, [documentShareURI]);

    // return the component for the DocumentViewer component
    return (
        <>
            {
                !isReady ?
                    <Spinner loadingSpinnerShown={loadingSpinnerShown} setLoadingSpinnerShown={setLoadingSpinnerShown}/>
                    :
                    <SafeAreaView edges={['right', 'left']} style={{flex: 1, backgroundColor: '#313030'}}>
                        <Portal>
                            <Dialog style={commonStyles.dialogStyle} visible={documentViewerErrorModalVisible}
                                    onDismiss={() => setDocumentViewerErrorModalVisible(false)}>
                                <Dialog.Icon icon="alert" color={"#F2FF5D"}
                                             size={hp(10)}/>
                                <Dialog.Title style={commonStyles.dialogTitle}>{'We hit a snag!'}</Dialog.Title>
                                <Dialog.Content>
                                    <Text
                                        style={commonStyles.dialogParagraph}>{`Unable to retrieve document ${documentViewerErrorModalMessage}!`}</Text>
                                </Dialog.Content>
                                <Dialog.Actions>
                                    <Button buttonStyle={commonStyles.dialogButton}
                                            titleStyle={commonStyles.dialogButtonText}
                                            onPress={() => {
                                                setDocumentViewerErrorModalVisible(false);
                                                navigation.goBack();

                                                // show the drawer header
                                                setDrawerHeaderShown(true);

                                                // enable the drawer swipe
                                                setDrawerSwipeEnabled(true);
                                            }}>
                                        {"Dismiss"}
                                    </Button>
                                </Dialog.Actions>
                            </Dialog>
                        </Portal>
                        {documentShareURI !== '' &&
                            <>
                                <SafeAreaView style={styles.topBar}>
                                    <View style={styles.containerView}>
                                        <IconButton
                                            rippleColor={'transparent'}
                                            icon="chevron-left"
                                            iconColor={"#F2FF5D"}
                                            size={hp(4)}
                                            style={styles.backButton}
                                            onPress={async () => {
                                                // go back to the screen which initiated the document load
                                                // @ts-ignore
                                                if (route.params.appDrawerFlag !== undefined) {
                                                    // @ts-ignore
                                                    navigation.navigate('AppWall', {});
                                                } else {
                                                    navigation.goBack();
                                                }

                                                // show the drawer header
                                                setDrawerHeaderShown(true);

                                                // enable the drawer swipe
                                                setDrawerSwipeEnabled(true);
                                            }}
                                        />
                                        <IconButton
                                            rippleColor={'transparent'}
                                            icon="paperclip"
                                            iconColor={"#F2FF5D"}
                                            size={hp(3)}
                                            style={styles.shareButton}
                                            onPress={async () => {
                                                // share the document
                                                await Sharing.shareAsync(documentShareURI!);
                                            }}
                                        />
                                    </View>
                                </SafeAreaView>
                                <WebView
                                    allowContentAccess={true}
                                    allowFileAccessFromFileURLs={true}
                                    allowFileAccess={true}
                                    allowUniversalAccessFromFileURLs={true}
                                    style={{backgroundColor: '#313030'}}
                                    scalesPageToFit={true}
                                    automaticallyAdjustContentInsets={true}
                                    startInLoadingState={true}
                                    source={
                                        // Android sucks... we all know it
                                        Platform.OS === "android"
                                            ? (documentShareURI.includes('terms')
                                                ? {uri: 'https://www.moonbeam.vet/terms-and-conditions'}
                                                : {uri: 'https://www.moonbeam.vet/privacy-policy'})
                                            : {uri: `${documentShareURI!}`}
                                    }
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
