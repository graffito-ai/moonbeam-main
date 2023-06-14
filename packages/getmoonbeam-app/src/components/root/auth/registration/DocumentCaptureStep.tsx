import React, {useEffect, useState} from "react";
import {Dimensions, Image, Text, TouchableOpacity, View} from "react-native";
import {Divider, TextInput} from "react-native-paper";
import {useRecoilState} from "recoil";
import {additionalDocumentationErrors, additionalDocumentationNeeded} from "../../../../recoil/AuthAtom";
import {styles} from "../../../../styles/registration.module";
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import {MediaTypeOptions, UIImagePickerPresentationStyle} from 'expo-image-picker';
import * as FileSystem from "expo-file-system";
import {isValidSize, uploadFile} from "../../../../utils/File";
import DropDownPicker from "react-native-dropdown-picker";
import {documentSelectionItems} from "../../../../models/Constants";
import {FieldValidator} from "../../../../utils/FieldValidator";
import {Spinner} from "../../../common/Spinner";

/**
 * DocumentCaptureStep component.
 *
 * @constructor for the component.
 */
export const DocumentCaptureStep = () => {
    // constants used to keep track of local component state
    const [isReady, setIsReady] = useState<boolean>(true);
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    const [capturedFileName, setCapturedFileName] = useState<string>("");
    const [uploadedFileName, setUploadedFileName] = useState<string>("");
    const [verificationDocument, setVerificationDocument] = useState<string>("");
    const [dropdownDocumentState, setDropdownDocumentState] = useState<boolean>(false);
    const [photoSelectionButtonState, setPhotoSelectionButtonState] = useState<boolean>(false);
    const [captureButtonState, setCaptureButtonState] = useState<boolean>(false);
    const [uploadButtonState, setUploadButtonState] = useState<boolean>(false);
    const [documentItems, setDocumentItems] = useState(documentSelectionItems);

    // constants used to keep track of shared states
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
    }, [captureButtonState, uploadButtonState, photoSelectionButtonState, documentationErrors, capturedFileName, uploadedFileName]);

    /**
     * Function used to pick a verification picture to storage, based on the photo library storage,
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
                    allowsEditing: true,
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
                        if (photoAsset.fileSize && isValidSize(photoAsset.fileSize!)) {
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
                            // upload the photo to Cloud storage
                            const [uploadFlag, fileName] = await uploadFile(uri, true);
                            if (!uploadFlag || fileName === null) {
                                const errorMessage = "Error while picking a photo to upload!";
                                console.log(errorMessage);

                                // set the documentation errors accordingly
                                // @ts-ignore
                                setDocumentationErrors([errorMessage]);

                                // release the loader on button press
                                setIsReady(true);
                                return false;
                            }
                            // set the captured file name, so it can be displayed in the UI
                            setCapturedFileName(fileName!);

                            // release the loader on button press
                            setIsReady(true);
                            return true;

                        }
                        const errorMessage = "Invalid photo size. Maximum allotted size is 10MB";
                        console.log(errorMessage);

                        // set the documentation errors accordingly
                        // @ts-ignore
                        setDocumentationErrors([errorMessage]);

                        // release the loader on button press
                        setIsReady(true);
                        return false;
                    }
                    const errorMessage = `Please pick only 1 photo of your document to continue!`;
                    console.log(`${errorMessage} - ${result.canceled}`);

                    // set the documentation errors accordingly
                    // @ts-ignore
                    setDocumentationErrors([errorMessage]);

                    // release the loader on button press
                    setIsReady(true);
                    return false;
                }
                const errorMessage = `Please pick a photo of your document to continue!`;
                console.log(`${errorMessage} - ${result.canceled}`);

                // set the documentation errors accordingly
                // @ts-ignore
                setDocumentationErrors([errorMessage]);

                // release the loader on button press
                setIsReady(true);
                return false;
            } else {
                const errorMessage = `Permission to access media library was not granted!`;
                console.log(errorMessage);

                // set the documentation errors accordingly
                // @ts-ignore
                setDocumentationErrors([errorMessage]);

                // release the loader on button press
                setIsReady(true);
                return false;
            }
        } catch (error) {
            const errorMessage = `Error while picking photo of document!`;
            console.log(`${errorMessage} - ${error}`);

            // set the documentation errors accordingly
            // @ts-ignore
            setDocumentationErrors([errorMessage]);

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
                    allowsEditing: true,
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
                        if (photoAsset.fileSize && isValidSize(photoAsset.fileSize!)) {
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
                            // upload the photo to Cloud storage
                            const [uploadFlag, fileName] = await uploadFile(uri, true);
                            if (!uploadFlag || fileName === null) {
                                const errorMessage = "Error while uploading photo!";
                                console.log(errorMessage);

                                // set the documentation errors accordingly
                                // @ts-ignore
                                setDocumentationErrors([errorMessage]);

                                // release the loader on button press
                                setIsReady(true);
                                return false;
                            }
                            // set the uploaded file name, so it can be displayed in the UI
                            setCapturedFileName(fileName!);

                            // release the loader on button press
                            setIsReady(true);
                            return true;

                        }
                        const errorMessage = "Invalid photo size. Maximum allotted size is 10MB";
                        console.log(errorMessage);

                        // set the documentation errors accordingly
                        // @ts-ignore
                        setDocumentationErrors([errorMessage]);

                        // release the loader on button press
                        setIsReady(true);
                        return false;
                    }
                    const errorMessage = `Please capture 1 photo of your document to continue!`;
                    console.log(`${errorMessage} - ${result.canceled}`);

                    // set the documentation errors accordingly
                    // @ts-ignore
                    setDocumentationErrors([errorMessage]);

                    // release the loader on button press
                    setIsReady(true);
                    return false;
                }
                const errorMessage = `Please capture your document to continue!`;
                console.log(`${errorMessage} - ${result.canceled}`);

                // set the documentation errors accordingly
                // @ts-ignore
                setDocumentationErrors([errorMessage]);

                // release the loader on button press
                setIsReady(true);
                return false;
            } else {
                const errorMessage = `Permission to access camera was not granted!`;
                console.log(errorMessage);

                // set the documentation errors accordingly
                // @ts-ignore
                setDocumentationErrors([errorMessage]);

                // release the loader on button press
                setIsReady(true);
                return false;
            }
        } catch (error) {
            const errorMessage = `Error while capturing document!`;
            console.log(`${errorMessage} - ${error}`);

            // set the documentation errors accordingly
            // @ts-ignore
            setDocumentationErrors([errorMessage]);

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
            if (result.type === "success") {
                // if the document was picked successfully, then check against its size
                if (result.size && isValidSize(result.size!)) {
                    /**
                     * build a new upload URI, used to upload the file to the file system storage
                     * in order to obtain a valid URI/URL that can be use for further steps
                     */
                    const uri = `${FileSystem.documentDirectory}${result.name.replaceAll(" ", "")}`;
                    // copy the file to the file system storage
                    await FileSystem.copyAsync({
                        from: result.uri,
                        to: uri
                    });
                    // upload the file to Cloud storage
                    const [uploadFlag, fileName] = await uploadFile(uri, true);
                    if (!uploadFlag || fileName === null) {
                        const errorMessage = "Error while uploading file!";
                        console.log(errorMessage);

                        // set the documentation errors accordingly
                        // @ts-ignore
                        setDocumentationErrors([errorMessage]);

                        // release the loader on button press
                        setIsReady(true);
                        return false;
                    }
                    // set the uploaded file name, so it can be displayed in the UI
                    setUploadedFileName(fileName!);

                    // release the loader on button press
                    setIsReady(true);
                    return true;
                }
                const errorMessage = "Invalid file size. Maximum allotted size is 10MB";
                console.log(errorMessage);

                // set the documentation errors accordingly
                // @ts-ignore
                setDocumentationErrors([errorMessage]);

                // release the loader on button press
                setIsReady(true);
                return false;
            }
            const errorMessage = `Please upload a file to continue!`;
            console.log(`${errorMessage} - ${result.type}`);

            // set the documentation errors accordingly
            // @ts-ignore
            setDocumentationErrors([errorMessage]);

            // release the loader on button press
            setIsReady(true);
            return false;
        } catch (error) {
            const errorMessage = `Error while uploading file!`;
            console.log(`${errorMessage} - ${error}`);

            // set the documentation errors accordingly
            // @ts-ignore
            setDocumentationErrors([errorMessage]);

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
                            <View style={styles.documentSelectionOptionTop}>
                                <DropDownPicker
                                    zIndex={5000}
                                    placeholder={"Select a document to continue"}
                                    dropDownContainerStyle={styles.documentsDropdownContainer}
                                    style={styles.documentsDropdownPicker}
                                    textStyle={[styles.textInputContentStyle, {color: '#D9D9D9'}]}
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
                                    mode="SIMPLE"
                                    searchable={true}
                                />
                            </View>
                            <Divider
                                style={styles.documentSelectionDivider}/>
                            <View style={styles.documentSelectionOptionBottom}>
                                <Image
                                    resizeMethod={"scale"}
                                    style={styles.photoUploadOptionImage}
                                    resizeMode={'stretch'}
                                    source={require('../../../../../assets/art/moonbeam-document-upload-2.png')}/>
                                <View style={styles.documentCapturingDescriptionView}>
                                    <Text style={styles.documentCapturingOptionDescription}>{
                                        capturedFileName === ""
                                            ? "Capture your document."
                                            : "Document successfully captured."
                                    }</Text>
                                    {
                                        capturedFileName === ""
                                            ?
                                            <>
                                                <TouchableOpacity
                                                    disabled={!captureButtonState}
                                                    style={!captureButtonState ? styles.documentSelectionButtonDisabled : styles.documentSelectionButton}
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
                                                    style={[!photoSelectionButtonState ? styles.documentSelectionButtonDisabled : styles.documentSelectionButton,
                                                        {marginTop: Dimensions.get('window').width / 30}]}
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
                                            </>
                                            :
                                            <>
                                                <TextInput
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
                                                    label="document"
                                                    textColor={"#FFFFFF"}
                                                    left={<TextInput.Icon icon="file" iconColor="#FFFFFF"/>}
                                                    right={
                                                        <TextInput.Icon
                                                            icon="close"
                                                            iconColor="#FFFFFF"
                                                            onPress={() => {
                                                                // Disable the next button and enable the upload button, and reset the capture file name
                                                                setUploadButtonState(true);
                                                                setAdditionalDocumentsNeeded(true);
                                                                setCapturedFileName("");
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
                                    source={require('../../../../../assets/art/moonbeam-document-upload-1.png')}/>
                                <View style={styles.documentCapturingDescriptionView}>
                                    <Text style={styles.documentCapturingOptionDescription}>{
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
                                                    label="document"
                                                    textColor={"#FFFFFF"}
                                                    left={<TextInput.Icon icon="file" iconColor="#FFFFFF"/>}
                                                    right={
                                                        <TextInput.Icon
                                                            icon="close"
                                                            iconColor="#FFFFFF"
                                                            onPress={() => {
                                                                // Disable the next button and enable the capture buttons, and reset the upload file name
                                                                setCaptureButtonState(true);
                                                                setPhotoSelectionButtonState(true);
                                                                setAdditionalDocumentsNeeded(true);
                                                                setUploadedFileName("");
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
