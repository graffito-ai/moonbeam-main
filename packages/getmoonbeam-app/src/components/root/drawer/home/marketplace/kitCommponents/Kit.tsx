import React, {useEffect} from 'react';
import {KitProps} from "../../../../../../models/props/MarketplaceProps";
import {useRecoilState} from "recoil";
import {bottomTabShownState} from "../../../../../../recoil/HomeAtom";
import {appDrawerHeaderShownState, customBannerShown, drawerSwipeState} from "../../../../../../recoil/AppDrawerAtom";
import {storeNavigationState} from "../../../../../../recoil/StoreOfferAtom";
import {ScrollView, View} from "react-native";
import { styles } from '../../../../../../styles/kit.module';
import {OnlineKitSection} from "./OnlineKitSection";

/**
 * Kit component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const Kit = ({navigation, route}: KitProps) => {
    // constants used to keep track of shared states
    const [, setStoreNavigationState] = useRecoilState(storeNavigationState);
    const [, setBottomTabShown] = useRecoilState(bottomTabShownState);
    const [, setBannerShown] = useRecoilState(customBannerShown);
    const [, setAppDrawerHeaderShown] = useRecoilState(appDrawerHeaderShownState);
    const [, setDrawerSwipeEnabled] = useRecoilState(drawerSwipeState);

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

    // return the component for the Kit page
    return (
        <View style={styles.content}>
            <ScrollView
                scrollEnabled={true}
                horizontal={false}
                persistentScrollbar={false}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps={'handled'}
                showsHorizontalScrollIndicator={false}
            >
                <>
                    <View style={styles.verticalScrollView}>
                        <OnlineKitSection navigation={navigation}/>
                    </View>
                </>
            </ScrollView>
        </View>
    );
};
