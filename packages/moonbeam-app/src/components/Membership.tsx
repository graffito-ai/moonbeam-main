import React, {useEffect} from 'react';
import {MembershipTabProps} from '../models/BottomBarProps';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {Navbar} from "./Navbar";
import {MembershipStackParamList} from "../models/MembershipStackProps";
import {MembershipProfile} from './MembershipProfile';

/**
 * Membership component.
 */
export const Membership = ({route}: MembershipTabProps) => {
    // create a native stack navigator, to be used for our Membership navigation
    const Stack = createNativeStackNavigator<MembershipStackParamList>();

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
    }, []);

    // return the component for the Membership page
    return (
        <NavigationContainer independent={true}>
            <Stack.Navigator>
                <Stack.Screen
                    name="MembershipProfile"
                    component={MembershipProfile}
                    options={{
                        header: (props) => {
                            return(<Navbar options={props.options} route={props.route} navigation={props.navigation}/>)
                        },
                        headerTitle: 'Membership'
                    }}
                    initialParams={{
                        currentUserInformation: route.params.currentUserInformation
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
