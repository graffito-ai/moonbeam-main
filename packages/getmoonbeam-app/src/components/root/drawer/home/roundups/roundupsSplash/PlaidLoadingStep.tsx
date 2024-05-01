import React, {useEffect} from "react";
// @ts-ignore
import MoonbeamPlaidConnection from "../../../../../../../assets/moonbeam-plaid-connection.png"
import {styles} from "../../../../../../styles/roundups.module";
import {Image, Text, View} from "react-native";
import {widthPercentageToDP as wp} from "react-native-responsive-screen";
import {ActivityIndicator} from "react-native-paper";

/**
 * PlaidLoadingStep component.
 *
 * @constructor constructor for the component.
 */
export const PlaidLoadingStep = () => {
    // constants used to keep track of local component state

    // constants used to keep track of shared states


    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {

    }, []);

    // return the component for the PlaidLoadingStep, part of the RoundupsSplash page
    return (
        <View style={styles.plaidLoadingStepView}>
            <Image
                style={styles.moonbeamPlaidConnectionImage}
                source={MoonbeamPlaidConnection}
                resizeMode={"contain"}
            />
            <Text style={styles.plaidLoadingStepText}>
                Waiting for your Banking information to sync from Plaid.
            </Text>
            <ActivityIndicator
                style={styles.plaidLoadingStepLoader}
                animating={true} color={'#F2FF5D'}
                size={wp(10)}/>
        </View>
    );
}
