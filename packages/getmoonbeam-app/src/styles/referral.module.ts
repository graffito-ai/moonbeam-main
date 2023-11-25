import {StyleSheet} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';

// styles to be used within the Referral component
export const styles = StyleSheet.create({
    mainReferralView: {
        backgroundColor: '#1e1e21',
        flex: 1,
        flexDirection: 'column'
    },
    closeIcon: {
        alignSelf: 'flex-start',
        marginTop: hp(6.5),
        left: wp(5)
    },
    contentView: {
        height: hp(85),
        flexDirection: 'column'
    },
    referralMainImage: {
        alignSelf: 'center',
        height: hp(40),
        width: wp(70),
        bottom: hp(5)
    },
    referralContentMessageView: {
        flexDirection: 'column',
        alignContent: 'center',
        alignItems: 'center',
        bottom: hp(7.5)
    },
    referralContentMessageTitle: {
        color: '#F2FF5D',
        fontFamily: 'Raleway-SemiBold',
        fontSize: hp(3.5),
        width: wp(80),
        textAlign: 'center'
    },
    referralContentMessageTitleValidity: {
        color: '#FFFFFF',
        fontFamily: 'Saira-Bold',
        fontSize: hp(1.8),
        width: wp(95),
        top: hp(2),
        marginBottom: hp(2),
        textAlign: 'center'
    },
    referralContentMessageSubtitle: {
        color: '#FFFFFF',
        fontFamily: 'Raleway-Regular',
        fontSize: hp(2.1),
        width: wp(95),
        top: hp(2),
        textAlign: 'center'
    },
    referralContentMessageSubtitleHighlighted: {
        color: '#F2FF5D',
        textDecorationLine: 'underline',
        fontFamily: 'Saira-Bold',
        fontSize: hp(2.1),
        width: wp(95),
        top: hp(2),
        textAlign: 'center'
    }
});
