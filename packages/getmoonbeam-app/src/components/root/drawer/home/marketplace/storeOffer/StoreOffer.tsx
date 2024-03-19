import React, {useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {StoreOfferProps} from "../../../../../../models/props/MarketplaceProps";
import {StoreOfferStackParamList} from "../../../../../../models/props/StoreOfferProps";
import {IconButton} from "react-native-paper";
import {commonStyles} from "../../../../../../styles/common.module";
import {useRecoilState} from "recoil";
import {bottomTabNeedsShowingState, bottomTabShownState} from "../../../../../../recoil/HomeAtom";
import {StoreOfferDetails} from "./StoreOfferDetails";
import {StoreOfferWebView} from "./StoreOfferWebView";
import {appDrawerHeaderShownState, customBannerShown, drawerSwipeState} from "../../../../../../recoil/AppDrawerAtom";
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';
import {Platform, View} from "react-native";
import {
    showClickOnlyBottomSheetState,
    storeNavigationState,
    storeOfferState
} from "../../../../../../recoil/StoreOfferAtom";

/**
 * StoreOffer component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const StoreOffer = ({route, navigation}: StoreOfferProps) => {
    // constants used to keep track of shared states
    const [, setStoreNavigationState] = useRecoilState(storeNavigationState);
    const [, setBottomTabShown] = useRecoilState(bottomTabShownState);
    const [, setBannerShown] = useRecoilState(customBannerShown);
    const [, setAppDrawerHeaderShown] = useRecoilState(appDrawerHeaderShownState);
    const [, setDrawerSwipeEnabled] = useRecoilState(drawerSwipeState);
    const [, setShowClickOnlyBottomSheet] = useRecoilState(showClickOnlyBottomSheetState);
    const [, setStoreOfferClicked] = useRecoilState(storeOfferState);
    const [, setBottomTabNeedsShowing] = useRecoilState(bottomTabNeedsShowingState);

    // create a native stack navigator, to be used for our StoreOffer navigation
    const Stack = createNativeStackNavigator<StoreOfferStackParamList>();

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        setStoreNavigationState(navigation);
        // set the app drawer status accordingly, custom banner visibility and drawer swipe actions accordingly
        setAppDrawerHeaderShown(false);
        setBannerShown(false);
        setDrawerSwipeEnabled(false);
        setBottomTabShown(false);
    }, []);

    // return the component for the StoreOffer page
    return (
        <View style={{flex: 1, backgroundColor: '#313030'}}>
            <Stack.Navigator
                initialRouteName={"StoreOfferDetails"}
                screenOptions={{
                    gestureEnabled: false,
                    headerTitle: '',
                    headerShown: true,
                    headerTransparent: true
                }}
            >
                <Stack.Screen
                    name="StoreOfferDetails"
                    component={StoreOfferDetails}
                    initialParams={{}}
                    options={{
                        headerLeft: () =>
                            <IconButton
                                rippleColor={'transparent'}
                                icon="close"
                                iconColor={"#F2FF5D"}
                                size={hp(4)}
                                style={[commonStyles.backButtonDismiss, Platform.OS === 'android' && {top: hp(2.5)}]}
                                onPress={() => {
                                    // hide the click only bottom sheet
                                    setShowClickOnlyBottomSheet(false);
                                    // show the bottom bar only conditionally
                                    setBottomTabShown(true);
                                    // reset the store offer clicked state
                                    setStoreOfferClicked(null);
                                    // set the bottom tab showing flag conditionally
                                    setBottomTabNeedsShowing(route.params.bottomTabNeedsShowingFlag);
                                    navigation.goBack();
                                }}
                            />
                    }}
                />
                <Stack.Screen
                    name="StoreOfferWebView"
                    component={StoreOfferWebView}
                    options={{
                        headerShown: false
                    }}
                />
            </Stack.Navigator>
        </View>
    );
};
