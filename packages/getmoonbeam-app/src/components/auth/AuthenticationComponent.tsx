import React, {useEffect} from "react";
import {AuthenticationProps} from "../../models/RootProps";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {AuthenticationStackParamList} from "../../models/AuthenticationProps";
import {NavigationContainer} from "@react-navigation/native";
import {IconButton, Text} from "react-native-paper";
import {SignInComponent} from "./SignInComponent";
import {RegistrationComponent} from "./registration/RegistrationComponent";
import {useRecoilState, useRecoilValue} from "recoil";
import {
    accountCreationDisclaimerCheckState,
    addressCityState,
    addressLineState,
    addressStateState,
    addressZipState, amplifySignUpProcessErrorsState,
    birthdayState,
    codeConfirmationInterval,
    dutyStatusValueState,
    emailState,
    enlistingYearState,
    firstNameState,
    initialAuthenticationScreen,
    lastNameState,
    militaryBranchValueState,
    phoneNumberState,
    registrationBackButtonShown,
    registrationCodeTimerValue,
    registrationConfirmationPasswordState,
    registrationMainErrorState,
    registrationPasswordState,
    registrationStepNumber,
    registrationVerificationDigit1,
    registrationVerificationDigit2,
    registrationVerificationDigit3,
    registrationVerificationDigit4,
    registrationVerificationDigit5,
    registrationVerificationDigit6,
    resetCodeConfirmationTimer, verificationCodeErrorsState
} from '../../recoil/AuthAtom';
import {AccountRecoveryComponent} from "./AccountRecoveryComponent";
import {Dimensions} from "react-native";
import {commonStyles} from "../../styles/common.module";

/**
 * Authentication component.
 */
export const AuthenticationComponent = ({}: AuthenticationProps) => {
        // create a native stack navigator, to be used for our Authentication application navigation
        const Stack = createNativeStackNavigator<AuthenticationStackParamList>();
        // constants used to keep track of shared states
        const [, setRegistrationMainError] = useRecoilState(registrationMainErrorState);
        const [, setStepNumber] = useRecoilState(registrationStepNumber);
        // step 1
        const [, setFirstName] = useRecoilState(firstNameState);
        const [, setLastName] = useRecoilState(lastNameState);
        const [, setBirthday] = useRecoilState(birthdayState);
        const [, setPhoneNumber] = useRecoilState(phoneNumberState);
        const [, setEmail] = useRecoilState(emailState);
        const [, setDutyStatus] = useRecoilState(dutyStatusValueState);
        const [, setEnlistingYear] = useRecoilState(enlistingYearState);
        // step 2
        const [, setAddressLine] = useRecoilState(addressLineState);
        const [, setAddressState] = useRecoilState(addressStateState);
        const [, setAddressZip] = useRecoilState(addressZipState);
        const [, setAddressCity] = useRecoilState(addressCityState);
        const [, setMilitaryBranch] = useRecoilState(militaryBranchValueState);
        // step 3
        const [,setPassword] = useRecoilState(registrationPasswordState);
        const [,setConfirmationPassword] = useRecoilState(registrationConfirmationPasswordState);
        const [,setAccountRegistrationDisclaimer] = useRecoilState(accountCreationDisclaimerCheckState);
        const [,setAmplifySignUpErrors] = useRecoilState(amplifySignUpProcessErrorsState);
        // step 4
        const [codeVerificationInterval, setCodeVerificationInterval] = useRecoilState(codeConfirmationInterval);
        const [codeConfirmationReset, setCodeConfirmationReset] = useRecoilState(resetCodeConfirmationTimer);
        const [, setRegistrationVerificationDigit1] = useRecoilState(registrationVerificationDigit1);
        const [, setRegistrationVerificationDigit2] = useRecoilState(registrationVerificationDigit2);
        const [, setRegistrationVerificationDigit3] = useRecoilState(registrationVerificationDigit3);
        const [, setRegistrationVerificationDigit4] = useRecoilState(registrationVerificationDigit4);
        const [, setRegistrationVerificationDigit5] = useRecoilState(registrationVerificationDigit5);
        const [, setRegistrationVerificationDigit6] = useRecoilState(registrationVerificationDigit6);
        const [countdownValue, ] = useRecoilState(registrationCodeTimerValue);
        const [, setVerificationCodeErrors] = useRecoilState(verificationCodeErrorsState);

        /**
         * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
         * auth-related functionality for example), as well as any afferent API calls.
         *
         * Generally speaking, any functionality imperative prior to the full page-load should be
         * included in here.
         */
        useEffect(() => {
            // reset the countdown appropriately, if the back button is pressed
            if ((codeConfirmationReset && codeVerificationInterval) || countdownValue < 0) {
                setCodeVerificationInterval(setInterval(() => {clearInterval(codeVerificationInterval)}, 0));
            }
        }, [codeConfirmationReset, countdownValue]);

        // return the component for the Authentication stack
        return (
            <>
                <NavigationContainer independent={true} fallback={<Text>Loading...</Text>}>
                    <Stack.Navigator
                        initialRouteName={useRecoilValue(initialAuthenticationScreen) == 'SignIn' ? "SignIn" : 'Registration'}
                        screenOptions={{
                            headerShown: false
                        }}
                    >
                        <Stack.Screen
                            name="SignIn"
                            component={SignInComponent}
                            initialParams={{initialRender: true}}
                        />
                        <Stack.Screen
                            name="Registration"
                            component={RegistrationComponent}
                            options={({navigation}) => {
                                return({
                                    headerTitle: '',
                                    headerShown: true,
                                    headerTransparent: true,
                                    headerLeft: () => {
                                        return useRecoilValue(registrationBackButtonShown)
                                            ?
                                            (<IconButton
                                                icon="chevron-left"
                                                iconColor={"#FFFFFF"}
                                                size={Dimensions.get('window').height / 30}
                                                style={commonStyles.backButton}
                                                onPress={() => {
                                                    // clear the registration values
                                                    // step 1
                                                    setFirstName("");
                                                    setLastName("");
                                                    setEmail("");
                                                    setBirthday("");
                                                    setPhoneNumber("");
                                                    setDutyStatus("");
                                                    setEnlistingYear("");
                                                    // step 2
                                                    setAddressLine("");
                                                    setAddressCity("");
                                                    setAddressZip("");
                                                    setAddressState("");
                                                    setMilitaryBranch("");
                                                    // step 3
                                                    setPassword("");
                                                    setConfirmationPassword("");
                                                    setAccountRegistrationDisclaimer(false);
                                                    setAmplifySignUpErrors([]);
                                                    // step 4
                                                    setRegistrationVerificationDigit1("");
                                                    setRegistrationVerificationDigit2("");
                                                    setRegistrationVerificationDigit3("");
                                                    setRegistrationVerificationDigit4("");
                                                    setRegistrationVerificationDigit5("");
                                                    setRegistrationVerificationDigit6("");
                                                    setVerificationCodeErrors([]);
                                                    setCodeConfirmationReset(true);
                                                    // main
                                                    setRegistrationMainError(false);
                                                    setStepNumber(0);
                                                    // navigate to the SignIn page
                                                    navigation.navigate('SignIn', {initialRender: true});
                                                }}
                                            />)
                                            : <></>
                                    }
                                })
                            }}
                            initialParams={{}}
                        />
                        <Stack.Screen
                            name="AccountRecovery"
                            component={AccountRecoveryComponent}
                            initialParams={{}}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </>
        );
    }
;

