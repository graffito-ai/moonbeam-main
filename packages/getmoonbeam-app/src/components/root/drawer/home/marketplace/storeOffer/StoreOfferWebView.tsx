import React, {useEffect, useRef, useState} from 'react';
import {StoreOfferWebViewProps} from "../../../../../../models/props/StoreOfferProps";
import {useRecoilState} from "recoil";
import {storeOfferState} from "../../../../../../recoil/StoreOfferAtom";
import {styles} from '../../../../../../styles/storeOfferWebView.module';
import {SafeAreaView} from 'react-native-safe-area-context';
import {View} from "react-native";
import {IconButton, Text, TextInput} from "react-native-paper";
import WebView from "react-native-webview";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {cardLinkingIdState} from "../../../../../../recoil/AppDrawerAtom";
import {userIsAuthenticatedState} from "../../../../../../recoil/AuthAtom";
import {logEvent} from "../../../../../../utils/AppSync";
import {LoggingLevel} from "@moonbeam/moonbeam-models";

/**
 * StoreOfferWebView component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const StoreOfferWebView = ({navigation}: StoreOfferWebViewProps) => {
    // constants used to keep track of local component state
    const [isBackButtonDisabled, setIsBackButtonDisabled] = useState<boolean>(true);
    const [isForwardButtonDisabled, setIsForwardButtonDisabled] = useState<boolean>(true);
    const [initialOfferWebsite, setInitialOfferWebsite] = useState<string>('https://www.google.com');
    const [offerWebsiteRetrieved, setOfferWebsiteRetrieved] = useState<boolean>(false);
    const webViewRef = useRef(null);
    // constants used to keep track of shared states
    const [userIsAuthenticated, ] = useRecoilState(userIsAuthenticatedState);
    const [cardLinkingId, ] = useRecoilState(cardLinkingIdState);
    const [storeOfferClicked,] = useRecoilState(storeOfferState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // set the offer website URL accordingly
        if (!offerWebsiteRetrieved) {
            // handle the click-based offers separately in terms of how we construct the redemption url
            // @ts-ignore
            if (storeOfferClicked!.numberOfOffers === undefined) {
                setOfferWebsiteRetrieved(true);
                // @ts-ignore
                if (storeOfferClicked!.redemptionType === 'click' && storeOfferClicked!.redemptionInstructionUrl !== undefined && storeOfferClicked!.redemptionInstructionUrl !== null) {
                    // @ts-ignore
                    setInitialOfferWebsite(`${storeOfferClicked!.redemptionInstructionUrl}${cardLinkingId}`);
                } else {
                    // @ts-ignore
                    if (storeOfferClicked!.brandWebsite) {
                        // @ts-ignore
                        setInitialOfferWebsite(`${storeOfferClicked!.brandWebsite!}`)
                    } else {
                        // @ts-ignore
                        setInitialOfferWebsite(`https://www.google.com/search?q=${storeOfferClicked!.brandDba!}`)
                    }
                }
            } else {
                setOfferWebsiteRetrieved(true);
                // @ts-ignore
                if (storeOfferClicked!.offers![0].brandWebsite) {
                    // @ts-ignore
                    setInitialOfferWebsite(`${storeOfferClicked!.offers![0].brandWebsite!}`)
                } else {
                    // @ts-ignore
                    setInitialOfferWebsite(`https://www.google.com/search?q=${storeOfferClicked!.offers![0].brandDba!}`)
                }
            }
        }
        logEvent(initialOfferWebsite, LoggingLevel.Info, userIsAuthenticated).then(() => {});
    }, [storeOfferClicked, cardLinkingId, offerWebsiteRetrieved]);

    // return the component for the StoreOfferWebView page
    return (
        <SafeAreaView edges={['right', 'left']}
                      style={styles.mainView}>
            <View style={styles.topBar}>
                <View style={{
                    alignSelf: 'flex-start',
                    flexDirection: 'row',
                    alignItems: 'center',
                    alignContent: 'center',
                    height: hp(12)
                }}>
                    <View style={{alignSelf: 'flex-end', height: hp(7.5)}}>
                        <IconButton
                            rippleColor={'transparent'}
                            icon="close"
                            iconColor={"#F2FF5D"}
                            size={hp(4)}
                            onPress={() => {
                                navigation.navigate('StoreOfferDetails', {});
                            }}
                        />
                    </View>
                    <View style={{alignSelf: 'flex-end', flexDirection: 'row', height: hp(7.5), width: wp(100)}}>
                        <TextInput
                            autoCapitalize={"sentences"}
                            autoCorrect={false}
                            autoComplete={"off"}
                            // the text input will be disabled for now, later we can enable it, for a full browser experience
                            disabled={true}
                            style={styles.urlBar}
                            contentStyle={styles.urlInput}
                            outlineStyle={styles.urlBarOutline}
                            multiline={false}
                            textColor={'black'}
                            selectionColor={'#F2FF5D'}
                            mode={'outlined'}
                            placeholder={'Search or type URL'}
                            // @ts-ignore
                            value={storeOfferClicked!.numberOfOffers === undefined ? storeOfferClicked!.brandDba! : storeOfferClicked.offers[0].brandDba!}
                        />
                    </View>
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
                <View style={{alignSelf: 'center', flexDirection: 'row', width: wp(25)}}>
                    <IconButton
                        disabled={false}
                        rippleColor={'transparent'}
                        icon="chevron-left"
                        iconColor={!isBackButtonDisabled ? "#F2FF5D" : '#FFFFFF'}
                        size={hp(4)}
                        style={styles.webViewBackButton}
                        onPress={() => {
                            // @ts-ignore
                            webViewRef && webViewRef.current.goBack();
                        }}
                    />
                    <IconButton
                        disabled={false}
                        rippleColor={'transparent'}
                        icon="chevron-right"
                        iconColor={!isForwardButtonDisabled ? "#F2FF5D" : '#FFFFFF'}
                        size={hp(4)}
                        style={styles.webViewForwardButton}
                        onPress={() => {
                            // @ts-ignore
                            webViewRef && webViewRef.current.goForward();
                        }}
                    />
                </View>
                <View style={styles.bottomBarDiscountsView}>
                    <Text style={styles.bottomBarDiscountsLabel}>
                        Shop with your{"\n"}
                        <Text style={styles.bottomBarDiscountsNumberLabel}>
                            Linked Card
                        </Text>
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
};
