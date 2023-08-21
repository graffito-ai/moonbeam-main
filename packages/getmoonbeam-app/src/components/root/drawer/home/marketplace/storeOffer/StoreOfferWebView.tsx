import React, {useEffect, useRef, useState} from 'react';
import {StoreOfferWebViewProps} from "../../../../../../models/props/StoreOfferProps";
import {useRecoilState} from "recoil";
import {storeOfferState} from "../../../../../../recoil/StoreOfferAtom";
import {styles} from '../../../../../../styles/storeOfferWebView.module';
import { SafeAreaView } from 'react-native-safe-area-context';
import {Dimensions, View} from "react-native";
import {FAB, IconButton, Portal, Text, TextInput} from "react-native-paper";
import WebView from "react-native-webview";
import * as Clipboard from 'expo-clipboard';
import {currentUserInformation} from "../../../../../../recoil/AuthAtom";

/**
 * StoreOfferWebView component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const StoreOfferWebView = ({}: StoreOfferWebViewProps) => {
    // constants used to keep track of local component state
    const [cardDetailsMenuOpen, setCardDetailsMenuOpen] = useState<any>(false);
    const [isBackButtonDisabled, setIsBackButtonDisabled] = useState<boolean>(true);
    const [isForwardButtonDisabled, setIsForwardButtonDisabled] = useState<boolean>(true);
    const [initialOfferWebsite, setInitialOfferWebsite] = useState<string>('https://www.google.com');
    const webViewRef = useRef(null);

    // constants used to keep track of shared states
    const [storeOfferClicked,] = useRecoilState(storeOfferState);
    const [userInformation,] = useRecoilState(currentUserInformation);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        console.log(JSON.stringify(userInformation));
        // set the current offer's website accordingly (for now defaulting to a Google search)
        // @ts-ignore
        storeOfferClicked!.numberOfOffers === undefined ? setInitialOfferWebsite(`https://www.google.com/search?q=${storeOfferClicked!.brandDba!}`) : setInitialOfferWebsite(`https://www.google.com/search?q=${storeOfferClicked!.offers[0].brandDba!}`)
    }, []);

    // return the component for the StoreOfferWebView page
    return (
        <SafeAreaView edges={['right', 'left']}
                      style={styles.mainView}>
            <View style={styles.topBar}>
                <View style={styles.containerView}>
                    <TextInput
                        // the text input will be disabled for now, later we can enable it, for a full browser experience
                        disabled={true}
                        style={styles.urlBar}
                        contentStyle={styles.urlInput}
                        outlineStyle={styles.urlBarOutline}
                        left={
                            <TextInput.Icon
                                style={styles.urlLockIcon}
                                icon="lock"
                                rippleColor={'#dbdbdb'}
                                size={Dimensions.get('window').height/55}
                            />
                        }
                        right={
                            <TextInput.Icon
                                style={styles.urlReloadIcon}
                                icon="reload"
                                size={Dimensions.get('window').height/40}
                                onPress={() => {
                                    // @ts-ignore
                                    webViewRef.current.reload();
                                }}
                            />
                        }
                        multiline={false}
                        textColor={'black'}
                        selectionColor={'#2A3779'}
                        mode={'outlined'}
                        placeholder={'Search or type URL'}
                        value={"www.google.com"}
                    />
                </View>
            </View>
            <WebView
                ref={webViewRef}
                style={{backgroundColor: 'transparent'}}
                scalesPageToFit={true}
                automaticallyAdjustContentInsets={true}
                startInLoadingState={true}
                source={{
                    uri: initialOfferWebsite,
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
                    iconColor={"#F2FF5D"}
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
                    iconColor={"#F2FF5D"}
                    size={Dimensions.get('window').height / 23}
                    style={styles.webViewForwardButton}
                    onPress={() => {
                        // @ts-ignore
                        webViewRef && webViewRef.current.goForward();
                    }}
                />
                <View style={styles.bottomBarDiscountsView}>
                    <Text style={styles.bottomBarDiscountsLabel}>
                        Shop with your{"\n"}
                        <Text style={styles.bottomBarDiscountsNumberLabel}>
                            Linked Card
                        </Text>
                    </Text>
                </View>
                <View>
                    <Portal>
                        <FAB.Group
                            visible={true}
                            style={styles.cardDetailsTab}
                            label={'Copy'}
                            fabStyle={styles.cardDetailsButton}
                            color={'#F2FF5D'}
                            open={cardDetailsMenuOpen['open']}
                            icon={cardDetailsMenuOpen['open'] ? require('../../../../../../../assets/card-details-close.png') : require('../../../../../../../assets/card-details-open.png')}
                            actions={[
                                ...userInformation["cards"] && userInformation["cards"].length !== 0 ?
                                [{
                                    labelStyle: styles.cardDetailsSectionLabel,
                                    color: '#F2FF5D',
                                    icon: 'credit-card',
                                    label: 'Linked Card Last 4 Digits',
                                    onPress: async () => {
                                        await Clipboard.setStringAsync(`Linked Card Last 4`);
                                    },
                                }] : [],
                                {
                                    labelStyle: styles.cardDetailsSectionLabel,
                                    color: '#F2FF5D',
                                    icon: 'map-marker-multiple',
                                    label: 'Billing Address',
                                    onPress: async () => {
                                        await Clipboard.setStringAsync(`${userInformation["address"]["formatted"]}`);
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
};
