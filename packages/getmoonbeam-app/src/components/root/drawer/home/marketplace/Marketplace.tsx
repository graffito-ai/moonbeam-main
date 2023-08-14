import React, {useEffect} from 'react';
import {MarketplaceProps} from "../../../../../models/props/HomeProps";
import {useRecoilState} from "recoil";
import {appDrawerHeaderShownState, customBannerShown, drawerSwipeState} from "../../../../../recoil/AppDrawerAtom";
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import {MarketplaceStackParamList} from "../../../../../models/props/MarketplaceProps";
import { Store } from './Store';
import { StoreOffer } from './storeOffer/StoreOffer';

/**
 * Marketplace component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const Marketplace = ({navigation}: MarketplaceProps) => {
    // constants used to keep track of shared states
    const [, setAppDrawerHeaderShown] = useRecoilState(appDrawerHeaderShownState);
    const [, setBannerShown] = useRecoilState(customBannerShown);
    const [, setDrawerSwipeEnabled] = useRecoilState(drawerSwipeState);

    // create a native stack navigator, to be used for our Marketplace navigation
    const Stack = createNativeStackNavigator<MarketplaceStackParamList>();

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // set the app drawer status accordingly ,custom banner visibility and drawer swipe actions accordingly
        if (navigation.getState().index === 1) {
            setAppDrawerHeaderShown(false);
            setBannerShown(true);
            setDrawerSwipeEnabled(false);
        }
    }, [navigation.getState()]);

    // return the component for the Marketplace page
    return (
        <NavigationContainer independent={true}>
            <Stack.Navigator
                initialRouteName={"Store"}
                screenOptions={{
                    headerShown: false,
                    gestureEnabled: false
                }}
            >
                <Stack.Screen
                    name="Store"
                    component={Store}
                    initialParams={{}}
                />
                <Stack.Screen
                    name="StoreOffer"
                    component={StoreOffer}
                    initialParams={{}}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
