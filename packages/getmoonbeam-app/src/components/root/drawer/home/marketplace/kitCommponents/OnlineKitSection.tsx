import React, {useEffect, useState} from 'react';
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {MarketplaceStackParamList} from "../../../../../../models/props/MarketplaceProps";
import {View} from "react-native";
import {styles} from '../../../../../../styles/kit.module';
import {Text} from "react-native-paper";
import {useRecoilState} from "recoil";
import {currentActiveKitState} from "../../../../../../recoil/StoreOfferAtom";
import {moonbeamKits} from "../storeComponents/KitsSection";

/**
 * OnlineKitSection component.
 *
 * @param props properties to be passed into the component
 * @constructor constructor for the component.
 */
export const OnlineKitSection = (props: {
    navigation: NativeStackNavigationProp<MarketplaceStackParamList, 'Kit'>
}) => {
    // constants used to keep track of local component state
    const [kitTitle, setKitTitle] = useState<string>("Kit");
    // constants used to keep track of shared states
    const [currentActiveKit,] = useRecoilState(currentActiveKitState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // set the kit title, according to the user selected option
        if (currentActiveKit !== null) {
            const filteredKits = moonbeamKits.filter(kit => kit.type === currentActiveKit);
            filteredKits.length === 1 && setKitTitle(filteredKits[0].secondaryTitle.toString());
        }
    }, [currentActiveKit]);

    // return the component for the OnlineKitSection page
    return (
        <View style={styles.onlineKitOffersView}>
            <View style={styles.onlineKitOffersTitleView}>
                <View style={styles.onlineKitOffersLeftTitleView}>
                    <Text style={styles.onlineKitOffersTitleMain}>
                        {`Online Offers`}
                    </Text>
                </View>

            </View>
        </View>
    );
};
