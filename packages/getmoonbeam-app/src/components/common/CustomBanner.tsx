import React, {useEffect} from 'react';
import {ImageSourcePropType, Platform, View} from "react-native";
import {Image} from 'expo-image';
import {Banner, Text} from 'react-native-paper';
import {RecoilState, useRecoilState} from "recoil";
import {styles} from '../../styles/customBanner.module';
import {customBannerShown} from "../../recoil/AppDrawerAtom";
import {bottomBarNavigationState} from "../../recoil/HomeAtom";
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';

/**
 * Custom Banner component. This component will be used as a banner for notification and/or
 * guidance purposes throughout the app.
 *
 * @param props component properties to be passed in.
 * @constructor constructor for the component.
 */
export const CustomBanner = (props: {
    bannerVisibilityState: RecoilState<boolean>,
    bannerMessage: string,
    bannerButtonLabel: string,
    bannerButtonLabelActionSource: string,
    bannerArtSource: ImageSourcePropType,
    dismissing: boolean,
    marketplaceLocking?: boolean
}) => {
    // constants used to keep track of shared states
    const [bottomBarNavigation,] = useRecoilState(bottomBarNavigationState);
    const [bannerShown,] = useRecoilState(customBannerShown);
    const [bannerVisibile, setBannerVisible] = useRecoilState(props.bannerVisibilityState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
    }, []);

    // return the component for the Custom Banner page
    return (
        <Banner
            style={[(!bannerVisibile && bannerShown) && ((props.marketplaceLocking !== undefined && props.marketplaceLocking) ? styles.marketplaceBannerStyle : styles.bannerStyle)]}
            visible={!bannerVisibile && bannerShown}
            actions={[
                {
                    label: props.bannerButtonLabel,
                    labelStyle: (props.marketplaceLocking !== undefined && props.marketplaceLocking) ? {
                        display: 'none'
                    } : styles.buttonLabel,
                    onPress: async () => {
                        // go to a specific URL within the application
                        if (props.bannerButtonLabelActionSource === "home/wallet") {
                            bottomBarNavigation && bottomBarNavigation!.navigate('Cards', {});
                        }
                    },
                },
                ...props.dismissing ? [{
                    labelStyle: styles.buttonLabel,
                    label: 'Dismiss',
                    onPress: () => {
                        // hide banner
                        setBannerVisible(false);
                    },
                }] : []
            ]}
            icon={({}) => (
                <Image
                    style={[styles.bannerImage, (props.marketplaceLocking !== undefined && props.marketplaceLocking) && {display: 'none'}]}
                    source={props.bannerArtSource}
                    placeholderContentFit={'contain'}
                    contentFit={'contain'}
                    cachePolicy={'memory-disk'}
                />
            )}>
            <View style={[(props.marketplaceLocking !== undefined && props.marketplaceLocking) ? {} : {top: hp(5)}]}>
                <Text
                    style={[styles.bannerDescription, (props.marketplaceLocking !== undefined && props.marketplaceLocking) && styles.marketplaceBannerDescription]}>
                    {props.bannerMessage}
                </Text>
                {
                    (props.marketplaceLocking !== undefined && props.marketplaceLocking) &&
                    <View style={Platform.OS === 'android' && {bottom: hp(0)}}>
                        <Text
                            style={styles.marketplaceButtonLabel}
                            onPress={async () => {
                                // go to a specific URL within the application
                                if (props.bannerButtonLabelActionSource === "home/wallet") {
                                    bottomBarNavigation && bottomBarNavigation!.navigate('Cards', {});
                                }
                            }}>
                            Link Now
                        </Text>
                    </View>
                }
            </View>
        </Banner>
    );
};

