import React, {useEffect, useState} from "react";
import 'react-native-get-random-values';
import {Dimensions, Image, ImageBackground, Platform, TouchableOpacity, View} from "react-native";
import {commonStyles} from '../../../../../styles/common.module';
import {styles} from '../../../../../styles/appWall.module';
import {Dialog, IconButton, Portal, Text} from "react-native-paper";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {useRecoilState} from "recoil";
import {currentUserInformation} from '../../../../../recoil/AuthAtom';
import {applicationWallSteps} from "../../../../../models/Constants";
import {
    createMilitaryVerification,
    MilitaryAffiliation,
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
    appWallStepNumber
} from "../../../../../recoil/AppDrawerAtom";
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

/**
 * AppWall Component.
 *
 * @constructor constructor for the component.
 */
export const AppWall = () => {
    // constants used to keep track of local component state
    const [isReady, setIsReady] = useState<boolean>(true);
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    const [supportModalVisible, setSupportModalVisible] = useState<boolean>(false);
    const [supportModalMessage, setSupportModalMessage] = useState<string>('');
    const [supportModalButtonMessage, setSupportModalButtonMessage] = useState<string>('');
    const [appWallError, setAppWallError] = useState<boolean>(false);
    // constants used to keep track of shared states
    const [stepNumber, setStepNumber] = useRecoilState(appWallStepNumber);
    const [userInformation,] = useRecoilState(currentUserInformation);
    // steps 1 and 4
    const [splashState, setSplashState] = useRecoilState(splashStatusState);
    // step 2
    const [militaryStatusDisclaimer, setMilitaryStatusDisclaimer] = useState<boolean>(false);
    // step 3
    const [additionalDocumentsNeeded, setAdditionalDocumentsNeeded] = useRecoilState(additionalAppWallDocumentationNeeded);
    const [, setDocumentationErrors] = useRecoilState(additionalAppWallDocumentationErrors);

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
                    splashTitle = `Sorry for the wait!`;
                    splashDescription = `We're working on verifying your account, and will hear back from our team shortly.`;
                    splashArtSource = StatusPendingImage;
                    splashButtonText = `Contact Us`;
                    break;
                case MilitaryVerificationStatusType.Rejected:
                    splashTitle = `Sorry for the inconvenience!`;
                    splashDescription = `We were not able to verify your military status. Contact our team for more information!`;
                    splashArtSource = StatusRejectedImage;
                    splashButtonText = `Contact Us`;
                    break;
                case "UNKNOWN":
                    splashTitle = `Resume your registration!`;
                    splashDescription = `It looks like you haven't finished our military verification process.`;
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
    }, [stepNumber, userInformation["militaryStatus"]]);


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
                console.log(`Unexpected error while updating the eligibility status through update ${JSON.stringify(modifyEligibilityResult)}`);
                return false;
            }
        } catch (error) {
            console.log(`Unexpected error while updating the eligibility status through update ${JSON.stringify(error)} ${error}`);
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
                    enlistmentYear: userInformation["custom:enlistmentYear"],
                    addressLine: addressComponents[0],
                    city: addressComponents[1],
                    state: addressComponents[2],
                    zipCode: addressComponents[3],
                    militaryAffiliation: MilitaryAffiliation.ServiceMember, // ToDo: in the future when we add family members, we need a mechanism for that
                    militaryBranch: userInformation["custom:branch"],
                    militaryDutyStatus: userInformation["custom:duty_status"]
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

                console.log(`Unexpected error while updating the eligibility status through creation ${JSON.stringify(updateEligibilityResult)}`);
                return false;
            }
        } catch (error) {
            // release the loader on button press
            setIsReady(true);

            console.log(`Unexpected error while updating the eligibility status through creation ${JSON.stringify(error)} ${error}`);
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
                    console.log('Message sent!');
                    setSupportModalMessage('Thank you for your inquiry! One of our team members will get back to you shortly!');
                    setSupportModalButtonMessage('Dismiss');
                    setSupportModalVisible(true);
                    break;
                case 'unknown':
                    console.log('Unknown error has occurred while attempting to send a message!');
                    setSupportModalMessage('An unexpected error occurred while attempting to contact our team');
                    setSupportModalButtonMessage('Retry');
                    setSupportModalVisible(true);
                    break;
                case 'cancelled':
                    console.log('Message was cancelled!');
                    setSupportModalMessage('It looks like you cancelled your inquiry to our team! If you do need help, please ensure that you send your message beforehand!');
                    setSupportModalButtonMessage('Dismiss');
                    setSupportModalVisible(true);
                    break;
            }
        } else {
            // there's no SMS available on this device
            console.log('no SMS available');
            setSupportModalMessage('Messaging not available on this platform!');
            setSupportModalButtonMessage('Dismiss');
            setSupportModalVisible(true);
        }
    }

    // return the component for the AppWall page
    return (
        <>
            {
                !isReady ?
                    <Spinner loadingSpinnerShown={loadingSpinnerShown} setLoadingSpinnerShown={setLoadingSpinnerShown}/>
                    :
                    <ImageBackground
                        style={[commonStyles.image]}
                        imageStyle={{
                            resizeMode: 'stretch'
                        }}
                        source={RegistrationBackgroundImage}>
                        <Portal>
                            <Dialog style={commonStyles.dialogStyle} visible={supportModalVisible}
                                    onDismiss={() => setSupportModalVisible(false)}>
                                <Dialog.Icon icon="alert" color={"#F2FF5D"}
                                             size={Dimensions.get('window').height / 14}/>
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
                            scrollEnabled={true}
                            showsVerticalScrollIndicator={false}
                            enableOnAndroid={true}
                            enableAutomaticScroll={(Platform.OS === 'ios')}
                            contentContainerStyle={[commonStyles.rowContainer]}
                            keyboardShouldPersistTaps={'handled'}
                        >
                            {stepNumber !== 0 && stepNumber !== 3 &&
                                <>
                                    <View
                                        style={[styles.titleView, {marginTop: Dimensions.get('window').height / 6}]}>
                                        <View style={[styles.titleViewDescription]}>
                                            <Text style={styles.stepTitle}>
                                                {applicationWallSteps[stepNumber].stepTitle}
                                            </Text>
                                            <IconButton
                                                icon={"triangle"}
                                                iconColor={"#F2FF5D"}
                                                size={Dimensions.get('window').width / 20}
                                                style={styles.triangleIcon}
                                            />
                                        </View>
                                    </View>
                                    <Text
                                        style={styles.stepDescription}>{applicationWallSteps[stepNumber].stepDescription}</Text>
                                </>
                            }
                            {/*switch views based on the step number*/}
                            {
                                stepNumber === 0
                                    ? <SplashScreen
                                        splashArtSource={splashState.splashArtSource}
                                        splashButtonText={splashState.splashButtonText}
                                        splashTitle={splashState.splashTitle}
                                        splashDescription={splashState.splashDescription}
                                    />
                                    : stepNumber === 1
                                        ?
                                        <>
                                            {appWallError
                                                ?
                                                <Text style={styles.errorMessage}>Unexpected error while verifying military
                                                    status. Try again!</Text>
                                                : <></>
                                            }
                                            <Image
                                                style={styles.militaryVerificationImage}
                                                source={MilitaryVerificationImage}/>
                                            <View style={styles.disclaimerView}>
                                                <Checkbox
                                                    style={styles.disclaimerCheckbox}
                                                    color={militaryStatusDisclaimer ? 'blue' : '#F2FF5D'}
                                                    value={militaryStatusDisclaimer}
                                                    onValueChange={(newValue) => {
                                                        setMilitaryStatusDisclaimer(newValue);

                                                        // clear any errors (if any)
                                                        setAppWallError(false);
                                                    }}
                                                />
                                                <Text
                                                    style={styles.disclaimerText}>{'By checking this box, you are confirming your status as a military service member, thereby granting Moonbeam the authority to document and review ' +
                                                    'this claim, as well as pursue legal action in accordance with U.S. federal statutes and penal codes, if the claim is proven to be fraudulent.\n' +
                                                    'You also acknowledge that you read and agree to our '}
                                                    <Text style={styles.disclaimerTextHighlighted}
                                                          onPress={() => {
                                                          }}>Privacy Policy</Text>{' and our'}
                                                    <Text style={styles.disclaimerTextHighlighted}
                                                          onPress={() => {
                                                          }}> Terms & Conditions.</Text>
                                                </Text>
                                            </View>
                                        </>
                                        : stepNumber === 2
                                            ? <WallDocumentCaptureStep/>
                                            : stepNumber === 3
                                                ? <SplashScreen
                                                    splashArtSource={splashState.splashArtSource}
                                                    splashButtonText={splashState.splashButtonText}
                                                    splashTitle={splashState.splashTitle}
                                                    splashDescription={splashState.splashDescription}
                                                />
                                                : <></>
                            }
                            <View style={[styles.bottomContainerButtonView]}>
                                <TouchableOpacity
                                    disabled={(!militaryStatusDisclaimer && stepNumber === 1) || (additionalDocumentsNeeded && stepNumber === 2)}
                                    style={[(!militaryStatusDisclaimer && stepNumber === 1) || (additionalDocumentsNeeded && stepNumber === 2) ? styles.bottomButtonDisabled : stepNumber == 0 ? styles.bottomButtonStep1 : styles.bottomButton,
                                        (stepNumber === 1 || stepNumber === 2)
                                        && {
                                            marginTop: -Dimensions.get('window').height / 10,
                                            marginBottom: Dimensions.get('window').height / 10
                                        },
                                        (stepNumber === 3)
                                        && {
                                            marginBottom: Dimensions.get('window').height / 4,
                                            marginLeft: Dimensions.get('window').width / 10
                                        }
                                    ]}
                                    onPress={
                                        async () => {
                                            // verify if we can move to the next stage
                                            let checksPassed = true;
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
                                                    // set a loader on button press
                                                    setIsReady(false);

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

                                                        // release the loader on button press
                                                        setIsReady(true);
                                                    } else {
                                                        checksPassed = false;
                                                        setAppWallError(true);

                                                        // release the loader on button press
                                                        setIsReady(true);
                                                    }
                                                    break;
                                                default:
                                                    break;
                                            }
                                            // increase the step number
                                            if ((stepNumber === 0 || stepNumber === 2) && checksPassed) {
                                                let newStepValue = stepNumber + 1;
                                                setStepNumber(newStepValue);
                                            }
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
                        </KeyboardAwareScrollView>
                    </ImageBackground>
            }
        </>
    );
};
