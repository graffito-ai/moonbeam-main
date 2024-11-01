import {Image, Keyboard, Linking, Platform, SafeAreaView, StyleSheet, TouchableOpacity, View} from "react-native";
import {Dialog, Portal, Text, TextInput} from "react-native-paper";
import React, {useEffect, useRef, useState} from "react";
import {commonStyles} from "../../../../../styles/common.module";
import {styles} from "../../../../../styles/profile.module";
// @ts-ignore
import FaceIDIcon from '../../../../../../assets/face-id-icon.png';
import {useRecoilState} from "recoil";
import {
    currentUserInformation,
    globalAmplifyCacheState,
    userIsAuthenticatedState
} from "../../../../../recoil/AuthAtom";
import {Spinner} from "../../../../common/Spinner";
import {ProfileProps} from "../../../../../models/props/SettingsProps";
import {appDrawerHeaderShownState, drawerSwipeState, profilePictureURIState} from "../../../../../recoil/AppDrawerAtom";
import {LinearGradient} from "expo-linear-gradient";
import {Avatar, Button} from "@rneui/base";
import DropDownPicker from "react-native-dropdown-picker";
import {CodeVerificationType, dutyStatusItems} from "../../../../../models/Constants";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import * as ImagePicker from "expo-image-picker";
import {MediaTypeOptions, UIImagePickerPresentationStyle} from "expo-image-picker";
import {isValidSize, uploadFile} from "../../../../../utils/File";
import * as FileSystem from "expo-file-system";
import {Auth} from "aws-amplify";
import {FieldValidator} from "../../../../../utils/FieldValidator";
import BottomSheet from "@gorhom/bottom-sheet";
import {CodeVerificationBottomSheet} from "./CodeVerificationBottomSheet";
import {codeVerificationSheetShown, codeVerifiedState} from "../../../../../recoil/CodeVerificationAtom";
import {CognitoUser} from "amazon-cognito-identity-js";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
// @ts-ignore
import MoonbeamPreferencesIOS from "../../../../../../assets/art/moonbeam-preferences-ios.jpg";
// @ts-ignore
import MoonbeamPreferencesAndroid from "../../../../../../assets/art/moonbeam-preferences-android.jpg";
import {Image as ExpoImage} from "expo-image/build/Image"
// @ts-ignore
import MoonbeamProfilePlaceholder from "../../../../../../assets/art/moonbeam-profile-placeholder.png";
import {logEvent} from "../../../../../utils/AppSync";
import {LoggingLevel} from "@moonbeam/moonbeam-models";

/**
 * Profile component
 *
 * @constructor constructor for the component
 */
export const Profile = ({navigation}: ProfileProps) => {
    // constants used to keep track of local component state
    const [isKeyboardShown, setIsKeyboardShown] = useState<boolean>(false);
    const [isReady, setIsReady] = useState<boolean>(true);
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    const [permissionsModalVisible, setPermissionsModalVisible] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [modalCustomMessage, setModalCustomMessage] = useState<string>("");
    const [modalButtonMessage, setModalButtonMessage] = useState<string>("");
    const [permissionsModalCustomMessage, setPermissionsModalCustomMessage] = useState<string>("");
    const [permissionsInstructionsCustomMessage, setPermissionsInstructionsCustomMessage] = useState<string>("");
    const [enlistingYear, setEnlistingYear] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [emailFocus, setIsEmailFocus] = useState<boolean>(false);
    const [birthday, setBirthday] = useState<string>("");
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const [phoneNumberFocus, setIsPhoneNumberFocus] = useState<boolean>(false);
    const [addressLine, setAddressLine] = useState<string>("");
    const [addressLineFocus, setIsAddressLineFocus] = useState<boolean>(false);
    const [addressCity, setAddressCity] = useState<string>("");
    const [addressCityFocus, setIsAddressCityFocus] = useState<boolean>(false);
    const [addressState, setAddressState] = useState<string>("");
    const [addressStateFocus, setIsAddressStateFocus] = useState<boolean>(false);
    const [addressZip, setAddressZip] = useState<string>("");
    const [addressZipFocus, setIsAddressZipFocus] = useState<boolean>(false);
    const [militaryBranch, setMilitaryBranch] = useState<string>("");
    const [dropdownDutyState, setDropdownDutyState] = useState<boolean>(false);
    const [dutyStatus, setDutyStatus] = useState<string>("");
    const [currentUserTitle, setCurrentUserTitle] = useState<string>("N/A");
    const [currentUserName, setCurrentUserName] = useState<string>("N/A");
    const [dutyItems, setDutyItems] = useState(dutyStatusItems);
    const [editingFlag, setEditingFlag] = useState<boolean>(false);
    const [profileUpdatesMainError, setProfileUpdatesMainError] = useState<boolean>(false);
    const [emailErrors, setEmailErrors] = useState<string[]>([]);
    const [phoneErrors, setPhoneErrors] = useState<string[]>([]);
    const [addressLineErrors, setAddressLineErrors] = useState<string[]>([]);
    const [addressCityErrors, setAddressCityErrors] = useState<string[]>([]);
    const [addressStateErrors, setAddressStateErrors] = useState<string[]>([]);
    const [addressZipErrors, setAddressZipErrors] = useState<string[]>([]);
    const [dutyStatusErrors, setDutyStatusErrors] = useState<string[]>([]);
    const bottomSheetRef = useRef(null);
    // constants used to keep track of shared states
    const [userIsAuthenticated,] = useRecoilState(userIsAuthenticatedState);
    const [globalCache,] = useRecoilState(globalAmplifyCacheState);
    const [showBottomSheet, setShowBottomSheet] = useRecoilState(codeVerificationSheetShown);
    const [codeVerified, setCodeVerified] = useRecoilState(codeVerifiedState);
    const [userInformation, setUserInformation] = useRecoilState(currentUserInformation);
    const [, setDrawerSwipeEnabled] = useRecoilState(drawerSwipeState);
    const [profilePictureURI, setProfilePictureURI] = useRecoilState(profilePictureURIState);
    const [appDrawerHeaderShown, setAppDrawerHeaderShown] = useRecoilState(appDrawerHeaderShownState);

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
        // keyboard listeners
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setIsKeyboardShown(true);
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setIsKeyboardShown(false);
            }
        );

        if (userInformation["custom:userId"]) {
            // if the code has been successfully verified from the code verification component
            if (codeVerified) {
                // reset the editing flag
                setEditingFlag(false);

                // un-focus all elements accordingly
                setIsEmailFocus(false);
                setIsPhoneNumberFocus(false);
                setIsAddressLineFocus(false);
                setIsAddressCityFocus(false);
                setIsAddressStateFocus(false);
                setIsAddressZipFocus(false);

                // show a success modal
                const message = `Profile information successfully updated!`;
                console.log(message);
                logEvent(message, LoggingLevel.Info, userIsAuthenticated).then(() => {
                });

                setModalCustomMessage(message);
                setModalButtonMessage('Ok');
                setModalVisible(true);

                // reset the flag
                setCodeVerified(false);
            }

            // disable the swipe for the drawer
            setDrawerSwipeEnabled(false);

            // hide the app drawer header on load
            setAppDrawerHeaderShown(false);

            // populate the information from the information object
            birthday === "" && email === "" && phoneNumber === "" && addressLine === "" &&
            addressCity === "" && addressState === "" && addressZip === "" && enlistingYear === "" &&
            dutyStatus === "" && retrieveUserInfo().then(() => {
            });

            // manipulate the bottom sheet
            if (!showBottomSheet && bottomSheetRef) {
                // @ts-ignore
                bottomSheetRef.current?.close?.();
            }
            if (showBottomSheet && bottomSheetRef) {
                // @ts-ignore
                bottomSheetRef.current?.expand?.();
            }

            // if the editing flag is off, make sure that no fields are focused
            if (!editingFlag &&
                (emailFocus || phoneNumberFocus || addressLineFocus ||
                    addressCityFocus || addressStateFocus || addressZipFocus)) {
                setIsEmailFocus(false);
                setIsPhoneNumberFocus(false);
                setIsAddressLineFocus(false);
                setIsAddressCityFocus(false);
                setIsAddressStateFocus(false);
                setIsAddressZipFocus(false);
            }

            // perform field validations on every state change, for the specific field that is being validated
            if (emailFocus && email !== "") {
                fieldValidator.validateField(email, "email", setEmailErrors);
            }
            email === "" && setEmailErrors([]);

            if (phoneNumberFocus && phoneNumber !== "") {
                fieldValidator.validateField(phoneNumber, "phoneNumber", setPhoneErrors);
            }
            phoneNumber === "" && setPhoneErrors([]);

            if (dutyStatus !== "") {
                fieldValidator.validateField(dutyStatus, "dutyStatus", setDutyStatusErrors);
            }
            dutyStatus === "" && setDutyStatusErrors([]);

            if (addressLineFocus && addressLine !== "") {
                fieldValidator.validateField(addressLine, "addressLine", setAddressLineErrors);
            }
            addressLine === "" && setAddressLineErrors([]);

            if (addressCityFocus && addressCity !== "") {
                fieldValidator.validateField(addressCity, "addressCity", setAddressCityErrors);
            }
            addressCity === "" && setAddressCityErrors([]);

            if (addressStateFocus && addressState !== "") {
                fieldValidator.validateField(addressState, "addressState", setAddressStateErrors);
            }
            addressState === "" && setAddressStateErrors([]);

            if (addressZipFocus && addressZip !== "") {
                fieldValidator.validateField(addressZip, "addressZip", setAddressZipErrors);
            }
            addressZip === "" && setAddressZipErrors([]);
        }

        // remove keyboard listeners accordingly
        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, [userInformation["custom:userId"], isKeyboardShown,
        appDrawerHeaderShown, userInformation, profilePictureURI,
        email, emailFocus, phoneNumber, phoneNumberFocus, dutyStatus,
        addressLine, addressLineFocus, addressCity, addressCityFocus,
        addressState, addressStateFocus, addressZip, addressZipFocus,
        showBottomSheet, bottomSheetRef, editingFlag, codeVerified]);

    /**
     * Function used to retrieve the user information from the shared user info
     * object, and format it appropriately.
     */
    const retrieveUserInfo = async (): Promise<void> => {
        // set a loader on button press
        setIsReady(false);

        // check to see if the user information object has been populated accordingly
        if (userInformation["given_name"] &&
            userInformation["family_name"] && userInformation["birthdate"] &&
            userInformation["email"] && userInformation["phone_number"] &&
            userInformation["address"] && userInformation["address"]["formatted"] &&
            (
                (!userInformation["custom:militaryAffiliation"] || userInformation["custom:militaryAffiliation"] === null) ?
                    userInformation["custom:enlistmentYear"] && userInformation["custom:branch"] &&
                    userInformation["custom:duty_status"]
                    :
                    userInformation["custom:militaryAffiliation"]
            )) {
            // release the loader on button press
            setIsReady(true);

            // set the title of the user's avatar in the profile page, based on the user's information
            setCurrentUserTitle(`${Array.from(userInformation["given_name"].split(" ")[0])[0] as string}${Array.from(userInformation["family_name"].split(" ")[0])[0] as string}`);
            setCurrentUserName(`${userInformation["given_name"]} ${userInformation["family_name"]}`);

            // set the user's information accordingly
            const userBirthdayComponents = userInformation["birthdate"].split('-');
            setBirthday(`${userBirthdayComponents[1]}/${userBirthdayComponents[2]}/${userBirthdayComponents[0]}`);

            setEmail(userInformation["email"].toLowerCase());
            setPhoneNumber(`${userInformation["phone_number"].substring(0, 2)} (${userInformation["phone_number"].substring(2, 5)}) - ${userInformation["phone_number"].substring(5, 8)} - ${userInformation["phone_number"].substring(8, 12)}`);

            const addressComponents = userInformation["address"]["formatted"].split(',');
            setAddressLine(addressComponents[0].trim());
            setAddressCity(addressComponents[1].trim());
            setAddressState(addressComponents[2].trim());
            setAddressZip(addressComponents[3].trim());

            setEnlistingYear(userInformation["custom:enlistmentYear"]);

            const branchComponents = userInformation["custom:branch"].split('_');
            setMilitaryBranch(
                branchComponents.length === 2
                    ? `${branchComponents[0].charAt(0)}${branchComponents[0].substring(1).toLowerCase()} ${branchComponents[1].charAt(0)}${branchComponents[1].substring(1).toLowerCase()}`
                    : `${branchComponents[0].charAt(0)}${branchComponents[0].substring(1).toLowerCase()}`);

            const filteredDutyStatus = dutyItems.filter((value) => value.value === userInformation["custom:duty_status"]);
            setDutyStatus(filteredDutyStatus[0].value);
        } else {
            // release the loader on button press
            setIsReady(true);
            const message = `Invalid user information structure retrieved!`;
            console.log(message);
            await logEvent(message, LoggingLevel.Error, userIsAuthenticated);

            setModalCustomMessage(`Unexpected error while loading user information!`);
            setModalButtonMessage(`Try Again!`);
            setModalVisible(true);
        }
    }

    /**
     * Function used to pick a profile picture, based on the photo library storage,
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
                            // upload the photo to Cloud storage, under the `profile_picture.png` name, so it can easily be retrieved
                            const [uploadFlag, fileName] = await uploadFile(uri, true, `profile_picture.png`, true);
                            if (!uploadFlag || fileName === null) {
                                const errorMessage = "Error while picking a photo as profile picture!";
                                console.log(errorMessage);
                                await logEvent(errorMessage, LoggingLevel.Error, userIsAuthenticated);

                                setModalCustomMessage(errorMessage);
                                setModalButtonMessage('Try Again!');
                                setModalVisible(true);

                                // release the loader on button press
                                setIsReady(true);

                                return false;
                            } else {
                                // release the loader on button press
                                setIsReady(true);
                                const message = "Profile picture successfully uploaded!";
                                console.log(message);
                                await logEvent(message, LoggingLevel.Info, userIsAuthenticated);

                                // update the Amplify cache accordingly - we will load up the new profile picture at first login load
                                if (globalCache && await globalCache!.getItem(`${userInformation["custom:userId"]}-profilePictureURI`) !== null) {
                                    const message = 'old profile picture is cached, needs cleaning up';
                                    console.log(message);
                                    await logEvent(message, LoggingLevel.Info, userIsAuthenticated);

                                    await globalCache!.removeItem(`${userInformation["custom:userId"]}-profilePictureURI`);
                                }

                                // update the global profile picture state
                                setProfilePictureURI(photoAsset.uri);

                                return true;
                            }
                        } else {
                            const errorMessage = "Invalid photo size. Maximum allotted size is 10MB";
                            console.log(errorMessage);
                            await logEvent(errorMessage, LoggingLevel.Error, userIsAuthenticated);

                            setModalCustomMessage(errorMessage);
                            setModalButtonMessage('Try Again!');
                            setModalVisible(true);

                            // release the loader on button press
                            setIsReady(true);

                            return false;
                        }
                    } else {
                        const errorMessage = `Please pick only 1 photo of for your profile picture to continue!`;
                        console.log(`${errorMessage} - ${result.canceled}`);
                        await logEvent(`${errorMessage} - ${result.canceled}`, LoggingLevel.Error, userIsAuthenticated);

                        setModalCustomMessage(errorMessage);
                        setModalButtonMessage('Try Again!');
                        setModalVisible(true);

                        // release the loader on button press
                        setIsReady(true);

                        return false;
                    }
                } else {
                    const errorMessage = `No photo picked as your profile picture!`;
                    console.log(`${errorMessage} - ${result.canceled}`);
                    await logEvent(`${errorMessage} - ${result.canceled}`, LoggingLevel.Error, userIsAuthenticated);

                    setModalCustomMessage(errorMessage);
                    setModalButtonMessage('Ok');
                    setModalVisible(true);

                    // release the loader on button press
                    setIsReady(true);

                    return false;
                }
            } else {
                const errorMessage = `Permission to access media library was not granted!`;
                console.log(errorMessage);
                await logEvent(errorMessage, LoggingLevel.Warning, userIsAuthenticated);

                setPermissionsModalCustomMessage(errorMessage);
                setPermissionsInstructionsCustomMessage(Platform.OS === 'ios'
                    ? "In order to upload a profile picture, go to Settings -> Moonbeam Finance, and allow Photo access by tapping on the \'Photos\' option."
                    : "In order to upload a profile picture, go to Settings -> Apps -> Moonbeam Finance -> Permissions, and allow Photo access by tapping on the \"Photos and videos\" option.");
                setPermissionsModalVisible(true);

                // release the loader on button press
                setIsReady(true);

                return false;
            }
        } catch (error) {
            const errorMessage = `Error while picking photo of document!`;
            console.log(`${errorMessage} - ${error}`);
            await logEvent(`${errorMessage} - ${error}`, LoggingLevel.Error, userIsAuthenticated);

            setModalCustomMessage(errorMessage);
            setModalButtonMessage('Try Again!');
            setModalVisible(true);

            // release the loader on button press
            setIsReady(true);

            return false;
        }
    }

    /**
     * Function used to update a user's profile information.
     */
    const updateProfile = async (): Promise<void> => {
        try {
            // set the loader on button press
            setIsReady(false);

            // retrieve the current authenticated user
            const user: CognitoUser = await Auth.currentAuthenticatedUser();

            // if there is no authenticated user, then redirect user to login page
            if (user) {
                // format the address according to what Amplify expects
                const formattedAddress = `${addressLine}, ${addressCity}, ${addressState}, ${addressZip}`;
                // format the phone number according to what Amplify expects
                const formattedPhoneNumber = phoneNumber.replaceAll('(', '')
                    .replaceAll(')', '').replaceAll('-', '').replaceAll(' ', '');

                // update the user attributes accordingly (all besides email for now, and in the future phone number as well)
                const updateAttributesResult = await Auth.updateUserAttributes(user, {
                    'address': formattedAddress,
                    'phone_number': formattedPhoneNumber,
                    ...((!userInformation["custom:militaryAffiliation"] || userInformation["custom:militaryAffiliation"] === null) && {
                        'custom:duty_status': dutyStatus
                    })
                })

                // check if the update was successful or not
                if (updateAttributesResult && updateAttributesResult.toLowerCase().includes('success')) {
                    // update the userInformation object with the appropriate updated info
                    setUserInformation({
                        ...userInformation,
                        address: {
                            formatted: formattedAddress
                        },
                        phone_number: formattedPhoneNumber,
                        ...((!userInformation["custom:militaryAffiliation"] || userInformation["custom:militaryAffiliation"] === null) && {
                            ["custom:duty_status"]: dutyStatus
                        })
                    })

                    const message = `Profile information successfully updated!`;
                    console.log(message);
                    await logEvent(message, LoggingLevel.Info, userIsAuthenticated);

                    setModalCustomMessage(message);
                    setModalButtonMessage('Ok');
                    setModalVisible(true);

                    // release the loader on button press
                    setIsReady(true);
                } else {
                    const errorMessage = `Error while updating profile information!`;
                    console.log(errorMessage);
                    await logEvent(errorMessage, LoggingLevel.Error, userIsAuthenticated);

                    setModalCustomMessage(errorMessage);
                    setModalButtonMessage('Try Again!');
                    setModalVisible(true);

                    // release the loader on button press
                    setIsReady(true);
                }
            } else {
                // release the loader on button press
                setIsReady(true);

                // ToDO: re-direct to the Login screen and logout
            }
        } catch (error) {
            const errorMessage = `Error updating profile information!`;
            console.log(`${errorMessage} - ${error}`);
            await logEvent(`${errorMessage} - ${error}`, LoggingLevel.Error, userIsAuthenticated);

            setModalCustomMessage(errorMessage);
            setModalButtonMessage('Try Again!');
            setModalVisible(true);

            // release the loader on button press
            setIsReady(true);
        }
    }

    // return the component for the Profile page
    return (
        <>
            {!isReady ?
                <Spinner loadingSpinnerShown={loadingSpinnerShown} setLoadingSpinnerShown={setLoadingSpinnerShown}/>
                :
                <>
                    <Portal>
                        <Dialog style={commonStyles.permissionsDialogStyle} visible={permissionsModalVisible}
                                onDismiss={() => setPermissionsModalVisible(false)}>
                            <Dialog.Title
                                style={commonStyles.dialogTitle}>{'Permissions not granted!'}</Dialog.Title>
                            <Dialog.Content>
                                <Text
                                    style={commonStyles.dialogParagraph}>{permissionsModalCustomMessage}</Text>
                            </Dialog.Content>
                            <Image source={
                                Platform.OS === 'ios'
                                    ? MoonbeamPreferencesIOS
                                    : MoonbeamPreferencesAndroid
                            }
                                   style={commonStyles.permissionsDialogImage}/>
                            <Dialog.Content>
                                <Text
                                    style={commonStyles.dialogParagraphInstructions}>{permissionsInstructionsCustomMessage}</Text>
                            </Dialog.Content>
                            <Dialog.Actions style={{alignSelf: 'center', flexDirection: 'column'}}>
                                <Button buttonStyle={commonStyles.dialogButton}
                                        titleStyle={commonStyles.dialogButtonText}
                                        onPress={async () => {
                                            // go to the appropriate settings page depending on the OS
                                            if (Platform.OS === 'ios') {
                                                await Linking.openURL("app-settings:");
                                            } else {
                                                await Linking.openSettings();
                                            }
                                            setPermissionsModalVisible(false);
                                            // close the bottom sheet if open
                                            showBottomSheet && setShowBottomSheet(false);
                                            // check if media library permissions have been re-enabled
                                            const mediaLibraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
                                            // if the status is granted
                                            if (mediaLibraryStatus && mediaLibraryStatus.status === 'granted') {
                                                await pickPhoto();
                                            }
                                        }}>
                                    {"Go to App Settings"}
                                </Button>
                                <Button buttonStyle={commonStyles.dialogButtonSkip}
                                        titleStyle={commonStyles.dialogButtonSkipText}
                                        onPress={() => {
                                            setPermissionsModalVisible(false);
                                            // close the bottom sheet if open
                                            showBottomSheet && setShowBottomSheet(false);
                                        }}>
                                    {"Skip"}
                                </Button>
                            </Dialog.Actions>
                        </Dialog>
                    </Portal>
                    <Portal>
                        <Dialog style={[commonStyles.dialogStyle, {backgroundColor: '#313030'}]} visible={modalVisible}
                                onDismiss={() => setModalVisible(false)}>
                            <Dialog.Icon icon="alert" color={"#F2FF5D"}
                                         size={hp(10)}/>
                            <Dialog.Title
                                style={commonStyles.dialogTitle}>{modalButtonMessage === 'Ok' ? 'Great' : 'We hit a snag!'}</Dialog.Title>
                            <Dialog.Content>
                                <Text
                                    style={commonStyles.dialogParagraph}>{modalCustomMessage}</Text>
                            </Dialog.Content>
                            <Dialog.Actions>
                                <Button buttonStyle={commonStyles.dialogButton}
                                        titleStyle={commonStyles.dialogButtonText}
                                        onPress={() => {
                                            setModalVisible(false);

                                            // depending on the button action, act accordingly
                                            if (modalButtonMessage === 'Dismiss') {
                                                // go back
                                                navigation.goBack();

                                                // make the app drawer header visible
                                                setAppDrawerHeaderShown(true);
                                            }
                                            // close the bottom sheet if open
                                            showBottomSheet && setShowBottomSheet(false);
                                        }}>
                                    {modalButtonMessage}
                                </Button>
                            </Dialog.Actions>
                        </Dialog>
                    </Portal>
                    <SafeAreaView style={styles.mainContainer}>
                        <View style={[styles.topContainer, StyleSheet.absoluteFill, {marginBottom: -hp(30)}]}>
                            <TouchableOpacity
                                activeOpacity={1}
                                disabled={!showBottomSheet}
                                onPress={() => {
                                    // @ts-ignore
                                    bottomSheetRef.current?.close?.();
                                    setShowBottomSheet(true);
                                }}
                            >
                                <View
                                    {...showBottomSheet && {pointerEvents: "none"}}
                                    {...showBottomSheet && {
                                        style: {backgroundColor: '#313030', opacity: 0.7}
                                    }}
                                >
                                    <KeyboardAwareScrollView
                                        scrollEnabled={true}
                                        showsVerticalScrollIndicator={false}
                                        enableOnAndroid={true}
                                        enableAutomaticScroll={(Platform.OS === 'ios')}
                                        keyboardShouldPersistTaps={'handled'}
                                    >
                                        <View style={Platform.OS === 'android' && isKeyboardShown && {height: hp(220)}}>
                                            <LinearGradient
                                                start={{x: 0.5, y: 0.05}}
                                                end={{x: 0.5, y: 1}}
                                                colors={['#313030', 'transparent']}>
                                                <View>
                                                    {
                                                        (!profilePictureURI || profilePictureURI === "") ?
                                                            <Avatar
                                                                {...(profilePictureURI && profilePictureURI !== "") && {
                                                                    source: {
                                                                        uri: profilePictureURI,
                                                                        cache: 'reload'
                                                                    }
                                                                }
                                                                }
                                                                avatarStyle={{
                                                                    resizeMode: 'cover',
                                                                    borderColor: '#F2FF5D',
                                                                    borderWidth: 3
                                                                }}
                                                                size={hp(20)}
                                                                rounded
                                                                title={(!profilePictureURI || profilePictureURI === "") ? currentUserTitle : undefined}
                                                                {...(!profilePictureURI || profilePictureURI === "") && {
                                                                    titleStyle: [
                                                                        styles.titleStyle
                                                                    ]
                                                                }}
                                                                containerStyle={styles.avatarStyle}
                                                                onPress={async () => {
                                                                    // first pick and upload a photo to storage
                                                                    await pickPhoto();
                                                                }}
                                                            >
                                                                <Avatar.Accessory
                                                                    size={hp(5)}
                                                                    style={styles.avatarAccessoryStyle}
                                                                    color={'#F2FF5D'}
                                                                    iconProps={{
                                                                        name: 'camera-alt'
                                                                    }}
                                                                    onPress={async () => {
                                                                        // first pick and upload a photo to storage
                                                                        await pickPhoto();
                                                                    }}
                                                                />
                                                            </Avatar>
                                                            :
                                                            <TouchableOpacity
                                                                onPress={async () => {
                                                                    // first pick and upload a photo to storage
                                                                    await pickPhoto();
                                                                }}
                                                            >
                                                                <ExpoImage
                                                                    style={styles.profileImage}
                                                                    source={{
                                                                        uri: profilePictureURI
                                                                    }}
                                                                    placeholder={MoonbeamProfilePlaceholder}
                                                                    placeholderContentFit={'cover'}
                                                                    contentFit={'cover'}
                                                                    transition={1000}
                                                                    cachePolicy={'memory-disk'}
                                                                />
                                                                <Avatar.Accessory
                                                                    size={hp(5)}
                                                                    style={styles.profileImageAccessoryStyle}
                                                                    color={'#F2FF5D'}
                                                                    iconProps={{
                                                                        name: 'camera-alt'
                                                                    }}
                                                                    onPress={async () => {
                                                                        // first pick and upload a photo to storage
                                                                        await pickPhoto();
                                                                    }}
                                                                />
                                                            </TouchableOpacity>
                                                    }
                                                    <Text numberOfLines={3} textBreakStrategy={"simple"}
                                                          style={[styles.userNameStyle]}>{currentUserName}</Text>
                                                    <TouchableOpacity
                                                        style={styles.editButton}
                                                        onPress={
                                                            async () => {
                                                                // check if we are editing, and we want to save
                                                                if (editingFlag) {
                                                                    if ((!userInformation["custom:militaryAffiliation"] || userInformation["custom:militaryAffiliation"] === null)) {
                                                                        if (email === "" || phoneNumber === "" || addressLine === "" || addressCity === "" || addressState === "" || addressZip === "" ||
                                                                            dutyStatus === "" || emailErrors.length !== 0 || phoneErrors.length !== 0 || addressLineErrors.length !== 0 || addressCityErrors.length !== 0 ||
                                                                            addressStateErrors.length !== 0 || addressZipErrors.length !== 0 || dutyStatusErrors.length !== 0) {
                                                                            // only populate main error if there are no other errors showing
                                                                            if (emailErrors.length === 0 && phoneErrors.length === 0 &&
                                                                                addressLineErrors.length === 0 && addressCityErrors.length === 0 && addressStateErrors.length === 0 &&
                                                                                addressZipErrors.length === 0 && dutyStatusErrors.length === 0) {
                                                                                setProfileUpdatesMainError(true);
                                                                            }
                                                                        } else {
                                                                            setProfileUpdatesMainError(false);

                                                                            // we first need to decide whether there's a need for an email or phone verification screen to show up
                                                                            if (email.toLowerCase() !== userInformation["email"].toLowerCase()) {
                                                                                // show the bottom sheet
                                                                                setShowBottomSheet(true);

                                                                                // close the keyboard so it doesn't overlap with anything
                                                                                Keyboard.dismiss();

                                                                                // performs the actual saving of fields in the bottom sheet
                                                                            } else {
                                                                                // performs the actual saving of fields here
                                                                                await updateProfile();

                                                                                // changes the editing flag accordingly
                                                                                setEditingFlag(false);
                                                                            }
                                                                        }
                                                                    } else {
                                                                        if (email === "" || phoneNumber === "" || addressLine === "" || addressCity === "" || addressState === "" || addressZip === "" ||
                                                                            emailErrors.length !== 0 || phoneErrors.length !== 0 || addressLineErrors.length !== 0 || addressCityErrors.length !== 0 ||
                                                                            addressStateErrors.length !== 0 || addressZipErrors.length !== 0) {
                                                                            // only populate main error if there are no other errors showing
                                                                            if (emailErrors.length === 0 && phoneErrors.length === 0 &&
                                                                                addressLineErrors.length === 0 && addressCityErrors.length === 0 && addressStateErrors.length === 0 &&
                                                                                addressZipErrors.length === 0) {
                                                                                setProfileUpdatesMainError(true);
                                                                            }
                                                                        } else {
                                                                            setProfileUpdatesMainError(false);

                                                                            // we first need to decide whether there's a need for an email or phone verification screen to show up
                                                                            if (email.toLowerCase() !== userInformation["email"].toLowerCase()) {
                                                                                // show the bottom sheet
                                                                                setShowBottomSheet(true);

                                                                                // close the keyboard so it doesn't overlap with anything
                                                                                Keyboard.dismiss();

                                                                                // performs the actual saving of fields in the bottom sheet
                                                                            } else {
                                                                                // performs the actual saving of fields here
                                                                                await updateProfile();

                                                                                // changes the editing flag accordingly
                                                                                setEditingFlag(false);
                                                                            }
                                                                        }
                                                                    }
                                                                } else {
                                                                    // set the editing flag accordingly
                                                                    setEditingFlag(true);
                                                                }
                                                            }
                                                        }
                                                    >
                                                        <Text
                                                            style={styles.buttonText}>{!editingFlag ? 'Edit Profile' : 'Save Changes'}</Text>
                                                    </TouchableOpacity>
                                                </View>
                                                {(!userInformation["custom:militaryAffiliation"] || userInformation["custom:militaryAffiliation"] === null) ?
                                                    (profileUpdatesMainError
                                                        ?
                                                        <Text
                                                            style={styles.errorMessage}>Please
                                                            fill out the information below!</Text>
                                                        : (emailErrors.length !== 0 && !profileUpdatesMainError)
                                                            ? <Text
                                                                style={styles.errorMessage}>{emailErrors[0]}</Text>
                                                            : (phoneErrors.length !== 0 && !profileUpdatesMainError)
                                                                ? <Text
                                                                    style={styles.errorMessage}>{phoneErrors[0]}</Text>
                                                                : (addressLineErrors.length !== 0 && !profileUpdatesMainError)
                                                                    ? <Text
                                                                        style={styles.errorMessage}>{addressLineErrors[0]}</Text>
                                                                    : (addressCityErrors.length !== 0 && !profileUpdatesMainError)
                                                                        ?
                                                                        <Text
                                                                            style={styles.errorMessage}>{addressCityErrors[0]}</Text>
                                                                        : (addressStateErrors.length !== 0 && !profileUpdatesMainError)
                                                                            ? <Text
                                                                                style={styles.errorMessage}>{addressStateErrors[0]}</Text>
                                                                            : (addressZipErrors.length !== 0 && !profileUpdatesMainError)
                                                                                ? <Text
                                                                                    style={styles.errorMessage}>{addressZipErrors[0]}</Text>
                                                                                : (dutyStatusErrors.length !== 0 && !profileUpdatesMainError)
                                                                                    ? <Text
                                                                                        style={styles.errorMessage}>{dutyStatusErrors[0]}</Text>
                                                                                    : <></>)
                                                    : (profileUpdatesMainError
                                                        ?
                                                        <Text
                                                            style={styles.errorMessage}>Please
                                                            fill out the information below!</Text>
                                                        : (emailErrors.length !== 0 && !profileUpdatesMainError)
                                                            ? <Text
                                                                style={styles.errorMessage}>{emailErrors[0]}</Text>
                                                            : (phoneErrors.length !== 0 && !profileUpdatesMainError)
                                                                ? <Text
                                                                    style={styles.errorMessage}>{phoneErrors[0]}</Text>
                                                                : (addressLineErrors.length !== 0 && !profileUpdatesMainError)
                                                                    ? <Text
                                                                        style={styles.errorMessage}>{addressLineErrors[0]}</Text>
                                                                    : (addressCityErrors.length !== 0 && !profileUpdatesMainError)
                                                                        ?
                                                                        <Text
                                                                            style={styles.errorMessage}>{addressCityErrors[0]}</Text>
                                                                        : (addressStateErrors.length !== 0 && !profileUpdatesMainError)
                                                                            ? <Text
                                                                                style={styles.errorMessage}>{addressStateErrors[0]}</Text>
                                                                            : (addressZipErrors.length !== 0 && !profileUpdatesMainError)
                                                                                ? <Text
                                                                                    style={styles.errorMessage}>{addressZipErrors[0]}</Text>
                                                                                : <></>)
                                                }
                                                <View
                                                    style={styles.profileContentView}>
                                                    <TextInput
                                                        autoCorrect={false}
                                                        autoComplete={"off"}
                                                        disabled={true}
                                                        placeholderTextColor={'#D9D9D9'}
                                                        activeUnderlineColor={'#F2FF5D'}
                                                        underlineColor={'#D9D9D9'}
                                                        outlineColor={'#D9D9D9'}
                                                        activeOutlineColor={'#F2FF5D'}
                                                        selectionColor={'#F2FF5D'}
                                                        mode={'flat'}
                                                        value={birthday}
                                                        contentStyle={styles.textInputContentStyle}
                                                        style={styles.textInputNonEditable}
                                                        label="Birthday"
                                                        textColor={"#FFFFFF"}
                                                        left={<TextInput.Icon icon="cake" color="#FFFFFF"/>}
                                                    />
                                                    <TextInput
                                                        autoCapitalize={"none"}
                                                        autoCorrect={false}
                                                        autoComplete={"off"}
                                                        disabled={!editingFlag}
                                                        keyboardType={"email-address"}
                                                        placeholderTextColor={'#D9D9D9'}
                                                        activeUnderlineColor={'#F2FF5D'}
                                                        underlineColor={'#D9D9D9'}
                                                        outlineColor={'#D9D9D9'}
                                                        activeOutlineColor={'#F2FF5D'}
                                                        selectionColor={'#F2FF5D'}
                                                        mode={'flat'}
                                                        onChangeText={(value: React.SetStateAction<string>) => {
                                                            setIsEmailFocus(true);
                                                            setProfileUpdatesMainError(false);
                                                            setEmail(value);
                                                        }}
                                                        onBlur={() => {
                                                            setIsEmailFocus(false);
                                                        }}
                                                        value={email}
                                                        contentStyle={styles.textInputContentStyle}
                                                        style={[emailFocus ? styles.textInputFocus : !editingFlag ? styles.textInputNonEditable : styles.textInput, {marginTop: hp(3)}]}
                                                        onFocus={() => {
                                                            setIsEmailFocus(true);

                                                            // close the dropdown if opened
                                                            dropdownDutyState && setDropdownDutyState(false);
                                                        }}
                                                        placeholder={'Required'}
                                                        label="Email"
                                                        textColor={"#FFFFFF"}
                                                        left={<TextInput.Icon icon="email" color="#FFFFFF"/>}
                                                        {...editingFlag && {
                                                            right: <TextInput.Icon icon="pencil" color="#F2FF5D"/>
                                                        }}
                                                    />
                                                    <TextInput
                                                        autoCorrect={false}
                                                        autoComplete={"off"}
                                                        disabled={!editingFlag}
                                                        keyboardType={"phone-pad"}
                                                        placeholderTextColor={'#D9D9D9'}
                                                        activeUnderlineColor={'#F2FF5D'}
                                                        underlineColor={'#D9D9D9'}
                                                        outlineColor={'#D9D9D9'}
                                                        activeOutlineColor={'#F2FF5D'}
                                                        selectionColor={'#F2FF5D'}
                                                        mode={'flat'}
                                                        onChangeText={(value: React.SetStateAction<string>) => {
                                                            setIsPhoneNumberFocus(true);
                                                            setProfileUpdatesMainError(false);

                                                            // format value
                                                            value = fieldValidator.formatPhoneNumber(phoneNumber, value.toString());

                                                            setPhoneNumber(value);
                                                        }}
                                                        onBlur={() => {
                                                            setIsPhoneNumberFocus(false);
                                                        }}
                                                        value={phoneNumber}
                                                        contentStyle={styles.textInputContentStyle}
                                                        style={[phoneNumberFocus ? styles.textInputFocus : !editingFlag ? styles.textInputNonEditable : styles.textInput, {marginTop: hp(3)}]}
                                                        onFocus={() => {
                                                            setIsPhoneNumberFocus(true);

                                                            // close the dropdown if opened
                                                            dropdownDutyState && setDropdownDutyState(false);
                                                        }}
                                                        placeholder={'Required +1 (XXX)-XXX-XXXX'}
                                                        label="Phone Number"
                                                        textColor={"#FFFFFF"}
                                                        left={<TextInput.Icon icon="phone" color="#FFFFFF"/>}
                                                        {...editingFlag && {
                                                            right: <TextInput.Icon icon="pencil" color="#F2FF5D"/>
                                                        }}
                                                    />
                                                    <TextInput
                                                        autoCapitalize={"sentences"}
                                                        autoCorrect={false}
                                                        autoComplete={"off"}
                                                        disabled={!editingFlag}
                                                        keyboardType={"default"}
                                                        placeholderTextColor={'#D9D9D9'}
                                                        activeUnderlineColor={'#F2FF5D'}
                                                        underlineColor={'#D9D9D9'}
                                                        outlineColor={'#D9D9D9'}
                                                        activeOutlineColor={'#F2FF5D'}
                                                        selectionColor={'#F2FF5D'}
                                                        mode={'flat'}
                                                        onChangeText={(value: React.SetStateAction<string>) => {
                                                            setIsAddressLineFocus(true);
                                                            setProfileUpdatesMainError(false);
                                                            setAddressLine(value);
                                                        }}
                                                        onBlur={() => {
                                                            setIsAddressLineFocus(false);
                                                        }}
                                                        value={addressLine}
                                                        contentStyle={styles.textInputContentStyle}
                                                        style={[addressLineFocus ? styles.textInputFocus : !editingFlag ? styles.textInputNonEditable : styles.textInput, {marginTop: hp(3)}]}
                                                        onFocus={() => {
                                                            setIsAddressLineFocus(true);

                                                            // close the dropdown if opened
                                                            dropdownDutyState && setDropdownDutyState(false);
                                                        }}
                                                        placeholder={'Required (1 West Example Street)'}
                                                        label="Street Address"
                                                        textColor={"#FFFFFF"}
                                                        left={<TextInput.Icon icon="home-map-marker"
                                                                              color="#FFFFFF"/>}
                                                        {...editingFlag && {
                                                            right: <TextInput.Icon icon="pencil" color="#F2FF5D"/>
                                                        }}
                                                    />
                                                    <TextInput
                                                        autoCapitalize={"sentences"}
                                                        autoCorrect={false}
                                                        autoComplete={"off"}
                                                        disabled={!editingFlag}
                                                        keyboardType={"default"}
                                                        placeholderTextColor={'#D9D9D9'}
                                                        activeUnderlineColor={'#F2FF5D'}
                                                        underlineColor={'#D9D9D9'}
                                                        outlineColor={'#D9D9D9'}
                                                        activeOutlineColor={'#F2FF5D'}
                                                        selectionColor={'#F2FF5D'}
                                                        mode={'flat'}
                                                        onChangeText={(value: React.SetStateAction<string>) => {
                                                            setIsAddressCityFocus(true);
                                                            setProfileUpdatesMainError(false);
                                                            setAddressCity(value);
                                                        }}
                                                        onBlur={() => {
                                                            setIsAddressCityFocus(false);
                                                        }}
                                                        value={addressCity}
                                                        contentStyle={styles.textInputContentStyle}
                                                        style={[addressCityFocus ? styles.textInputFocus : !editingFlag ? styles.textInputNonEditable : styles.textInput, {marginTop: hp(3)}]}
                                                        onFocus={() => {
                                                            setIsAddressCityFocus(true);

                                                            // close the dropdown if opened
                                                            dropdownDutyState && setDropdownDutyState(false);
                                                        }}
                                                        placeholder={'Required'}
                                                        label="City"
                                                        textColor={"#FFFFFF"}
                                                        left={<TextInput.Icon icon="home-city" color="#FFFFFF"/>}
                                                        {...editingFlag && {
                                                            right: <TextInput.Icon icon="pencil" color="#F2FF5D"/>
                                                        }}
                                                    />
                                                    <View style={styles.inputColumnViewAddress}>
                                                        <TextInput
                                                            autoCapitalize={"characters"}
                                                            autoCorrect={false}
                                                            autoComplete={"off"}
                                                            disabled={!editingFlag}
                                                            keyboardType={"default"}
                                                            placeholderTextColor={'#D9D9D9'}
                                                            activeUnderlineColor={'#F2FF5D'}
                                                            underlineColor={'#D9D9D9'}
                                                            outlineColor={'#D9D9D9'}
                                                            activeOutlineColor={'#F2FF5D'}
                                                            selectionColor={'#F2FF5D'}
                                                            mode={'flat'}
                                                            onChangeText={(value: React.SetStateAction<string>) => {
                                                                setIsAddressStateFocus(true);
                                                                setProfileUpdatesMainError(false);
                                                                setAddressState(value);
                                                            }}
                                                            onBlur={() => {
                                                                setIsAddressStateFocus(false);
                                                            }}
                                                            value={addressState}
                                                            contentStyle={styles.textInputNarrowContentStyle}
                                                            style={[addressStateFocus ? styles.textInputNarrowFocus : !editingFlag ? styles.textInputNarrowNonEditable : styles.textInputNarrow]}
                                                            onFocus={() => {
                                                                setIsAddressStateFocus(true);

                                                                // close the dropdown if opened
                                                                dropdownDutyState && setDropdownDutyState(false);
                                                            }}
                                                            placeholder={'Required'}
                                                            label="State"
                                                            textColor={"#FFFFFF"}
                                                            left={<TextInput.Icon icon="flag" color="#FFFFFF"/>}
                                                            {...editingFlag && {
                                                                right: <TextInput.Icon icon="pencil"
                                                                                       color="#F2FF5D"/>
                                                            }}
                                                        />
                                                        <TextInput
                                                            autoCorrect={false}
                                                            autoComplete={"off"}
                                                            disabled={!editingFlag}
                                                            keyboardType={"number-pad"}
                                                            placeholderTextColor={'#D9D9D9'}
                                                            activeUnderlineColor={'#F2FF5D'}
                                                            underlineColor={'#D9D9D9'}
                                                            outlineColor={'#D9D9D9'}
                                                            activeOutlineColor={'#F2FF5D'}
                                                            selectionColor={'#F2FF5D'}
                                                            mode={'flat'}
                                                            onChangeText={(value: React.SetStateAction<string>) => {
                                                                setIsAddressZipFocus(true);
                                                                setProfileUpdatesMainError(false);
                                                                setAddressZip(value);
                                                            }}
                                                            onBlur={() => {
                                                                setIsAddressZipFocus(false);
                                                            }}
                                                            value={addressZip}
                                                            contentStyle={styles.textInputNarrowContentStyle}
                                                            style={[addressZipFocus ? styles.textInputNarrowFocus : !editingFlag ? styles.textInputNarrowNonEditable : styles.textInputNarrow, {
                                                                marginTop: hp(0),
                                                                marginLeft: wp(7)
                                                            }]}
                                                            onFocus={() => {
                                                                setIsAddressZipFocus(true);

                                                                // close the dropdown if opened
                                                                dropdownDutyState && setDropdownDutyState(false);
                                                            }}
                                                            placeholder={'Required'}
                                                            label="Zip"
                                                            textColor={"#FFFFFF"}
                                                            left={<TextInput.Icon icon="dialpad" color="#FFFFFF"/>}
                                                            {...editingFlag && {
                                                                right: <TextInput.Icon icon="pencil"
                                                                                       color="#F2FF5D"/>
                                                            }}
                                                        />
                                                    </View>
                                                    {
                                                        (!userInformation["custom:militaryAffiliation"] || userInformation["custom:militaryAffiliation"] === null) &&
                                                        <>
                                                            <View style={styles.pickerView}>
                                                                <DropDownPicker
                                                                    showArrowIcon={editingFlag}
                                                                    ArrowDownIconComponent={({}) => (
                                                                        <TextInput.Icon
                                                                            style={{right: 30, bottom: 10}}
                                                                            color="#F2FF5D"
                                                                            icon="pencil"
                                                                            onPress={() => {
                                                                                setDropdownDutyState(true);
                                                                            }}
                                                                        />
                                                                    )}
                                                                    disabled={!editingFlag}
                                                                    zIndex={5000}
                                                                    placeholder={"Duty Status"}
                                                                    // containerStyle={dropdownDutyState && Platform.OS === 'android' && {height: hp(25)}}
                                                                    dropDownContainerStyle={[!editingFlag ? styles.dropdownContainerNonEditable : styles.dropdownContainer, Platform.OS === 'android' ? {height: hp(20)} : {height: hp(15)}]}
                                                                    style={!editingFlag
                                                                        ? (styles.dropdownPickerNonEditable)
                                                                        : (styles.dropdownPicker)}
                                                                    dropDownDirection={"BOTTOM"}
                                                                    open={dropdownDutyState}
                                                                    value={dutyStatus === "" ? null : dutyStatus}
                                                                    items={dutyItems}
                                                                    setOpen={setDropdownDutyState}
                                                                    setValue={setDutyStatus}
                                                                    setItems={setDutyItems}
                                                                    onOpen={() => {
                                                                        setProfileUpdatesMainError(false);
                                                                    }}
                                                                    onClose={() => {
                                                                        setDropdownDutyState(false);
                                                                    }}
                                                                    onSelectItem={(item) => {
                                                                        setDutyStatus(item.value!);

                                                                        // validate value
                                                                        fieldValidator.validateField(item.value!, "dutyStatus", setDutyStatusErrors);
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
                                                                    listItemLabelStyle={styles.textInputContentStyle}
                                                                    modalTitle={"Select your Duty Status"}
                                                                    // @ts-ignore
                                                                    arrowIconStyle={{tintColor: '#FFFFFF'}}
                                                                    // @ts-ignore
                                                                    closeIconStyle={{tintColor: '#FFFFFF'}}
                                                                    placeholderStyle={styles.textInputContentStyle}
                                                                    // @ts-ignore
                                                                    tickIconStyle={{tintColor: '#313030'}}
                                                                    selectedItemLabelStyle={[styles.textInputContentStyle, {color: '#313030'}]}
                                                                    selectedItemContainerStyle={{backgroundColor: '#D9D9D9'}}
                                                                    itemSeparator={false}
                                                                    labelStyle={styles.textInputContentStyle}
                                                                />
                                                            </View>
                                                            <TextInput
                                                                autoCorrect={false}
                                                                autoComplete={"off"}
                                                                disabled={true}
                                                                placeholderTextColor={'#D9D9D9'}
                                                                activeUnderlineColor={'#F2FF5D'}
                                                                underlineColor={'#D9D9D9'}
                                                                outlineColor={'#D9D9D9'}
                                                                activeOutlineColor={'#F2FF5D'}
                                                                selectionColor={'#F2FF5D'}
                                                                mode={'flat'}
                                                                value={enlistingYear}
                                                                contentStyle={styles.textInputContentStyle}
                                                                style={[styles.textInputNonEditable, {marginTop: hp(7.5)}]}
                                                                label="Year of Enlistment/Commission"
                                                                textColor={"#FFFFFF"}
                                                                left={<TextInput.Icon icon="calendar" color="#FFFFFF"/>}
                                                            />
                                                            <TextInput
                                                                autoCapitalize={"sentences"}
                                                                autoCorrect={false}
                                                                autoComplete={"off"}
                                                                disabled={true}
                                                                placeholderTextColor={'#D9D9D9'}
                                                                activeUnderlineColor={'#F2FF5D'}
                                                                underlineColor={'#D9D9D9'}
                                                                outlineColor={'#D9D9D9'}
                                                                activeOutlineColor={'#F2FF5D'}
                                                                selectionColor={'#F2FF5D'}
                                                                mode={'flat'}
                                                                value={militaryBranch}
                                                                contentStyle={styles.textInputContentStyle}
                                                                style={[styles.textInputNonEditable, {marginTop: hp(3)}]}
                                                                label="Military Branch"
                                                                textColor={"#FFFFFF"}
                                                                left={<TextInput.Icon icon="tank" color="#FFFFFF"/>}
                                                            />
                                                        </>
                                                    }
                                                </View>
                                            </LinearGradient>
                                        </View>
                                    </KeyboardAwareScrollView>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                    {
                        showBottomSheet &&
                        <BottomSheet
                            ref={bottomSheetRef}
                            backgroundStyle={styles.bottomSheet}
                            enablePanDownToClose={true}
                            index={showBottomSheet ? 0 : -1}
                            snapPoints={[hp(65), hp(65)]}
                            onChange={(index) => {
                                setShowBottomSheet(index !== -1);
                            }}
                        >
                            {showBottomSheet &&
                                <CodeVerificationBottomSheet
                                    verificationType={CodeVerificationType.EMAIL}
                                    email={email.toLowerCase()}
                                    phoneNumber={phoneNumber.replaceAll('(', '')
                                        .replaceAll(')', '').replaceAll('-', '').replaceAll(' ', '')}
                                    address={`${addressLine}, ${addressCity}, ${addressState}, ${addressZip}`}
                                    dutyStatus={dutyStatus}
                                />
                            }
                        </BottomSheet>
                    }
                </>
            }
        </>
    );
}
