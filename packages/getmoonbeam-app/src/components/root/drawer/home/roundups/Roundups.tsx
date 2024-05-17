import React, {useEffect} from 'react';
import {RoundupsProps} from "../../../../../models/props/HomeProps";
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from "react-native-safe-area-context";
import {useRecoilState} from "recoil";
import {appDrawerHeaderShownState, customBannerShown, drawerSwipeState} from "../../../../../recoil/AppDrawerAtom";
import {RoundupsStackParamList} from "../../../../../models/props/RoundupsProps";
import {RoundupsSplash} from "./roundupsSplash/RoundupsSplash";
import {roundupsActiveState} from "../../../../../recoil/RoundupsAtom";
import {bottomTabShownState, drawerNavigationState} from "../../../../../recoil/HomeAtom";
import {RoundupsHome} from "./roundupsHome/RoundupsHome";
import {showRoundupTransactionBottomSheetState} from "../../../../../recoil/DashboardAtom";

/**
 * Roundups component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const Roundups = ({navigation}: RoundupsProps) => {
    // constants used to keep track of local component state

    // constants used to keep track of shared states
    const [drawerNavigation,] = useRecoilState(drawerNavigationState);
    const [appDrawerHeaderShown, setAppDrawerHeaderShown] = useRecoilState(appDrawerHeaderShownState);
    const [drawerSwipeEnabled, setDrawerSwipeEnabled] = useRecoilState(drawerSwipeState);
    const [bannerShown, setBannerShown] = useRecoilState(customBannerShown);
    const [areRoundupsActive,] = useRecoilState(roundupsActiveState);
    const [bottomTabShown, setBottomTabShown] = useRecoilState(bottomTabShownState);
    const [showRoundupTransactionsBottomSheet,] = useRecoilState(showRoundupTransactionBottomSheetState);

    // create a native stack navigator, to be used for our Roundups navigation
    const Stack = createNativeStackNavigator<RoundupsStackParamList>();

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // set the app drawer status accordingly, custom banner visibility and drawer swipe actions accordingly
        if (navigation.getState().index === 1 && drawerNavigation!.getState().index === 0) {
            if (!areRoundupsActive) {
                setAppDrawerHeaderShown(false);
                setBannerShown(false);
                setDrawerSwipeEnabled(false);
                setBottomTabShown(false);
            } else {
                setAppDrawerHeaderShown(true);
                setBannerShown(false);
                !showRoundupTransactionsBottomSheet && setDrawerSwipeEnabled(true);
                showRoundupTransactionsBottomSheet && setDrawerSwipeEnabled(false);
                !showRoundupTransactionsBottomSheet && setBottomTabShown(true);
            }
        }
    }, [navigation.getState(), drawerNavigation?.getState(),
        areRoundupsActive, bottomTabShown, appDrawerHeaderShown,
        bannerShown, drawerSwipeEnabled]);

    // return the component for the Roundups page
    return (
        <>
            {
                <SafeAreaProvider style={{flex: 1, backgroundColor: '#313030'}}>
                    <Stack.Navigator
                        initialRouteName={!areRoundupsActive ? "RoundupsSplash" : "RoundupsHome"}
                        screenOptions={{
                            headerShown: false,
                            gestureEnabled: false
                        }}
                    >
                        {
                            !areRoundupsActive &&
                            <Stack.Screen
                                name="RoundupsSplash"
                                component={RoundupsSplash}
                                initialParams={{}}
                            />
                        }
                        <Stack.Screen
                            name="RoundupsHome"
                            component={RoundupsHome}
                            initialParams={{}}
                        />
                    </Stack.Navigator>
                </SafeAreaProvider>
            }
        </>
    );
};