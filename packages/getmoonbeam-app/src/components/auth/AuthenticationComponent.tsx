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
    addressZipState,
    amplifySignUpProcessErrorsState,
    birthdayState,
    dutyStatusValueState,
    emailState,
    enlistingYearState,
    firstNameState,
    initialAuthenticationScreen,
    lastNameState,
    militaryBranchValueState,
    phoneNumberState,
    registrationBackButtonShown,
    registrationConfirmationPasswordState,
    registrationMainErrorState,
    registrationPasswordState,
    registrationStepNumber
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
        // do not need to clear further steps because back button won't be shown for subsequent ones

        /**
         * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
         * auth-related functionality for example), as well as any afferent API calls.
         *
         * Generally speaking, any functionality imperative prior to the full page-load should be
         * included in here.
         */
        useEffect(() => {
        }, []);

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
                                                    // do not need to clear next steps because back button won't be shown for subsequent ones

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

