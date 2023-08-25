import 'react-native-get-random-values';
import React, {useEffect} from "react";
import {NavigationContainer} from "@react-navigation/native";
import {SupportProps} from '../../../../models/props/AppDrawerProps';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SupportStackParamList} from '../../../../models/props/SupportProps';
import {SupportCenter} from "./SupportCenter";
import {FAQ} from "./FAQ";
import {useRecoilState} from "recoil";
import {appDrawerHeaderShownState, drawerDashboardState, drawerSwipeState} from "../../../../recoil/AppDrawerAtom";
import {IconButton} from "react-native-paper";
import {commonStyles} from "../../../../styles/common.module";
import { Dimensions } from 'react-native';

/**
 * Support component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component
 */
export const Support = ({navigation}: SupportProps) => {
    // constants used to keep track of shared states
    const [, setIsDrawerInDashboard] = useRecoilState(drawerDashboardState);
    const [, setDrawerHeaderShown] = useRecoilState(appDrawerHeaderShownState);
    const [, setDrawerSwipeEnabled] = useRecoilState(drawerSwipeState);

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
        // set the custom drawer header style accordingly
        if (navigation.getState().index === 3) {
            setIsDrawerInDashboard(false);
        }
    }, [navigation.getState()]);

    // return the component for the Support page
    return (
        <NavigationContainer independent={true}>
            <Stack.Navigator
                initialRouteName={"SupportCenter"}
                screenOptions={{
                    headerTitle: '',
                    headerTransparent: true,
                    headerTintColor: '#313030'
                }}
            >
                <Stack.Screen
                    name="SupportCenter"
                    component={SupportCenter}
                    initialParams={{}}
                    options={{
                        headerShown: false
                    }}
                />
                <Stack.Screen
                    name="FAQ"
                    component={FAQ}
                    initialParams={{}}
                    options={({navigation}) => ({
                        headerLeft: () =>
                            <IconButton
                                rippleColor={'transparent'}
                                icon="chevron-left"
                                iconColor={"#F2FF5D"}
                                size={Dimensions.get('window').height / 25}
                                style={commonStyles.backButtonDismiss}
                                onPress={() => {
                                    // show the drawer header
                                    setDrawerHeaderShown(true);

                                    // enable the drawer swipe
                                    setDrawerSwipeEnabled(true);

                                    // go back to the support center
                                    navigation.navigate('SupportCenter', {});
                                }}
                            />,
                        headerShown: true,
                        headerTransparent: false,
                        headerStyle: {backgroundColor: '#313030'},
                        headerTitle: 'FAQs',
                        headerTitleStyle: {
                            fontFamily: 'Raleway-Medium',
                            fontSize: Dimensions.get('window').width / 20,
                            textAlign: 'justify',
                            alignSelf: 'center',
                            color: '#FFFFFF'
                        }
                    })}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
