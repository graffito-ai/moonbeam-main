import 'react-native-get-random-values';
import React, {useEffect, useState} from "react";
import {SupportProps} from "../../../models/DrawerProps";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {SupportStackParamList} from '../../../models/SupportStackProps';
import {NavigationContainer} from "@react-navigation/native";
import {IconButton} from "react-native-paper";
import {SupportCenter} from './SupportCenter';
import { FAQ } from './FAQ';

/**
 * Support component.
 */
export const Support = ({route}: SupportProps) => {
    // create a state to keep track of whether the drawer header is shown or not
    const [isDrawerHeaderShown, setIsDrawerHeaderShown] = useState<boolean>(true);

    // create a native stack navigator, to be used for our Support navigation
    const Stack = createNativeStackNavigator<SupportStackParamList>();

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        route.params.setIsDrawerHeaderShown(isDrawerHeaderShown);
    }, [isDrawerHeaderShown]);

    // return the component for the Support page
    return (
        <NavigationContainer independent={true}>
            <Stack.Navigator
                initialRouteName={"SupportCenter"}
                screenOptions={({navigation}) => {
                    return({
                        headerLeft: () => {
                            return(<IconButton
                                icon="chevron-left"
                                iconColor={"#2A3779"}
                                size={40}
                                style={{marginTop: '-5%',  marginLeft: `-10%`}}
                                onPress={() => {
                                    route.params.setIsDrawerHeaderShown(true);
                                    navigation.navigate('SupportCenter', {});
                                }}
                            />)
                        },
                        headerTitle: '',
                        headerTransparent: true,
                        headerTintColor: '#2A3779'
                    })
                }}
            >
                <Stack.Screen
                    name="SupportCenter"
                    component={SupportCenter}
                    initialParams={{
                        setIsDrawerHeaderShown: setIsDrawerHeaderShown
                    }}
                    options={{
                        headerShown: false
                    }}
                />
                <Stack.Screen
                    name="FAQ"
                    component={FAQ}
                    initialParams={{
                        setIsDrawerHeaderShown: setIsDrawerHeaderShown
                    }}
                    options={{
                        headerShown: true
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
