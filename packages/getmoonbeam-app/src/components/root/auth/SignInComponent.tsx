import React, {useEffect, useRef, useState} from "react";
import {Image, ImageBackground, Keyboard, Platform, TouchableOpacity, View} from "react-native";
import {commonStyles} from '../../../styles/common.module';
import {styles} from '../../../styles/signIn.module';
import {SignInProps} from "../../../models/props/AuthenticationProps";
import {Dialog, Portal, Text, TextInput} from "react-native-paper";
import {FieldValidator} from "../../../utils/FieldValidator";
// @ts-ignore
import LoginLogo from '../../../../assets/login-logo.png';
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {useRecoilState} from "recoil";
import {
    currentUserInformation,
    isLoadingAppOverviewNeededState,
    mainRootNavigationState,
    userIsAuthenticatedState
} from "../../../recoil/AuthAtom";
import {Auth} from "aws-amplify";
import {Spinner} from "../../common/Spinner";
// @ts-ignore
import AuthenticationGradientImage from '../../../../assets/backgrounds/authentication-gradient.png';
// @ts-ignore
import MilitaryBranchImage from '../../../../assets/art/military-branch-logos.png';
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {moonbeamUserIdPassState, moonbeamUserIdState} from "../../../recoil/RootAtom";
import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from 'expo-local-authentication';
import {referralCodeMarketingCampaignState, referralCodeState} from "../../../recoil/BranchAtom";
import {logEvent} from "../../../utils/AppSync";
import {LoggingLevel} from "@moonbeam/moonbeam-models";
import {Button} from "@rneui/base";

/**
 * Sign In component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const SignInComponent = ({navigation}: SignInProps) => {
    // other constants
    const RESEND_CODE_ALERT_MESSAGE: string = "Re-sending verification code! You should receive an email shortly";
    // constants used to keep track of local component state
    const [countdownValue, setCountDownValue] = useState<number>(0);
    const [verificationCodeDigit1Focus, setIsVerificationCodeDigit1Focus] = useState<boolean>(false);
    const [verificationCodeDigit2Focus, setIsVerificationCodeDigit2Focus] = useState<boolean>(false);
    const [verificationCodeDigit3Focus, setIsVerificationCodeDigit3Focus] = useState<boolean>(false);
    const [verificationCodeDigit4Focus, setIsVerificationCodeDigit4Focus] = useState<boolean>(false);
    const [verificationCodeDigit5Focus, setIsVerificationCodeDigit5Focus] = useState<boolean>(false);
    const [verificationCodeDigit6Focus, setIsVerificationCodeDigit6Focus] = useState<boolean>(false);
    const [verificationCodeMainError, setVerificationCodeMainError] = useState<boolean>(false);
    const [verificationCodeErrors, setVerificationCodeErrors] = useState<string[]>([]);
    const [verificationCodeDigit1, setVerificationCodeDigit1] = useState<string>("");
    const verificationCodeDigit1Ref = useRef(null);
    const [verificationCodeDigit2, setVerificationCodeDigit2] = useState<string>("");
    const verificationCodeDigit2Ref = useRef(null);
    const [verificationCodeDigit3, setVerificationCodeDigit3] = useState<string>("");
    const verificationCodeDigit3Ref = useRef(null);
    const [verificationCodeDigit4, setVerificationCodeDigit4] = useState<string>("");
    const verificationCodeDigit4Ref = useRef(null);
    const [verificationCodeDigit5, setVerificationCodeDigit5] = useState<string>("");
    const verificationCodeDigit5Ref = useRef(null);
    const [verificationCodeDigit6, setVerificationCodeDigit6] = useState<string>("");
    const verificationCodeDigit6Ref = useRef(null);
    const [emailVerificationModalVisible, setEmailVerificationModalVisible] = useState<boolean>(false);
    const [biometricCheckInitiated, setBiometricCheckInitiated] = useState<boolean>(false);
    const [biometricCheckReady, setBiometricCheckReady] = useState<boolean>(false);
    const [isReady, setIsReady] = useState<boolean>(true);
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    const [email, setEmail] = useState<string>("");
    const [emailErrors, setEmailErrors] = useState<any[]>([]);
    const [emailFocus, setIsEmailFocus] = useState<boolean>(false);
    const [password, setPassword] = useState<string>("");
    const [passwordErrors, setPasswordErrors] = useState<any[]>([]);
    const [passwordFocus, setIsPasswordFocus] = useState<boolean>(false);
    const [loginMainError, setLoginMainError] = useState<boolean>(false);
    const [passwordShown, setIsPasswordShown] = useState<boolean>(false);
    const [isKeyboardShown, setIsKeyboardShown] = useState<boolean>(false);
    // constants used to keep track of shared states
    const [userIsAuthenticated, setIsUserAuthenticated] = useRecoilState(userIsAuthenticatedState);
    const [referralCodeMarketingCampaign,] = useRecoilState(referralCodeMarketingCampaignState);
    const [referralCode,] = useRecoilState(referralCodeState);
    const [, setMoonbeamUserId] = useRecoilState(moonbeamUserIdState);
    const [, setMoonbeamUserIdPass] = useRecoilState(moonbeamUserIdPassState);
    const [mainRootNavigation,] = useRecoilState(mainRootNavigationState);
    const [, setIsLoadingAppOverviewNeeded] = useRecoilState(isLoadingAppOverviewNeededState);
    const [, setUserInformation] = useRecoilState(currentUserInformation);

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
        /**
         * force the registration navigation in case we got a referral code and marketing code and for some reason the
         * re-direct did not work
         */
        referralCode.length !== 0 && referralCodeMarketingCampaign.length !== 0 && navigation.navigate('Registration', {});

        // determine whether biometric sign-in is enabled or not, and sign-in user using biometrics if that's available
        referralCode.length === 0 && !biometricCheckReady && !biometricCheckInitiated && signInWithBiometrics().then(_ => {
            setBiometricCheckReady(true);
        });

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
        /**
         * signal that there will be no need to go back to the App Overview component from here, unless we press
         * on the appropriate prompt, located under the Sign-In button.
         */
        setIsLoadingAppOverviewNeeded(false);

        // perform field validations on every state change, for the specific field that is being validated
        if (emailFocus && email !== "") {
            fieldValidator.validateField(email, "email", setEmailErrors);
        }
        email === "" && setEmailErrors([]);

        if (passwordFocus && password !== "") {
            fieldValidator.validateField(password, "password", setPasswordErrors);
        }
        password === "" && setPasswordErrors([]);

        // remove keyboard listeners accordingly
        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, [isKeyboardShown, email, emailFocus, password, passwordFocus, referralCode, referralCodeMarketingCampaign,
        countdownValue, verificationCodeErrors, verificationCodeMainError]);


    /**
     * Function used to authenticate a user with biometric data (if available),
     * given their username and password.
     *
     * @return a {@link Promise} of a {@link Boolean} representing a flag indicating whether
     * a user biometric data sign-in was successfully attempted or not.
     */
    const signInWithBiometrics = async (): Promise<boolean> => {
        try {
            // so we don't repeat the biometric login attempt
            setBiometricCheckInitiated(true);

            // set a loader on button press
            setIsReady(false);


            /**
             * We're going to do a try and catch for retrieving items from the Secure Store, since in case
             * of decryption issues this will cause log in errors.
             */
            let biometricsEnabled: string | null = null;
            try {
                // we will retrieve the user's biometrics preferences, and check if we should attempt biometric login
                biometricsEnabled = await SecureStore.getItemAsync(`biometrics-enabled`, {
                    requireAuthentication: false // we don't need this to be under authentication, so we can check at login
                });
            } catch (error) {
                const message = `Unexpected error while retrieving item \'biometrics-enabled\' from SecureStore`;
                console.log(message);
                await logEvent(message, LoggingLevel.Warning, userIsAuthenticated);
            }

            if (biometricsEnabled !== null && biometricsEnabled.length !== 0 && biometricsEnabled === '1') {
                const message = 'Biometric sign-in enabled for device! Attempting to sign-in.';
                console.log(message);
                await logEvent(message, LoggingLevel.Info, true);

                // attempt biometric authentication in order to retrieve necessary data
                const localAuthenticationResult: LocalAuthentication.LocalAuthenticationResult = await LocalAuthentication.authenticateAsync({
                    promptMessage: 'Use your biometrics or FingerPrint/TouchID to authenticate with Moonbeam!',
                });
                // check if the authentication was successful or not
                if (localAuthenticationResult.success) {
                    const message = 'Biometric login successful. Logging user in.';
                    console.log(message);
                    await logEvent(message, LoggingLevel.Info, true);

                    /**
                     * We're going to do a try and catch for retrieving items from the Secure Store, since in case
                     * of decryption issues this will cause log in errors.
                     */
                    let moonbeamUserId: string | null = null;
                    let moonbeamUserPass: string | null = null;
                    try {
                        moonbeamUserId = await SecureStore.getItemAsync(`moonbeam-user-id`, {
                            requireAuthentication: false // we don't need this to be under authentication, so we can check at login
                        });
                        moonbeamUserPass = await SecureStore.getItemAsync(`moonbeam-user-passcode`, {
                            requireAuthentication: false // we don't need this to be under authentication, so we can check at login
                        });
                    } catch (error) {
                        const message = `Unexpected error while retrieving item \'moonbeam-user-id\' or \'moonbeam-user-passcode\' from SecureStore`;
                        console.log(message);
                        await logEvent(message, LoggingLevel.Warning, userIsAuthenticated);
                    }

                    if (moonbeamUserId !== null && moonbeamUserPass !== null && moonbeamUserId.length !== 0 && moonbeamUserPass.length !== 0) {
                        // use Amplify to sign in the user, given the retrieve Secure Store data.
                        const user = await Auth.signIn(moonbeamUserId, moonbeamUserPass);
                        if (user) {
                            // we will autofill these values
                            setIsPasswordShown(false);
                            setPassword(moonbeamUserPass);
                            setEmail(moonbeamUserId);

                            // retrieve the user information payload from the authenticated session.
                            const userInfo = user.signInUserSession.idToken.payload;

                            // set the current user information accordingly
                            setUserInformation({
                                ...userInfo
                            });

                            // release the loader on button press
                            setIsReady(true);

                            // check if authentication was successful
                            setLoginMainError(false);

                            /**
                             * set the already signed in flag to true, so next time user logs in, they
                             * can skip on the overview screen.
                             */
                            await SecureStore.setItemAsync(`moonbeam-skip-overview`, '1', {
                                requireAuthentication: false // can only retrieve this if a valid authentication mechanism was successfully passed.
                            });

                            // mark that the user is authenticated
                            setIsUserAuthenticated(true);

                            // navigate to the App Drawer
                            // @ts-ignore
                            navigation.navigate("AppDrawer", {});

                            return true;
                        } else {
                            // release the loader on button press
                            setIsReady(true);
                            const message = `No user object available: ${JSON.stringify(user)}`;
                            console.log(message);
                            await logEvent(message, LoggingLevel.Warning, true);

                            return true;
                        }
                    } else {
                        // release the loader on button press
                        setIsReady(true);
                        const message = `Unable to retrieve appropriate SecureStore data for biometrics.`;
                        console.log(message);
                        await logEvent(message, LoggingLevel.Error, true);

                        return true;
                    }
                } else {
                    // release the loader on button press
                    setIsReady(true);
                    const message = 'Biometric login not successful. Falling back to regular login.';
                    console.log(message);
                    await logEvent(message, LoggingLevel.Warning, true);

                    return true;
                }
            } else {
                // release the loader on button press
                setIsReady(true);
                const message = 'Biometric data not available/Biometric sign-in not enabled for device';
                console.log(message);
                await logEvent(message, LoggingLevel.Warning, true);

                return true;
            }
        } catch (error) {
            // release the loader on button press
            setIsReady(true);
            const message = `Unexpected error while attempting to biometrically sign in - ${error} ${JSON.stringify(error)}`;
            console.log(message);
            await logEvent(message, LoggingLevel.Error, true);

            return true;
        }
    }

    /**
     * Function used to authenticate a user, given their username and password.
     *
     * @return a {@link Promise} of a {@link Boolean} representing a flag indicating whether
     * a user was successfully authenticated or not.
     */
    const signIn = async (): Promise<boolean> => {
        // constant to keep track of the common error for authentication
        let authenticationErrorMessage = `Unexpected error while signing in. Try again!`;

        try {
            // set a loader on button press
            setIsReady(false);

            // use Amplify to sign in the user, given the inputted email and password combination.
            const user = await Auth.signIn(email, password);
            if (user) {
                /**
                 * we also check to see whether this new user is different from any existing ones in keychain.
                 * if so, and we have biometrics set up, we will reset biometrics for this new user, so it does
                 * not inherit the other user's settings.
                 */
                let moonbeamUserId: string | null = null;

                /**
                 * We're going to do a try and catch for retrieving items from the Secure Store, since in case
                 * of decryption issues this will cause log in errors.
                 */
                try {
                    moonbeamUserId = await SecureStore.getItemAsync(`moonbeam-user-id`, {
                        requireAuthentication: false // we don't need this to be under authentication, so we can check at login
                    });
                } catch (error) {
                    const message = `Unexpected error while retrieving item \'moonbeam-user-id\' from SecureStore`;
                    console.log(message);
                    await logEvent(message, LoggingLevel.Warning, userIsAuthenticated);
                }

                if (moonbeamUserId !== null && moonbeamUserId.length !== 0 && moonbeamUserId.trim() !== email.trim()) {
                    const message = 'Inheriting biometrics from old user. Resetting.';
                    console.log(message);
                    await logEvent(message, LoggingLevel.Info, userIsAuthenticated);

                    await SecureStore.deleteItemAsync(`biometrics-enabled`, {
                        requireAuthentication: false // we don't need this to be under authentication, so we can check at login
                    });
                    await SecureStore.deleteItemAsync(`moonbeam-user-id`, {
                        requireAuthentication: false // we don't need this to be under authentication, so we can check at login
                    });
                    await SecureStore.deleteItemAsync(`moonbeam-user-passcode`, {
                        requireAuthentication: false // we don't need this to be under authentication, so we can check at login
                    });
                    await SecureStore.deleteItemAsync(`biometrics-type`, {
                        requireAuthentication: false // we don't need this to be under authentication, so we can check at login
                    });
                }

                /**
                 * we will store these values in a Recoil state, so we can use them through Keychain/Secure Store in case the user wants to enable biometrics
                 * we will remove the values in these fields for readability purposes.
                 */
                setMoonbeamUserId(email);
                setMoonbeamUserIdPass(password);
                setPassword("");
                setEmail("");

                // retrieve the user information payload from the authenticated session.
                const userInfo = user.signInUserSession.idToken.payload;

                // set the current user information accordingly
                setUserInformation({
                    ...userInfo
                });

                // release the loader on button press
                setIsReady(true);

                /**
                 * set the already signed in flag to true, so next time user logs in, they
                 * can skip on the overview screen.
                 */
                await SecureStore.setItemAsync(`moonbeam-skip-overview`, '1', {
                    requireAuthentication: false // can only retrieve this if a valid authentication mechanism was successfully passed.
                });

                // mark that the user is authenticated
                setIsUserAuthenticated(true);

                return true;
            } else {
                // release the loader on button press
                setIsReady(true);
                const message = `${authenticationErrorMessage} - user object: ${JSON.stringify(user)}`;
                console.log(message);
                await logEvent(message, LoggingLevel.Info, userIsAuthenticated);

                /**
                 * here we just chose to populate one of the error arrays for the fields, instead of having to create a separate
                 * error array for authentication purposes.
                 */
                setEmailErrors([authenticationErrorMessage]);
                return false;
            }
        } catch (error) {
            // filter through the errors accordingly
            // @ts-ignore
            const errorCode = error.code;
            if (error && errorCode) {
                if (errorCode === "UserNotFoundException") {
                    authenticationErrorMessage = `User not found! Register first.`;
                } else if (errorCode === "NotAuthorizedException") {
                    authenticationErrorMessage = `User and password combination incorrect.`
                } else if (errorCode === "UserNotConfirmedException") {
                    authenticationErrorMessage = `Email not verified.`
                    setEmailVerificationModalVisible(true);
                    await resendCode();
                }
                // ToDo: add more filtering if needed below
            }

            // release the loader on button press
            setIsReady(true);
            const message = `${authenticationErrorMessage} ${error}`;
            console.log(message);
            await logEvent(message, LoggingLevel.Error, userIsAuthenticated);

            /**
             * here we just chose to populate one of the error arrays for the fields, instead of having to create a separate
             * error array for authentication purposes.
             */
            setEmailErrors([authenticationErrorMessage]);
            return false;
        }
    }

    /**
     * Function used to capture the confirmation button press
     */
    const resendCode = async () => {
        try {
            const resendSignUpCode = await Auth.resendSignUp(email);
            if (resendSignUpCode) {
                // this is not an actual error, but we will treat it as an alerting message
                // @ts-ignore
                setVerificationCodeErrors([RESEND_CODE_ALERT_MESSAGE]);

                // clear previous code and any errors
                setVerificationCodeDigit1("");
                setVerificationCodeDigit2("");
                setVerificationCodeDigit3("");
                setVerificationCodeDigit4("");
                setVerificationCodeDigit5("");
                setVerificationCodeDigit6("");
                setVerificationCodeErrors([]);
            }
        } catch (error) {
            // @ts-ignore
            const errorMessage: string = error.name;
            if (errorMessage && errorMessage === "LimitExceededException") {
                // set verification code errors accordingly
                // @ts-ignore
                setVerificationCodeErrors(["Requested too many codes. Wait a while before requesting another one!"]);
            } else {
                // set verification code errors accordingly
                // @ts-ignore
                setVerificationCodeErrors(["Unexpected error while re-sending verification code. Try again!"]);
            }
            const message = errorMessage
                ? `Unexpected error while resending verification code: ${JSON.stringify(errorMessage)}`
                : `Unexpected error while resending verification code: ${JSON.stringify(error)} ${error}`;
            console.log(message);
            await logEvent(message, LoggingLevel.Error, userIsAuthenticated);
        }
    };

    /**
     * Function used to capture the confirmation of the verification code,
     * and prompt users back to the sign-in page.
     *
     * @returns a {@link Promise} of {@link boolean} representing the flag indicating
     * whether this code was successfully confirmed or not
     */
    const confirmSignUpCode = async (): Promise<boolean> => {
        try {
            // first confirm the signing up of the user, using the code provided
            const signUp = await Auth.confirmSignUp(
                email,
                `${verificationCodeDigit1}${verificationCodeDigit2}${verificationCodeDigit3}${verificationCodeDigit4}${verificationCodeDigit5}${verificationCodeDigit6}`,
                {forceAliasCreation: false}
            );
            if (signUp) {
                return true;
            } else {
                const message = `Unexpected error while confirming sign up code: ${JSON.stringify(signUp)}`;
                console.log(message);
                await logEvent(message, LoggingLevel.Error, userIsAuthenticated);

                // @ts-ignore
                setVerificationCodeErrors(["Unexpected error while re-sending verification code. Try again!"]);

                return false;
            }
        } catch (error) {
            // @ts-ignore
            const errorMessage: string = error.name;
            if (errorMessage && errorMessage === "CodeMismatchException") {
                // set verification code errors accordingly
                // @ts-ignore
                setVerificationCodeErrors(["Invalid verification code provided. Try again!"]);
            } else if (errorMessage && errorMessage === "LimitExceededException") {
                // set verification code errors accordingly
                // @ts-ignore
                setVerificationCodeErrors(["Too many attempts to verify code. Please wait a while before verifying again!"]);
            } else if (errorMessage && errorMessage === "NotAuthorizedException") {
                // set verification code errors accordingly
                // @ts-ignore
                setVerificationCodeErrors(["Verification code expired. Generate a new code and try again!"]);
            } else {
                // set verification code errors accordingly
                // @ts-ignore
                setVerificationCodeErrors(["Unexpected error while re-sending verification code. Try again!"]);
            }

            const message = errorMessage
                ? `Unexpected error while confirming sign up code: ${JSON.stringify(errorMessage)}`
                : `Unexpected error while confirming sign up code: ${JSON.stringify(error)} ${error}`;
            console.log(message);
            await logEvent(message, LoggingLevel.Error, userIsAuthenticated);

            return false;
        }
    };

    // return the component for the SignIn page
    return (
        <>
            {
                !isReady ?
                    <Spinner loadingSpinnerShown={loadingSpinnerShown} setLoadingSpinnerShown={setLoadingSpinnerShown}/>
                    :
                    <>
                        <Portal>
                            <Dialog style={commonStyles.emailVerificationDialogStyle}
                                    visible={emailVerificationModalVisible}
                                    onDismiss={() => {
                                        setVerificationCodeErrors([]);
                                        setVerificationCodeMainError(false);
                                        setVerificationCodeDigit1("");
                                        setVerificationCodeDigit2("");
                                        setVerificationCodeDigit3("");
                                        setVerificationCodeDigit4("");
                                        setVerificationCodeDigit5("");
                                        setVerificationCodeDigit6("");
                                        setEmailVerificationModalVisible(false);
                                    }}>
                                {/*<Dialog.Icon icon="alert" color={"#F2FF5D"}*/}
                                {/*             size={hp(10)}/>*/}
                                <Dialog.Title
                                    style={commonStyles.dialogTitle}>{"Email Verification"}</Dialog.Title>
                                <Dialog.Content>
                                    <Text
                                        style={commonStyles.dialogParagraph}>{"Enter the 6 digit verification code we just sent to your email."}</Text>
                                    {verificationCodeMainError
                                        ?
                                        <Text style={styles.codeVerificationErrorMessage}>Please fill out the
                                            information
                                            below!</Text>
                                        : (verificationCodeErrors.length !== 0 && !verificationCodeMainError)
                                            ? <Text
                                                style={styles.codeVerificationErrorMessage}>{verificationCodeErrors[0]}</Text>
                                            : <></>
                                    }
                                    <View style={styles.codeInputColumnView}>
                                        <TextInput
                                            ref={verificationCodeDigit1Ref}
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
                                            selection={{start: verificationCodeDigit1.length}}
                                            onChangeText={(value: React.SetStateAction<string>) => {
                                                setIsVerificationCodeDigit1Focus(true);
                                                setVerificationCodeMainError(false);
                                                setVerificationCodeErrors([]);

                                                // format value
                                                value = fieldValidator.formatCodeDigit(value.toString());
                                                setVerificationCodeDigit1(value);

                                                // if the value is of length 1, then move to the next digit and clear its contents too
                                                if (value.length === 1) {
                                                    // @ts-ignore
                                                    verificationCodeDigit2Ref.current.focus();
                                                    setVerificationCodeDigit2('');
                                                }
                                            }}
                                            onBlur={() => {
                                                setIsVerificationCodeDigit1Focus(false);
                                            }}
                                            value={verificationCodeDigit1}
                                            contentStyle={styles.textInputCodeContentStyle}
                                            style={verificationCodeDigit1Focus ? styles.textInputCodeFocus : styles.textInputCode}
                                            onFocus={() => {
                                                setIsVerificationCodeDigit1Focus(true);
                                            }}
                                            placeholder={'-'}
                                            label=""
                                            textColor={"#FFFFFF"}
                                        />
                                        <TextInput
                                            autoCorrect={false}
                                            autoComplete={"off"}
                                            ref={verificationCodeDigit2Ref}
                                            keyboardType={"number-pad"}
                                            placeholderTextColor={'#D9D9D9'}
                                            activeUnderlineColor={'#F2FF5D'}
                                            underlineColor={'#D9D9D9'}
                                            outlineColor={'#D9D9D9'}
                                            activeOutlineColor={'#F2FF5D'}
                                            selectionColor={'#F2FF5D'}
                                            mode={'outlined'}
                                            selection={{start: verificationCodeDigit2.length}}
                                            onKeyPress={({nativeEvent}) => {
                                                // for backspace, go back to the previous digit if current digit value is empty
                                                if (nativeEvent.key === 'Backspace' && verificationCodeDigit2.length === 0) {
                                                    // @ts-ignore
                                                    verificationCodeDigit1Ref.current.focus();
                                                }
                                            }}
                                            onChangeText={(value: React.SetStateAction<string>) => {
                                                setIsVerificationCodeDigit2Focus(true);
                                                setVerificationCodeMainError(false);
                                                setVerificationCodeErrors([]);

                                                // format value
                                                value = fieldValidator.formatCodeDigit(value.toString());
                                                setVerificationCodeDigit2(value);

                                                // if the value is of length 1, then move to the next digit and clear its contents too
                                                if (value.length === 1) {
                                                    // @ts-ignore
                                                    verificationCodeDigit3Ref.current.focus();
                                                    setVerificationCodeDigit3('');
                                                }
                                                // if the value is of length 0, then we move to the previous digit
                                                if (value.length === 0) {
                                                    // @ts-ignore
                                                    verificationCodeDigit1Ref.current.focus();
                                                }
                                            }}
                                            onBlur={() => {
                                                setIsVerificationCodeDigit2Focus(false);
                                            }}
                                            value={verificationCodeDigit2}
                                            contentStyle={styles.textInputCodeContentStyle}
                                            style={verificationCodeDigit2Focus ? styles.textInputCodeFocus : styles.textInputCode}
                                            onFocus={() => {
                                                setIsVerificationCodeDigit2Focus(true);
                                            }}
                                            placeholder={'-'}
                                            label=""
                                            textColor={"#FFFFFF"}
                                        />
                                        <TextInput
                                            autoCorrect={false}
                                            autoComplete={"off"}
                                            ref={verificationCodeDigit3Ref}
                                            keyboardType={"number-pad"}
                                            placeholderTextColor={'#D9D9D9'}
                                            activeUnderlineColor={'#F2FF5D'}
                                            underlineColor={'#D9D9D9'}
                                            outlineColor={'#D9D9D9'}
                                            activeOutlineColor={'#F2FF5D'}
                                            selectionColor={'#F2FF5D'}
                                            mode={'outlined'}
                                            selection={{start: verificationCodeDigit3.length}}
                                            onKeyPress={({nativeEvent}) => {
                                                // for backspace, go back to the previous digit if current digit value is empty
                                                if (nativeEvent.key === 'Backspace' && verificationCodeDigit3.length === 0) {
                                                    // @ts-ignore
                                                    verificationCodeDigit2Ref.current.focus();
                                                }
                                            }}
                                            onChangeText={(value: React.SetStateAction<string>) => {
                                                setIsVerificationCodeDigit3Focus(true);
                                                setVerificationCodeMainError(false);
                                                setVerificationCodeErrors([]);

                                                // format value
                                                value = fieldValidator.formatCodeDigit(value.toString());
                                                setVerificationCodeDigit3(value);

                                                // if the value is of length 1, then move to the next digit and clear its contents too
                                                if (value.length === 1) {
                                                    // @ts-ignore
                                                    verificationCodeDigit4Ref.current.focus();
                                                    setVerificationCodeDigit4('');
                                                }
                                                // if the value is of length 0, then we move to the previous digit
                                                if (value.length === 0) {
                                                    // @ts-ignore
                                                    verificationCodeDigit2Ref.current.focus();
                                                }
                                            }}
                                            onBlur={() => {
                                                setIsVerificationCodeDigit3Focus(false);
                                            }}
                                            value={verificationCodeDigit3}
                                            contentStyle={styles.textInputCodeContentStyle}
                                            style={verificationCodeDigit3Focus ? styles.textInputCodeFocus : styles.textInputCode}
                                            onFocus={() => {
                                                setIsVerificationCodeDigit3Focus(true);
                                            }}
                                            placeholder={'-'}
                                            label=""
                                            textColor={"#FFFFFF"}
                                        />
                                        <TextInput
                                            autoCorrect={false}
                                            autoComplete={"off"}
                                            ref={verificationCodeDigit4Ref}
                                            keyboardType={"number-pad"}
                                            placeholderTextColor={'#D9D9D9'}
                                            activeUnderlineColor={'#F2FF5D'}
                                            underlineColor={'#D9D9D9'}
                                            outlineColor={'#D9D9D9'}
                                            activeOutlineColor={'#F2FF5D'}
                                            selectionColor={'#F2FF5D'}
                                            mode={'outlined'}
                                            selection={{start: verificationCodeDigit4.length}}
                                            onKeyPress={({nativeEvent}) => {
                                                // for backspace, go back to the previous digit if current digit value is empty
                                                if (nativeEvent.key === 'Backspace' && verificationCodeDigit4.length === 0) {
                                                    // @ts-ignore
                                                    verificationCodeDigit3Ref.current.focus();
                                                }
                                            }}
                                            onChangeText={(value: React.SetStateAction<string>) => {
                                                setIsVerificationCodeDigit4Focus(true);
                                                setVerificationCodeMainError(false);
                                                setVerificationCodeErrors([]);

                                                // format value
                                                value = fieldValidator.formatCodeDigit(value.toString());
                                                setVerificationCodeDigit4(value);

                                                // if the value is of length 1, then move to the next digit and clear its contents too
                                                if (value.length === 1) {
                                                    // @ts-ignore
                                                    verificationCodeDigit5Ref.current.focus();
                                                    setVerificationCodeDigit5('');
                                                }
                                                // if the value is of length 0, then we move to the previous digit
                                                if (value.length === 0) {
                                                    // @ts-ignore
                                                    verificationCodeDigit3Ref.current.focus();
                                                }
                                            }}
                                            onBlur={() => {
                                                setIsVerificationCodeDigit4Focus(false);
                                            }}
                                            value={verificationCodeDigit4}
                                            contentStyle={styles.textInputCodeContentStyle}
                                            style={verificationCodeDigit4Focus ? styles.textInputCodeFocus : styles.textInputCode}
                                            onFocus={() => {
                                                setIsVerificationCodeDigit4Focus(true);
                                            }}
                                            placeholder={'-'}
                                            label=""
                                            textColor={"#FFFFFF"}
                                        />
                                        <TextInput
                                            autoCorrect={false}
                                            autoComplete={"off"}
                                            ref={verificationCodeDigit5Ref}
                                            keyboardType={"number-pad"}
                                            placeholderTextColor={'#D9D9D9'}
                                            activeUnderlineColor={'#F2FF5D'}
                                            underlineColor={'#D9D9D9'}
                                            outlineColor={'#D9D9D9'}
                                            activeOutlineColor={'#F2FF5D'}
                                            selectionColor={'#F2FF5D'}
                                            mode={'outlined'}
                                            selection={{start: verificationCodeDigit5.length}}
                                            onKeyPress={({nativeEvent}) => {
                                                /// for backspace, go back to the previous digit if current digit value is empty
                                                if (nativeEvent.key === 'Backspace' && verificationCodeDigit5.length === 0) {
                                                    // @ts-ignore
                                                    verificationCodeDigit4Ref.current.focus();
                                                }
                                            }}
                                            onChangeText={(value: React.SetStateAction<string>) => {
                                                setIsVerificationCodeDigit5Focus(true);
                                                setVerificationCodeMainError(false);
                                                setVerificationCodeErrors([]);

                                                // format value
                                                value = fieldValidator.formatCodeDigit(value.toString());
                                                setVerificationCodeDigit5(value);

                                                // if the value is of length 1, then move to the next digit and clear its contents too
                                                if (value.length === 1) {
                                                    // @ts-ignore
                                                    verificationCodeDigit6Ref.current.focus();
                                                    setVerificationCodeDigit6('');
                                                }
                                                // if the value is of length 0, then we move to the previous digit
                                                if (value.length === 0) {
                                                    // @ts-ignore
                                                    verificationCodeDigit4Ref.current.focus();
                                                }
                                            }}
                                            onBlur={() => {
                                                setIsVerificationCodeDigit5Focus(false);
                                            }}
                                            value={verificationCodeDigit5}
                                            contentStyle={styles.textInputCodeContentStyle}
                                            style={verificationCodeDigit5Focus ? styles.textInputCodeFocus : styles.textInputCode}
                                            onFocus={() => {
                                                setIsVerificationCodeDigit5Focus(true);
                                            }}
                                            placeholder={'-'}
                                            label=""
                                            textColor={"#FFFFFF"}
                                        />
                                        <TextInput
                                            autoCorrect={false}
                                            autoComplete={"off"}
                                            ref={verificationCodeDigit6Ref}
                                            keyboardType={"number-pad"}
                                            placeholderTextColor={'#D9D9D9'}
                                            activeUnderlineColor={'#F2FF5D'}
                                            underlineColor={'#D9D9D9'}
                                            outlineColor={'#D9D9D9'}
                                            activeOutlineColor={'#F2FF5D'}
                                            selectionColor={'#F2FF5D'}
                                            mode={'outlined'}
                                            selection={{start: verificationCodeDigit6.length}}
                                            onKeyPress={({nativeEvent}) => {
                                                // for backspace, go back to the previous digit if current digit value is empty
                                                if (nativeEvent.key === 'Backspace' && verificationCodeDigit6.length === 0) {
                                                    // @ts-ignore
                                                    verificationCodeDigit5Ref.current.focus();
                                                }
                                            }}
                                            onChangeText={(value: React.SetStateAction<string>) => {
                                                setIsVerificationCodeDigit6Focus(true);
                                                setVerificationCodeMainError(false);
                                                setVerificationCodeErrors([]);

                                                // format value
                                                value = fieldValidator.formatCodeDigit(value.toString());
                                                setVerificationCodeDigit6(value);

                                                // if the value is of length 1, then verify code automatically
                                                if (value.length === 1) {
                                                    // @ts-ignore
                                                    verificationCodeDigit6Ref.current.blur();
                                                    // automatically verify the code
                                                    // setAutomaticallyVerifyRegistrationCode(true);
                                                }
                                                // if the value is of length 0, then we move to the previous digit
                                                if (value.length === 0) {
                                                    // @ts-ignore
                                                    verificationCodeDigit5Ref.current.focus();
                                                }
                                            }}
                                            onBlur={() => {
                                                setIsVerificationCodeDigit6Focus(false);
                                            }}
                                            value={verificationCodeDigit6}
                                            contentStyle={styles.textInputCodeContentStyle}
                                            style={verificationCodeDigit6Focus ? styles.textInputCodeFocus : styles.textInputCode}
                                            onFocus={() => {
                                                setIsVerificationCodeDigit6Focus(true);
                                            }}
                                            placeholder={'-'}
                                            label=""
                                            textColor={"#FFFFFF"}
                                        />
                                    </View>
                                </Dialog.Content>
                                <Dialog.Actions>
                                    <TouchableOpacity
                                        // disabled={countdownValue > 0}
                                        onPress={
                                            async () => {
                                                // reset the timer
                                                setCountDownValue(10);

                                                // resend the verification code
                                                await resendCode();

                                                // reset all error messages
                                                setVerificationCodeMainError(false);
                                                setVerificationCodeErrors([]);
                                            }
                                        }
                                    >
                                        <Text style={styles.resendCode}>Resend Code</Text>
                                        {/*<Text style={[countdownValue > 0 ? styles.resendCodeDisabled : styles.resendCode]}>Resend Code</Text>*/}
                                    </TouchableOpacity>
                                    <Button buttonStyle={commonStyles.emailVerificationDialogButton}
                                            titleStyle={commonStyles.emailVerificationDialogButtonText}
                                            onPress={async () => {
                                                // verify if we can dismiss the modal
                                                if (verificationCodeDigit1 === "" || verificationCodeDigit2 === "" || verificationCodeDigit3 === "" ||
                                                    verificationCodeDigit4 === "" || verificationCodeDigit5 === "" || verificationCodeDigit6 === "" ||
                                                    verificationCodeErrors.length !== 0) {
                                                    if (verificationCodeErrors.length === 0) {
                                                        setVerificationCodeMainError(true);
                                                    }
                                                } else {
                                                    // check on the code validity through Amplify
                                                    const confirmedCodeFlag = await confirmSignUpCode();

                                                    // dismiss the modal if there are no errors
                                                    if (confirmedCodeFlag) {
                                                        // that means that the code was confirmed, and we can dismiss the modal
                                                        setEmailVerificationModalVisible(false);
                                                        setVerificationCodeMainError(false);
                                                        setVerificationCodeErrors([]);
                                                    }
                                                }
                                            }}>
                                        {"Verify"}
                                    </Button>
                                </Dialog.Actions>
                            </Dialog>
                        </Portal>
                        <ImageBackground
                            style={[commonStyles.image]}
                            imageStyle={{
                                resizeMode: 'stretch'
                            }}
                            resizeMethod={"scale"}
                            source={AuthenticationGradientImage}>
                            <KeyboardAwareScrollView
                                enableOnAndroid={true}
                                showsVerticalScrollIndicator={false}
                                enableAutomaticScroll={(Platform.OS === 'ios')}
                                contentContainerStyle={[commonStyles.rowContainer]}
                                keyboardShouldPersistTaps={'handled'}
                            >
                                <View style={Platform.OS === 'android' && isKeyboardShown && {height: hp(220)}}>
                                    <View style={styles.topContainer}>
                                        <Text style={styles.greetingTitle}>Hello</Text>
                                        <Text style={styles.gettingSubtitle}>Get ready to <Text
                                            style={styles.gettingSubtitleHighlighted}>Earn</Text></Text>
                                        <Image resizeMethod={"scale"}
                                               resizeMode={'contain'}
                                               source={MilitaryBranchImage}
                                               style={styles.topContainerImage}/>
                                    </View>
                                    <View style={[styles.bottomContainer]}>
                                        <Text style={styles.bottomTitle}>Login</Text>
                                        {loginMainError ?
                                            <Text style={styles.errorMessage}>Please fill out the information
                                                below!</Text>
                                            : (emailErrors.length !== 0 && !loginMainError) ?
                                                <Text style={styles.errorMessage}>{emailErrors[0]}</Text>
                                                : (passwordErrors.length !== 0 && !loginMainError) ?
                                                    <Text style={styles.errorMessage}>{passwordErrors[0]}</Text>
                                                    : <></>
                                        }
                                        <TextInput
                                            autoCapitalize={"none"}
                                            autoCorrect={false}
                                            autoComplete={"off"}
                                            keyboardType={"email-address"}
                                            placeholderTextColor={'#D9D9D9'}
                                            activeUnderlineColor={'#F2FF5D'}
                                            underlineColor={'#D9D9D9'}
                                            outlineColor={'#D9D9D9'}
                                            activeOutlineColor={'#F2FF5D'}
                                            selectionColor={'#F2FF5D'}
                                            mode={'outlined'}
                                            onChangeText={(value: React.SetStateAction<string>) => {
                                                setIsEmailFocus(true);
                                                setLoginMainError(false);
                                                setEmail(value);
                                            }}
                                            value={email}
                                            contentStyle={styles.textInputContentStyle}
                                            style={emailFocus ? styles.textInputFocus : styles.textInput}
                                            onFocus={() => {
                                                setIsEmailFocus(true);
                                            }}
                                            placeholder={'Type in your email...'}
                                            label="Email"
                                            textColor={"#FFFFFF"}
                                            left={<TextInput.Icon icon="email" color="#FFFFFF"/>}
                                        />
                                        <TextInput
                                            autoCapitalize={"none"}
                                            autoCorrect={false}
                                            autoComplete={"off"}
                                            keyboardType={"default"}
                                            placeholderTextColor={'#D9D9D9'}
                                            activeUnderlineColor={'#F2FF5D'}
                                            underlineColor={'#D9D9D9'}
                                            outlineColor={'#D9D9D9'}
                                            activeOutlineColor={'#F2FF5D'}
                                            selectionColor={'#F2FF5D'}
                                            mode={'outlined'}
                                            onChangeText={(value: React.SetStateAction<string>) => {
                                                setIsPasswordFocus(true);
                                                setLoginMainError(false);
                                                setPassword(value);
                                            }}
                                            value={password}
                                            contentStyle={[styles.textInputContentStyle, {width: wp(60)}]}
                                            style={passwordFocus ? styles.textInputFocus : styles.textInput}
                                            onFocus={() => {
                                                setIsPasswordFocus(true);
                                            }}
                                            placeholder={'Type in your password...'}
                                            label="Password"
                                            secureTextEntry={!passwordShown}
                                            textColor={"#FFFFFF"}
                                            right={<TextInput.Icon icon={!passwordShown ? "eye" : "eye-off"}
                                                                   color={passwordShown ? "#F2FF5D" : "#FFFFFF"}
                                                                   onPress={() => setIsPasswordShown(!passwordShown)}/>}
                                            left={<TextInput.Icon icon="lock" color="#FFFFFF"/>}
                                        />
                                        <View style={styles.forgotPasswordView}>
                                            <Text style={styles.forgotPasswordButton}
                                                  onPress={() => {
                                                      setIsEmailFocus(false);
                                                      setEmail("");
                                                      setIsPasswordFocus(false);
                                                      setPassword("");
                                                      setEmailErrors([]);
                                                      setPasswordErrors([]);
                                                      setLoginMainError(false);
                                                      // @ts-ignore
                                                      navigation.navigate('AccountRecovery', {})
                                                  }}>Forgot Password ?
                                            </Text>
                                        </View>
                                        <TouchableOpacity
                                            style={styles.logInButton}
                                            onPress={async () => {
                                                if (email === "" || password === "" || passwordErrors.length !== 0
                                                    || emailErrors.length !== 0) {
                                                    // only populate main error if there are no other errors showing
                                                    if (passwordErrors.length === 0 && emailErrors.length === 0) {
                                                        setLoginMainError(true);
                                                    }
                                                } else {
                                                    // authenticate user through Amplify
                                                    const signInFlag = await signIn();

                                                    // check if authentication was successful
                                                    if (signInFlag) {
                                                        setLoginMainError(false);

                                                        // navigate to the App Drawer
                                                        // @ts-ignore
                                                        navigation.navigate("AppDrawer", {});
                                                    }
                                                }
                                            }}
                                        >
                                            <Text style={styles.loginButtonContentStyle}>Sign In</Text>
                                        </TouchableOpacity>
                                        <View
                                            style={(emailErrors.length !== 0 || passwordErrors.length !== 0 || !loginMainError)
                                                ? {marginTop: hp(5)} : {marginTop: hp(1)}}>
                                            <Image source={LoginLogo}
                                                   style={styles.loginLogo}
                                                   resizeMode={'contain'}/>
                                            <Text style={styles.loginFooter}>Don't have an account ?
                                                <Text style={styles.loginFooterButton}
                                                      onPress={() => {
                                                          // clear the username and password
                                                          setPassword("");
                                                          setEmail("");
                                                          // @ts-ignore
                                                          navigation.navigate('Registration', {});
                                                      }}>{"  "}Sign up</Text>
                                            </Text>
                                            <Text style={styles.loginFooter}>
                                                <Text style={styles.loginFooterButton}
                                                      onPress={() => {
                                                          // clear the username and password
                                                          setPassword("");
                                                          setEmail("");
                                                          // reset the App Overview flag and go back, to the App Overview screen
                                                          setIsLoadingAppOverviewNeeded(true);
                                                          mainRootNavigation && mainRootNavigation.goBack();
                                                      }}>{"  "}Learn More</Text>
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </KeyboardAwareScrollView>
                        </ImageBackground>
                    </>
            }
        </>
    );
};
