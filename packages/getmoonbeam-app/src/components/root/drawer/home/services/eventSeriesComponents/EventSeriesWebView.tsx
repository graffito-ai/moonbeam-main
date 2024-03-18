import React, {useEffect, useRef, useState} from 'react';
import {styles} from '../../../../../../styles/eventSeriesWebView.module';
import {SafeAreaView} from 'react-native-safe-area-context';
import {View} from "react-native";
import {IconButton, TextInput} from "react-native-paper";
import WebView from "react-native-webview";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {EventSeriesWebViewProps} from "../../../../../../models/props/EventSeriesProps";
import {useRecoilState} from "recoil";
import {eventToRegisterState} from "../../../../../../recoil/ServicesAtom";

/**
 * EventSeriesWebView component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const EventSeriesWebView = ({navigation}: EventSeriesWebViewProps) => {
    // constants used to keep track of local component state
    const [isBackButtonDisabled, setIsBackButtonDisabled] = useState<boolean>(true);
    const [isForwardButtonDisabled, setIsForwardButtonDisabled] = useState<boolean>(true);
    const webViewRef = useRef(null);
    // constants used to keep track of shared states
    const [eventToRegister,] = useRecoilState(eventToRegisterState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
    }, []);

    // return the component for the EventSeriesWebView page
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
                                // go back to the Event Series details page
                                navigation.navigate('EventSeriesDetails', {});
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
                            value={eventToRegister !== null && eventToRegister!.title
                                ? eventToRegister!.title!
                                : ""}
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
                    uri: eventToRegister !== null && eventToRegister!.registrationUrl
                        ? eventToRegister!.registrationUrl!
                        : 'https://www.google.com',
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
            </View>
        </SafeAreaView>
    );
};
