import React, {useEffect} from "react";
import {AuthenticationProps} from "../../models/RootProps";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {AuthenticationStackParamList} from "../../models/AuthenticationProps";
import {NavigationContainer} from "@react-navigation/native";
import {IconButton, Text} from "react-native-paper";
import {SignInComponent} from "./SignInComponent";
import {RegistrationComponent} from "./RegistrationComponent";
import {useRecoilState, useRecoilValue} from "recoil";
import {
    initialAuthenticationScreen,
    registrationBackButtonShown,
    firstNameState,
    lastNameState,
    emailState,
    birthdayState,
    phoneNumberState,
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
        const [, setStepNumber] = useRecoilState(registrationStepNumber);
        const [, setFirstName] = useRecoilState(firstNameState);
        const [, setLastName] = useRecoilState(lastNameState);
        const [, setBirthday] = useRecoilState(birthdayState);
        const [, setPhoneNumber] = useRecoilState(phoneNumberState);
        const [, setEmail] = useRecoilState(emailState);

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
                                                    setStepNumber(0);
                                                    setFirstName("");
                                                    setLastName("");
                                                    setEmail("");
                                                    setBirthday("");
                                                    setPhoneNumber("");

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

