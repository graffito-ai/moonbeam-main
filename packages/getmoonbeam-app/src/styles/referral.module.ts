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
        left: wp(5),
        backgroundColor: '#2e2e33',
        shadowColor: 'black',
        shadowOffset: {width: -2, height: 5},
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 15,
        borderRadius: 10
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
        color: '#FFFFFF',
        fontFamily: 'Raleway-Bold',
        fontSize: hp(3.5),
        width: wp(80),
        textAlign: 'center'
    },
    referralContentMessageTitleValidity: {
        color: '#FFFFFF',
        fontFamily: 'Saira-Medium',
        fontSize: hp(1.8),
        width: wp(95),
        top: hp(2),
        marginBottom: hp(2),
        textAlign: 'center'
    },
    referralContentMessageSubtitle: {
        color: '#a4a4a4',
        fontFamily: 'Raleway-Regular',
        fontSize: hp(2.1),
        width: wp(95),
        top: hp(2),
        textAlign: 'center'
    },
    referralContentMessageSubtitleHighlighted: {
        color: '#F2FF5D',
        fontFamily: 'Saira-Medium',
        fontSize: hp(2.1),
        width: wp(95),
        top: hp(2),
        textAlign: 'center',
        alignSelf: 'center'
    },
    referralCodeView: {
        marginTop: -hp(5),
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: wp(100),
        alignSelf: 'center',
        alignItems: 'center',
        alignContent: 'center'
    },
    referralCodeInnerView: {
        alignSelf: 'center',
        backgroundColor: '#313030',
        flexDirection: 'row',
        width: wp(80),
        height: hp(8),
        borderWidth: hp(0.05),
        borderColor: '#F2FF5D',
        borderStyle: 'dashed'
    },
    referralCode: {
        color: '#F2FF5D',
        fontFamily: 'Saira-Medium',
        fontSize: hp(2.1),
        width: wp(60),
        top: hp(0.75),
        left: wp(3),
        textAlign: 'center'
    },
    referralCodeIcon: {
        top: hp(1),
        paddingLeft: wp(4)
    },
    shareButton: {
        backgroundColor: '#F2FF5D',
        width: wp(75),
        height: hp(5),
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: hp(4),
        marginBottom: hp(0.5)
    },
    shareButtonText: {
        color: '#1e1e21',
        fontFamily: 'Saira-Medium',
        fontSize: hp(2.3),
        marginTop: hp(1.3),
        left: wp(2)
    }
});
