import React, {useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from "react-native-safe-area-context";
import {RoundupsHomeProps} from "../../../../../../models/props/RoundupsProps";
import {RoundupsHomeStackParamList} from "../../../../../../models/props/RoundupsHomeProps";
import {RoundupsDashboard} from "./roundupsDashboard/RoundupsDashboard";

/**
 * Roundups component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const RoundupsHome = ({}: RoundupsHomeProps) => {
    // constants used to keep track of local component state

    // constants used to keep track of shared states

    // create a native stack navigator, to be used for our RoundupsHome navigation
    const Stack = createNativeStackNavigator<RoundupsHomeStackParamList>();

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
    }, []);

    // return the component for the RoundupsHome page
    return (
        <>
            {
                <SafeAreaProvider style={{flex: 1, backgroundColor: '#313030'}}>
                    <Stack.Navigator
                        initialRouteName={"RoundupsDashboard"}
                        screenOptions={{
                            headerShown: false,
                            gestureEnabled: false
                        }}
                    >
                        <Stack.Screen
                            name="RoundupsDashboard"
                            component={RoundupsDashboard}
                            initialParams={() => {
                                return (<></>)
                            }}
                        />
                        <Stack.Screen
                            name="RoundupsObjectives"
                            component={() => {
                                return (<></>)
                            }}
                            initialParams={{}}
                        />
                        <Stack.Screen
                            name="RoundupsAccounts"
                            component={() => {
                                return (<></>)
                            }}
                            initialParams={{}}
                        />
                    </Stack.Navigator>
                </SafeAreaProvider>
            }
        </>
    );
};
