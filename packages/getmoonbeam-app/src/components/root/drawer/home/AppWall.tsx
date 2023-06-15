import React, {useEffect, useState} from "react";
import 'react-native-get-random-values';
import {Dimensions, ImageBackground, Platform, TouchableOpacity, View} from "react-native";
import {commonStyles} from '../../../../styles/common.module';
import {styles} from '../../../../styles/appWall.module';
import {IconButton, Text} from "react-native-paper";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {useRecoilState} from "recoil";
import {
    additionalDocumentationErrors,
    additionalDocumentationNeeded,
    currentUserInformation,
    militaryRegistrationDisclaimerCheckState
} from '../../../../recoil/AuthAtom';
import {applicationWallSteps} from "../../../../models/Constants";
import {API, graphqlOperation} from "aws-amplify";
import {
    createMilitaryVerification,
    MilitaryAffiliation,
    MilitaryVerificationStatusType
} from "@moonbeam/moonbeam-models";
import {Spinner} from "../../../common/Spinner";
import {appWallStepNumber} from "../../../../recoil/HomeAtom";
import {splashStatusState} from "../../../../recoil/SplashAtom";
import {SplashScreen} from "../../../common/Splash";

/**
 * AppWall component.
 *
 */
export const AppWall = () => {
    // constants used to keep track of local component state
    const [isReady, setIsReady] = useState<boolean>(true);
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    // constants used to keep track of shared states
    const [stepNumber, setStepNumber] = useRecoilState(appWallStepNumber);
    const [userInformation, setUserInformation] = useRecoilState(currentUserInformation);
    // steps 1 and 4
    const [splashState, setSplashState] = useRecoilState(splashStatusState);
    // step 2
    const [militaryVerificationDisclaimer,] = useRecoilState(militaryRegistrationDisclaimerCheckState);
    // step 3
    const [additionalDocumentsNeeded, setAdditionalDocumentsNeeded] = useRecoilState(additionalDocumentationNeeded);
    const [, setDocumentationErrors] = useRecoilState(additionalDocumentationErrors);

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

            // the splash state information will depend on the military status
            switch (userInformation["militaryStatus"]) {
                case MilitaryVerificationStatusType.Pending:
                    splashTitle = `Sorry for the wait!`;
                    splashDescription = `We're working on verifying your account, and will hear back from our team shortly.`;
                    splashArtSource = require('../../../../../assets/art/military-status-pending.png');
                    break;
                case MilitaryVerificationStatusType.Rejected:
                    splashTitle = `Sorry for the inconvenience!`;
                    splashDescription = `We were not able to verify your military status. Contact our team for more information!`;
                    splashArtSource = require('../../../../../assets/art/military-status-rejected.png');
                    break;
                case "UNKNOWN":
                    splashTitle = `Resume your registration!`;
                    splashDescription = `It looks like you haven't finished our military verification process.`;
                    splashArtSource = require('../../../../../assets/art/military-status-unknown.png');
                    break;
                default:
                    // any error will be caught in the App Drawer component
                    break;
            }

            setSplashState({
                splashTitle: splashTitle,
                splashDescription: splashDescription,
                splashButtonText: 'Finish',
                splashArtSource: splashArtSource,
                withButton: false
            });
        }
    }, [stepNumber]);

    /**
     * Function used to verify an individual's eligibility by checking their
     * military verification status.
     *
     * @return a {@link Promise} of a pair, containing a {@link Boolean} and {@link MilitaryVerificationStatusType},
     * representing whether eligibility was verified successfully or not, and implicitly, the verification status.
     */
    const verifyEligibility = async (): Promise<[boolean, MilitaryVerificationStatusType]> => {
        try {
            // set a loader on button press
            setIsReady(false);

            // call the verification API
            const eligibilityResult = await API.graphql(graphqlOperation(createMilitaryVerification, {
                createMilitaryVerificationInput: {
                    id: userInformation["custom:userId"],
                    firstName: userInformation["custom:userId"],
                    lastName: userInformation["custom:userId"],
                    dateOfBirth: userInformation["custom:userId"],
                    enlistmentYear: userInformation["custom:userId"],
                    addressLine: userInformation["custom:userId"],
                    city: userInformation["custom:userId"],
                    state: userInformation["custom:userId"],
                    zipCode: userInformation["custom:userId"],
                    militaryAffiliation: MilitaryAffiliation.ServiceMember, // ToDo: in the future when we add family members, we need a mechanism for that
                    militaryBranch: userInformation["custom:userId"],
                    militaryDutyStatus: userInformation["custom:userId"]
                }
            }));

            // retrieve the data block from the response
            // @ts-ignore
            const responseData = eligibilityResult ? eligibilityResult.data : null;

            // check if there are any errors in the returned response
            if (responseData && responseData.createMilitaryVerification.errorMessage === null) {
                // release the loader on button press
                setIsReady(true);

                return [true, responseData.createMilitaryVerification.data.militaryVerificationStatus];
            } else {
                // release the loader on button press
                setIsReady(true);

                console.log(`Unexpected error while retrieving the eligibility status for app wall ${JSON.stringify(eligibilityResult)}`);
                return [false, MilitaryVerificationStatusType.Pending];
            }
        } catch (error) {
            // release the loader on button press
            setIsReady(true);

            console.log(`Unexpected error while retrieving the eligibility status for app wall ${JSON.stringify(error)}`);
            return [false, MilitaryVerificationStatusType.Pending];
        }
    }

    // return the component for the AppWall page
    return (
        <>
            {
                !isReady ?
                    <Spinner loadingSpinnerShown={loadingSpinnerShown} setLoadingSpinnerShown={setLoadingSpinnerShown}/>
                    : <ImageBackground
                        style={[commonStyles.image]}
                        imageStyle={{
                            resizeMode: 'stretch'
                        }}
                        source={require('../../../../../assets/backgrounds/registration-background.png')}>
                        <KeyboardAwareScrollView
                            scrollEnabled={stepNumber === 1}
                            enableOnAndroid={true}
                            enableAutomaticScroll={(Platform.OS === 'ios')}
                            contentContainerStyle={[commonStyles.rowContainer]}
                            keyboardShouldPersistTaps={'handled'}
                        >
                            {stepNumber !== 0 && stepNumber !== 4 &&
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
                                        withButton={splashState.withButton}
                                    />
                                    : stepNumber === 1
                                        ? <></>
                                        : stepNumber === 2
                                            ? <></>
                                            : stepNumber === 3
                                                ? <></>
                                                : <></>
                            }
                            <View style={[styles.bottomContainerButtonView]}>
                                <TouchableOpacity
                                    style={styles.bottomButton}
                                    onPress={
                                        async () => {
                                            // verify if we can move to the next stage
                                            let checksPassed = true;
                                            switch (stepNumber) {
                                                case 0:
                                                    break;
                                                case 1:
                                                    break;
                                                case 2:
                                                    break;
                                                case 3:
                                                    break;
                                                default:
                                                    break;
                                            }
                                            // increase the step number
                                            if (stepNumber < 3 && checksPassed) {
                                                let newStepValue = stepNumber + 1;
                                                setStepNumber(newStepValue);
                                            }
                                        }
                                    }
                                >
                                    <Text style={styles.buttonText}>{
                                        stepNumber === 0
                                            ? `Continue`
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
