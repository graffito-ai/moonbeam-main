import React, {useEffect, useState} from 'react';
import {KitProps} from "../../../../../../models/props/MarketplaceProps";
import {useRecoilState} from "recoil";
import {bottomTabShownState} from "../../../../../../recoil/HomeAtom";
import {appDrawerHeaderShownState, customBannerShown, drawerSwipeState} from "../../../../../../recoil/AppDrawerAtom";
import {
    currentActiveKitState,
    fullScreenKitMapActiveState,
    isElectronicsKitLoadedState,
    isEntertainmentKitLoadedState,
    isFoodKitLoadedState,
    isHealthAndBeautyKitLoadedState,
    isHomeKitLoadedState,
    isOfficeAndBusinessKitLoadedState,
    isRetailKitLoadedState,
    isServicesAndSubscriptionsKitLoadedState,
    isVeteransDayKitLoadedState,
    locationServicesButtonState,
    nearbyElectronicsCategorizedOffersListState,
    nearbyElectronicsCategorizedOffersPageNumberState,
    nearbyEntertainmentCategorizedOffersListState,
    nearbyEntertainmentCategorizedOffersPageNumberState,
    nearbyFoodCategorizedOffersListState,
    nearbyFoodCategorizedOffersPageNumberState,
    nearbyHealthAndBeautyCategorizedOffersListState,
    nearbyHealthAndBeautyCategorizedOffersPageNumberState,
    nearbyHomeCategorizedOffersListState,
    nearbyHomeCategorizedOffersPageNumberState,
    nearbyKitListIsExpandedState,
    nearbyOfficeAndBusinessCategorizedOffersListState,
    nearbyOfficeAndBusinessCategorizedOffersPageNumberState,
    nearbyRetailCategorizedOffersListState,
    nearbyRetailCategorizedOffersPageNumberState,
    nearbyServicesAndSubscriptionsCategorizedOffersListState,
    nearbyServicesAndSubscriptionsCategorizedOffersPageNumberState,
    noNearbyElectronicsCategorizedOffersToLoadState,
    noNearbyEntertainmentCategorizedOffersToLoadState,
    noNearbyFoodCategorizedOffersToLoadState,
    noNearbyHealthAndBeautyCategorizedOffersToLoadState,
    noNearbyHomeCategorizedOffersToLoadState,
    noNearbyOfficeAndBusinessCategorizedOffersToLoadState,
    noNearbyRetailCategorizedOffersToLoadState,
    noNearbyServicesAndSubscriptionsCategorizedOffersToLoadState,
    noOnlineElectronicsCategorizedOffersToLoadState,
    noOnlineEntertainmentCategorizedOffersToLoadState,
    noOnlineFoodCategorizedOffersToLoadState,
    noOnlineHealthAndBeautyCategorizedOffersToLoadState,
    noOnlineHomeCategorizedOffersToLoadState,
    noOnlineOfficeAndBusinessCategorizedOffersToLoadState,
    noOnlineRetailCategorizedOffersToLoadState,
    noOnlineServicesAndSubscriptionsCategorizedOffersToLoadState,
    noOnlineVeteransDayCategorizedOffersToLoadState,
    numberOfElectronicsCategorizedOffersWithin25MilesState,
    numberOfElectronicsCategorizedOnlineOffersState,
    numberOfEntertainmentCategorizedOffersWithin25MilesState,
    numberOfEntertainmentCategorizedOnlineOffersState,
    numberOfFoodCategorizedOffersWithin25MilesState,
    numberOfFoodCategorizedOnlineOffersState,
    numberOfHealthAndBeautyCategorizedOffersWithin25MilesState,
    numberOfHealthAndBeautyCategorizedOnlineOffersState,
    numberOfHomeCategorizedOffersWithin25MilesState,
    numberOfHomeCategorizedOnlineOffersState,
    numberOfOfficeAndBusinessCategorizedOffersWithin25MilesState,
    numberOfOfficeAndBusinessCategorizedOnlineOffersState,
    numberOfRetailCategorizedOffersWithin25MilesState,
    numberOfRetailCategorizedOnlineOffersState,
    numberOfServicesAndSubscriptionsCategorizedOffersWithin25MilesState,
    numberOfServicesAndSubscriptionsCategorizedOnlineOffersState,
    numberOfVeteransDayCategorizedOnlineOffersState,
    offersNearUserLocationFlagState,
    onlineElectronicsCategorizedOfferListState,
    onlineElectronicsCategorizedOffersPageNumberState,
    onlineEntertainmentCategorizedOfferListState,
    onlineEntertainmentCategorizedOffersPageNumberState,
    onlineFoodCategorizedOfferListState,
    onlineFoodCategorizedOffersPageNumberState,
    onlineHealthAndBeautyCategorizedOfferListState,
    onlineHealthAndBeautyCategorizedOffersPageNumberState,
    onlineHomeCategorizedOfferListState,
    onlineHomeCategorizedOffersPageNumberState,
    onlineKitListIsExpandedState,
    onlineOfficeAndBusinessCategorizedOfferListState,
    onlineOfficeAndBusinessCategorizedOffersPageNumberState,
    onlineRetailCategorizedOfferListState,
    onlineRetailCategorizedOffersPageNumberState,
    onlineServicesAndSubscriptionsCategorizedOfferListState,
    onlineServicesAndSubscriptionsCategorizedOffersPageNumberState,
    onlineVeteransDayCategorizedOfferListState,
    onlineVeteransDayCategorizedOffersPageNumberState,
    storeNavigationState
} from "../../../../../../recoil/StoreOfferAtom";
import {View} from "react-native";
import {styles} from '../../../../../../styles/kit.module';
import {OnlineKitSection} from "./OnlineKitSection";
import {Portal} from 'react-native-paper';
import {MapHorizontalKitSection} from "./MapHorizontalKitSection";
import {FullScreenMapKitSection} from "./FullScreenMapKitSection";
import {NearbyKitSection} from "./NearbyKitSection";
import {OfferCategory} from "@moonbeam/moonbeam-models";
import {Spinner} from "../../../../../common/Spinner";
import {retrieveCategorizedOffersNearby, retrieveCategorizedOnlineOffersList} from "../../../../../../utils/AppSync";
import {currentUserInformation} from "../../../../../../recoil/AuthAtom";
import {currentUserLocationState} from "../../../../../../recoil/RootAtom";

/**
 * Kit component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const Kit = ({navigation}: KitProps) => {
    // constants used to keep track of local component state
    const [isReady, setIsReady] = useState<boolean>(false);
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    // constants used to keep track of shared states
    const [currentActiveKit,] = useRecoilState(currentActiveKitState);
    const [onlineKitListExpanded,] = useRecoilState(onlineKitListIsExpandedState);
    const [nearbyKitListExpanded,] = useRecoilState(nearbyKitListIsExpandedState);
    const [fullScreenKitMapActive,] = useRecoilState(fullScreenKitMapActiveState);
    const [storeNavigation, setStoreNavigation] = useRecoilState(storeNavigationState);
    const [bottomTabShown, setBottomTabShown] = useRecoilState(bottomTabShownState);
    const [bannerShown, setBannerShown] = useRecoilState(customBannerShown);
    const [appDrawerHeaderShown, setAppDrawerHeaderShown] = useRecoilState(appDrawerHeaderShownState);
    const [drawerSwipeEnabled, setDrawerSwipeEnabled] = useRecoilState(drawerSwipeState);
    const [userInformation,] = useRecoilState(currentUserInformation);
    const [, setOffersNearUserLocationFlag] = useRecoilState(offersNearUserLocationFlagState);
    const [currentUserLocation, setCurrentUserLocation] = useRecoilState(currentUserLocationState);
    const [, setLocationServicesButtonState] = useRecoilState(locationServicesButtonState);
    const [numberOfFoodCategorizedOffersWithin25Miles, setNumberOfFoodCategorizedOffersWithin25Miles] = useRecoilState(numberOfFoodCategorizedOffersWithin25MilesState);
    const [numberOfRetailCategorizedOffersWithin25Miles, setNumberOfRetailCategorizedOffersWithin25Miles] = useRecoilState(numberOfRetailCategorizedOffersWithin25MilesState);
    const [numberOfEntertainmentCategorizedOffersWithin25Miles, setNumberOfEntertainmentCategorizedOffersWithin25Miles] = useRecoilState(numberOfEntertainmentCategorizedOffersWithin25MilesState);
    const [numberOfElectronicsCategorizedOffersWithin25Miles, setNumberOfElectronicsCategorizedOffersWithin25Miles] = useRecoilState(numberOfElectronicsCategorizedOffersWithin25MilesState);
    const [numberOfHomeCategorizedOffersWithin25Miles, setNumberOfHomeCategorizedOffersWithin25Miles] = useRecoilState(numberOfHomeCategorizedOffersWithin25MilesState);
    const [numberOfHealthAndBeautyCategorizedOffersWithin25Miles, setNumberOfHealthAndBeautyCategorizedOffersWithin25Miles] = useRecoilState(numberOfHealthAndBeautyCategorizedOffersWithin25MilesState);
    const [numberOfOfficeAndBusinessCategorizedOffersWithin25Miles, setNumberOfOfficeAndBusinessCategorizedOffersWithin25Miles] = useRecoilState(numberOfOfficeAndBusinessCategorizedOffersWithin25MilesState);
    const [numberOfServicesAndSubscriptionsCategorizedOffersWithin25Miles, setNumberOfServicesAndSubscriptionsCategorizedOffersWithin25Miles] = useRecoilState(numberOfServicesAndSubscriptionsCategorizedOffersWithin25MilesState);
    const [nearbyFoodCategorizedOffersPageNumber, setNearbyFoodCategorizedOffersPageNumber] = useRecoilState(nearbyFoodCategorizedOffersPageNumberState);
    const [nearbyRetailCategorizedOffersPageNumber, setNearbyRetailCategorizedOffersPageNumber] = useRecoilState(nearbyRetailCategorizedOffersPageNumberState);
    const [nearbyEntertainmentCategorizedOffersPageNumber, setNearbyEntertainmentCategorizedOffersPageNumber] = useRecoilState(nearbyEntertainmentCategorizedOffersPageNumberState);
    const [nearbyElectronicsCategorizedOffersPageNumber, setNearbyElectronicsCategorizedOffersPageNumber] = useRecoilState(nearbyElectronicsCategorizedOffersPageNumberState);
    const [nearbyHomeCategorizedOffersPageNumber, setNearbyHomeCategorizedOffersPageNumber] = useRecoilState(nearbyHomeCategorizedOffersPageNumberState);
    const [nearbyHealthAndBeautyCategorizedOffersPageNumber, setNearbyHealthAndBeautyCategorizedOffersPageNumber] = useRecoilState(nearbyHealthAndBeautyCategorizedOffersPageNumberState);
    const [nearbyOfficeAndBusinessCategorizedOffersPageNumber, setNearbyOfficeAndBusinessCategorizedOffersPageNumber] = useRecoilState(nearbyOfficeAndBusinessCategorizedOffersPageNumberState);
    const [nearbyServicesAndSubscriptionsCategorizedOffersPageNumber, setNearbyServicesAndSubscriptionsCategorizedOffersPageNumber] = useRecoilState(nearbyServicesAndSubscriptionsCategorizedOffersPageNumberState);
    const [onlineVeteransDayCategorizedOffersPageNumber, setOnlineVeteransDayCategorizedOffersPageNumber] = useRecoilState(onlineVeteransDayCategorizedOffersPageNumberState);
    const [onlineFoodCategorizedOffersPageNumber, setOnlineFoodCategorizedOffersPageNumber] = useRecoilState(onlineFoodCategorizedOffersPageNumberState);
    const [onlineRetailCategorizedOffersPageNumber, setOnlineRetailCategorizedOffersPageNumber] = useRecoilState(onlineRetailCategorizedOffersPageNumberState);
    const [onlineEntertainmentCategorizedOffersPageNumber, setOnlineEntertainmentCategorizedOffersPageNumber] = useRecoilState(onlineEntertainmentCategorizedOffersPageNumberState);
    const [onlineElectronicsCategorizedOffersPageNumber, setOnlineElectronicsCategorizedOffersPageNumber] = useRecoilState(onlineElectronicsCategorizedOffersPageNumberState);
    const [onlineHomeCategorizedOffersPageNumber, setOnlineHomeCategorizedOffersPageNumber] = useRecoilState(onlineHomeCategorizedOffersPageNumberState);
    const [onlineHealthAndBeautyCategorizedOffersPageNumber, setOnlineHealthAndBeautyCategorizedOffersPageNumber] = useRecoilState(onlineHealthAndBeautyCategorizedOffersPageNumberState);
    const [onlineOfficeAndBusinessCategorizedOffersPageNumber, setOnlineOfficeAndBusinessCategorizedOffersPageNumber] = useRecoilState(onlineOfficeAndBusinessCategorizedOffersPageNumberState);
    const [onlineServicesAndSubscriptionsCategorizedOffersPageNumber, setOnlineServicesAndSubscriptionsCategorizedOffersPageNumber] = useRecoilState(onlineServicesAndSubscriptionsCategorizedOffersPageNumberState);
    const [loadingNearbyFoodCategorizedOffersInProgress, setIsLoadingNearbyFoodCategorizedOffersInProgress] = useState<boolean>(false);
    const [loadingNearbyRetailCategorizedOffersInProgress, setIsLoadingNearbyRetailCategorizedOffersInProgress] = useState<boolean>(false);
    const [loadingNearbyEntertainmentCategorizedOffersInProgress, setIsLoadingNearbyEntertainmentCategorizedOffersInProgress] = useState<boolean>(false);
    const [loadingNearbyElectronicsCategorizedOffersInProgress, setIsLoadingNearbyElectronicsCategorizedOffersInProgress] = useState<boolean>(false);
    const [loadingNearbyHomeCategorizedOffersInProgress, setIsLoadingNearbyHomeCategorizedOffersInProgress] = useState<boolean>(false);
    const [loadingNearbyHealthAndBeautyCategorizedOffersInProgress, setIsLoadingNearbyHealthAndBeautyCategorizedOffersInProgress] = useState<boolean>(false);
    const [loadingNearbyOfficeAndBusinessCategorizedOffersInProgress, setIsLoadingNearbyOfficeAndBusinessCategorizedOffersInProgress] = useState<boolean>(false);
    const [loadingNearbyServicesAndSubscriptionsCategorizedOffersInProgress, setIsLoadingNearbyServicesAndSubscriptionsCategorizedOffersInProgress] = useState<boolean>(false);
    const [loadingOnlineVeteransDayCategorizedInProgress, setIsLoadingOnlineVeteransDayCategorizedInProgress] = useState<boolean>(false);
    const [loadingOnlineFoodCategorizedInProgress, setIsLoadingOnlineFoodCategorizedInProgress] = useState<boolean>(false);
    const [loadingOnlineRetailCategorizedInProgress, setIsLoadingOnlineRetailCategorizedInProgress] = useState<boolean>(false);
    const [loadingOnlineEntertainmentCategorizedInProgress, setIsLoadingOnlineEntertainmentCategorizedInProgress] = useState<boolean>(false);
    const [loadingOnlineElectronicsCategorizedInProgress, setIsLoadingOnlineElectronicsCategorizedInProgress] = useState<boolean>(false);
    const [loadingOnlineHomeCategorizedInProgress, setIsLoadingOnlineHomeCategorizedInProgress] = useState<boolean>(false);
    const [loadingOnlineHealthAndBeautyCategorizedInProgress, setIsLoadingOnlineHealthAndBeautyCategorizedInProgress] = useState<boolean>(false);
    const [loadingOnlineOfficeAndBusinessCategorizedInProgress, setIsLoadingOnlineOfficeAndBusinessCategorizedInProgress] = useState<boolean>(false);
    const [loadingOnlineServicesAndSubscriptionsCategorizedInProgress, setIsLoadingOnlineServicesAndSubscriptionsCategorizedInProgress] = useState<boolean>(false);
    const [numberOfVeteransDayCategorizedOnlineOffers, setNumberOfVeteransDayCategorizedOnlineOffers] = useRecoilState(numberOfVeteransDayCategorizedOnlineOffersState);
    const [numberOfFoodCategorizedOnlineOffers, setNumberOfFoodCategorizedOnlineOffers] = useRecoilState(numberOfFoodCategorizedOnlineOffersState);
    const [numberOfRetailCategorizedOnlineOffers, setNumberOfRetailCategorizedOnlineOffers] = useRecoilState(numberOfRetailCategorizedOnlineOffersState);
    const [numberOfEntertainmentCategorizedOnlineOffers, setNumberOfEntertainmentCategorizedOnlineOffers] = useRecoilState(numberOfEntertainmentCategorizedOnlineOffersState);
    const [numberOfElectronicsCategorizedOnlineOffers, setNumberOfElectronicsCategorizedOnlineOffers] = useRecoilState(numberOfElectronicsCategorizedOnlineOffersState);
    const [numberOfHomeCategorizedOnlineOffers, setNumberOfHomeCategorizedOnlineOffers] = useRecoilState(numberOfHomeCategorizedOnlineOffersState);
    const [numberOfHealthAndBeautyCategorizedOnlineOffers, setNumberOfHealthAndBeautyCategorizedOnlineOffers] = useRecoilState(numberOfHealthAndBeautyCategorizedOnlineOffersState);
    const [numberOfOfficeAndBusinessCategorizedOnlineOffers, setNumberOfOfficeAndBusinessCategorizedOnlineOffers] = useRecoilState(numberOfOfficeAndBusinessCategorizedOnlineOffersState);
    const [numberOfServicesAndSubscriptionsCategorizedOnlineOffers, setNumberOfServicesAndSubscriptionsCategorizedOnlineOffers] = useRecoilState(numberOfServicesAndSubscriptionsCategorizedOnlineOffersState);
    const [noOnlineVeteransDayCategorizedOffersToLoad, setNoOnlineVeteransDayCategorizedOffersToLoad] = useRecoilState(noOnlineVeteransDayCategorizedOffersToLoadState);
    const [noOnlineFoodCategorizedOffersToLoad, setNoOnlineFoodCategorizedOffersToLoad] = useRecoilState(noOnlineFoodCategorizedOffersToLoadState);
    const [noOnlineRetailCategorizedOffersToLoad, setNoOnlineRetailCategorizedOffersToLoad] = useRecoilState(noOnlineRetailCategorizedOffersToLoadState);
    const [noOnlineEntertainmentCategorizedOffersToLoad, setNoOnlineEntertainmentCategorizedOffersToLoad] = useRecoilState(noOnlineEntertainmentCategorizedOffersToLoadState);
    const [noOnlineElectronicsCategorizedOffersToLoad, setNoOnlineElectronicsCategorizedOffersToLoad] = useRecoilState(noOnlineElectronicsCategorizedOffersToLoadState);
    const [noOnlineHomeCategorizedOffersToLoad, setNoOnlineHomeCategorizedOffersToLoad] = useRecoilState(noOnlineHomeCategorizedOffersToLoadState);
    const [noOnlineHealthAndBeautyCategorizedOffersToLoad, setNoOnlineHealthAndBeautyCategorizedOffersToLoad] = useRecoilState(noOnlineHealthAndBeautyCategorizedOffersToLoadState);
    const [noOnlineOfficeAndBusinessCategorizedOffersToLoad, setNoOnlineOfficeAndBusinessCategorizedOffersToLoad] = useRecoilState(noOnlineOfficeAndBusinessCategorizedOffersToLoadState);
    const [noOnlineServicesAndSubscriptionsCategorizedOffersToLoad, setNoOnlineServicesAndSubscriptionsCategorizedOffersToLoad] = useRecoilState(noOnlineServicesAndSubscriptionsCategorizedOffersToLoadState);
    const [noNearbyFoodCategorizedOffersToLoad, setNoNearbyFoodCategorizedOffersToLoad] = useRecoilState(noNearbyFoodCategorizedOffersToLoadState);
    const [noNearbyRetailCategorizedOffersToLoad, setNoNearbyRetailCategorizedOffersToLoad] = useRecoilState(noNearbyRetailCategorizedOffersToLoadState);
    const [noNearbyEntertainmentCategorizedOffersToLoad, setNoNearbyEntertainmentCategorizedOffersToLoad] = useRecoilState(noNearbyEntertainmentCategorizedOffersToLoadState);
    const [noNearbyElectronicsCategorizedOffersToLoad, setNoNearbyElectronicsCategorizedOffersToLoad] = useRecoilState(noNearbyElectronicsCategorizedOffersToLoadState);
    const [noNearbyHomeCategorizedOffersToLoad, setNoNearbyHomeCategorizedOffersToLoad] = useRecoilState(noNearbyHomeCategorizedOffersToLoadState);
    const [noNearbyHealthAndBeautyCategorizedOffersToLoad, setNoNearbyHealthAndBeautyCategorizedOffersToLoad] = useRecoilState(noNearbyHealthAndBeautyCategorizedOffersToLoadState);
    const [noNearbyOfficeAndBusinessCategorizedOffersToLoad, setNoNearbyOfficeAndBusinessCategorizedOffersToLoad] = useRecoilState(noNearbyOfficeAndBusinessCategorizedOffersToLoadState);
    const [noNearbyServicesAndSubscriptionsCategorizedOffersToLoad, setNoNearbyServicesAndSubscriptionsCategorizedOffersToLoad] = useRecoilState(noNearbyServicesAndSubscriptionsCategorizedOffersToLoadState);
    const [nearbyFoodCategorizedOfferList, setNearbyFoodCategorizedOfferList] = useRecoilState(nearbyFoodCategorizedOffersListState);
    const [nearbyRetailCategorizedOfferList, setNearbyRetailCategorizedOfferList] = useRecoilState(nearbyRetailCategorizedOffersListState);
    const [nearbyEntertainmentCategorizedOfferList, setNearbyEntertainmentCategorizedOfferList] = useRecoilState(nearbyEntertainmentCategorizedOffersListState);
    const [nearbyElectronicsCategorizedOfferList, setNearbyElectronicsCategorizedOfferList] = useRecoilState(nearbyElectronicsCategorizedOffersListState);
    const [nearbyHomeCategorizedOfferList, setNearbyHomeCategorizedOfferList] = useRecoilState(nearbyHomeCategorizedOffersListState);
    const [nearbyHealthAndBeautyCategorizedOfferList, setNearbyHealthAndBeautyCategorizedOfferList] = useRecoilState(nearbyHealthAndBeautyCategorizedOffersListState);
    const [nearbyOfficeAndBusinessCategorizedOfferList, setNearbyOfficeAndBusinessCategorizedOfferList] = useRecoilState(nearbyOfficeAndBusinessCategorizedOffersListState);
    const [nearbyServicesAndSubscriptionsCategorizedOfferList, setNearbyServicesAndSubscriptionsCategorizedOfferList] = useRecoilState(nearbyServicesAndSubscriptionsCategorizedOffersListState);
    const [onlineVeteransDayCategorizedOfferList, setOnlineVeteransDayCategorizedOfferList] = useRecoilState(onlineVeteransDayCategorizedOfferListState);
    const [onlineFoodCategorizedOfferList, setOnlineFoodCategorizedOfferList] = useRecoilState(onlineFoodCategorizedOfferListState);
    const [onlineRetailCategorizedOfferList, setOnlineRetailCategorizedOfferList] = useRecoilState(onlineRetailCategorizedOfferListState);
    const [onlineEntertainmentCategorizedOfferList, setOnlineEntertainmentCategorizedOfferList] = useRecoilState(onlineEntertainmentCategorizedOfferListState);
    const [onlineElectronicsCategorizedOfferList, setOnlineElectronicsCategorizedOfferList] = useRecoilState(onlineElectronicsCategorizedOfferListState);
    const [onlineHomeCategorizedOfferList, setOnlineHomeCategorizedOfferList] = useRecoilState(onlineHomeCategorizedOfferListState);
    const [onlineHealthAndBeautyCategorizedOfferList, setOnlineHealthAndBeautyCategorizedOfferList] = useRecoilState(onlineHealthAndBeautyCategorizedOfferListState);
    const [onlineOfficeAndBusinessCategorizedOfferList, setOnlineOfficeAndBusinessCategorizedOfferList] = useRecoilState(onlineOfficeAndBusinessCategorizedOfferListState);
    const [onlineServicesAndSubscriptionsCategorizedOfferList, setOnlineServicesAndSubscriptionsCategorizedOfferList] = useRecoilState(onlineServicesAndSubscriptionsCategorizedOfferListState);
    const [isVeteransDayKitLoaded, setIsVeteransDayKitLoaded] = useRecoilState(isVeteransDayKitLoadedState);
    const [isFoodKitLoaded, setIsFoodKitLoaded] = useRecoilState(isFoodKitLoadedState);
    const [isRetailKitLoaded, setIsRetailKitLoaded] = useRecoilState(isRetailKitLoadedState);
    const [isElectronicsKitLoaded, setIsElectronicsKitLoaded] = useRecoilState(isElectronicsKitLoadedState);
    const [isEntertainmentKitLoaded, setIsEntertainmentKitLoaded] = useRecoilState(isEntertainmentKitLoadedState);
    const [isHomeKitLoaded, setIsHomeKitLoaded] = useRecoilState(isHomeKitLoadedState);
    const [isHealthAndBeautyKitLoaded, setIsHealthAndBeautyKitLoaded] = useRecoilState(isHealthAndBeautyKitLoadedState);
    const [isOfficeAndBusinessKitLoaded, setIsOfficeAndBusinessKitLoaded] = useRecoilState(isOfficeAndBusinessKitLoadedState);
    const [isServicesAndSubscriptionsKitLoaded, setIsServicesAndSubscriptionsKitLoaded] = useRecoilState(isServicesAndSubscriptionsKitLoadedState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        !storeNavigation && setStoreNavigation(navigation);
        // set the app drawer status accordingly, custom banner visibility and drawer swipe actions accordingly
        appDrawerHeaderShown && setAppDrawerHeaderShown(false);
        bannerShown && setBannerShown(false);
        drawerSwipeEnabled && setDrawerSwipeEnabled(false);
        bottomTabShown && setBottomTabShown(false);

        if (currentActiveKit !== null) {
            loadActiveKit().then(() => {
            });
        }
    }, [
        currentActiveKit,

        bottomTabShown, appDrawerHeaderShown, storeNavigation,

        noNearbyFoodCategorizedOffersToLoad, noNearbyRetailCategorizedOffersToLoad, noNearbyEntertainmentCategorizedOffersToLoad,
        noNearbyElectronicsCategorizedOffersToLoad, noNearbyHealthAndBeautyCategorizedOffersToLoad, noNearbyOfficeAndBusinessCategorizedOffersToLoad,
        noNearbyServicesAndSubscriptionsCategorizedOffersToLoad,

        nearbyFoodCategorizedOfferList, nearbyRetailCategorizedOfferList, nearbyEntertainmentCategorizedOfferList,
        nearbyElectronicsCategorizedOfferList, nearbyHealthAndBeautyCategorizedOfferList, nearbyOfficeAndBusinessCategorizedOfferList,
        nearbyServicesAndSubscriptionsCategorizedOfferList,

        onlineVeteransDayCategorizedOfferList, onlineFoodCategorizedOfferList, onlineRetailCategorizedOfferList,
        onlineEntertainmentCategorizedOfferList, onlineElectronicsCategorizedOfferList, onlineHealthAndBeautyCategorizedOfferList,
        onlineOfficeAndBusinessCategorizedOfferList, onlineServicesAndSubscriptionsCategorizedOfferList,

        loadingOnlineVeteransDayCategorizedInProgress,
        loadingOnlineFoodCategorizedInProgress, loadingNearbyFoodCategorizedOffersInProgress,
        loadingOnlineRetailCategorizedInProgress, loadingNearbyRetailCategorizedOffersInProgress,
        loadingOnlineEntertainmentCategorizedInProgress, loadingNearbyEntertainmentCategorizedOffersInProgress,
        loadingOnlineElectronicsCategorizedInProgress, loadingNearbyElectronicsCategorizedOffersInProgress,
        loadingOnlineHealthAndBeautyCategorizedInProgress, loadingNearbyHealthAndBeautyCategorizedOffersInProgress,
        loadingOnlineOfficeAndBusinessCategorizedInProgress, loadingNearbyOfficeAndBusinessCategorizedOffersInProgress,
        loadingOnlineServicesAndSubscriptionsCategorizedInProgress, loadingNearbyServicesAndSubscriptionsCategorizedOffersInProgress,

        noOnlineVeteransDayCategorizedOffersToLoad, noOnlineFoodCategorizedOffersToLoad, noOnlineRetailCategorizedOffersToLoad,
        noOnlineEntertainmentCategorizedOffersToLoad, noOnlineElectronicsCategorizedOffersToLoad, noOnlineHealthAndBeautyCategorizedOffersToLoad,
        noOnlineOfficeAndBusinessCategorizedOffersToLoad, noOnlineServicesAndSubscriptionsCategorizedOffersToLoad
    ]);

    /**
     * Function used to load the kit offers according to the active kit
     */
    const loadActiveKit = async (): Promise<void> => {
        switch (currentActiveKit) {
            case OfferCategory.VeteranDay:
                if (!loadingOnlineVeteransDayCategorizedInProgress && !noOnlineVeteransDayCategorizedOffersToLoad && onlineVeteransDayCategorizedOfferList.length < 20) {
                    await loadOnlineVeteransDayCategorizedData();
                }
                if (!isVeteransDayKitLoaded) {
                    setIsReady(false);
                    setTimeout(() => {
                        setIsReady(true);
                        setIsVeteransDayKitLoaded(true);
                    }, 3000);
                } else {
                    setIsReady(true);
                }
                break;
            case OfferCategory.Food:
                if (!loadingOnlineFoodCategorizedInProgress && !noOnlineFoodCategorizedOffersToLoad && onlineFoodCategorizedOfferList.length < 20) {
                    await loadOnlineFoodCategorizedData();
                } else if (!loadingNearbyFoodCategorizedOffersInProgress && !noNearbyFoodCategorizedOffersToLoad && nearbyFoodCategorizedOfferList.length < 20) {
                    await loadNearbyFoodCategorizedData();
                }
                if (!isFoodKitLoaded) {
                    setIsReady(false);
                    setTimeout(() => {
                        setIsReady(true);
                        setIsFoodKitLoaded(true);
                    }, 3000);
                } else {
                    setIsReady(true);
                }
                break;
            case OfferCategory.Retail:
                if (!loadingOnlineRetailCategorizedInProgress && !noOnlineRetailCategorizedOffersToLoad && onlineRetailCategorizedOfferList.length < 20) {
                    await loadOnlineRetailCategorizedData();
                } else if (!loadingNearbyRetailCategorizedOffersInProgress && !noNearbyRetailCategorizedOffersToLoad && nearbyRetailCategorizedOfferList.length < 20) {
                    await loadNearbyRetailCategorizedData();
                }
                if (!isRetailKitLoaded) {
                    setIsReady(false);
                    setTimeout(() => {
                        setIsReady(true);
                        setIsRetailKitLoaded(true);
                    }, 3000);
                } else {
                    setIsReady(true);
                }
                break;
            case OfferCategory.Entertainment:
                if (!loadingOnlineEntertainmentCategorizedInProgress && !noOnlineEntertainmentCategorizedOffersToLoad && onlineEntertainmentCategorizedOfferList.length < 20) {
                    await loadOnlineEntertainmentCategorizedData();
                } else if (!loadingNearbyEntertainmentCategorizedOffersInProgress && !noNearbyEntertainmentCategorizedOffersToLoad && nearbyEntertainmentCategorizedOfferList.length < 20) {
                    await loadNearbyEntertainmentCategorizedData();
                }
                if (!isEntertainmentKitLoaded) {
                    setIsReady(false);
                    setTimeout(() => {
                        setIsReady(true);
                        setIsEntertainmentKitLoaded(true);
                    }, 3000);
                } else {
                    setIsReady(true);
                }
                break;
            case OfferCategory.Electronics:
                if (!loadingOnlineElectronicsCategorizedInProgress && !noOnlineElectronicsCategorizedOffersToLoad && onlineElectronicsCategorizedOfferList.length < 20) {
                    await loadOnlineElectronicsCategorizedData()
                } else if (!loadingNearbyElectronicsCategorizedOffersInProgress && !noNearbyElectronicsCategorizedOffersToLoad && nearbyElectronicsCategorizedOfferList.length < 20) {
                    await loadNearbyElectronicsCategorizedData();
                }
                if (!isElectronicsKitLoaded) {
                    setIsReady(false);
                    setTimeout(() => {
                        setIsReady(true);
                        setIsElectronicsKitLoaded(true);
                    }, 3000);
                } else {
                    setIsReady(true);
                }
                break;
            case OfferCategory.Home:
                if (!loadingOnlineHomeCategorizedInProgress && !noOnlineHomeCategorizedOffersToLoad && onlineHomeCategorizedOfferList.length < 20) {
                    await loadOnlineHomeCategorizedData();
                } else if (!loadingNearbyHomeCategorizedOffersInProgress && !noNearbyHomeCategorizedOffersToLoad && nearbyHomeCategorizedOfferList.length < 20) {
                    await loadNearbyHomeCategorizedData();
                }
                if (!isHomeKitLoaded) {
                    setIsReady(false);
                    setTimeout(() => {
                        setIsReady(true);
                        setIsHomeKitLoaded(true);
                    }, 3000);
                } else {
                    setIsReady(true);
                }
                break;
            case OfferCategory.HealthAndBeauty:
                if (!loadingOnlineHealthAndBeautyCategorizedInProgress && !noOnlineHealthAndBeautyCategorizedOffersToLoad && onlineHealthAndBeautyCategorizedOfferList.length < 20) {
                    await loadOnlineHealthAndBeautyCategorizedData();
                } else if (!loadingNearbyHealthAndBeautyCategorizedOffersInProgress && !noNearbyHealthAndBeautyCategorizedOffersToLoad && nearbyHealthAndBeautyCategorizedOfferList.length < 20) {
                    await loadNearbyHealthAndBeautyCategorizedData();
                }
                if (!isHealthAndBeautyKitLoaded) {
                    setIsReady(false);
                    setTimeout(() => {
                        setIsReady(true);
                        setIsHealthAndBeautyKitLoaded(true);
                    }, 3000);
                } else {
                    setIsReady(true);
                }
                break;
            case OfferCategory.OfficeAndBusiness:
                if (!loadingOnlineOfficeAndBusinessCategorizedInProgress && !noOnlineOfficeAndBusinessCategorizedOffersToLoad && onlineOfficeAndBusinessCategorizedOfferList.length < 20) {
                    await loadOnlineOfficeAndBusinessCategorizedData();
                } else if (!loadingNearbyOfficeAndBusinessCategorizedOffersInProgress && !noNearbyOfficeAndBusinessCategorizedOffersToLoad && nearbyOfficeAndBusinessCategorizedOfferList.length < 20) {
                    await loadNearbyOfficeAndBusinessCategorizedData();
                }
                if (!isOfficeAndBusinessKitLoaded) {
                    setIsReady(false);
                    setTimeout(() => {
                        setIsReady(true);
                        setIsOfficeAndBusinessKitLoaded(true);
                    }, 3000);
                } else {
                    setIsReady(true);
                }
                break;
            case OfferCategory.ServicesAndSubscriptions:
                if (!loadingOnlineServicesAndSubscriptionsCategorizedInProgress && !noOnlineServicesAndSubscriptionsCategorizedOffersToLoad && onlineServicesAndSubscriptionsCategorizedOfferList.length < 20) {
                    await loadOnlineServicesAndSubscriptionsCategorizedData();
                } else if (!loadingNearbyServicesAndSubscriptionsCategorizedOffersInProgress && !noNearbyServicesAndSubscriptionsCategorizedOffersToLoad && nearbyServicesAndSubscriptionsCategorizedOfferList.length < 20) {
                    await loadNearbyServicesAndSubscriptionsCategorizedData();
                }
                if (!isServicesAndSubscriptionsKitLoaded) {
                    setIsReady(false);
                    setTimeout(() => {
                        setIsReady(true);
                        setIsServicesAndSubscriptionsKitLoaded(true);
                    }, 3000);
                } else {
                    setIsReady(true);
                }
                break;
        }
    }

    /**
     * Function used to load the online VETERANS_DAY categorized data
     */
    const loadOnlineVeteransDayCategorizedData = async (): Promise<void> => {
        setTimeout(async () => {
            setIsLoadingOnlineVeteransDayCategorizedInProgress(true);

            const additionalOnlineVeteransDayCategoryOffers =
                await retrieveCategorizedOnlineOffersList(numberOfVeteransDayCategorizedOnlineOffers, setNumberOfVeteransDayCategorizedOnlineOffers,
                    OfferCategory.VeteranDay, onlineVeteransDayCategorizedOffersPageNumber, setOnlineVeteransDayCategorizedOffersPageNumber);

            if (additionalOnlineVeteransDayCategoryOffers.length === 0) {
                setNoOnlineVeteransDayCategorizedOffersToLoad(true);
                setOnlineVeteransDayCategorizedOfferList(oldOnlineVeteransDayCategorizedOfferList => {
                    return [...oldOnlineVeteransDayCategorizedOfferList, ...additionalOnlineVeteransDayCategoryOffers]
                });
            } else {
                setNoOnlineVeteransDayCategorizedOffersToLoad(false);
                setOnlineVeteransDayCategorizedOfferList(oldOnlineVeteransDayCategorizedOfferList => {
                    return [...oldOnlineVeteransDayCategorizedOfferList, ...additionalOnlineVeteransDayCategoryOffers]
                });
            }

            setIsLoadingOnlineVeteransDayCategorizedInProgress(false);
        }, 0);
    }

    /**
     * Function used to load the online FOOD categorized data
     */
    const loadOnlineFoodCategorizedData = async (): Promise<void> => {
        setTimeout(async () => {
            setIsLoadingOnlineFoodCategorizedInProgress(true);

            const additionalOnlineFoodCategoryOffers =
                await retrieveCategorizedOnlineOffersList(numberOfFoodCategorizedOnlineOffers, setNumberOfFoodCategorizedOnlineOffers,
                    OfferCategory.Food, onlineFoodCategorizedOffersPageNumber, setOnlineFoodCategorizedOffersPageNumber);
            if (additionalOnlineFoodCategoryOffers.length === 0) {
                setNoOnlineFoodCategorizedOffersToLoad(true);
                setOnlineFoodCategorizedOfferList(oldOnlineFoodCategorizedOfferList => {
                    return [...oldOnlineFoodCategorizedOfferList, ...additionalOnlineFoodCategoryOffers]
                });
            } else {
                setNoOnlineFoodCategorizedOffersToLoad(false);
                setOnlineFoodCategorizedOfferList(oldOnlineFoodCategorizedOfferList => {
                    return [...oldOnlineFoodCategorizedOfferList, ...additionalOnlineFoodCategoryOffers]
                });
            }

            setIsLoadingOnlineFoodCategorizedInProgress(false);
        }, 0);
    }

    /**
     * Function used to load the online RETAIL categorized data
     */
    const loadOnlineRetailCategorizedData = async (): Promise<void> => {
        setTimeout(async () => {
            setIsLoadingOnlineRetailCategorizedInProgress(true);

            const additionalOnlineRetailCategoryOffers =
                await retrieveCategorizedOnlineOffersList(numberOfRetailCategorizedOnlineOffers, setNumberOfRetailCategorizedOnlineOffers,
                    OfferCategory.Retail, onlineRetailCategorizedOffersPageNumber, setOnlineRetailCategorizedOffersPageNumber);
            if (additionalOnlineRetailCategoryOffers.length === 0) {
                setNoOnlineRetailCategorizedOffersToLoad(true);
                setOnlineRetailCategorizedOfferList(oldOnlineRetailCategorizedOfferList => {
                    return [...oldOnlineRetailCategorizedOfferList, ...additionalOnlineRetailCategoryOffers]
                });
            } else {
                setNoOnlineRetailCategorizedOffersToLoad(false);
                setOnlineRetailCategorizedOfferList(oldOnlineRetailCategorizedOfferList => {
                    return [...oldOnlineRetailCategorizedOfferList, ...additionalOnlineRetailCategoryOffers]
                });
            }

            setIsLoadingOnlineRetailCategorizedInProgress(false);
        }, 0);
    }

    /**
     * Function used to load the online ENTERTAINMENT categorized data
     */
    const loadOnlineEntertainmentCategorizedData = async (): Promise<void> => {
        setTimeout(async () => {
            setIsLoadingOnlineEntertainmentCategorizedInProgress(true);

            const additionalOnlineEntertainmentCategoryOffers =
                await retrieveCategorizedOnlineOffersList(numberOfEntertainmentCategorizedOnlineOffers, setNumberOfEntertainmentCategorizedOnlineOffers,
                    OfferCategory.Entertainment, onlineEntertainmentCategorizedOffersPageNumber, setOnlineEntertainmentCategorizedOffersPageNumber);
            if (additionalOnlineEntertainmentCategoryOffers.length === 0) {
                setNoOnlineEntertainmentCategorizedOffersToLoad(true);
                setOnlineEntertainmentCategorizedOfferList(oldOnlineEntertainmentCategorizedOfferList => {
                    return [...oldOnlineEntertainmentCategorizedOfferList, ...additionalOnlineEntertainmentCategoryOffers]
                });
            } else {
                setNoOnlineEntertainmentCategorizedOffersToLoad(false);
                setOnlineEntertainmentCategorizedOfferList(oldOnlineEntertainmentCategorizedOfferList => {
                    return [...oldOnlineEntertainmentCategorizedOfferList, ...additionalOnlineEntertainmentCategoryOffers]
                });
            }

            setIsLoadingOnlineEntertainmentCategorizedInProgress(false);
        }, 0);
    }

    /**
     * Function used to load the online ELECTRONICS categorized data
     */
    const loadOnlineElectronicsCategorizedData = async (): Promise<void> => {
        setTimeout(async () => {
            setIsLoadingOnlineElectronicsCategorizedInProgress(true);

            const additionalOnlineElectronicsCategoryOffers =
                await retrieveCategorizedOnlineOffersList(numberOfElectronicsCategorizedOnlineOffers, setNumberOfElectronicsCategorizedOnlineOffers,
                    OfferCategory.Electronics, onlineElectronicsCategorizedOffersPageNumber, setOnlineElectronicsCategorizedOffersPageNumber);
            if (additionalOnlineElectronicsCategoryOffers.length === 0) {
                setNoOnlineElectronicsCategorizedOffersToLoad(true);
                setOnlineElectronicsCategorizedOfferList(oldOnlineElectronicsCategorizedOfferList => {
                    return [...oldOnlineElectronicsCategorizedOfferList, ...additionalOnlineElectronicsCategoryOffers]
                });
            } else {
                setNoOnlineElectronicsCategorizedOffersToLoad(false);
                setOnlineElectronicsCategorizedOfferList(oldOnlineElectronicsCategorizedOfferList => {
                    return [...oldOnlineElectronicsCategorizedOfferList, ...additionalOnlineElectronicsCategoryOffers]
                });
            }

            setIsLoadingOnlineElectronicsCategorizedInProgress(false);
        }, 0);
    }

    /**
     * Function used to load the online HOME categorized data
     */
    const loadOnlineHomeCategorizedData = async (): Promise<void> => {
        setTimeout(async () => {
            setIsLoadingOnlineHomeCategorizedInProgress(true);

            const additionalOnlineHomeCategoryOffers =
                await retrieveCategorizedOnlineOffersList(numberOfHomeCategorizedOnlineOffers, setNumberOfHomeCategorizedOnlineOffers,
                    OfferCategory.Home, onlineHomeCategorizedOffersPageNumber, setOnlineHomeCategorizedOffersPageNumber);
            if (additionalOnlineHomeCategoryOffers.length === 0) {
                setNoOnlineHomeCategorizedOffersToLoad(true);
                setOnlineHomeCategorizedOfferList(oldOnlineHomeCategorizedOfferList => {
                    return [...oldOnlineHomeCategorizedOfferList, ...additionalOnlineHomeCategoryOffers]
                });
            } else {
                setNoOnlineHomeCategorizedOffersToLoad(false);
                setOnlineHomeCategorizedOfferList(oldOnlineHomeCategorizedOfferList => {
                    return [...oldOnlineHomeCategorizedOfferList, ...additionalOnlineHomeCategoryOffers]
                });
            }

            setIsLoadingOnlineHomeCategorizedInProgress(false);
        }, 0);
    }

    /**
     * Function used to load the online HEALTH AND BEAUTY categorized data
     */
    const loadOnlineHealthAndBeautyCategorizedData = async (): Promise<void> => {
        setTimeout(async () => {
            setIsLoadingOnlineHealthAndBeautyCategorizedInProgress(true);

            const additionalOnlineHealthAndBeautyCategoryOffers =
                await retrieveCategorizedOnlineOffersList(numberOfHealthAndBeautyCategorizedOnlineOffers, setNumberOfHealthAndBeautyCategorizedOnlineOffers,
                    OfferCategory.HealthAndBeauty, onlineHealthAndBeautyCategorizedOffersPageNumber, setOnlineHealthAndBeautyCategorizedOffersPageNumber);
            if (additionalOnlineHealthAndBeautyCategoryOffers.length === 0) {
                setNoOnlineHealthAndBeautyCategorizedOffersToLoad(true);
                setOnlineHealthAndBeautyCategorizedOfferList(oldOnlineHealthAndBeautyCategorizedOfferList => {
                    return [...oldOnlineHealthAndBeautyCategorizedOfferList, ...additionalOnlineHealthAndBeautyCategoryOffers]
                });
            } else {
                setNoOnlineHealthAndBeautyCategorizedOffersToLoad(false);
                setOnlineHealthAndBeautyCategorizedOfferList(oldOnlineHealthAndBeautyCategorizedOfferList => {
                    return [...oldOnlineHealthAndBeautyCategorizedOfferList, ...additionalOnlineHealthAndBeautyCategoryOffers]
                });
            }

            setIsLoadingOnlineHealthAndBeautyCategorizedInProgress(false);
        }, 0);
    }

    /**
     * Function used to load the online OFFICE AND BUSINESS categorized data
     */
    const loadOnlineOfficeAndBusinessCategorizedData = async (): Promise<void> => {
        setTimeout(async () => {
            setIsLoadingOnlineOfficeAndBusinessCategorizedInProgress(true);

            const additionalOnlineOfficeAndBusinessCategoryOffers =
                await retrieveCategorizedOnlineOffersList(numberOfOfficeAndBusinessCategorizedOnlineOffers, setNumberOfOfficeAndBusinessCategorizedOnlineOffers,
                    OfferCategory.OfficeAndBusiness, onlineOfficeAndBusinessCategorizedOffersPageNumber, setOnlineOfficeAndBusinessCategorizedOffersPageNumber);
            if (additionalOnlineOfficeAndBusinessCategoryOffers.length === 0) {
                setNoOnlineOfficeAndBusinessCategorizedOffersToLoad(true);
                setOnlineOfficeAndBusinessCategorizedOfferList(oldOnlineOfficeAndBusinessCategorizedOfferList => {
                    return [...oldOnlineOfficeAndBusinessCategorizedOfferList, ...additionalOnlineOfficeAndBusinessCategoryOffers]
                });
            } else {
                setNoOnlineOfficeAndBusinessCategorizedOffersToLoad(false);
                setOnlineOfficeAndBusinessCategorizedOfferList(oldOnlineOfficeAndBusinessCategorizedOfferList => {
                    return [...oldOnlineOfficeAndBusinessCategorizedOfferList, ...additionalOnlineOfficeAndBusinessCategoryOffers]
                });
            }

            setIsLoadingOnlineOfficeAndBusinessCategorizedInProgress(false);
        }, 0);
    }

    /**
     * Function used to load the online SERVICES AND SUBSCRIPTIONS categorized data
     */
    const loadOnlineServicesAndSubscriptionsCategorizedData = async (): Promise<void> => {
        setTimeout(async () => {
            setIsLoadingOnlineServicesAndSubscriptionsCategorizedInProgress(true);

            const additionalOnlineServicesAndSubscriptionsCategoryOffers =
                await retrieveCategorizedOnlineOffersList(numberOfServicesAndSubscriptionsCategorizedOnlineOffers, setNumberOfServicesAndSubscriptionsCategorizedOnlineOffers,
                    OfferCategory.ServicesAndSubscriptions, onlineServicesAndSubscriptionsCategorizedOffersPageNumber, setOnlineServicesAndSubscriptionsCategorizedOffersPageNumber);
            if (additionalOnlineServicesAndSubscriptionsCategoryOffers.length === 0) {
                setNoOnlineServicesAndSubscriptionsCategorizedOffersToLoad(true);
                setOnlineServicesAndSubscriptionsCategorizedOfferList(oldOnlineServicesAndSubscriptionsCategorizedOfferList => {
                    return [...oldOnlineServicesAndSubscriptionsCategorizedOfferList, ...additionalOnlineServicesAndSubscriptionsCategoryOffers]
                });
            } else {
                setNoOnlineServicesAndSubscriptionsCategorizedOffersToLoad(false);
                setOnlineServicesAndSubscriptionsCategorizedOfferList(oldOnlineServicesAndSubscriptionsCategorizedOfferList => {
                    return [...oldOnlineServicesAndSubscriptionsCategorizedOfferList, ...additionalOnlineServicesAndSubscriptionsCategoryOffers]
                });
            }

            setIsLoadingOnlineServicesAndSubscriptionsCategorizedInProgress(false);
        }, 0);
    }

    /**
     * Function used to load the nearby FOOD categorized offer data
     */
    const loadNearbyFoodCategorizedData = async (): Promise<void> => {
        setTimeout(async () => {
            setIsLoadingNearbyFoodCategorizedOffersInProgress(true);

            const offersFoodCategorizedNearby = await
                retrieveCategorizedOffersNearby(nearbyFoodCategorizedOffersPageNumber, setNearbyFoodCategorizedOffersPageNumber,
                    userInformation, setOffersNearUserLocationFlag, currentUserLocation, setCurrentUserLocation, numberOfFoodCategorizedOffersWithin25Miles,
                    setNumberOfFoodCategorizedOffersWithin25Miles, OfferCategory.Food);
            if (offersFoodCategorizedNearby === null) {
                setIsLoadingNearbyFoodCategorizedOffersInProgress(false);
                setNoNearbyFoodCategorizedOffersToLoad(true);
                setLocationServicesButtonState(true);
            } else if (offersFoodCategorizedNearby.length === 0) {
                setIsLoadingNearbyFoodCategorizedOffersInProgress(false);
                setNoNearbyFoodCategorizedOffersToLoad(true);
            } else {
                setNoNearbyFoodCategorizedOffersToLoad(false);
                setIsLoadingNearbyFoodCategorizedOffersInProgress(false);
                setNearbyFoodCategorizedOfferList(oldNearbyFoodCategorizedOfferList => {
                    return [...oldNearbyFoodCategorizedOfferList, ...offersFoodCategorizedNearby]
                });
            }
        }, 0);
    }

    /**
     * Function used to load the nearby RETAIL categorized offer data
     */
    const loadNearbyRetailCategorizedData = async (): Promise<void> => {
        setTimeout(async () => {
            setIsLoadingNearbyRetailCategorizedOffersInProgress(true);

            const offersRetailCategorizedNearby = await
                retrieveCategorizedOffersNearby(nearbyRetailCategorizedOffersPageNumber, setNearbyRetailCategorizedOffersPageNumber,
                    userInformation, setOffersNearUserLocationFlag, currentUserLocation, setCurrentUserLocation, numberOfRetailCategorizedOffersWithin25Miles,
                    setNumberOfRetailCategorizedOffersWithin25Miles, OfferCategory.Retail);
            if (offersRetailCategorizedNearby === null) {
                setIsLoadingNearbyRetailCategorizedOffersInProgress(false);
                setNoNearbyRetailCategorizedOffersToLoad(true);
                setLocationServicesButtonState(true);
            } else if (offersRetailCategorizedNearby.length === 0) {
                setIsLoadingNearbyRetailCategorizedOffersInProgress(false);
                setNoNearbyRetailCategorizedOffersToLoad(true);
            } else {
                setNoNearbyRetailCategorizedOffersToLoad(false);
                setIsLoadingNearbyRetailCategorizedOffersInProgress(false);
                setNearbyRetailCategorizedOfferList(oldNearbyRetailCategorizedOfferList => {
                    return [...oldNearbyRetailCategorizedOfferList, ...offersRetailCategorizedNearby]
                });
            }
        }, 0);
    }

    /**
     * Function used to load the nearby ENTERTAINMENT categorized offer data
     */
    const loadNearbyEntertainmentCategorizedData = async (): Promise<void> => {
        setTimeout(async () => {
            setIsLoadingNearbyEntertainmentCategorizedOffersInProgress(true);

            const offersEntertainmentCategorizedNearby = await
                retrieveCategorizedOffersNearby(nearbyEntertainmentCategorizedOffersPageNumber, setNearbyEntertainmentCategorizedOffersPageNumber,
                    userInformation, setOffersNearUserLocationFlag, currentUserLocation, setCurrentUserLocation, numberOfEntertainmentCategorizedOffersWithin25Miles,
                    setNumberOfEntertainmentCategorizedOffersWithin25Miles, OfferCategory.Entertainment);
            if (offersEntertainmentCategorizedNearby === null) {
                setIsLoadingNearbyEntertainmentCategorizedOffersInProgress(false);
                setNoNearbyEntertainmentCategorizedOffersToLoad(true);
                setLocationServicesButtonState(true);
            } else if (offersEntertainmentCategorizedNearby.length === 0) {
                setIsLoadingNearbyEntertainmentCategorizedOffersInProgress(false);
                setNoNearbyEntertainmentCategorizedOffersToLoad(true);
            } else {
                setNoNearbyEntertainmentCategorizedOffersToLoad(false);
                setIsLoadingNearbyEntertainmentCategorizedOffersInProgress(false);
                setNearbyEntertainmentCategorizedOfferList(oldNearbyEntertainmentCategorizedOfferList => {
                    return [...oldNearbyEntertainmentCategorizedOfferList, ...offersEntertainmentCategorizedNearby]
                });
            }
        }, 0);
    }

    /**
     * Function used to load the nearby ELECTRONICS categorized offer data
     */
    const loadNearbyElectronicsCategorizedData = async (): Promise<void> => {
        setTimeout(async () => {
            setIsLoadingNearbyElectronicsCategorizedOffersInProgress(true);

            const offersElectronicsCategorizedNearby = await
                retrieveCategorizedOffersNearby(nearbyElectronicsCategorizedOffersPageNumber, setNearbyElectronicsCategorizedOffersPageNumber,
                    userInformation, setOffersNearUserLocationFlag, currentUserLocation, setCurrentUserLocation, numberOfElectronicsCategorizedOffersWithin25Miles,
                    setNumberOfElectronicsCategorizedOffersWithin25Miles, OfferCategory.Electronics);
            if (offersElectronicsCategorizedNearby === null) {
                setIsLoadingNearbyElectronicsCategorizedOffersInProgress(false);
                setNoNearbyElectronicsCategorizedOffersToLoad(true);
                setLocationServicesButtonState(true);
            } else if (offersElectronicsCategorizedNearby.length === 0) {
                setIsLoadingNearbyElectronicsCategorizedOffersInProgress(false);
                setNoNearbyElectronicsCategorizedOffersToLoad(true);
            } else {
                setNoNearbyElectronicsCategorizedOffersToLoad(false);
                setIsLoadingNearbyElectronicsCategorizedOffersInProgress(false);
                setNearbyElectronicsCategorizedOfferList(oldNearbyElectronicsCategorizedOfferList => {
                    return [...oldNearbyElectronicsCategorizedOfferList, ...offersElectronicsCategorizedNearby]
                });
            }
        }, 0);
    }

    /**
     * Function used to load the nearby HOME categorized offer data
     */
    const loadNearbyHomeCategorizedData = async (): Promise<void> => {
        setTimeout(async () => {
            setIsLoadingNearbyHomeCategorizedOffersInProgress(true);

            const offersHomeCategorizedNearby = await
                retrieveCategorizedOffersNearby(nearbyHomeCategorizedOffersPageNumber, setNearbyHomeCategorizedOffersPageNumber,
                    userInformation, setOffersNearUserLocationFlag, currentUserLocation, setCurrentUserLocation, numberOfHomeCategorizedOffersWithin25Miles,
                    setNumberOfHomeCategorizedOffersWithin25Miles, OfferCategory.Home);
            if (offersHomeCategorizedNearby === null) {
                setIsLoadingNearbyHomeCategorizedOffersInProgress(false);
                setNoNearbyHomeCategorizedOffersToLoad(true);
                setLocationServicesButtonState(true);
            } else if (offersHomeCategorizedNearby.length === 0) {
                setIsLoadingNearbyHomeCategorizedOffersInProgress(false);
                setNoNearbyHomeCategorizedOffersToLoad(true);
            } else {
                setNoNearbyHomeCategorizedOffersToLoad(false);
                setIsLoadingNearbyHomeCategorizedOffersInProgress(false);
                setNearbyHomeCategorizedOfferList(oldNearbyHomeCategorizedOfferList => {
                    return [...oldNearbyHomeCategorizedOfferList, ...offersHomeCategorizedNearby]
                });
            }
        }, 0);
    }

    /**
     * Function used to load the nearby HEALTH AND BEAUTY categorized offer data
     */
    const loadNearbyHealthAndBeautyCategorizedData = async (): Promise<void> => {
        setTimeout(async () => {
            setIsLoadingNearbyHealthAndBeautyCategorizedOffersInProgress(true);

            const offersHealthAndBeautyCategorizedNearby = await
                retrieveCategorizedOffersNearby(nearbyHealthAndBeautyCategorizedOffersPageNumber, setNearbyHealthAndBeautyCategorizedOffersPageNumber,
                    userInformation, setOffersNearUserLocationFlag, currentUserLocation, setCurrentUserLocation, numberOfHealthAndBeautyCategorizedOffersWithin25Miles,
                    setNumberOfHealthAndBeautyCategorizedOffersWithin25Miles, OfferCategory.HealthAndBeauty);
            if (offersHealthAndBeautyCategorizedNearby === null) {
                setIsLoadingNearbyHealthAndBeautyCategorizedOffersInProgress(false);
                setNoNearbyHealthAndBeautyCategorizedOffersToLoad(true);
                setLocationServicesButtonState(true);
            } else if (offersHealthAndBeautyCategorizedNearby.length === 0) {
                setIsLoadingNearbyHealthAndBeautyCategorizedOffersInProgress(false);
                setNoNearbyHealthAndBeautyCategorizedOffersToLoad(true);
            } else {
                setNoNearbyHealthAndBeautyCategorizedOffersToLoad(false);
                setIsLoadingNearbyHealthAndBeautyCategorizedOffersInProgress(false);
                setNearbyHealthAndBeautyCategorizedOfferList(oldNearbyHealthAndBeautyCategorizedOfferList => {
                    return [...oldNearbyHealthAndBeautyCategorizedOfferList, ...offersHealthAndBeautyCategorizedNearby]
                });
            }
        }, 0);
    }

    /**
     * Function used to load the nearby OFFICE AND BUSINESS categorized offer data
     */
    const loadNearbyOfficeAndBusinessCategorizedData = async (): Promise<void> => {
        setTimeout(async () => {
            setIsLoadingNearbyOfficeAndBusinessCategorizedOffersInProgress(true);

            const offersOfficeAndBusinessCategorizedNearby = await
                retrieveCategorizedOffersNearby(nearbyOfficeAndBusinessCategorizedOffersPageNumber, setNearbyOfficeAndBusinessCategorizedOffersPageNumber,
                    userInformation, setOffersNearUserLocationFlag, currentUserLocation, setCurrentUserLocation, numberOfOfficeAndBusinessCategorizedOffersWithin25Miles,
                    setNumberOfOfficeAndBusinessCategorizedOffersWithin25Miles, OfferCategory.OfficeAndBusiness);
            if (offersOfficeAndBusinessCategorizedNearby === null) {
                setIsLoadingNearbyOfficeAndBusinessCategorizedOffersInProgress(false);
                setNoNearbyOfficeAndBusinessCategorizedOffersToLoad(true);
                setLocationServicesButtonState(true);
            } else if (offersOfficeAndBusinessCategorizedNearby.length === 0) {
                setIsLoadingNearbyOfficeAndBusinessCategorizedOffersInProgress(false);
                setNoNearbyOfficeAndBusinessCategorizedOffersToLoad(true);
            } else {
                setNoNearbyOfficeAndBusinessCategorizedOffersToLoad(false);
                setIsLoadingNearbyOfficeAndBusinessCategorizedOffersInProgress(false);
                setNearbyOfficeAndBusinessCategorizedOfferList(oldNearbyOfficeAndBusinessCategorizedOfferList => {
                    return [...oldNearbyOfficeAndBusinessCategorizedOfferList, ...offersOfficeAndBusinessCategorizedNearby]
                });
            }
        }, 0);
    }

    /**
     * Function used to load the nearby SERVICES AND SUBSCRIPTIONS categorized offer data
     */
    const loadNearbyServicesAndSubscriptionsCategorizedData = async (): Promise<void> => {
        setTimeout(async () => {
            setIsLoadingNearbyServicesAndSubscriptionsCategorizedOffersInProgress(true);

            const offersServicesAndSubscriptionsCategorizedNearby = await
                retrieveCategorizedOffersNearby(nearbyServicesAndSubscriptionsCategorizedOffersPageNumber, setNearbyServicesAndSubscriptionsCategorizedOffersPageNumber,
                    userInformation, setOffersNearUserLocationFlag, currentUserLocation, setCurrentUserLocation, numberOfServicesAndSubscriptionsCategorizedOffersWithin25Miles,
                    setNumberOfServicesAndSubscriptionsCategorizedOffersWithin25Miles, OfferCategory.Food);
            if (offersServicesAndSubscriptionsCategorizedNearby === null) {
                setIsLoadingNearbyServicesAndSubscriptionsCategorizedOffersInProgress(false);
                setNoNearbyServicesAndSubscriptionsCategorizedOffersToLoad(true);
                setLocationServicesButtonState(true);
            } else if (offersServicesAndSubscriptionsCategorizedNearby.length === 0) {
                setIsLoadingNearbyServicesAndSubscriptionsCategorizedOffersInProgress(false);
                setNoNearbyServicesAndSubscriptionsCategorizedOffersToLoad(true);
            } else {
                setNoNearbyServicesAndSubscriptionsCategorizedOffersToLoad(false);
                setIsLoadingNearbyServicesAndSubscriptionsCategorizedOffersInProgress(false);
                setNearbyServicesAndSubscriptionsCategorizedOfferList(oldNearbyServicesAndSubscriptionsCategorizedOfferList => {
                    return [...oldNearbyServicesAndSubscriptionsCategorizedOfferList, ...offersServicesAndSubscriptionsCategorizedNearby]
                });
            }
        }, 0);
    }

    // return the component for the Kit page
    return (
        <View style={styles.content}>
            {
                !isReady ?
                    <Spinner loadingSpinnerShown={loadingSpinnerShown}
                             setLoadingSpinnerShown={setLoadingSpinnerShown}/>
                    :
                    <Portal.Host>
                        {
                            fullScreenKitMapActive ? <FullScreenMapKitSection navigation={navigation}/>
                                :
                                <>
                                    {
                                        !nearbyKitListExpanded && onlineKitListExpanded &&
                                        <OnlineKitSection navigation={navigation}/>

                                    }
                                    {
                                        !nearbyKitListExpanded && !onlineKitListExpanded &&
                                        <>
                                            <OnlineKitSection navigation={navigation}/>
                                            {
                                                currentActiveKit !== null && currentActiveKit !== OfferCategory.VeteranDay &&
                                                <>
                                                    <MapHorizontalKitSection/>
                                                    <NearbyKitSection navigation={navigation}/>
                                                </>
                                            }
                                        </>

                                    }
                                    {
                                        !onlineKitListExpanded && nearbyKitListExpanded && currentActiveKit !== null && currentActiveKit !== OfferCategory.VeteranDay &&
                                        <NearbyKitSection navigation={navigation}/>
                                    }
                                </>
                        }
                    </Portal.Host>
            }
        </View>
    );
};
