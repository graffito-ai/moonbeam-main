import React, {useEffect, useState} from 'react';
import WebView from 'react-native-webview';
// @ts-ignore
import HomeDashboardLogo from "../../../assets/login-logo.png";
import {DocumentViewerSettingsProps} from "../../models/SettingsStackProps";
import * as FileSystem from "expo-file-system";
import {API, graphqlOperation} from "aws-amplify";
import {FileAccessLevel, FileType, getStorage} from "../../../../moonbeam-models";
import {Dimensions, SafeAreaView, View} from "react-native";
import {styles} from "../../styles/documentViewer.module";
import {Portal, Modal, Button, Text, Divider} from "react-native-paper";
import {commonStyles} from "../../styles/common.module";
import * as Sharing from "expo-sharing";
import {DocumentViewerRootProps} from "../../models/RootProps";

/**
 * DocumentViewer component.
 */
export const DocumentViewer = ({route, navigation}: DocumentViewerSettingsProps | DocumentViewerRootProps) => {
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
        route.params.setBottomTabNavigationShown && route.params.setBottomTabNavigationShown(false);
        route.params.setIsHeaderShown && route.params.setIsHeaderShown(true);

        // retrieving the document link from either local cache, or from storage
        fetchDocument(route.params.name, route.params.privacyFlag).then(([returnFlag, shareURI]) => {
            if (!returnFlag) {
                // show error modal, go back on dismiss
                setDocumentViewerErrorModalMessage(`${route.params.name}`);
                setDocumentViewerErrorModalVisible(true);
            }
            // setting the URI to be used in sharing the document.
            setDocumentShareURI(shareURI!);
        })
    }, [documentShareURI]);

    /**
     * Function used to fetch a document from CloudFront, given its name, and privacy level,
     * and allow for opening it with a partner application.
     *
     * @param name name of the document to fetch
     * @param privacyFlag privacy level flag
     *
     * @return an instance of {@link Promise} of a tuple containing a {@link boolean} and a {@link string}
     */
    const fetchDocument = async (name: string, privacyFlag: boolean): Promise<[boolean, string | null]> => {
        // first check if the base directory exists or not
        const baseDir = `${FileSystem.documentDirectory!}` + `files/`;
        const baseDirInfo = await FileSystem.getInfoAsync(baseDir);
        if (!baseDirInfo.exists) {
            await FileSystem.makeDirectoryAsync(baseDir);
        }
        // then check if the file exists in the local file system storage
        const fileUri = baseDir + name;
        const fileInfo = await FileSystem.getInfoAsync(fileUri);

        // if the file already exists in local file system cache
        // ToDo: re-download the file after a certain time
        if (!fileInfo.exists) {
            console.log(`${name} isn't cached locally. Downloading...`);
            // perform the query to fetch a file
            const fetchFileResult = await API.graphql(graphqlOperation(getStorage, {
                getStorageInput: {
                    level: privacyFlag ? FileAccessLevel.Private : FileAccessLevel.Public,
                    type: FileType.Main,
                    name: name
                }
            }));
            // @ts-ignore
            if (fetchFileResult && fetchFileResult.data.getStorage.errorMessage === null) {
                // @ts-ignore
                const retrievedURI = fetchFileResult.data.getStorage.data.url;
                const fileDownloadResult = await FileSystem.downloadAsync(retrievedURI, fileUri);

                // file did not exist, downloaded the file and return the newly locally cached URI
                return [true, fileDownloadResult.uri];
            } else {
                console.log(`Unexpected error while fetching file ${name} ${JSON.stringify(fetchFileResult)}`);
                return [false, null];
            }
        }
        console.log(`${name} is cached locally.`);

        // file exists, just return the locally cached URI
        return [true, fileUri];
    }

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
