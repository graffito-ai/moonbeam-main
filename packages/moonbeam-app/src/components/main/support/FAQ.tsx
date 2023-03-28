import 'react-native-get-random-values';
import React, {useEffect} from "react";
import {SafeAreaView} from "react-native";
import {commonStyles} from "../../../styles/common.module";
import {FAQProps} from '../../../models/SupportStackProps';

/**
 * FAQ component.
 */
export const FAQ = ({route}: FAQProps) => {
    // state driven key-value pairs for UI related elements

    // state driven key-value pairs for any specific data values

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        route.params.setIsDrawerHeaderShown(false);
    }, [route]);

    // return the component for the FAQ page
    return (
        <SafeAreaView style={[commonStyles.rowContainer, commonStyles.androidSafeArea]}>
        </SafeAreaView>
    );
}
