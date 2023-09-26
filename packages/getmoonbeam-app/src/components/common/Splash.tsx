import React, {useEffect} from 'react';
import {Image, ImageSourcePropType, SafeAreaView, Text, View} from "react-native";
import {styles} from '../../styles/splashScreen.module';
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {Icon} from "@rneui/base";
import {useRecoilState} from "recoil";
import {deferToLoginState, mainRootNavigationState} from "../../recoil/AuthAtom";

/**
 * Splash component. This component will be used as a confirmation and/or error message screen
 * by various parent components for a better UI/UX experience.
 *
 * @param props component properties to be passed in.
 * @constructor constructor for the component.
 */
export const SplashScreen = (props: {
    splashTitle: string,
    splashDescription: string,
    splashButtonText: string,
    splashArtSource: ImageSourcePropType,
    splashDismissButton?: boolean
}) => {
    // constants used to keep track of shared states
    const [mainRootNavigation,] = useRecoilState(mainRootNavigationState);
    const [, setDeferToLogin] = useRecoilState(deferToLoginState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
    }, []);

    // return the component for the Splash page
    return (
        <SafeAreaView style={styles.splashScreenView}>
            {
                props.splashDismissButton !== null && props.splashDismissButton !== undefined && props.splashDismissButton &&
                <View style={{width: wp(100)}}>
                    <Icon
                        name={'close'}
                        size={hp(4.5)}
                        color={'#FFFFFF'}
                        style={styles.loginButton}
                        onPress={async () => {
                            // go to the Login page
                            setDeferToLogin(true);
                            mainRootNavigation && mainRootNavigation!.navigate('AppOverview', {});
                        }}
                    />
                </View>
            }
            <Image
                style={[styles.splashArt,
                    props.splashDismissButton !== null && props.splashDismissButton !== undefined &&
                    props.splashDismissButton && {bottom: hp(5)}]}
                resizeMethod={'scale'}
                resizeMode={'contain'}
                source={props.splashArtSource}
            />
            <View style={[styles.splashContentView,
                props.splashDismissButton !== null && props.splashDismissButton !== undefined &&
                props.splashDismissButton && {bottom: hp(15)}]}>
                <Text style={styles.splashTitle}>{props.splashTitle}</Text>
                <Text style={styles.splashDescription}>{props.splashDescription}</Text>
            </View>
        </SafeAreaView>
    );
};

