import 'react-native-get-random-values';
import React, {useEffect} from "react";
import {Dimensions, SafeAreaView, View} from "react-native";
import {commonStyles} from "../../../styles/common.module";
import {Button, Text} from "react-native-paper";
import {Avatar} from '@rneui/base';
import {styles} from "../../../styles/partnerMerchantStore.module";
// @ts-ignore
import BattleThreadsLogo from "../../../../assets/companies/battleThreads.jpg";
import {PartnerMerchantStoreProps} from "../../../models/PartnerMerchantStackProps";

/**
 * Home PartnerMerchantStore component.
 */
export const PartnerMerchantStore = ({route, navigation}: PartnerMerchantStoreProps) => {
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

    // return the component for the PartnerMerchantStore page
    return (
        <SafeAreaView style={[commonStyles.rowContainer, commonStyles.androidSafeArea]}>
            <View style={styles.mainView}>
                <View style={styles.messageView}>
                    <Avatar
                        imageProps={{
                            resizeMode: 'stretch'
                        }}
                        size={200}
                        rounded
                        source={{uri: route.params.partnerStore.logo}}
                    />
                    <Text style={styles.messageTitle}>{route.params.partnerStore.name} offers</Text>
                    <Text style={styles.messageSubtitle}>{route.params.partnerStore.pointsMultiplier} Points and {route.params.partnerStore.discountPercentage}% Discount</Text>
                </View>
                <View style={styles.bottomMessageView}>
                    <Button
                        onPress={async () => {
                            navigation.navigate('PartnerMerchantWebView', {rootLink: route.params.partnerStore.websiteURL});
                        }}
                        uppercase={false}
                        style={styles.referButton}
                        textColor={"#f2f2f2"}
                        buttonColor={"#2A3779"}
                        mode="outlined"
                        labelStyle={{fontSize: Dimensions.get('window').height / 54, height: Dimensions.get('window').height}}>
                        Shop at {route.params.partnerStore.websiteURL.split('www.')[1]}
                    </Button>
                    <View>
                        <Text style={styles.messageFooterTitle}>Moonbeam exclusive offer</Text>
                        <Text style={styles.messageFooterSubtitle}>Offers may change, and are subject to{"\n"} using
                            your Alpha card at checkout.</Text>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}
