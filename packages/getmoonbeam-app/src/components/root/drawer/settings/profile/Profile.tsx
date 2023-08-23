import {Dimensions, Platform, SafeAreaView, StyleSheet, TouchableOpacity, View} from "react-native";
import {Dialog, Portal, Text, TextInput} from "react-native-paper";
import React, {useEffect, useRef, useState} from "react";
import {commonStyles} from "../../../../../styles/common.module";
import {styles} from "../../../../../styles/profile.module";
// @ts-ignore
import FaceIDIcon from '../../../../../../assets/face-id-icon.png';
import {useRecoilState} from "recoil";
import {currentUserInformation} from "../../../../../recoil/AuthAtom";
import {Spinner} from "../../../../common/Spinner";
import {ProfileProps} from "../../../../../models/props/SettingsProps";
import {appDrawerHeaderShownState, drawerSwipeState, profilePictureURIState} from "../../../../../recoil/AppDrawerAtom";
import {LinearGradient} from "expo-linear-gradient";
import * as Device from "expo-device";
import {DeviceType} from "expo-device";
import {Avatar, Button} from "@rneui/base";
import {deviceTypeState} from "../../../../../recoil/RootAtom";
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

/**
 * Profile component
 *
 * @constructor constructor for the component
 */
export const Profile = ({navigation}: ProfileProps) => {
    // constants used to keep track of local component state
    const [isReady, setIsReady] = useState<boolean>(true);
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [modalCustomMessage, setModalCustomMessage] = useState<string>("");
    const [modalButtonMessage, setModalButtonMessage] = useState<string>("");
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
    const [showBottomSheet, setShowBottomSheet] = useRecoilState(codeVerificationSheetShown);
    const [codeVerified, setCodeVerified] = useRecoilState(codeVerifiedState);
    const [userInformation, setUserInformation] = useRecoilState(currentUserInformation);
    const [, setDrawerSwipeEnabled] = useRecoilState(drawerSwipeState);
    const [profilePictureURI, setProfilePictureURI] = useRecoilState(profilePictureURIState);
    const [appDrawerHeaderShown, setAppDrawerHeaderShown] = useRecoilState(appDrawerHeaderShownState);
    const [deviceType, setDeviceType] = useRecoilState(deviceTypeState);

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

                setModalCustomMessage(message);
                setModalButtonMessage('Ok');
                setModalVisible(true);

                // reset the flag
                setCodeVerified(false);
            }

            // check and set the type of device, to be used throughout the app
            Device.getDeviceTypeAsync().then(deviceType => {
                setDeviceType(deviceType);
            });

            // disable the swipe for the drawer
            setDrawerSwipeEnabled(false);

            // hide the app drawer header on load
            setAppDrawerHeaderShown(false);

            // populate the information from the information object
            birthday === "" && email === "" && phoneNumber === "" && addressLine === "" &&
            addressCity === "" && addressState === "" && addressZip === "" && enlistingYear === "" &&
            dutyStatus === "" && retrieveUserInfo();

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
    }, [userInformation["custom:userId"],
        appDrawerHeaderShown, userInformation, profilePictureURI,
        email, emailFocus, phoneNumber, phoneNumberFocus, dutyStatus,
        addressLine, addressLineFocus, addressCity, addressCityFocus,
        addressState, addressStateFocus, addressZip, addressZipFocus,
        showBottomSheet, bottomSheetRef, deviceType, editingFlag,
        codeVerified]);

    /**
     * Function used to retrieve the user information from the shared user info
     * object, and format it appropriately.
     */
    const retrieveUserInfo = (): void => {
        // set a loader on button press
        setIsReady(false);

        // check to see if the user information object has been populated accordingly
        if (userInformation["given_name"] &&
            userInformation["family_name"] && userInformation["birthdate"] &&
            userInformation["email"] && userInformation["phone_number"] &&
            userInformation["address"] && userInformation["address"]["formatted"] &&
            userInformation["custom:enlistmentYear"] && userInformation["custom:branch"] &&
            userInformation["custom:duty_status"]) {
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
            console.log(`Invalid user information structure retrieved!`);

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
                            // upload the photo to Cloud storage, under the `profile_picture.png` name, so it can easily be retrieved
                            const [uploadFlag, fileName] = await uploadFile(uri, true, `profile_picture.png`, true);
                            if (!uploadFlag || fileName === null) {
                                const errorMessage = "Error while picking a photo as profile picture!";
                                console.log(errorMessage);

                                setModalCustomMessage(errorMessage);
                                setModalButtonMessage('Try Again!');
                                setModalVisible(true);

                                // release the loader on button press
                                setIsReady(true);

                                return false;
                            } else {
                                // release the loader on button press
                                setIsReady(true);
                                console.log("Profile picture successfully uploaded!");

                                // update the global profile picture state
                                setProfilePictureURI(photoAsset.uri);

                                return true;
                            }
                        } else {
                            const errorMessage = "Invalid photo size. Maximum allotted size is 10MB";
                            console.log(errorMessage);

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

                setModalCustomMessage(errorMessage);
                setModalButtonMessage('Try Again!');
                setModalVisible(true);

                // release the loader on button press
                setIsReady(true);

                return false;
            }
        } catch (error) {
            const errorMessage = `Error while picking photo of document!`;
            console.log(`${errorMessage} - ${error}`);

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
                    // ToDo: in the future need to have a separate flow for the phone number, as we have one for email
                    'phone_number': formattedPhoneNumber,
                    'custom:duty_status': dutyStatus
                });

                // check if the update was successful or not
                if (updateAttributesResult && updateAttributesResult.toLowerCase().includes('success')) {
                    // update the userInformation object with the appropriate updated info
                    setUserInformation({
                        ...userInformation,
                        address: {
                            formatted: formattedAddress
                        },
                        phone_number: formattedPhoneNumber,
                        ["custom:duty_status"]: dutyStatus
                    });

                    const message = `Profile information successfully updated!`;
                    console.log(message);

                    setModalCustomMessage(message);
                    setModalButtonMessage('Ok');
                    setModalVisible(true);

                    // release the loader on button press
                    setIsReady(true);
                } else {
                    const errorMessage = `Error while updating profile information!`;
                    console.log(errorMessage);

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
                        <Dialog style={[commonStyles.dialogStyle, {backgroundColor: '#313030'}]} visible={modalVisible}
                                onDismiss={() => setModalVisible(false)}>
                            <Dialog.Icon icon="alert" color={"#F2FF5D"}
                                         size={Dimensions.get('window').height / 14}/>
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
                        <View style={[styles.topContainer, StyleSheet.absoluteFill]}>
                            <KeyboardAwareScrollView
                                scrollEnabled={true}
                                showsVerticalScrollIndicator={false}
                                enableOnAndroid={true}
                                enableAutomaticScroll={(Platform.OS === 'ios')}
                                keyboardShouldPersistTaps={'handled'}
                            >
                                <LinearGradient
                                    start={{x: 0.5, y: 0.05}}
                                    end={{x: 0.5, y: 1}}
                                    colors={['#313030', 'transparent']}>
                                    <View>
                                        <Avatar
                                            {...(profilePictureURI && profilePictureURI !== "") && {
                                                source: {
                                                    uri: profilePictureURI,
                                                    cache: 'force-cache'
                                                }
                                            }
                                            }
                                            avatarStyle={{
                                                resizeMode: 'cover',
                                                borderColor: '#F2FF5D',
                                                borderWidth: 3
                                            }}
                                            size={deviceType === DeviceType.TABLET ? 300 : Dimensions.get('window').height / 5}
                                            rounded
                                            title={(!profilePictureURI || profilePictureURI === "") ? currentUserTitle : undefined}
                                            {...(!profilePictureURI || profilePictureURI === "") && {
                                                titleStyle: [
                                                    styles.titleStyle, deviceType === DeviceType.TABLET ? {fontSize: 84} : {fontSize: Dimensions.get('window').width / 6}
                                                ]
                                            }}
                                            containerStyle={styles.avatarStyle}
                                            onPress={async () => {
                                                // first pick and upload a photo to storage
                                                await pickPhoto();
                                            }}
                                        >
                                            <Avatar.Accessory
                                                size={deviceType == DeviceType.TABLET ? 60 : Dimensions.get('window').width / 10}
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
                                        <Text numberOfLines={3} textBreakStrategy={"simple"}
                                              style={[styles.userNameStyle,
                                                  deviceType === DeviceType.TABLET
                                                      ? {
                                                          fontSize: 45,
                                                          top: '7%',
                                                          marginBottom: '30%',
                                                          width: Dimensions.get('window').width / 2.1
                                                      }
                                                      : {
                                                          fontSize: Dimensions.get('window').width / 15,
                                                          top: '7%',
                                                          marginBottom: '30%',
                                                          width: Dimensions.get('window').width / 1.6
                                                      }]}>{currentUserName}</Text>
                                        <TouchableOpacity
                                            style={styles.editButton}
                                            onPress={
                                                async () => {
                                                    // check if we are editing, and we want to save
                                                    if (editingFlag) {
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
                                                                setShowBottomSheet(true);
                                                                // performs the actual saving of fields in the bottom sheet
                                                            } else {
                                                                // performs the actual saving of fields here
                                                                await updateProfile();

                                                                // changes the editing flag accordingly
                                                                setEditingFlag(false);
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
                                    {profileUpdatesMainError
                                        ?
                                        <Text
                                            style={deviceType === DeviceType.TABLET ? styles.errorMessageTablet : styles.errorMessage}>Please
                                            fill out the information below!</Text>
                                        : (emailErrors.length !== 0 && !profileUpdatesMainError)
                                            ? <Text
                                                style={deviceType === DeviceType.TABLET ? styles.errorMessageTablet : styles.errorMessage}>{emailErrors[0]}</Text>
                                            : (phoneErrors.length !== 0 && !profileUpdatesMainError)
                                                ? <Text
                                                    style={deviceType === DeviceType.TABLET ? styles.errorMessageTablet : styles.errorMessage}>{phoneErrors[0]}</Text>
                                                : (addressLineErrors.length !== 0 && !profileUpdatesMainError)
                                                    ? <Text
                                                        style={deviceType === DeviceType.TABLET ? styles.errorMessageTablet : styles.errorMessage}>{addressLineErrors[0]}</Text>
                                                    : (addressCityErrors.length !== 0 && !profileUpdatesMainError)
                                                        ?
                                                        <Text
                                                            style={deviceType === DeviceType.TABLET ? styles.errorMessageTablet : styles.errorMessage}>{addressCityErrors[0]}</Text>
                                                        : (addressStateErrors.length !== 0 && !profileUpdatesMainError)
                                                            ? <Text
                                                                style={deviceType === DeviceType.TABLET ? styles.errorMessageTablet : styles.errorMessage}>{addressStateErrors[0]}</Text>
                                                            : (addressZipErrors.length !== 0 && !profileUpdatesMainError)
                                                                ? <Text
                                                                    style={deviceType === DeviceType.TABLET ? styles.errorMessageTablet : styles.errorMessage}>{addressZipErrors[0]}</Text>
                                                                : (dutyStatusErrors.length !== 0 && !profileUpdatesMainError)
                                                                    ? <Text
                                                                        style={deviceType === DeviceType.TABLET ? styles.errorMessageTablet : styles.errorMessage}>{dutyStatusErrors[0]}</Text>
                                                                    : <></>
                                    }
                                    <View
                                        style={deviceType === DeviceType.TABLET ? styles.profileContentViewTablet : styles.profileContentView}>
                                        <TextInput
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
                                            left={<TextInput.Icon icon="cake" iconColor="#FFFFFF"/>}
                                        />
                                        <TextInput
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
                                            style={[emailFocus ? styles.textInputFocus : !editingFlag ? styles.textInputNonEditable : styles.textInput, {marginTop: Dimensions.get('window').height / 30}]}
                                            onFocus={() => {
                                                setIsEmailFocus(true);

                                                // close the dropdown if opened
                                                dropdownDutyState && setDropdownDutyState(false);
                                            }}
                                            placeholder={'Required'}
                                            label="Email"
                                            textColor={"#FFFFFF"}
                                            left={<TextInput.Icon icon="email" iconColor="#FFFFFF"/>}
                                            {...editingFlag && {
                                                right: <TextInput.Icon icon="pencil" iconColor="#F2FF5D"/>
                                            }}
                                        />
                                        <TextInput
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
                                            style={[phoneNumberFocus ? styles.textInputFocus : !editingFlag ? styles.textInputNonEditable : styles.textInput, {marginTop: Dimensions.get('window').height / 30}]}
                                            onFocus={() => {
                                                setIsPhoneNumberFocus(true);

                                                // close the dropdown if opened
                                                dropdownDutyState && setDropdownDutyState(false);
                                            }}
                                            placeholder={'Required +1 (XXX)-XXX-XXXX'}
                                            label="Phone Number"
                                            textColor={"#FFFFFF"}
                                            left={<TextInput.Icon icon="phone" iconColor="#FFFFFF"/>}
                                            {...editingFlag && {
                                                right: <TextInput.Icon icon="pencil" iconColor="#F2FF5D"/>
                                            }}
                                        />
                                        <TextInput
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
                                            style={[addressLineFocus ? styles.textInputFocus : !editingFlag ? styles.textInputNonEditable : styles.textInput, {marginTop: Dimensions.get('window').height / 30}]}
                                            onFocus={() => {
                                                setIsAddressLineFocus(true);

                                                // close the dropdown if opened
                                                dropdownDutyState && setDropdownDutyState(false);
                                            }}
                                            placeholder={'Required (1 West Example Street)'}
                                            label="Street Address"
                                            textColor={"#FFFFFF"}
                                            left={<TextInput.Icon icon="home-map-marker" iconColor="#FFFFFF"/>}
                                            {...editingFlag && {
                                                right: <TextInput.Icon icon="pencil" iconColor="#F2FF5D"/>
                                            }}
                                        />
                                        <TextInput
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
                                            style={[addressCityFocus ? styles.textInputFocus : !editingFlag ? styles.textInputNonEditable : styles.textInput, {marginTop: Dimensions.get('window').height / 30}]}
                                            onFocus={() => {
                                                setIsAddressCityFocus(true);

                                                // close the dropdown if opened
                                                dropdownDutyState && setDropdownDutyState(false);
                                            }}
                                            placeholder={'Required'}
                                            label="City"
                                            textColor={"#FFFFFF"}
                                            left={<TextInput.Icon icon="home-city" iconColor="#FFFFFF"/>}
                                            {...editingFlag && {
                                                right: <TextInput.Icon icon="pencil" iconColor="#F2FF5D"/>
                                            }}
                                        />
                                        <View style={styles.inputColumnViewAddress}>
                                            <TextInput
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
                                                left={<TextInput.Icon icon="flag" iconColor="#FFFFFF"/>}
                                                {...editingFlag && {
                                                    right: <TextInput.Icon icon="pencil" iconColor="#F2FF5D"/>
                                                }}
                                            />
                                            <TextInput
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
                                                style={[addressZipFocus ? styles.textInputNarrowFocus : !editingFlag ? styles.textInputNarrowNonEditable : styles.textInputNarrow, {marginLeft: Dimensions.get('window').width / 15}]}
                                                onFocus={() => {
                                                    setIsAddressZipFocus(true);

                                                    // close the dropdown if opened
                                                    dropdownDutyState && setDropdownDutyState(false);
                                                }}
                                                placeholder={'Required'}
                                                label="Zip"
                                                textColor={"#FFFFFF"}
                                                left={<TextInput.Icon icon="dialpad" iconColor="#FFFFFF"/>}
                                                {...editingFlag && {
                                                    right: <TextInput.Icon icon="pencil" iconColor="#F2FF5D"/>
                                                }}
                                            />
                                        </View>
                                        <View style={styles.pickerView}>
                                            <DropDownPicker
                                                showArrowIcon={editingFlag}
                                                ArrowDownIconComponent={({}) => (
                                                    <TextInput.Icon
                                                        style={{right: 30, bottom: 10}}
                                                        iconColor="#F2FF5D"
                                                        icon="pencil"
                                                    />
                                                )}
                                                ArrowUpIconComponent={({}) => (
                                                    <TextInput.Icon
                                                        style={{right: 30, bottom: 10}}
                                                        iconColor="#F2FF5D"
                                                        icon="pencil"
                                                    />
                                                )}
                                                disabled={!editingFlag}
                                                zIndex={5000}
                                                placeholder={"Duty Status"}
                                                dropDownContainerStyle={!editingFlag ? styles.dropdownContainerNonEditable : styles.dropdownContainer}
                                                style={!editingFlag
                                                    ? (deviceType === DeviceType.TABLET ? styles.dropdownPickerNonEditableTablet : styles.dropdownPickerNonEditable)
                                                    : (deviceType === DeviceType.TABLET ? styles.dropdownPickerTablet : styles.dropdownPicker)}
                                                textStyle={[styles.textInputContentStyle, {color: '#D9D9D9'}]}
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
                                                mode="SIMPLE"
                                                searchable={true}
                                            />
                                        </View>
                                        <TextInput
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
                                            style={[styles.textInputNonEditable, {marginTop: Dimensions.get('window').height / 14}]}
                                            label="Year of Enlistment/Commission"
                                            textColor={"#FFFFFF"}
                                            left={<TextInput.Icon icon="calendar" iconColor="#FFFFFF"/>}
                                        />
                                        <TextInput
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
                                            style={[styles.textInputNonEditable, {marginTop: Dimensions.get('window').height / 30}]}
                                            label="Military Branch"
                                            textColor={"#FFFFFF"}
                                            left={<TextInput.Icon icon="tank" iconColor="#FFFFFF"/>}
                                        />
                                    </View>
                                </LinearGradient>
                            </KeyboardAwareScrollView>
                        </View>
                    </SafeAreaView>
                    <BottomSheet
                        ref={bottomSheetRef}
                        backgroundStyle={styles.bottomSheet}
                        enablePanDownToClose={true}
                        index={showBottomSheet ? 0 : -1}
                        snapPoints={['60%', '60%']}
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
                </>
            }
        </>
    );
}
