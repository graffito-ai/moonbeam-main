import React, {useEffect} from 'react';
import {ServicesProps} from "../../../../../models/props/HomeProps";
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from "react-native-safe-area-context";
import {ServicesStackParamList} from "../../../../../models/props/ServicesProps";
import {useRecoilState} from "recoil";
import {appDrawerHeaderShownState, customBannerShown, drawerSwipeState} from "../../../../../recoil/AppDrawerAtom";
import {ServiceOfferings} from "./ServiceOfferings";
import {ServiceOfferingDetails} from "./ServiceOfferingDetails";

/**
 * Services component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const Services = ({navigation}: ServicesProps) => {
    // constants used to keep track of local component state

    // constants used to keep track of shared states
    const [appDrawerHeaderShown, setAppDrawerHeaderShown] = useRecoilState(appDrawerHeaderShownState);
    const [drawerSwipeEnabled, setDrawerSwipeEnabled] = useRecoilState(drawerSwipeState);
    const [bannerShown, setBannerShown] = useRecoilState(customBannerShown);

    // create a native stack navigator, to be used for our Services navigation
    const Stack = createNativeStackNavigator<ServicesStackParamList>();

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // set the app drawer status accordingly, custom banner visibility and drawer swipe actions accordingly
        if (navigation.getState().index === 1) {
            appDrawerHeaderShown && setAppDrawerHeaderShown(false);
            bannerShown && setBannerShown(false);
            drawerSwipeEnabled && setDrawerSwipeEnabled(false);
        }
    }, [navigation.getState()]);

    // return the component for the Services page
    return (
        <SafeAreaProvider style={{flex: 1, backgroundColor: '#313030'}}>
            <Stack.Navigator
                initialRouteName={"ServiceOfferings"}
                screenOptions={{
                    headerShown: false,
                    gestureEnabled: false
                }}
            >
                <Stack.Screen
                    name="ServiceOfferings"
                    component={ServiceOfferings}
                    initialParams={{}}
                />
                <Stack.Screen
                    name="ServiceOfferingDetails"
                    component={ServiceOfferingDetails}
                    initialParams={{}}
                />
            </Stack.Navigator>
        </SafeAreaProvider>
    );
};
