import React, {useEffect, useState} from "react";
import 'react-native-get-random-values';
import {Image, ImageBackground, Linking, Platform, TouchableOpacity, View} from "react-native";
import {commonStyles} from '../../../../../styles/common.module';
import {styles} from '../../../../../styles/appWall.module';
import {Dialog, HelperText, IconButton, Portal, Text, TextInput} from "react-native-paper";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {useRecoilState} from "recoil";
import {
    currentUserInformation,
    globalAmplifyCacheState,
    userIsAuthenticatedState
} from '../../../../../recoil/AuthAtom';
import {applicationWallSteps} from "../../../../../models/Constants";
import {
    createMilitaryVerification,
    LoggingLevel,
    MilitaryAffiliation,
    MilitaryBranch,
    MilitaryDutyStatus,
    MilitaryVerificationStatusType,
    updateMilitaryVerificationStatus
} from "@moonbeam/moonbeam-models";
import {Spinner} from "../../../../common/Spinner";
import {splashStatusState} from "../../../../../recoil/SplashAtom";
import {SplashScreen} from "../../../../common/Splash";
import * as SMS from 'expo-sms';
import {Checkbox} from "expo-checkbox";
import {API, graphqlOperation} from "aws-amplify";
import {WallDocumentCaptureStep} from "./WallDocumentCaptureStep";
import {
    additionalAppWallDocumentationErrors,
    additionalAppWallDocumentationNeeded,
    appWallDocumentsReCapturePhotoState,
    appWallDocumentsRePickPhotoState,
    appWallPermissionsInstructionsCustomMessageState,
    appWallPermissionsModalCustomMessageState,
    appWallPermissionsModalVisibleState,
    appWallStepNumber,
    isReadyAppWallState
} from "../../../../../recoil/AppDrawerAtom";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
// @ts-ignore
import StatusPendingImage from '../../../../../../assets/art/military-status-pending.png';
// @ts-ignore
import StatusRejectedImage from '../../../../../../assets/art/military-status-rejected.png';
// @ts-ignore
import StatusUnknownImage from '../../../../../../assets/art/military-status-unknown.png';
// @ts-ignore
import MilitaryApprovalImage from '../../../../../../assets/art/military-approval.png';
// @ts-ignore
import RegistrationBackgroundImage from '../../../../../../assets/backgrounds/registration-background.png';
// @ts-ignore
import MilitaryVerificationImage from '../../../../../../assets/art/military-verification.png';
import {Button} from "@rneui/base";
import {AppWallProps} from "../../../../../models/props/AppDrawerProps";
// @ts-ignore
import MoonbeamPreferencesIOS from "../../../../../../assets/art/moonbeam-preferences-ios.jpg";
// @ts-ignore
import MoonbeamPreferencesAndroid from "../../../../../../assets/art/moonbeam-preferences-android.jpg";
import * as ImagePicker from "expo-image-picker";
import {logEvent} from "../../../../../utils/AppSync";
import {FieldValidator} from "../../../../../utils/FieldValidator";

/**
 * AppWall Component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const AppWall = ({navigation}: AppWallProps) => {
    // constants used to keep track of local component state
    const [ssnValue, setSSNValue] = useState<string>("");
    const [ssnFocus, setIsSSNFocus] = useState<boolean>(false);
    const [ssnErrors, setSSNErrors] = useState<string[]>([]);
    const [dismissButtonVisible, setIsDismissButtonVisible] = useState<boolean>(false);
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    const [supportModalVisible, setSupportModalVisible] = useState<boolean>(false);
    const [supportModalMessage, setSupportModalMessage] = useState<string>('');
    const [supportModalButtonMessage, setSupportModalButtonMessage] = useState<string>('');
    const [ssnMainError, setSSNMainError] = useState<boolean>(false);
    const [appWallError, setAppWallError] = useState<boolean>(false);
    // constants used to keep track of shared states
    const [userIsAuthenticated,] = useRecoilState(userIsAuthenticatedState);
    const [, setDocumentsRePickPhoto] = useRecoilState(appWallDocumentsRePickPhotoState);
    const [, setDocumentsReCapturePhoto] = useRecoilState(appWallDocumentsReCapturePhotoState);
    const [permissionsModalVisible, setPermissionsModalVisible] = useRecoilState(appWallPermissionsModalVisibleState);
    const [permissionsModalCustomMessage,] = useRecoilState(appWallPermissionsModalCustomMessageState);
    const [permissionsInstructionsCustomMessage,] = useRecoilState(appWallPermissionsInstructionsCustomMessageState);
    const [globalCache,] = useRecoilState(globalAmplifyCacheState);
    const [isReady, setIsReady] = useRecoilState(isReadyAppWallState);
    const [stepNumber, setStepNumber] = useRecoilState(appWallStepNumber);
    const [userInformation,] = useRecoilState(currentUserInformation);
    // steps 1 and 4
    const [splashState, setSplashState] = useRecoilState(splashStatusState);
    // step 2
    const [militaryStatusDisclaimer, setMilitaryStatusDisclaimer] = useState<boolean>(false);
    // step 3
    const [additionalDocumentsNeeded, setAdditionalDocumentsNeeded] = useRecoilState(additionalAppWallDocumentationNeeded);
    const [, setDocumentationErrors] = useRecoilState(additionalAppWallDocumentationErrors);

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
        // setting the splash state for the first step
        if (stepNumber === 0) {
            // splash state information to be modified accordingly
            let splashArtSource;
            let splashDescription;
            let splashTitle;
            let splashButtonText;

            // the splash state information will depend on the military status
            switch (userInformation["militaryStatus"]) {
                case MilitaryVerificationStatusType.Pending:
                    splashTitle = `Thanks for registering!`;
                    splashDescription = `We're working on verifying your account, and will hear back from our team shortly.`;
                    splashArtSource = StatusPendingImage;
                    splashButtonText = `Contact Us`;
                    setIsDismissButtonVisible(true);
                    break;
                case MilitaryVerificationStatusType.Rejected:
                    splashTitle = `Sorry for the inconvenience!`;
                    splashDescription = `We were not able to verify your military status. Contact our team for more information!`;
                    splashArtSource = StatusRejectedImage;
                    splashButtonText = `Contact Us`;
                    setIsDismissButtonVisible(true);
                    break;
                case "UNKNOWN":
                case "NEEDS_DOCUMENT_UPLOAD":
                    splashTitle = `Resume your registration!`;
                    splashDescription = `It looks like you have not finished our military affiliation verification process.`;
                    splashArtSource = StatusUnknownImage;
                    splashButtonText = `Get Started`;
                    break;
                default:
                    // any error will be caught in the App Drawer component
                    break;
            }

            setSplashState({
                splashTitle: splashTitle,
                splashDescription: splashDescription,
                splashButtonText: splashButtonText,
                splashArtSource: splashArtSource
            });
        }

        // validate the SSN
        if (ssnFocus && ssnValue !== "") {
            fieldValidator.validateField(ssnValue, "ssn", setSSNErrors);
        }
        ssnValue === "" && setSSNErrors([]);

    }, [stepNumber, userInformation["militaryStatus"], ssnValue, ssnFocus]);


    /**
     * Function used to update an individual's eligibility, by updating their
     * military verification status through the `updateMilitaryVerificationStatus` API call.
     *
     * @return a {@link Promise} containing a {@link Boolean} representing whether eligibility
     * was updated successfully or not.
     */
    const modifyMilitaryVerificationStatus = async (): Promise<boolean> => {
        try {
            // call the verification API
            const modifyEligibilityResult = await API.graphql(graphqlOperation(updateMilitaryVerificationStatus, {
                updateMilitaryVerificationInput: {
                    id: userInformation["custom:userId"],
                    militaryVerificationStatus: userInformation["militaryStatus"]
                }
            }));

            // retrieve the data block from the response
            // @ts-ignore
            const responseData = modifyEligibilityResult ? modifyEligibilityResult.data : null;

            // check if there are any errors in the returned response
            if (responseData && responseData.updateMilitaryVerificationStatus.errorMessage === null) {
                return true;
            } else {
                const message = `Unexpected error while updating the eligibility status through update ${JSON.stringify(modifyEligibilityResult)}`;
                console.log(message);
                await logEvent(message, LoggingLevel.Error, userIsAuthenticated);
                return false;
            }
        } catch (error) {
            const message = `Unexpected error while updating the eligibility status through update ${JSON.stringify(error)} ${error}`;
            console.log(message);
            await logEvent(message, LoggingLevel.Error, userIsAuthenticated);
            return false;
        }
    }

    /**
     * Function used to update an individual's eligibility by updating their
     * military verification status through the `createMilitaryVerification` API call.
     *
     * @return a {@link Promise} containing a {@link Boolean} representing whether eligibility
     * was updated successfully or not
     */
    const updateEligibility = async (): Promise<boolean> => {
        try {
            // set a loader on button press
            setIsReady(false);

            /**
             * retrieve the address from the user information object, and split it based on commas (since that's how we store it),
             * so that we can easily fetch all its components (line, city, state and zip)
             */
            const addressComponents = userInformation["address"]["formatted"].split(",");

            // convert the birthday from YYYY-MM-DD to MM/DD/YYYY, format since we store and retrieve the birthday in a different format than Amplify
            const birthdayComponents = userInformation["birthdate"].split("-");
            const birthday = `${birthdayComponents[1]}/${birthdayComponents[2]}/${birthdayComponents[0]}`;

            // call the verification API
            const updateEligibilityResult = await API.graphql(graphqlOperation(createMilitaryVerification, {
                createMilitaryVerificationInput: {
                    id: userInformation["custom:userId"],
                    firstName: userInformation["given_name"],
                    lastName: userInformation["family_name"],
                    dateOfBirth: birthday,
                    // default to current year for military spouses
                    enlistmentYear:
                        userInformation["custom:militaryAffiliation"] && userInformation["custom:militaryAffiliation"] === MilitaryAffiliation.FamilySpouse
                            ? new Date().getFullYear()
                            : userInformation["custom:enlistmentYear"],
                    addressLine: addressComponents[0],
                    city: addressComponents[1],
                    state: addressComponents[2],
                    zipCode: addressComponents[3],
                    militaryAffiliation: userInformation["custom:militaryAffiliation"] && userInformation["custom:militaryAffiliation"] === MilitaryAffiliation.FamilySpouse
                        ? MilitaryAffiliation.FamilySpouse
                        : MilitaryAffiliation.ServiceMember,
                    militaryBranch:
                        userInformation["custom:militaryAffiliation"] && userInformation["custom:militaryAffiliation"] === MilitaryAffiliation.FamilySpouse
                            ? MilitaryBranch.NotApplicable
                            : userInformation["custom:branch"],
                    militaryDutyStatus:
                        userInformation["custom:militaryAffiliation"] && userInformation["custom:militaryAffiliation"] === MilitaryAffiliation.FamilySpouse
                            ? MilitaryDutyStatus.NotApplicable
                            : userInformation["custom:duty_status"],
                    ...(userInformation["custom:militaryAffiliation"] && userInformation["custom:militaryAffiliation"] === MilitaryAffiliation.FamilySpouse && {
                        personalIdentifier: ssnValue.trimStart().trimEnd().trim().replaceAll(' ', '')
                    })
                }
            }));

            // retrieve the data block from the response
            // @ts-ignore
            const responseData = updateEligibilityResult ? updateEligibilityResult.data : null;

            // check if there are any errors in the returned response
            if (responseData && responseData.createMilitaryVerification.errorMessage === null) {
                // release the loader on button press
                setIsReady(true);

                // retrieve the military verification status, and determine what the next step is
                switch (responseData.createMilitaryVerification.data.militaryVerificationStatus) {
                    case MilitaryVerificationStatusType.Pending:
                        // set the military status of the user information object accordingly
                        userInformation["militaryStatus"] = MilitaryVerificationStatusType.Pending;

                        // set the documentation needed flag to true for next step
                        setAdditionalDocumentsNeeded(true);
                        // clear any documents related errors
                        setDocumentationErrors([]);

                        // go to the documentation step
                        setStepNumber(stepNumber + 1);

                        return true;
                    case MilitaryVerificationStatusType.Verified:
                        // if the verification status is verified, then we can cache it accordingly
                        if (globalCache && await globalCache!.getItem(`${userInformation["custom:userId"]}-militaryStatus`) !== null) {
                            const message = 'old military status is cached, needs cleaning up';
                            console.log(message);
                            await logEvent(message, LoggingLevel.Info, userIsAuthenticated);

                            await globalCache!.removeItem(`${userInformation["custom:userId"]}-militaryStatus`);
                            await globalCache!.setItem(`${userInformation["custom:userId"]}-militaryStatus`, MilitaryVerificationStatusType.Verified);
                            userInformation["militaryStatus"] = MilitaryVerificationStatusType.Verified;
                        } else {
                            const message = 'military status is not cached';
                            console.log(message);
                            await logEvent(message, LoggingLevel.Info, userIsAuthenticated);

                            globalCache && globalCache!.setItem(`${userInformation["custom:userId"]}-militaryStatus`, MilitaryVerificationStatusType.Verified);
                            userInformation["militaryStatus"] = MilitaryVerificationStatusType.Verified;
                        }

                        // set the military status of the user information object accordingly
                        userInformation["militaryStatus"] = MilitaryVerificationStatusType.Verified;

                        // set the splash state of the final step
                        setSplashState({
                            splashTitle: `Great!`,
                            splashDescription: `You finished our verification process, and can now continue!`,
                            splashButtonText: `Finish`,
                            splashArtSource: MilitaryApprovalImage
                        });
                        // go to the final step
                        setStepNumber(stepNumber + 2);
                        return true;
                    default:
                        setAppWallError(true);
                        return false;
                }
            } else {
                // release the loader on button press
                setIsReady(true);

                const message = `Unexpected error while updating the eligibility status through creation ${JSON.stringify(updateEligibilityResult)}`;
                console.log(message);
                await logEvent(message, LoggingLevel.Error, userIsAuthenticated);

                return false;
            }
        } catch (error) {
            // release the loader on button press
            setIsReady(true);

            const message = `Unexpected error while updating the eligibility status through creation ${JSON.stringify(error)} ${error}`;
            console.log(message);
            await logEvent(message, LoggingLevel.Error, userIsAuthenticated);

            return false;
        }
    }

    /**
     * Function used to contact support, via the native messaging application.
     */
    const contactSupport = async (): Promise<void> => {
        const isAvailable = await SMS.isAvailableAsync();
        if (isAvailable) {
            // customize the SMS message below
            const result = await SMS.sendSMSAsync(
                ['210-744-6222'],
                'Hello I would like some help with: ',
                {}
            );
            // switch based on the result received from the async SMS action
            switch (result.result) {
                case 'sent':
                    const messageSent = 'Message sent!';
                    console.log(messageSent);
                    await logEvent(messageSent, LoggingLevel.Info, userIsAuthenticated);

                    setSupportModalMessage('Thank you for your inquiry! One of our team members will get back to you shortly!');
                    setSupportModalButtonMessage('Dismiss');
                    setSupportModalVisible(true);
                    break;
                case 'unknown':
                    const messageUnknown = 'Unknown error has occurred while attempting to send a message!';
                    console.log(messageUnknown);
                    await logEvent(messageUnknown, LoggingLevel.Info, userIsAuthenticated);

                    setSupportModalMessage('An unexpected error occurred while attempting to contact our team');
                    setSupportModalButtonMessage('Retry');
                    setSupportModalVisible(true);
                    break;
                case 'cancelled':
                    const messageCancelled = 'Message was cancelled!';
                    console.log(messageCancelled);
                    await logEvent(messageCancelled, LoggingLevel.Info, userIsAuthenticated);

                    setSupportModalMessage('It looks like you cancelled your inquiry to our team! If you do need help, please ensure that you send your message beforehand!');
                    setSupportModalButtonMessage('Ok');
                    setSupportModalVisible(true);
                    break;
            }
        } else {
            // there's no SMS available on this device
            const messageCancelled = 'no SMS available';
            console.log(messageCancelled);
            await logEvent(messageCancelled, LoggingLevel.Info, userIsAuthenticated);

            setSupportModalMessage('Messaging not available on this platform!');
            setSupportModalButtonMessage('Retry');
            setSupportModalVisible(true);
        }
    }

    // return the component for the AppWall page
    return (
        <>
            {
                !isReady || (splashState.splashTitle === "" && splashState.splashDescription === "" && splashState.splashButtonText === "") ?
                    <Spinner loadingSpinnerShown={loadingSpinnerShown} setLoadingSpinnerShown={setLoadingSpinnerShown}/>
                    :
                    <ImageBackground
                        style={[commonStyles.image]}
                        imageStyle={{
                            resizeMode: 'stretch'
                        }}
                        source={RegistrationBackgroundImage}>
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

                                                // check if media library permissions have been re-enabled
                                                const mediaLibraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
                                                // if the status is granted
                                                if (mediaLibraryStatus && mediaLibraryStatus.status === 'granted') {
                                                    setDocumentsRePickPhoto(true);
                                                }
                                                // check if camera permissions have been re-enabled
                                                const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
                                                // if the status is granted
                                                if (cameraStatus && cameraStatus.status === 'granted') {
                                                    setDocumentsReCapturePhoto(true);
                                                }
                                            }}>
                                        {"Go to App Settings"}
                                    </Button>
                                    <Button buttonStyle={commonStyles.dialogButtonSkip}
                                            titleStyle={commonStyles.dialogButtonSkipText}
                                            onPress={() => {
                                                setPermissionsModalVisible(false);
                                            }}>
                                        {"Skip"}
                                    </Button>
                                </Dialog.Actions>
                            </Dialog>
                        </Portal>
                        <Portal>
                            <Dialog style={commonStyles.dialogStyle} visible={supportModalVisible}
                                    onDismiss={() => setSupportModalVisible(false)}>
                                <Dialog.Icon icon="alert" color={"#F2FF5D"}
                                             size={hp(10)}/>
                                <Dialog.Title
                                    style={commonStyles.dialogTitle}>{supportModalButtonMessage === 'Retry' ? 'We hit a snag!' : ('Dismiss' ? 'Great' : 'Heads up')}</Dialog.Title>
                                <Dialog.Content>
                                    <Text
                                        style={commonStyles.dialogParagraph}>{supportModalMessage}</Text>
                                </Dialog.Content>
                                <Dialog.Actions>
                                    <Button buttonStyle={commonStyles.dialogButton}
                                            titleStyle={commonStyles.dialogButtonText}
                                            onPress={() => {
                                                setSupportModalVisible(false);
                                            }}>
                                        {supportModalButtonMessage}
                                    </Button>
                                </Dialog.Actions>
                            </Dialog>
                        </Portal>
                        <KeyboardAwareScrollView
                            scrollEnabled={stepNumber !== 0 && stepNumber !== 1}
                            showsVerticalScrollIndicator={false}
                            enableOnAndroid={true}
                            enableAutomaticScroll={(Platform.OS === 'ios')}
                            contentContainerStyle={[commonStyles.rowContainer]}
                            keyboardShouldPersistTaps={'handled'}
                        >
                            {stepNumber !== 0 && stepNumber !== 3 &&
                                <>
                                    <View
                                        style={[styles.titleView, {marginTop: hp(10)}]}>
                                        <View style={[styles.titleViewDescription]}>
                                            <Text style={styles.stepTitle}>
                                                {applicationWallSteps[stepNumber].stepTitle}
                                            </Text>
                                            <IconButton
                                                icon={"triangle"}
                                                iconColor={"#F2FF5D"}
                                                size={hp(2.5)}
                                                style={styles.triangleIcon}
                                            />
                                        </View>
                                    </View>
                                    <Text style={styles.stepDescription}>
                                        {
                                            userInformation["custom:militaryAffiliation"] && userInformation["custom:militaryAffiliation"] === MilitaryAffiliation.FamilySpouse
                                                ? "Allow us to verify your military affiliation status by providing the following additional information."
                                                : applicationWallSteps[stepNumber].stepDescription
                                        }
                                    </Text>
                                </>
                            }
                            {/*switch views based on the step number*/}
                            {
                                stepNumber === 0
                                    ? <SplashScreen
                                        //@ts-ignore
                                        splashArtSource={splashState.splashArtSource}
                                        splashButtonText={splashState.splashButtonText}
                                        splashTitle={splashState.splashTitle}
                                        splashDescription={splashState.splashDescription}
                                        {
                                            ...dismissButtonVisible &&
                                            {
                                                splashDismissButton: true
                                            }
                                        }
                                    />
                                    : stepNumber === 1
                                        ?
                                        <>
                                            {appWallError
                                                ?
                                                <Text style={styles.errorMessage}>Unexpected error while verifying
                                                    military
                                                    status. Try again!</Text>
                                                :
                                                <>
                                                    {userInformation["custom:militaryAffiliation"] && userInformation["custom:militaryAffiliation"] === MilitaryAffiliation.FamilySpouse
                                                        && (ssnMainError
                                                            ? <Text style={styles.errorMessageSSN}>Please fill out the
                                                                information below!</Text>
                                                            : (ssnErrors.length !== 0 && !ssnMainError)
                                                                ? <Text style={styles.errorMessageSSN}>{ssnErrors[0]}</Text>
                                                                : <></>)
                                                    }
                                                    {userInformation["custom:militaryAffiliation"] && userInformation["custom:militaryAffiliation"] === MilitaryAffiliation.FamilySpouse &&
                                                        <>
                                                            <TextInput
                                                                autoCorrect={false}
                                                                autoComplete={"off"}
                                                                keyboardType={"number-pad"}
                                                                placeholderTextColor={'#D9D9D9'}
                                                                activeUnderlineColor={'#F2FF5D'}
                                                                underlineColor={'#D9D9D9'}
                                                                outlineColor={'#D9D9D9'}
                                                                activeOutlineColor={'#F2FF5D'}
                                                                selectionColor={'#F2FF5D'}
                                                                mode={'outlined'}
                                                                onChangeText={(value: React.SetStateAction<string>) => {
                                                                    setIsSSNFocus(true);

                                                                    setAppWallError(false);
                                                                    setSSNMainError(false);

                                                                    // format value
                                                                    value = fieldValidator.formatSSNValue(ssnValue, value.toString());

                                                                    setSSNValue(value);
                                                                }}
                                                                onBlur={() => {
                                                                    setIsSSNFocus(false);
                                                                }}
                                                                value={ssnValue}
                                                                contentStyle={styles.textInputContentStyle}
                                                                style={[ssnFocus ? styles.textInputFocus : styles.textInput, ssnValue.length === 0 && {height: hp(6)}]}
                                                                onFocus={() => {
                                                                    setIsSSNFocus(true);
                                                                }}
                                                                placeholder={'Required'}
                                                                label="Social Security Number"
                                                                textColor={"#FFFFFF"}
                                                                left={
                                                                    <TextInput.Icon icon="bank" size={hp(2.8)}
                                                                                    style={{marginTop: hp(2.2)}}
                                                                                    color="#FFFFFF"/>
                                                                }
                                                            />
                                                            <HelperText style={{
                                                                top: hp(4.5),
                                                                alignSelf: 'center',
                                                                width: wp(92),
                                                                color: '#F2FF5D'
                                                            }} type="info" visible={ssnFocus}>
                                                                We will not store this information! It will only be used for
                                                                military affiliation
                                                                verification purposes.
                                                            </HelperText>
                                                        </>
                                                    }
                                                </>
                                            }
                                            {
                                                userInformation["custom:militaryAffiliation"] && userInformation["custom:militaryAffiliation"] === MilitaryAffiliation.FamilySpouse
                                                    ? <></>
                                                    : <Image
                                                        style={[styles.militaryVerificationImage, {
                                                            bottom: hp(5),
                                                            alignSelf: 'center'
                                                        }]}
                                                        source={MilitaryVerificationImage}/>
                                            }
                                            <View style={[styles.disclaimerView,
                                                userInformation["custom:militaryAffiliation"] && userInformation["custom:militaryAffiliation"] === MilitaryAffiliation.FamilySpouse &&
                                                {top: hp(6)}
                                            ]}>
                                                <Checkbox
                                                    style={styles.disclaimerCheckbox}
                                                    color={militaryStatusDisclaimer ? 'blue' : '#F2FF5D'}
                                                    value={militaryStatusDisclaimer}
                                                    onValueChange={(newValue) => {
                                                        setMilitaryStatusDisclaimer(newValue);

                                                        // clear any errors (if any)
                                                        setAppWallError(false);
                                                        setSSNMainError(false);
                                                    }}
                                                />
                                                <Text
                                                    style={styles.disclaimerText}>{'By checking this box, you are confirming your status as a service member, veteran, or dependent, thereby granting Moonbeam the authority to document and review ' +
                                                    'this claim, as well as pursue legal action in accordance with U.S. federal statutes and penal codes, if the claim is proven to be fraudulent.\nIn addition, this represents your consent ' +
                                                    'to Moonbeam storing any documentation or media that you provide during this process (except for your SSN in case you are a dependent).\n' +
                                                    'You also acknowledge that you read and agree to our '}
                                                    <Text style={styles.disclaimerTextHighlighted}
                                                          onPress={async () => {
                                                              navigation.navigate('DocumentsViewer', {
                                                                  name: 'privacy-policy.pdf',
                                                                  privacyFlag: false,
                                                                  appDrawerFlag: true
                                                              });
                                                          }}>Privacy Policy</Text>{' and our'}
                                                    <Text style={styles.disclaimerTextHighlighted}
                                                          onPress={async () => {
                                                              navigation.navigate('DocumentsViewer', {
                                                                  name: 'terms-and-conditions.pdf',
                                                                  privacyFlag: false,
                                                                  appDrawerFlag: true
                                                              });
                                                          }}> Terms & Conditions.</Text>
                                                </Text>
                                            </View>
                                        </>
                                        : stepNumber === 2
                                            ? <WallDocumentCaptureStep/>
                                            : stepNumber === 3
                                                ? <SplashScreen
                                                    //@ts-ignore
                                                    splashArtSource={splashState.splashArtSource}
                                                    splashButtonText={splashState.splashButtonText}
                                                    splashTitle={splashState.splashTitle}
                                                    splashDescription={splashState.splashDescription}
                                                    {...splashState.splashTitle !== 'Great!' && {
                                                        splashDismissButton: true
                                                    }}
                                                />
                                                : <></>
                            }
                            {
                                (stepNumber < 3 || (stepNumber === 3 && splashState.splashTitle === 'Great!')) &&
                                <View
                                    style={[stepNumber === 0 ? styles.bottomContainerSplashView : styles.bottomContainerButtonView]}>
                                    <TouchableOpacity
                                        disabled={
                                            (!militaryStatusDisclaimer && stepNumber === 1) ||
                                            (additionalDocumentsNeeded && stepNumber === 2)
                                        }
                                        style={[(!militaryStatusDisclaimer && stepNumber === 1) || (additionalDocumentsNeeded && stepNumber === 2) ? styles.bottomButtonDisabled : stepNumber == 0 ? styles.bottomButtonStep1 : styles.bottomButton,
                                            (stepNumber === 0) && {
                                                left: wp(0.25)
                                            },
                                            (stepNumber === 1 || stepNumber === 2)
                                            && {
                                                marginTop: -hp(25)
                                            },
                                            (stepNumber === 3)
                                            && {
                                                marginBottom: hp(30),
                                                marginLeft: wp(10)
                                            },
                                            (stepNumber === 1 && userInformation["custom:militaryAffiliation"] && userInformation["custom:militaryAffiliation"] === MilitaryAffiliation.FamilySpouse) && {
                                                marginTop: -hp(5)
                                            }
                                        ]}
                                        onPress={
                                            async () => {
                                                // set a loader on button press
                                                setIsReady(false);

                                                // verify if we can move to the next stage
                                                let checksPassed = true;
                                                // increase the step number
                                                if ((stepNumber === 0 || stepNumber === 2) && checksPassed) {
                                                    let newStepValue = stepNumber + 1;
                                                    /**
                                                     * in case we are at the first step, and the verification status is NEEDS_DOCUMENT_UPLOAD, then
                                                     * go straight to the document upload.
                                                     */
                                                    if (stepNumber === 0 && userInformation["militaryStatus"] && userInformation["militaryStatus"] === "NEEDS_DOCUMENT_UPLOAD") {
                                                        newStepValue += 1;
                                                    }
                                                    setStepNumber(newStepValue);
                                                }
                                                switch (stepNumber) {
                                                    case 0:
                                                        // depending on the military status, determine whether there is a next step or not.
                                                        switch (userInformation["militaryStatus"]) {
                                                            case MilitaryVerificationStatusType.Pending:
                                                            case MilitaryVerificationStatusType.Rejected:
                                                                // initiate the contact support action
                                                                await contactSupport();
                                                                checksPassed = false; // to prevent going to the next step
                                                                break;
                                                            case "UNKNOWN":
                                                            case "NEEDS_DOCUMENT_UPLOAD":
                                                                // pass through to the next step
                                                                checksPassed = true;
                                                                break;
                                                            default:
                                                                checksPassed = false; // to prevent going to the next step
                                                                // any error will be caught in the App Drawer component
                                                                break;
                                                        }
                                                        break;
                                                    case 1:
                                                        if (userInformation["custom:militaryAffiliation"] && userInformation["custom:militaryAffiliation"] === MilitaryAffiliation.FamilySpouse) {
                                                            if (ssnValue === "" || ssnErrors.length !== 0) {
                                                                // only populate main error if there are no other errors showing
                                                                if (ssnErrors.length === 0) {
                                                                    setSSNMainError(true);
                                                                }
                                                            } else {
                                                                setSSNMainError(false);

                                                                // execute the update call through creation
                                                                const updateEligibilityFlag = await updateEligibility();
                                                                // check the update eligibility flag, in order to determine whether the checks have passed or not
                                                                if (updateEligibilityFlag) {
                                                                    checksPassed = true;
                                                                    setAppWallError(false);
                                                                } else {
                                                                    checksPassed = false;
                                                                    setAppWallError(true);
                                                                }
                                                            }

                                                        } else {
                                                            // execute the update call through creation
                                                            const updateEligibilityFlag = await updateEligibility();
                                                            // check the update eligibility flag, in order to determine whether the checks have passed or not
                                                            if (updateEligibilityFlag) {
                                                                checksPassed = true;
                                                                setAppWallError(false);
                                                            } else {
                                                                checksPassed = false;
                                                                setAppWallError(true);
                                                            }
                                                        }
                                                        break;
                                                    case 2:
                                                        /**
                                                         * for the 3rd step, the driver of the step is the additional documentation needed flag in the WallDocumentation component
                                                         * nevertheless, we need to set the splash state accordingly, for the last step, in order to display the appropriate messaging.
                                                         */
                                                        // set the splash state of the final step
                                                        setSplashState({
                                                            splashTitle: `Account is pending creation!`,
                                                            splashDescription: `Our team is working on verifying the documentation that you provided!`,
                                                            splashButtonText: `Finish`,
                                                            splashArtSource: StatusPendingImage
                                                        });
                                                        break;
                                                    case 3:
                                                        /**
                                                         * for the last step, in we need to execute the "updateMilitaryVerificationStatus" API call, in order to trigger an AppWall action,
                                                         * that would either dismiss it, or take it to the Pending screen.
                                                         */
                                                        // execute the update call through update
                                                        const modifyEligibilityCall = await modifyMilitaryVerificationStatus();
                                                        // check the update eligibility flag, in order to determine whether the checks have passed or not
                                                        if (modifyEligibilityCall) {
                                                            // clean everything
                                                            setAppWallError(false);
                                                            setMilitaryStatusDisclaimer(false);
                                                            setDocumentationErrors([]);
                                                            setAdditionalDocumentsNeeded(false);

                                                            checksPassed = true;
                                                            setAppWallError(false);
                                                            setStepNumber(0);
                                                        } else {
                                                            checksPassed = false;
                                                            setAppWallError(true);
                                                        }
                                                        break;
                                                    default:
                                                        break;
                                                }
                                                // release the loader on button press
                                                setTimeout(() => {
                                                    setIsReady(true);
                                                }, 15);
                                            }
                                        }
                                    >
                                        <Text style={styles.buttonText}>{
                                            stepNumber === 0
                                                ? splashState.splashButtonText
                                                : stepNumber === 1
                                                    ? `Verify`
                                                    : stepNumber === 2
                                                        ? `Continue`
                                                        : `Finish`
                                        }</Text>
                                    </TouchableOpacity>
                                </View>
                            }
                        </KeyboardAwareScrollView>
                    </ImageBackground>
            }
        </>
    );
};
