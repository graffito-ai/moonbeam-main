import React, {useEffect} from 'react';
import {KitProps} from "../../../../../../models/props/MarketplaceProps";
import {useRecoilState} from "recoil";
import {bottomTabShownState} from "../../../../../../recoil/HomeAtom";
import {appDrawerHeaderShownState, customBannerShown, drawerSwipeState} from "../../../../../../recoil/AppDrawerAtom";
import {
    currentActiveKitState,
    fullScreenKitMapActiveState, nearbyKitListIsExpandedState,
    onlineKitListIsExpandedState,
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

/**
 * Kit component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const Kit = ({navigation}: KitProps) => {
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
    }, [bottomTabShown, appDrawerHeaderShown, storeNavigation]);

    // return the component for the Kit page
    return (
        <View style={styles.content}>
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
        </View>
    );
};
