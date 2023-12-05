import React, {useEffect, useState} from "react";
import {Image, ImageBackground, Keyboard, Platform, TouchableOpacity, View} from "react-native";
import {commonStyles} from '../../../styles/common.module';
import {styles} from '../../../styles/signIn.module';
import {SignInProps} from "../../../models/props/AuthenticationProps";
import {Text, TextInput} from "react-native-paper";
import {FieldValidator} from "../../../utils/FieldValidator";
// @ts-ignore
import LoginLogo from '../../../../assets/login-logo.png';
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {useRecoilState} from "recoil";
import {
    currentUserInformation,
    isLoadingAppOverviewNeededState,
    mainRootNavigationState
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
import {referralCodeState} from "../../../recoil/BranchAtom";

/**
 * Sign In component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const SignInComponent = ({navigation}: SignInProps) => {
    // constants used to keep track of local component state
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
    }, [isKeyboardShown, email, emailFocus, password, passwordFocus, referralCode]);


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

            // we will retrieve the user's biometrics preferences, and check if we should attempt biometric login
            const biometricsEnabled = await SecureStore.getItemAsync(`biometrics-enabled`, {
                requireAuthentication: false // we don't need this to be under authentication, so we can check at login
            });
            if (biometricsEnabled !== null && biometricsEnabled.length !== 0 && biometricsEnabled === '1') {
                console.log('Biometric sign-in enabled for device! Attempting to sign-in.');
                // attempt biometric authentication in order to retrieve necessary data
                const localAuthenticationResult: LocalAuthentication.LocalAuthenticationResult = await LocalAuthentication.authenticateAsync({
                    promptMessage: 'Use your biometrics or FingerPrint/TouchID to authenticate with Moonbeam!',
                });
                // check if the authentication was successful or not
                if (localAuthenticationResult.success) {
                    console.log('Biometric login successful. Logging user in.');
                    const moonbeamUserId = await SecureStore.getItemAsync(`moonbeam-user-id`, {
                        requireAuthentication: false // we don't need this to be under authentication, so we can check at login
                    });
                    const moonbeamUserPass = await SecureStore.getItemAsync(`moonbeam-user-passcode`, {
                        requireAuthentication: false // we don't need this to be under authentication, so we can check at login
                    });

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

                            // navigate to the App Drawer
                            // @ts-ignore
                            navigation.navigate("AppDrawer", {});

                            return true;
                        } else {
                            // release the loader on button press
                            setIsReady(true);
                            console.log(`No user object available: ${JSON.stringify(user)}`);
                            return true;
                        }
                    } else {
                        // release the loader on button press
                        setIsReady(true);
                        console.log(`Unable to retrieve appropriate SecureStore data for biometrics.`);
                        return true;
                    }
                } else {
                    // release the loader on button press
                    setIsReady(true);
                    console.log('Biometric login not successful. Falling back to regular login.');
                    return true;
                }
            } else {
                // release the loader on button press
                setIsReady(true);
                console.log('Biometric data not available/Biometric sign-in not enabled for device');
                return true;
            }
        } catch (error) {
            // release the loader on button press
            setIsReady(true);
            console.log(`Unexpected error while attempting to biometrically sign in - ${error} ${JSON.stringify(error)}`);
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
                const moonbeamUserId = await SecureStore.getItemAsync(`moonbeam-user-id`, {
                    requireAuthentication: false // we don't need this to be under authentication, so we can check at login
                });
                if (moonbeamUserId !== null && moonbeamUserId.length !== 0 && moonbeamUserId.trim() !== email.trim()) {
                    console.log('Inheriting biometrics from old user. Resetting.');
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

                return true;
            } else {
                // release the loader on button press
                setIsReady(true);
                console.log(`${authenticationErrorMessage} - user object: ${JSON.stringify(user)}`);
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
                }
                // ToDo: add more filtering if needed below
            }

            // release the loader on button press
            setIsReady(true);
            console.log(`${authenticationErrorMessage} ${error}`);
            /**
             * here we just chose to populate one of the error arrays for the fields, instead of having to create a separate
             * error array for authentication purposes.
             */
            setEmailErrors([authenticationErrorMessage]);
            return false;
        }
    }

    // return the component for the SignIn page
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
                                        <Text style={styles.errorMessage}>Please fill out the information below!</Text>
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
                                        left={<TextInput.Icon icon="email" iconColor="#FFFFFF"/>}
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
                                                               iconColor={passwordShown ? "#F2FF5D" : "#FFFFFF"}
                                                               onPress={() => setIsPasswordShown(!passwordShown)}/>}
                                        left={<TextInput.Icon icon="lock" iconColor="#FFFFFF"/>}
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
            }
        </>
    );
};
