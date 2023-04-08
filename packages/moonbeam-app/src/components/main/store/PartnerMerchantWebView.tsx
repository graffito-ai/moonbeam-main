import React, {useEffect, useRef} from "react";
import {Dimensions, Text, View} from "react-native";
import {SafeAreaView} from 'react-native-safe-area-context';
import {useHeaderHeight} from '@react-navigation/elements';
import {PartnerMerchantWebViewProps} from "../../../models/PartnerMerchantStackProps";
import WebView from "react-native-webview";
import {styles} from "../../../styles/partnerMerchantWebView.module";
import {FAB, IconButton, Portal} from "react-native-paper";
import * as Clipboard from 'expo-clipboard';

/**
 * Home PartnerMerchantWebView component.
 */
export const PartnerMerchantWebView = ({route}: PartnerMerchantWebViewProps) => {
    // state driven key-value pairs for UI related elements
    const headerHeight = useHeaderHeight();

    // state driven key-value pairs for any specific data values
    const [cardDetailsMenuOpen, setCardDetailsMenuOpen] = React.useState<boolean>(false);
    const [isBackButtonDisabled, setIsBackButtonDisabled] = React.useState<boolean>(true);
    const [isForwardButtonDisabled, setIsForwardButtonDisabled] = React.useState<boolean>(true);
    const webViewRef = useRef(null);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        webViewRef && route.params.setWebViewRef(webViewRef);
    }, [webViewRef]);

    // return the component for the PartnerMerchantWebView page
    return (
        <SafeAreaView edges={['right', 'top', 'left']}
                      style={[styles.mainView, {paddingTop: headerHeight / 2.05}]}>
            <WebView
                ref={webViewRef}
                style={{backgroundColor: 'transparent'}}
                scalesPageToFit={true}
                automaticallyAdjustContentInsets={true}
                startInLoadingState={true}
                source={{
                    uri: 'https://www.apple.com',
                }}
                originWhiteList={['*']}
                onNavigationStateChange={state => {
                    const back = state.canGoBack;
                    const forward = state.canGoForward;
                    setIsBackButtonDisabled(!back);
                    setIsForwardButtonDisabled(!forward);
                }}
            />
            <View style={styles.webViewNavbar}>
                <IconButton
                    disabled={isBackButtonDisabled}
                    rippleColor={'grey'}
                    icon="chevron-left"
                    iconColor={"#2A3779"}
                    size={Dimensions.get('window').height / 23}
                    style={styles.webViewBackButton}
                    onPress={() => {
                        // @ts-ignore
                        webViewRef && webViewRef.current.goBack();
                    }}
                />
                <IconButton
                    disabled={isForwardButtonDisabled}
                    rippleColor={'grey'}
                    icon="chevron-right"
                    iconColor={"#2A3779"}
                    size={Dimensions.get('window').height / 23}
                    style={styles.webViewForwardButton}
                    onPress={() => {
                        // @ts-ignore
                        webViewRef && webViewRef.current.goForward();
                    }}
                />
                <View style={styles.bottomBarPointsView}>
                    <Text style={styles.bottomBarPointNumberLabel}>
                        3X{" "}
                        <Text style={styles.bottomBarPointsLabel}>
                            Points
                        </Text>
                    </Text>
                </View>
                <View style={styles.bottomBarDiscountsView}>
                    <Text style={styles.bottomBarDiscountsNumberLabel}>
                        10%{" "}
                        <Text style={styles.bottomBarDiscountsLabel}>
                            Discount
                        </Text>
                    </Text>
                </View>
                <View>
                    <Portal>
                        <FAB.Group
                            style={styles.cardDetailsTab}
                            label={'Copy'}
                            uppercase={false}
                            fabStyle={styles.cardDetailsButton}
                            color={'#2A3779'}
                            open={cardDetailsMenuOpen['open']}
                            icon={cardDetailsMenuOpen['open'] ? require('../../../../assets/card-details-close.png') : require('../../../../assets/card-details-open.png')}
                            size={54}
                            actions={[
                                {
                                    labelStyle: styles.cardDetailsSectionLabel,
                                    color: '#2A3779',
                                    icon: 'credit-card',
                                    label: 'Card Number',
                                    onPress: async () => {
                                        await Clipboard.setStringAsync(`${route.params.currentUserInformation["name"]}'s Card Number`);
                                    },
                                },
                                {
                                    labelStyle: styles.cardDetailsSectionLabel,
                                    color: '#2A3779',
                                    icon: 'map-marker-multiple',
                                    label: 'Billing Address',
                                    onPress: async () => {
                                        await Clipboard.setStringAsync(`${route.params.currentUserInformation["name"]}'s Billing Address`);
                                    },
                                },
                                {
                                    labelStyle: styles.cardDetailsSectionLabel,
                                    color: '#2A3779',
                                    icon: 'lock-open-variant',
                                    label: 'Security Code',
                                    onPress: async () => {
                                        await Clipboard.setStringAsync(`${route.params.currentUserInformation["name"]}'s Security Code`);
                                    },
                                }
                            ]}
                            onStateChange={setCardDetailsMenuOpen}
                            onPress={() => {
                                if (cardDetailsMenuOpen['open']) {
                                    setCardDetailsMenuOpen(false);
                                }
                                if (!cardDetailsMenuOpen['open']) {
                                    setCardDetailsMenuOpen(true);
                                }
                            }}
                        />
                    </Portal>
                </View>
            </View>
        </SafeAreaView>
    );
}
