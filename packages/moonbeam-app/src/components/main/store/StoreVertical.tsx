import 'react-native-get-random-values';
import React, {useEffect} from "react";
import {SafeAreaView, ScrollView, Text, View} from "react-native";
import {List} from "react-native-paper";
import {styles} from "../../../styles/faq.module";
import {StoreVerticalProps} from "../../../models/StoreStackProps";

/**
 * StoreVertical component.
 */
export const StoreVertical = ({}: StoreVerticalProps) => {
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
    }, []);

    // return the component for the vertical Store page
    return (
        <SafeAreaView style={[styles.rowContainer, styles.androidSafeArea]}>
            <ScrollView
                scrollEnabled={true}
                keyboardShouldPersistTaps={'handled'}
                showsVerticalScrollIndicator={false}
            >
                <View style={[styles.mainView]}>
                    <View style={styles.titleView}>
                        <Text style={styles.mainTitle}>
                            <Text>
                                Store
                            </Text>
                        </Text>
                    </View>
                    <View style={styles.content}>
                        <List.Section style={styles.listSectionView}>

                        </List.Section>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
