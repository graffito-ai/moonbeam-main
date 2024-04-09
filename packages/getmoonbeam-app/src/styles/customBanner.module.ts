import {StyleSheet} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';

// styles to be used within the CustomBanner component
export const styles = StyleSheet.create({
    bannerStyle: {
        backgroundColor: '#313030',
        borderTopWidth: hp(0.02),
        borderBottomWidth: hp(0.02),
        width: wp(100),
        height: hp(30),
        position: 'absolute',
        bottom: 0,
    },
    marketplaceBannerStyle: {
        backgroundColor: '#262626',
        borderTopWidth: hp(0.02),
        borderBottomWidth: hp(0.02),
        width: wp(100),
        height: hp(15)
    },
    buttonLabel: {
        fontFamily: 'Saira-Bold',
        color: '#F2FF5D',
        fontSize: hp(1.9),
        top: hp(1.5),
        lineHeight: hp(3),
        textDecorationLine: 'underline'
    },
    marketplaceButtonLabel: {
        textDecorationLine: 'underline',
        fontFamily: 'Saira-Bold',
        color: '#F2FF5D',
        fontSize: hp(1.9),
        lineHeight: hp(3),
        left: hp(1),
        bottom: hp(1)
    },
    bannerImage: {
        width: wp(25),
        height: hp(15),
        left: wp(0.5),
        top: hp(2)
    },
    marketplaceBannerDescription: {
        width: wp(85),
        height: hp(14),
        textAlign: 'left',
        fontFamily: 'Saira-Medium',
        fontSize: hp(1.7),
        color: '#FFFFFF',
        marginTop: -hp(5)
    },
    bannerDescription: {
        left: wp(2),
        top: hp(3.5),
        height: hp(12),
        width: wp(64),
        textAlign: 'left',
        fontFamily: 'Saira-Medium',
        fontSize: hp(1.7),
        color: '#FFFFFF'
    }
});
