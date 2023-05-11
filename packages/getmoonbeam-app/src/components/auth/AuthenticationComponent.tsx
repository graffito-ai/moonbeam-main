import React, {useEffect} from "react";
import {AuthenticationProps} from "../../models/RootProps";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {AuthenticationStackParamList} from "../../models/AuthenticationProps";
import {NavigationContainer} from "@react-navigation/native";
import {Text} from "react-native-paper";
import {SignInComponent} from "./SignInComponent";
import {RegistrationComponent} from "./RegistrationComponent";
import {useRecoilValue} from "recoil";
import {initialAuthenticationScreen} from '../../recoil/AuthAtom';

/**
 * Authentication component.
 */
export const AuthenticationComponent = ({}: AuthenticationProps) => {
    // create a native stack navigator, to be used for our Authentication application navigation
    const Stack = createNativeStackNavigator<AuthenticationStackParamList>();

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
                    initialRouteName={useRecoilValue(initialAuthenticationScreen) == 'SignIn' ?  "SignIn": 'Registration'}
                >
                    <Stack.Screen
                        name="SignIn"
                        component={SignInComponent}
                        options={{
                            headerShown: false
                        }}
                        initialParams={{initialRender: true}}
                    />
                    <Stack.Screen
                        name="Registration"
                        component={RegistrationComponent}
                        options={{
                            headerShown: true
                        }}
                        initialParams={{}}
                    />
                    {/*<Stack.Screen*/}
                    {/*    name="AccountRecovery"*/}
                    {/*    component={AccountRecoveryComponent}*/}
                    {/*    options={{*/}
                    {/*        headerShown: true*/}
                    {/*    }}*/}
                    {/*    initialParams={{}}*/}
                    {/*/>*/}
                </Stack.Navigator>
            </NavigationContainer>
        </>
    );
};

