import React, {useEffect} from 'react';
// @ts-ignore
import HomeDashboardLogo from "../../../assets/login-logo.png";
import {Dimensions, View} from "react-native";
import {IconButton, TextInput} from "react-native-paper";
import {PartnerMerchantProps} from "../../models/StoreStackProps";
import {styles} from "../../styles/webViewNavbar.module";

/**
 * WebViewNavbar component.
 */
export const WebViewNavbar = (props: PartnerMerchantProps & {setReloadState: React.Dispatch<React.SetStateAction<boolean>>}) => {
    // state driven key-value pairs for UI related elements

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
    }, []);

    // return the component for the WebViewNavbar component
    return (
        <View style={[styles.content]}>
            <IconButton
                rippleColor={'#ecebeb'}
                icon="close"
                iconColor={"#2A3779"}
                size={Dimensions.get('window').height/30}
                style={styles.backButton}
                onPress={() => {
                    props.route.params.setBottomTabNavigationShown && props.route.params.setBottomTabNavigationShown(true);
                    props.navigation.navigate('Marketplace', {currentUserInformation: props.route.params.currentUserInformation});
                }}
            />
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
                            props.setReloadState(true);
                        }}
                    />
                }
                multiline={false}
                textColor={'black'}
                selectionColor={'#2A3779'}
                mode={'outlined'}
                placeholder={'Search or type URL'}
                value={
                    'apple.com'
                }
            />
        </View>
    );
};
