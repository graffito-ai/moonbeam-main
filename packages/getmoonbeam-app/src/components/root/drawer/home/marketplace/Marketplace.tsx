import React, {useEffect, useState} from 'react';
import {MarketplaceProps} from "../../../../../models/props/HomeProps";
import {useRecoilState} from "recoil";
import {appDrawerHeaderShownState, customBannerShown, drawerSwipeState} from "../../../../../recoil/AppDrawerAtom";
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {MarketplaceStackParamList} from "../../../../../models/props/MarketplaceProps";
import {Store} from './Store';
import {StoreOffer} from './storeOffer/StoreOffer';
import {View} from "react-native";
import {Kit} from "./kitCommponents/Kit";
import {OfferCategory} from "@moonbeam/moonbeam-models";
import {IconButton} from "react-native-paper";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {commonStyles} from "../../../../../styles/common.module";
import {bottomTabShownState} from "../../../../../recoil/HomeAtom";
import {currentActiveKitState, storeNavigationState} from "../../../../../recoil/StoreOfferAtom";
import {moonbeamKits} from "./storeComponents/KitsSection";

/**
 * Marketplace component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const Marketplace = ({navigation}: MarketplaceProps) => {
    // constants used to keep track of local component state
    const [kitTitle, setKitTitle] = useState<string>("Kit");
    // constants used to keep track of shared states
    const [currentActiveKit, ] = useRecoilState(currentActiveKitState);
    const [storeNavigation,] = useRecoilState(storeNavigationState);
    const [, setAppDrawerHeaderShown] = useRecoilState(appDrawerHeaderShownState);
    const [, setBannerShown] = useRecoilState(customBannerShown);
    const [, setDrawerSwipeEnabled] = useRecoilState(drawerSwipeState);
    const [, setBottomTabShown] = useRecoilState(bottomTabShownState);

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
        // set the kit title, according to the user selected option
        if (currentActiveKit !== null) {
            const filteredKits = moonbeamKits.filter(kit => kit.type === currentActiveKit);
            filteredKits.length === 1 && setKitTitle(filteredKits[0].secondaryTitle.toString());
        }
    }, [navigation.getState(), currentActiveKit]);

    // return the component for the Marketplace page
    return (
        <View style={{flex: 1, backgroundColor: '#313030'}}>
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
                <Stack.Screen
                    name="Kit"
                    component={Kit}
                    initialParams={{
                        kitType: OfferCategory.Food
                    }}
                    options={{
                        headerShown: true,
                        gestureEnabled: false,
                        headerStyle: {
                            backgroundColor: '#5B5A5A'
                        },
                        headerLargeStyle: {
                            backgroundColor: '#5B5A5A'
                        },
                        headerLargeTitle: true,
                        headerLargeTitleStyle: {
                            color: '#FFFFFF',
                            fontSize: hp(3.5),
                            fontFamily: 'Saira-Medium'
                        },
                        headerBackVisible: false,
                        headerTitle: kitTitle,
                        headerRight: () =>
                            <IconButton
                                rippleColor={'transparent'}
                                icon="close"
                                iconColor={"#F2FF5D"}
                                size={hp(4)}
                                style={[commonStyles.backButtonDismiss, {left: wp(3), top: hp(4)}]}
                                onPress={() => {
                                    setBottomTabShown(true);
                                    storeNavigation && storeNavigation.navigate('Store', {});
                                }}
                            />
                    }}
                />
            </Stack.Navigator>
        </View>
    );
};
