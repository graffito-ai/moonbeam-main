import {StyleSheet} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";

// styles to be used within the Biometrics pop-up component
export const styles = StyleSheet.create({
    dialogStyle: {
        backgroundColor: '#5B5A5A',
        borderRadius: wp(5),
        height: hp(90),
        width: wp(95),
        alignSelf: 'center'
    },
    topDailySummaryImage: {
        top: hp(1),
        height: hp(25),
        width: wp(53),
        alignSelf: 'center'
    },
    dialogTitle: {
        color: '#F2FF5D',
        fontFamily: 'Raleway-Bold',
        width: wp(75),
        fontSize: hp(2.25),
        alignSelf: 'center',
        textAlign: 'center'
    },
    dialogActionButtons: {
        bottom: hp(1),
        alignSelf: 'center',
        flexDirection: 'column',
        alignItems: 'center',
        alignContent: 'center'
    },
    redeemButton: {
        backgroundColor: '#F2FF5D',
        height: hp(5.5),
        width: wp(60),
        alignSelf: 'center'
    },
    redeemButtonText: {
        color: '#313030',
        fontFamily: 'Saira-Medium',
        fontSize: hp(2.2),
        textAlign: 'center',
        alignSelf: 'center'
    },
    earningsItemView: {
        backgroundColor: '#313030',
        height: hp(10),
        width: wp(90),
        marginTop: hp(1),
        left: wp(2.5),
        borderRadius: hp(2)
    },
    earningsItemTitle: {
        lineHeight: hp(2.55),
        left: wp(8),
        fontSize: hp(2),
        color: '#FFFFFF',
        fontFamily: 'Saira-ExtraBold',
        width: wp(30)
    },
    earningsDescription: {
        top: hp(0.50),
        lineHeight: hp(2.10),
        left: wp(8),
        fontSize: hp(1.8),
        color: '#FFFFFF',
        fontFamily: 'Saira-Regular',
        width: wp(80)
    },
    earningsBrandLogo: {
        height: hp(6),
        width: hp(6),
        left: wp(5)
    },
    earningsRightView: {
        flexDirection: 'row'
    },
    earningsRightDetailsView: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        flexDirection: 'column'
    },
    earningsRightDetailTop: {
        fontSize: hp(1.8),
        fontFamily: 'Changa-Bold',
        color: '#F2FF5D',
    },
    earningsRightDetailBottom: {
        fontSize: hp(1.6),
        fontFamily: 'Raleway-Medium',
        color: '#FFFFFF'
    },
    earningsList: {
        height: hp(42),
        width: wp(95),
        alignSelf: 'center',
        top: hp(1)
    }
});
