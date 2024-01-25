import React, {useEffect, useState} from "react";
import {Image, Platform, Text, TouchableOpacity, View} from "react-native";
import {Divider, TextInput} from "react-native-paper";
import {useRecoilState, useRecoilValue} from "recoil";
import {
    additionalDocumentationErrors,
    additionalDocumentationNeeded,
    currentMemberAffiliationState,
    currentUserInformation,
    documentsReCapturePhotoState,
    documentsRePickPhotoState,
    isDocumentUploadedState,
    isPhotoUploadedState,
    isReadyRegistrationState,
    permissionsInstructionsCustomMessageState,
    permissionsModalCustomMessageState,
    permissionsModalVisibleState,
    userIsAuthenticatedState,
    verificationDocumentState
} from "../../../../recoil/AuthAtom";
import {styles} from "../../../../styles/registration.module";
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import {MediaTypeOptions, UIImagePickerPresentationStyle} from 'expo-image-picker';
import * as FileSystem from "expo-file-system";
import {isValidSize, uploadFile} from "../../../../utils/File";
import DropDownPicker from "react-native-dropdown-picker";
import {
    militarySpousesDocumentSelectionItems,
    serviceMembersDocumentSelectionItems
} from "../../../../models/Constants";
import {FieldValidator} from "../../../../utils/FieldValidator";
import {Spinner} from "../../../common/Spinner";
// @ts-ignore
import DocumentationUpload1Picture from '../../../../../assets/art/moonbeam-document-upload-1.png';
// @ts-ignore
import DocumentationUpload2Picture from '../../../../../assets/art/moonbeam-document-upload-2.png';
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
// @ts-ignore
import MoonbeamPreferencesIOS from "../../../../../assets/art/moonbeam-preferences-ios.jpg";
// @ts-ignore
import MoonbeamPreferencesAndroid from "../../../../../assets/art/moonbeam-preferences-android.jpg";
import {logEvent} from "../../../../utils/AppSync";
import {LoggingLevel, MilitaryAffiliation} from "@moonbeam/moonbeam-models";

/**
 * DocumentCaptureStep component.
 *
 * @constructor for the component.
 */
export const DocumentCaptureStep = () => {
    // constants used to keep track of local component state
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    const [dropdownDocumentState, setDropdownDocumentState] = useState<boolean>(false);
    const [photoSelectionButtonState, setPhotoSelectionButtonState] = useState<boolean>(false);
    const [captureButtonState, setCaptureButtonState] = useState<boolean>(false);
    const [uploadButtonState, setUploadButtonState] = useState<boolean>(false);
    const [documentItems, setDocumentItems] = useState(
        useRecoilValue(currentMemberAffiliationState) === MilitaryAffiliation.ServiceMember
            ? serviceMembersDocumentSelectionItems
            : militarySpousesDocumentSelectionItems);
    // constants used to keep track of shared states
    const [userIsAuthenticated, ] = useRecoilState(userIsAuthenticatedState);
    const [documentsRePickPhoto, setDocumentsRePickPhoto] = useRecoilState(documentsRePickPhotoState);
    const [documentsReCapturePhoto, setDocumentsReCapturePhoto] = useRecoilState(documentsReCapturePhotoState);
    const [, setPermissionsModalVisible] = useRecoilState(permissionsModalVisibleState);
    const [, setPermissionsModalCustomMessage] = useRecoilState(permissionsModalCustomMessageState);
    const [, setPermissionsInstructionsCustomMessage] = useRecoilState(permissionsInstructionsCustomMessageState);
    const [userInformation,] = useRecoilState(currentUserInformation);
    const [verificationDocument, setVerificationDocument] = useRecoilState(verificationDocumentState);
    const [capturedFileName, setCapturedFileName] = useRecoilState(isPhotoUploadedState);
    const [uploadedFileName, setUploadedFileName] = useRecoilState(isDocumentUploadedState);
    const [isReady, setIsReady] = useRecoilState(isReadyRegistrationState);
    const [, setAdditionalDocumentsNeeded] = useRecoilState(additionalDocumentationNeeded);
    const [documentationErrors, setDocumentationErrors] = useRecoilState(additionalDocumentationErrors);

    // initializing the field validator, to be used for validating form field values
    const fieldValidator = new FieldValidator();

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // re-pick or re-capture accordingly, in case of reset permissions
        if (documentsRePickPhoto) {
            setDocumentsRePickPhoto(false);
            pickPhoto().then(_ => {});
        }
        if (documentsReCapturePhoto) {
            setDocumentsReCapturePhoto(false);
            capturePhoto().then(_ => {});
        }
        // enable/disable the buttons, depending on the document name
        if (capturedFileName !== "") {
            // Enable the next button and disable the upload button
            setUploadButtonState(false);
            setAdditionalDocumentsNeeded(false);
        }
        if (uploadedFileName !== "") {
            // Enable the next button and disable the capture buttons, and reset the upload file name
            setCaptureButtonState(false);
            setPhotoSelectionButtonState(false);
            setAdditionalDocumentsNeeded(false);
        }
        // enable/disable the buttons, if a valid document selection was picked
        if (verificationDocument !== "" && documentationErrors.length === 0
            && uploadedFileName === "" && capturedFileName === "") {
            setCaptureButtonState(true);
            setUploadButtonState(true);
            setPhotoSelectionButtonState(true);
        }
        if (verificationDocument !== "" && documentationErrors.length > 0 && documentationErrors[0] === 'Invalid Verification Document.'
            && uploadedFileName === "" && capturedFileName === "") {
            setCaptureButtonState(false);
            setUploadButtonState(false);
            setPhotoSelectionButtonState(false);
        }
    }, [documentsReCapturePhoto, documentsRePickPhoto,
        captureButtonState, uploadButtonState, photoSelectionButtonState
        , documentationErrors, capturedFileName, uploadedFileName]);

    /**
     * Function used to pick a verification picture, based on the photo library storage,
     * obtained from an image picker.
     *
     * @return a {@link Promise} containing a {@link Boolean} representing a flag of whether
     * the photo pick was successfully uploaded or not
     */
    const pickPhoto = async (): Promise<boolean> => {
        try {
            // set the loader on button press
            setIsReady(false);

            // request permissions to access the media library
            const status = await ImagePicker.requestMediaLibraryPermissionsAsync();
            // if the status is granted
            if (status && status.status === 'granted') {
                // first display the photo library picker, and allow the user to pick a photo of their document
                const result = await ImagePicker.launchImageLibraryAsync({
                    allowsEditing: false,
                    quality: 1,
                    mediaTypes: MediaTypeOptions.Images, // only pick images, not videos
                    allowsMultipleSelection: false,
                    presentationStyle: UIImagePickerPresentationStyle.FULL_SCREEN
                });
                // if the user successfully picked a photo of their document using the picker
                if (!result.canceled) {
                    // make sure that only one photo was picked and not more
                    if (result.assets.length === 1) {
                        const photoAsset = result.assets[0];

                        // if a photo of their document was picked successfully, then check against its size
                        if (!photoAsset.fileSize || (photoAsset.fileSize && isValidSize(photoAsset.fileSize!))) {
                            /**
                             * build a new upload URI, used to upload the photo to the file system storage
                             * in order to obtain a valid URI/URL that can be use for further steps
                             */
                            const uri = `${FileSystem.documentDirectory}${photoAsset.fileName ? photoAsset.fileName.replaceAll(" ", "") : 'document_photo.png'}`;
                            // copy the photo to the file system storage
                            await FileSystem.copyAsync({
                                from: photoAsset.uri,
                                to: uri
                            });
                            /**
                             * upload the photo to Cloud storage - we upload these to the /public path under a customized path defined by the user id's, since if we upload it
                             * under the /private path, we won't be able to see who this belongs to.
                             */
                            const [uploadFlag, fileName] = await uploadFile(uri, false,
                                `${userInformation["custom:userId"]}-${uri.split('/')[uri.split('/').length - 1]}`);
                            if (!uploadFlag || fileName === null) {
                                const errorMessage = "Error while picking a photo to upload!";
                                console.log(errorMessage);
                                await logEvent(errorMessage, LoggingLevel.Error, userIsAuthenticated);

                                // set the documentation errors accordingly
                                // @ts-ignore
                                setDocumentationErrors([errorMessage]);

                                setVerificationDocument("");

                                // release the loader on button press
                                setIsReady(true);
                                return false;
                            } else {
                                // set the captured file name, so it can be displayed in the UI
                                setCapturedFileName(fileName!);

                                // release the loader on button press
                                setIsReady(true);
                                return true;
                            }
                        } else {
                            const errorMessage = "Invalid photo size. Maximum allotted size is 10MB";
                            console.log(errorMessage);
                            await logEvent(errorMessage, LoggingLevel.Error, userIsAuthenticated);

                            // set the documentation errors accordingly
                            // @ts-ignore
                            setDocumentationErrors([errorMessage]);

                            setVerificationDocument("");

                            // release the loader on button press
                            setIsReady(true);
                            return false;
                        }
                    } else {
                        const errorMessage = `Please pick only 1 photo of your document to continue!`;
                        console.log(`${errorMessage} - ${result.canceled}`);
                        await logEvent(`${errorMessage} - ${result.canceled}`, LoggingLevel.Error, userIsAuthenticated);

                        // set the documentation errors accordingly
                        // @ts-ignore
                        setDocumentationErrors([errorMessage]);

                        setVerificationDocument("");

                        // release the loader on button press
                        setIsReady(true);
                        return false;
                    }
                } else {
                    const errorMessage = `Please pick a photo of your document to continue!`;
                    console.log(`${errorMessage} - ${result.canceled}`);
                    await logEvent(`${errorMessage} - ${result.canceled}`, LoggingLevel.Warning, userIsAuthenticated);

                    // set the documentation errors accordingly
                    // @ts-ignore
                    setDocumentationErrors([errorMessage]);

                    setVerificationDocument("");

                    // release the loader on button press
                    setIsReady(true);
                    return false;
                }
            } else {
                const errorMessage = `Enable permissions to access your verification document pictures, and re-login to upload them!`;
                console.log(errorMessage);
                await logEvent(errorMessage, LoggingLevel.Warning, userIsAuthenticated);

                setPermissionsModalCustomMessage(errorMessage);
                setPermissionsInstructionsCustomMessage(Platform.OS === 'ios'
                    ? "In order to upload a picture of your documentation from your library, go to Settings -> Moonbeam Finance, and allow Photo access by tapping on the \'Photos\' option."
                    : "In order to upload a picture of your documentation from your library, go to Settings -> Apps -> Moonbeam Finance -> Permissions, and allow Photo access by tapping on the \"Photos and videos\" option.");
                setPermissionsModalVisible(true);

                // release the loader on button press
                setIsReady(true);

                return false;
            }
        } catch (error) {
            const errorMessage = `Error while picking photo of document!`;
            console.log(`${errorMessage} - ${error}`);
            await logEvent(`${errorMessage} - ${error}`, LoggingLevel.Error, userIsAuthenticated);

            // set the documentation errors accordingly
            // @ts-ignore
            setDocumentationErrors([errorMessage]);

            setVerificationDocument("");

            // release the loader on button press
            setIsReady(true);
            return false;
        }
    }

    /**
     * Function used to upload a verification picture to storage, based on a photo capture,
     * obtained from an image picker.
     *
     * @return a {@link Promise} containing a {@link Boolean} representing a flag of whether
     * the photo capture of the document was successfully uploaded or not
     */
    const capturePhoto = async (): Promise<boolean> => {
        try {
            // set the loader on button press
            setIsReady(false);

            // request permissions for camera
            const status = await ImagePicker.requestCameraPermissionsAsync();
            // if the status is granted
            if (status && status.status === 'granted') {
                // first display the camera, and allow the user to capture a photo of their document
                const result = await ImagePicker.launchCameraAsync({
                    allowsEditing: false,
                    quality: 1,
                    mediaTypes: MediaTypeOptions.Images, // only pick images, not videos
                    allowsMultipleSelection: false,
                    presentationStyle: UIImagePickerPresentationStyle.FULL_SCREEN
                });
                // if the user successfully captured a photo of their document using the picker
                if (!result.canceled) {

                    // make sure that only one photo was captured and not more
                    if (result.assets.length === 1) {
                        const photoAsset = result.assets[0];

                        // if a photo of their document was captured successfully, then check against its size
                        if (!photoAsset.fileSize || (photoAsset.fileSize && isValidSize(photoAsset.fileSize!))) {
                            /**
                             * build a new upload URI, used to upload the photo to the file system storage
                             * in order to obtain a valid URI/URL that can be use for further steps
                             */
                            const uri = `${FileSystem.documentDirectory}${photoAsset.fileName ? photoAsset.fileName.replaceAll(" ", "") : 'document_photo_captured.png'}`;
                            // copy the photo to the file system storage
                            await FileSystem.copyAsync({
                                from: photoAsset.uri,
                                to: uri
                            });
                            /**
                             * upload the photo to Cloud storage - we upload these to the /public path under a customized path defined by the user id's, since if we upload it
                             * under the /private path, we won't be able to see who this belongs to.
                             */
                            const [uploadFlag, fileName] = await uploadFile(uri, false,
                                `${userInformation["custom:userId"]}-${uri.split('/')[uri.split('/').length - 1]}`);
                            if (!uploadFlag || fileName === null) {
                                const errorMessage = "Error while uploading photo!";
                                console.log(errorMessage);
                                await logEvent(errorMessage, LoggingLevel.Error, userIsAuthenticated);

                                // set the documentation errors accordingly
                                // @ts-ignore
                                setDocumentationErrors([errorMessage]);

                                setVerificationDocument("");

                                // release the loader on button press
                                setIsReady(true);
                                return false;
                            } else {
                                // set the uploaded file name, so it can be displayed in the UI
                                setCapturedFileName(fileName!);

                                // release the loader on button press
                                setIsReady(true);
                                return true;
                            }
                        } else {
                            const errorMessage = "Invalid photo size. Maximum allotted size is 10MB";
                            console.log(errorMessage);
                            await logEvent(errorMessage, LoggingLevel.Error, userIsAuthenticated);

                            // set the documentation errors accordingly
                            // @ts-ignore
                            setDocumentationErrors([errorMessage]);

                            setVerificationDocument("");

                            // release the loader on button press
                            setIsReady(true);
                            return false;
                        }
                    } else {
                        const errorMessage = `Please capture 1 photo of your document to continue!`;
                        console.log(`${errorMessage} - ${result.canceled}`);
                        await logEvent(`${errorMessage} - ${result.canceled}`, LoggingLevel.Warning, userIsAuthenticated);

                        // set the documentation errors accordingly
                        // @ts-ignore
                        setDocumentationErrors([errorMessage]);

                        setVerificationDocument("");

                        // release the loader on button press
                        setIsReady(true);
                        return false;
                    }
                } else {
                    const errorMessage = `Please capture your document to continue!`;
                    console.log(`${errorMessage} - ${result.canceled}`);
                    await logEvent(`${errorMessage} - ${result.canceled}`, LoggingLevel.Warning, userIsAuthenticated);

                    // set the documentation errors accordingly
                    // @ts-ignore
                    setDocumentationErrors([errorMessage]);

                    setVerificationDocument("");

                    // release the loader on button press
                    setIsReady(true);
                    return false;
                }
            } else {
                const errorMessage = `Enable permissions to capture your verification documents, and re-login to upload them!`;
                console.log(errorMessage);
                await logEvent(errorMessage, LoggingLevel.Warning, userIsAuthenticated);

                setPermissionsModalCustomMessage(errorMessage);
                setPermissionsInstructionsCustomMessage(Platform.OS === 'ios'
                    ? "In order to capture a picture of your documentation, go to Settings -> Moonbeam Finance, and allow Camera access by tapping on the \'Camera\' option."
                    : "In order to capture a picture of your documentation, go to Settings -> Apps -> Moonbeam Finance -> Permissions, and allow Camera access by tapping on the \"Camera\" option.");
                setPermissionsModalVisible(true);

                // release the loader on button press
                setIsReady(true);
                return false;
            }
        } catch (error) {
            const errorMessage = `Error while capturing document!`;
            console.log(`${errorMessage} - ${error}`);
            await logEvent(`${errorMessage} - ${error}`, LoggingLevel.Error, userIsAuthenticated);

            // set the documentation errors accordingly
            // @ts-ignore
            setDocumentationErrors([errorMessage]);

            setVerificationDocument("");

            // release the loader on button press
            setIsReady(true);
            return false;
        }
    }

    /**
     * Function used to upload a verification document to storage, based on an existing document
     * or picture obtained from the document picker.
     *
     * @return a {@link Promise} containing a {@link Boolean} representing a flag of whether
     * the document was successfully uploaded or not
     */
    const uploadDocument = async (): Promise<boolean> => {
        try {
            // set a loader on button press
            setIsReady(false);

            // first display the document picker, and allow the user to select a document
            const result = await DocumentPicker.getDocumentAsync({
                /**
                 * only allow '.doc, .docx, .pdf, .txt' and all type of images as files to pick from
                 * for more information check out the MIME types here {@link https://en.wikipedia.org/wiki/Media_type}
                 */
                type: [
                    'application/msword',
                    'application/pdf',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'text/plain',
                    'image/*'
                ],
                multiple: false,
                copyToCacheDirectory: true
            });
            // if the user successfully selected a document using the picker
            if (!result.canceled && result.assets !== null && result.assets.length !== 0) {
                // if the document was picked successfully, then check against its size
                if (result.assets.length !== 1 || (result.assets[0] && isValidSize(result.assets[0].size!))) {
                    /**
                     * build a new upload URI, used to upload the file to the file system storage
                     * in order to obtain a valid URI/URL that can be use for further steps
                     */
                    const uri = `${FileSystem.documentDirectory}${result.assets[0].name.replaceAll(" ", "")}`;
                    // copy the file to the file system storage
                    await FileSystem.copyAsync({
                        from: result.assets[0].uri,
                        to: uri
                    });
                    /**
                     * upload the photo to Cloud storage - we upload these to the /public path under a customized path defined by the user id's, since if we upload it
                     * under the /private path, we won't be able to see who this belongs to.
                     */
                    const [uploadFlag, fileName] = await uploadFile(uri, false,
                        `${userInformation["custom:userId"]}-${uri.split('/')[uri.split('/').length - 1]}`);
                    if (!uploadFlag || fileName === null) {
                        const errorMessage = "Error while uploading file!";
                        console.log(errorMessage);
                        await logEvent(errorMessage, LoggingLevel.Error, userIsAuthenticated);

                        // set the documentation errors accordingly
                        // @ts-ignore
                        setDocumentationErrors([errorMessage]);

                        setVerificationDocument("");

                        // release the loader on button press
                        setIsReady(true);
                        return false;
                    } else {
                        // set the uploaded file name, so it can be displayed in the UI
                        setUploadedFileName(fileName!);

                        // release the loader on button press
                        setIsReady(true);
                        return true;
                    }
                } else {
                    const errorMessage = "Invalid file size. Maximum allotted size is 10MB";
                    console.log(errorMessage);
                    await logEvent(errorMessage, LoggingLevel.Error, userIsAuthenticated);

                    // set the documentation errors accordingly
                    // @ts-ignore
                    setDocumentationErrors([errorMessage]);

                    setVerificationDocument("");

                    // release the loader on button press
                    setIsReady(true);
                    return false;
                }
            } else {
                const errorMessage = `Please upload a file to continue!`;
                console.log(`${errorMessage} - ${result.canceled}`);
                await logEvent(`${errorMessage} - ${result.canceled}`, LoggingLevel.Warning, userIsAuthenticated);

                // set the documentation errors accordingly
                // @ts-ignore
                setDocumentationErrors([errorMessage]);

                setVerificationDocument("");

                // release the loader on button press
                setIsReady(true);
                return false;
            }
        } catch (error) {
            const errorMessage = `Error while uploading file!`;
            console.log(`${errorMessage} - ${error}`);
            await logEvent(`${errorMessage} - ${error}`, LoggingLevel.Error, userIsAuthenticated);

            // set the documentation errors accordingly
            // @ts-ignore
            setDocumentationErrors([errorMessage]);

            setVerificationDocument("");

            // release the loader on button press
            setIsReady(true);
            return false;
        }
    }

    // return the component for the DocumentCaptureStep, part of the Registration page
    return (
        <>
            {
                !isReady ?
                    <Spinner loadingSpinnerShown={loadingSpinnerShown} setLoadingSpinnerShown={setLoadingSpinnerShown}/>
                    :
                    <>
                        {documentationErrors.length !== 0
                            ? <Text style={styles.errorMessage}>{documentationErrors[0]}</Text>
                            : <></>
                        }
                        <View style={styles.documentSelectionView}>
                            <DropDownPicker
                                zIndex={5000}
                                placeholder={"Select a document to continue"}
                                // containerStyle={dropdownDocumentState && Platform.OS === 'android' && {height: hp(25)}}
                                dropDownContainerStyle={[styles.documentsDropdownContainer, Platform.OS === 'android' ? {height: hp(20)} : {height: hp(15)}]}
                                style={styles.documentsDropdownPicker}
                                dropDownDirection={"BOTTOM"}
                                open={dropdownDocumentState}
                                onOpen={() => {
                                    // clear any previous errors
                                    setDocumentationErrors([]);
                                }}
                                onClose={() => {
                                    setDropdownDocumentState(false);
                                }}
                                value={verificationDocument === "" ? null : verificationDocument}
                                items={documentItems}
                                setOpen={setDropdownDocumentState}
                                setValue={setVerificationDocument}
                                setItems={setDocumentItems}
                                onSelectItem={(item) => {
                                    // clear any previous errors
                                    setDocumentationErrors([]);

                                    setVerificationDocument(item.value!);

                                    // validate value
                                    fieldValidator.validateField(item.value!, "verificationDocument", setDocumentationErrors);
                                }}
                                theme="DARK"
                                multiple={false}
                                listMode="MODAL"
                                modalAnimationType="slide"
                                modalContentContainerStyle={{
                                    backgroundColor: '#313030'
                                }}
                                modalTitleStyle={{
                                    fontSize: hp(2.3),
                                    fontFamily: 'Raleway-Regular',
                                    color: '#F2FF5D'
                                }}
                                listItemContainerStyle={{
                                    top: hp(1.5)
                                }}
                                listItemLabelStyle={styles.dropdownTextInputContentStyle}
                                modalTitle={"Select your Document Type"}
                                // @ts-ignore
                                arrowIconStyle={{tintColor: '#FFFFFF'}}
                                // @ts-ignore
                                closeIconStyle={{tintColor: '#FFFFFF'}}
                                placeholderStyle={styles.dropdownTextInputContentStyle}
                                // @ts-ignore
                                tickIconStyle={{tintColor: '#313030'}}
                                selectedItemLabelStyle={[styles.dropdownTextInputContentStyle, {color: '#313030'}]}
                                selectedItemContainerStyle={{backgroundColor: '#D9D9D9'}}
                                itemSeparator={false}
                                labelStyle={styles.dropdownTextInputContentStyle}
                            />
                            <View style={styles.documentSelectionOptionBottom}>
                                <Image
                                    resizeMethod={"scale"}
                                    style={styles.photoUploadOptionImage}
                                    resizeMode={'stretch'}
                                    source={DocumentationUpload2Picture}/>
                                <View style={styles.documentCapturingDescriptionView}>
                                    <Text style={styles.documentCapturingOptionDescription}>{
                                        capturedFileName === ""
                                            ? "Capture your document."
                                            : "Document successfully captured."
                                    }</Text>
                                    {
                                        capturedFileName === ""
                                            ?
                                            <View style={{bottom: hp(3)}}>
                                                <TouchableOpacity
                                                    disabled={!captureButtonState}
                                                    style={!captureButtonState ? styles.captureSelectionButtonDisabled : styles.captureSelectionButton}
                                                    onPress={
                                                        async () => {
                                                            // clear any previous errors
                                                            setDocumentationErrors([]);

                                                            // upload a photo of the document, and wait for its result
                                                            await capturePhoto();
                                                        }
                                                    }
                                                >
                                                    <Text style={styles.documentButtonText}>Take Photo</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    disabled={!photoSelectionButtonState}
                                                    style={[!photoSelectionButtonState ? styles.captureSelectionButtonDisabled : styles.captureSelectionButton,
                                                        {marginTop: wp(3)}]}
                                                    onPress={
                                                        async () => {
                                                            // clear any previous errors
                                                            setDocumentationErrors([]);

                                                            // pick a photo of the document, and wait for its result
                                                            await pickPhoto();
                                                        }
                                                    }
                                                >
                                                    <Text style={styles.documentButtonText}>Pick Photo</Text>
                                                </TouchableOpacity>
                                            </View>
                                            :
                                            <>
                                                <TextInput
                                                    autoCapitalize={"none"}
                                                    autoCorrect={false}
                                                    autoComplete={"off"}
                                                    disabled={true}
                                                    keyboardType={"default"}
                                                    placeholderTextColor={'#D9D9D9'}
                                                    activeUnderlineColor={'#F2FF5D'}
                                                    underlineColor={'#D9D9D9'}
                                                    outlineColor={'#D9D9D9'}
                                                    activeOutlineColor={'#F2FF5D'}
                                                    selectionColor={'#F2FF5D'}
                                                    mode={'outlined'}
                                                    contentStyle={styles.fileUploadTextInputContentStyle}
                                                    style={styles.pictureUploadedTextInput}
                                                    value={"document"}
                                                    textColor={"#FFFFFF"}
                                                    left={<TextInput.Icon icon="file" color="#FFFFFF"/>}
                                                    right={
                                                        <TextInput.Icon
                                                            icon="close"
                                                            color="#FFFFFF"
                                                            onPress={() => {
                                                                // Disable the next button and enable the upload button, and reset the capture file name
                                                                setCaptureButtonState(false);
                                                                setPhotoSelectionButtonState(false);
                                                                setUploadButtonState(false);
                                                                setAdditionalDocumentsNeeded(true);
                                                                setCapturedFileName("");
                                                                setVerificationDocument("");
                                                            }}
                                                        />
                                                    }
                                                />
                                            </>
                                    }
                                </View>
                            </View>
                            <Divider
                                style={styles.documentSelectionDivider}/>
                            <View style={styles.documentSelectionOptionBottom}>
                                <Image
                                    resizeMethod={"scale"}
                                    style={styles.documentUploadOptionImage}
                                    resizeMode={'stretch'}
                                    source={DocumentationUpload1Picture}/>
                                <View style={styles.documentCapturingDescriptionView}>
                                    <Text style={styles.documentUploadOptionDescription}>{
                                        uploadedFileName === ""
                                            ? "Upload your document."
                                            : "Document successfully uploaded."
                                    }</Text>
                                    {
                                        uploadedFileName === ""
                                            ?
                                            <>
                                                <TouchableOpacity
                                                    disabled={!uploadButtonState}
                                                    style={!uploadButtonState ? styles.documentSelectionButtonDisabled : styles.documentSelectionButton}
                                                    onPress={
                                                        async () => {
                                                            // clear any previous errors
                                                            setDocumentationErrors([]);

                                                            // upload a document, and wait for its result
                                                            await uploadDocument();
                                                        }
                                                    }
                                                >
                                                    <Text style={styles.documentButtonText}>Choose file</Text>
                                                </TouchableOpacity>
                                            </>
                                            :
                                            <>
                                                <TextInput
                                                    autoCapitalize={"none"}
                                                    autoCorrect={false}
                                                    autoComplete={"off"}
                                                    disabled={true}
                                                    keyboardType={"default"}
                                                    placeholderTextColor={'#D9D9D9'}
                                                    activeUnderlineColor={'#F2FF5D'}
                                                    underlineColor={'#D9D9D9'}
                                                    outlineColor={'#D9D9D9'}
                                                    activeOutlineColor={'#F2FF5D'}
                                                    selectionColor={'#F2FF5D'}
                                                    mode={'outlined'}
                                                    contentStyle={styles.fileUploadTextInputContentStyle}
                                                    style={styles.fileUploadedTextInput}
                                                    value={"document"}
                                                    textColor={"#FFFFFF"}
                                                    left={<TextInput.Icon icon="file" color="#FFFFFF"/>}
                                                    right={
                                                        <TextInput.Icon
                                                            icon="close"
                                                            color="#FFFFFF"
                                                            onPress={() => {
                                                                // Disable the next button and enable the capture buttons, and reset the upload file name
                                                                setCaptureButtonState(false);
                                                                setPhotoSelectionButtonState(false);
                                                                setUploadButtonState(false);
                                                                setAdditionalDocumentsNeeded(true);
                                                                setUploadedFileName("");
                                                                setVerificationDocument("");
                                                            }}
                                                        />
                                                    }
                                                />
                                            </>
                                    }
                                </View>
                            </View>
                            <Divider
                                style={styles.documentSelectionDivider}/>
                        </View>
                    </>
            }
        </>
    );
}
