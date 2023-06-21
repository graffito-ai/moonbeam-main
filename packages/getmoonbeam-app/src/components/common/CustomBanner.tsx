import React, {useEffect} from 'react';
import {Image, ImageSourcePropType} from "react-native";
import {Banner, Text} from 'react-native-paper';
import {RecoilState, useRecoilState} from "recoil";
import {styles} from '../../styles/customBanner.module';
import {customBannerShown} from "../../recoil/AppDrawerAtom";

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
    const [bannerShown, ] = useRecoilState(customBannerShown);
    // constants used to keep track of local component state
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
            style={{backgroundColor: '#5B5A5A'}}
            visible={!bannerVisibile && bannerShown}
            actions={[
                {
                    label: props.bannerButtonLabel,
                    labelStyle: styles.buttonLabel,
                    onPress: () => {
                        // hide banner accordingly or go to a specific URL within the application
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
                    source={props.bannerArtSource}
                    style={styles.bannerImage}
                />
            )}>
            <Text style={styles.bannerDescription}>
                {props.bannerMessage}
            </Text>
        </Banner>
    );
};

