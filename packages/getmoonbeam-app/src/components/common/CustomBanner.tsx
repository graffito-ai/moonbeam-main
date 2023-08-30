import React, {useEffect} from 'react';
import {Image, ImageSourcePropType} from "react-native";
import {Banner, Text} from 'react-native-paper';
import {RecoilState, useRecoilState} from "recoil";
import {styles} from '../../styles/customBanner.module';
import {customBannerShown} from "../../recoil/AppDrawerAtom";
import {deviceTypeState} from "../../recoil/RootAtom";
import * as Device from "expo-device";
import {DeviceType} from "expo-device";
import {bottomBarNavigationState} from "../../recoil/HomeAtom";

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
    dismissing: boolean
}) => {
    // constants used to keep track of shared states
    const [bottomBarNavigation, ] = useRecoilState(bottomBarNavigationState);
    const [bannerShown,] = useRecoilState(customBannerShown);
    const [deviceType, setDeviceType] = useRecoilState(deviceTypeState);
    const [bannerVisibile, setBannerVisible] = useRecoilState(props.bannerVisibilityState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // check and set the type of device, to be used throughout the app
        Device.getDeviceTypeAsync().then(deviceType => {
            setDeviceType(deviceType);
        })
    }, [deviceType]);

    // return the component for the Custom Banner page
    return (
        <Banner
            style={!bannerVisibile && bannerShown && styles.bannerStyle}
            visible={!bannerVisibile && bannerShown}
            actions={[
                {
                    label: props.bannerButtonLabel,
                    labelStyle: deviceType === DeviceType.TABLET ? styles.buttonLabelTablet : styles.buttonLabel,
                    onPress: async () => {
                        // go to a specific URL within the application
                        if (props.bannerButtonLabelActionSource === "home/wallet") {
                            bottomBarNavigation && bottomBarNavigation!.navigate('Cards', {});
                        }
                    },
                },
                ...props.dismissing ? [{
                    labelStyle: deviceType === DeviceType.TABLET ? styles.buttonLabelTablet : styles.buttonLabel,
                    label: 'Dismiss',
                    onPress: () => {
                        // hide banner
                        setBannerVisible(false);
                    },
                }] : []
            ]}
            icon={({}) => (
                <Image
                    source={props.bannerArtSource}
                    style={deviceType === DeviceType.TABLET ? styles.bannerImageTablet : styles.bannerImage}
                />
            )}>
            <Text style={deviceType === DeviceType.TABLET ? styles.bannerDescriptionTablet : styles.bannerDescription}>
                {props.bannerMessage}
            </Text>
        </Banner>
    );
};

