import React, {useEffect, useState} from 'react';
import {MembershipTabProps} from '../../../models/BottomBarProps';
import {CommonActions, NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {Navbar} from "../../common/Navbar";
import {MembershipStackParamList} from "../../../models/MembershipStackProps";
import {MembershipProfile} from './MembershipProfile';

/**
 * Membership component.
 */
export const Membership = ({route, navigation}: MembershipTabProps) => {
    // create a native stack navigator, to be used for our Membership navigation
    const Stack = createNativeStackNavigator<MembershipStackParamList>();

    // state to keep track of the value, for the number of points to be redeemed
    const [pointValueRedeemed, setPointValueRedeemed] = useState<number>(0);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        if (pointValueRedeemed !== 0) {
            // dispatch a navigation event, which will update the user information object accordingly (in Home and Membership)
            const updatedUserInformation = route.params.currentUserInformation;
            updatedUserInformation['custom:points'] = 0;
            navigation.dispatch({
                ...CommonActions.setParams({
                    currentUserInformation: updatedUserInformation,
                    source: navigation.getState().routes[0].key
                })
            });
            navigation.dispatch({
                ...CommonActions.setParams({
                    currentUserInformation: updatedUserInformation,
                    source: route.key
                })
            });

            // dispatch a navigation event, which will update the membership for the points value redeemed (in Home)
            navigation.dispatch({
                ...CommonActions.setParams({pointValueRedeemed: pointValueRedeemed}),
                source: navigation.getState().routes[0].key
            });
        }
    }, [pointValueRedeemed]);

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
                        setPointValueRedeemed: setPointValueRedeemed,
                        currentUserInformation: route.params.currentUserInformation
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
