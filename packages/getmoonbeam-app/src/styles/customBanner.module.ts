import {StyleSheet} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';

// styles to be used within the CustomBanner component
export const styles = StyleSheet.create({
    bannerStyle: {
        backgroundColor: '#313030',
        borderTopWidth: hp(0.02),
        borderBottomWidth: hp(0.02),
        width: wp(100),
        position: 'absolute',
        bottom: 0
    },
    buttonLabel: {
        fontFamily: 'Saira-Bold',
        color: '#F2FF5D',
        marginTop: hp(2),
        marginBottom: hp(2),
        height: hp(2.3),
        fontSize: hp(1.8)
    },
    bannerImage: {
        width: wp(25),
        height: hp(10),
        left: wp(0.5)
    },
    bannerDescription: {
        fontFamily: 'Saira-Medium',
        fontSize: hp(1.7),
        color: '#FFFFFF'
    }
});
