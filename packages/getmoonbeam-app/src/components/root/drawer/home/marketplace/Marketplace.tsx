import React, {useEffect, useState} from 'react';
import {MarketplaceProps} from "../../../../../models/props/HomeProps";
import {useRecoilState} from "recoil";
import {appDrawerHeaderShownState, customBannerShown, drawerSwipeState} from "../../../../../recoil/AppDrawerAtom";
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {MarketplaceStackParamList} from "../../../../../models/props/MarketplaceProps";
import {Store} from './Store';
import {StoreOffer} from './storeOffer/StoreOffer';
import {Text, View} from "react-native";
import {Kit} from "./kitCommponents/Kit";
import {OfferCategory} from "@moonbeam/moonbeam-models";
import {IconButton} from "react-native-paper";
import {heightPercentageToDP as hp} from "react-native-responsive-screen";
import {bottomTabNeedsShowingState, bottomTabShownState} from "../../../../../recoil/HomeAtom";
import {
    currentActiveKitState,
    filteredOffersListState,
    fullScreenKitMapActiveState,
    nearbyKitListIsExpandedState,
    noFilteredOffersToLoadState,
    onlineKitListIsExpandedState,
    searchQueryState,
    showClickOnlyBottomSheetState,
    storeNavigationState,
    toggleViewPressedState
} from "../../../../../recoil/StoreOfferAtom";
import {moonbeamKits} from "./storeComponents/KitsSection";
import {styles} from "../../../../../styles/store.module";
import {ImageBackground} from 'expo-image';
import {SafeAreaProvider} from "react-native-safe-area-context";

/**
 * Marketplace component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const Marketplace = ({navigation}: MarketplaceProps) => {
    // constants used to keep track of local component state
    const [kitImage, setKitImage] = useState<any>(null);
    const [kitTitle, setKitTitle] = useState<string>("Kit");
    // constants used to keep track of shared states
    const [, setSearchQuery] = useRecoilState(searchQueryState);
    const [, setNoFilteredOffersToLoad] = useRecoilState(noFilteredOffersToLoadState);
    const [, setFilteredOffersList] = useRecoilState(filteredOffersListState);
    const [, setToggleViewPressed] = useRecoilState(toggleViewPressedState);

    const [, setShowClickOnlyBottomSheet] = useRecoilState(showClickOnlyBottomSheetState);
    const [fullScreenKitMapActive, setFullScreenKitMapActive] = useRecoilState(fullScreenKitMapActiveState);
    const [, setOnlineKitListExpanded] = useRecoilState(onlineKitListIsExpandedState);
    const [, setNearbyKitListExpanded] = useRecoilState(nearbyKitListIsExpandedState);
    const [currentActiveKit, setCurrentActiveKit] = useRecoilState(currentActiveKitState);
    const [storeNavigation,] = useRecoilState(storeNavigationState);
    const [, setAppDrawerHeaderShown] = useRecoilState(appDrawerHeaderShownState);
    const [, setBannerShown] = useRecoilState(customBannerShown);
    const [, setDrawerSwipeEnabled] = useRecoilState(drawerSwipeState);
    const [, setBottomTabShown] = useRecoilState(bottomTabShownState);
    const [, setBottomTabNeedsShowing] = useRecoilState(bottomTabNeedsShowingState);

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
        // for anything else other than the marketplace, reset the search queries if active, and go to the horizontal view
        if (navigation.getState().index !== 1) {
            // reset any filtered offers
            setNoFilteredOffersToLoad(false);
            setFilteredOffersList([]);

            // reset search query
            setSearchQuery("");

            // reset the view to the default horizontal one
            setToggleViewPressed('horizontal');
        }
        // set the app drawer status accordingly ,custom banner visibility and drawer swipe actions accordingly
        if (navigation.getState().index === 1) {
            setAppDrawerHeaderShown(false);
            setBannerShown(true);
            setDrawerSwipeEnabled(false);
        }
        // set the kit title, according to the user selected option
        if (currentActiveKit !== null) {
            const filteredKits = moonbeamKits.filter(kit => kit.type === currentActiveKit);
            if (filteredKits !== undefined && filteredKits !== null && filteredKits.length === 1) {
                setKitImage(filteredKits[0].backgroundPictureSource);
                setKitTitle(filteredKits[0].secondaryTitle.toString());
            }
        }
    }, [navigation.getState(), currentActiveKit]);

    // return the component for the Marketplace page
    return (
        <SafeAreaProvider style={{flex: 1, backgroundColor: '#313030'}}>
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
                        header: () =>
                            <View style={styles.kitsHeaderView}>
                                <ImageBackground
                                    style={styles.kitsHeaderPicture}
                                    source={kitImage}
                                    contentFit={'cover'}
                                    cachePolicy={'memory-disk'}
                                >
                                    <Text style={styles.kitsHeaderTitle}>
                                        {kitTitle}
                                    </Text>
                                    <IconButton
                                        rippleColor={'transparent'}
                                        icon="close"
                                        iconColor={"#F2FF5D"}
                                        size={hp(4)}
                                        style={styles.kitsHeaderDismissButton}
                                        onPress={() => {
                                            setFullScreenKitMapActive(false);
                                            setCurrentActiveKit(null);
                                            setOnlineKitListExpanded(false);
                                            setNearbyKitListExpanded(false);
                                            setBottomTabShown(true);
                                            setShowClickOnlyBottomSheet(false);
                                            setBottomTabNeedsShowing(true);
                                            storeNavigation && storeNavigation.navigate('Store', {});
                                        }}
                                    />
                                </ImageBackground>
                                {
                                    fullScreenKitMapActive ?
                                        <View
                                            style={styles.kitRadiusFullMapView}
                                        >
                                            <IconButton
                                                rippleColor={'transparent'}
                                                icon="chevron-left"
                                                iconColor={"#F2FF5D"}
                                                size={hp(4)}
                                                style={styles.kitsRadiusDismissButton}
                                                onPress={() => {
                                                    setFullScreenKitMapActive(false);
                                                }}
                                            />
                                            <View style={styles.kitRadiusFullMapViewTitleView}>
                                                <Text style={styles.kitRadiusFullMapViewTitle}>
                                                    Find
                                                </Text>
                                                <Text
                                                    style={[styles.mainSubtitle, styles.kitRadiusFullMapViewSubtitle]}>
                                                    {
                                                        `your favorite brands`
                                                    }
                                                </Text>
                                            </View>
                                        </View>
                                        :
                                        currentActiveKit !== null && currentActiveKit !== OfferCategory.VeteranDay
                                            ?
                                            <View style={styles.kitRadiusView}/>
                                            :
                                            <View style={styles.seasonalOffersBannerCard}>
                                                <View style={{flexDirection: 'column', top: hp(1)}}>
                                                    <Text
                                                        style={styles.seasonalOfferBannerName}>{'Exclusive Offers'}</Text>
                                                    <Text
                                                        style={styles.seasonalOfferBannerSubtitleName}>{'Available only on November 11th'}</Text>
                                                </View>
                                            </View>
                                }
                            </View>
                    }}
                />
            </Stack.Navigator>
        </SafeAreaProvider>
    );
};
