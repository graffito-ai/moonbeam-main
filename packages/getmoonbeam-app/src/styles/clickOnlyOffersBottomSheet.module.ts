import {StyleSheet} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';

// styles to be used within the ClickOnlyOffersBottomSheet component
export const styles = StyleSheet.create({
    unlinkedContentView: {
        top: hp(7),
        width: wp(100),
        height: hp(27),
        flexDirection: 'column'
    },
    contentView: {
        top: hp(2),
        width: wp(100),
        height: hp(27),
        flexDirection: 'column'
    },
    contentDisclaimer: {
        left: wp(9),
        color: '#FFFFFF',
        fontFamily: 'Raleway-Regular',
        top: hp(0.5),
        fontSize: hp(2),
        alignSelf: 'flex-start',
        width: wp(80),
        textAlign: 'left'
    },
    contentDisclaimerNumber: {
        left: wp(9),
        color: '#F2FF5D',
        fontFamily: 'Saira-Medium',
        top: hp(0.5),
        fontSize: hp(2.7),
        alignSelf: 'flex-start',
        width: wp(90),
        textAlign: 'left'
    },
    topTitleView: {
        width: wp(100),
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    unlinkedTopTitle: {
        top: hp(3),
        left: wp(5),
        color: '#FFFFFF',
        fontFamily: 'Saira-Bold',
        fontSize: hp(2.5),
        width: wp(75),
        textAlign: 'left'
    },
    topTitle: {
        left: wp(5),
        color: '#FFFFFF',
        fontFamily: 'Saira-Bold',
        fontSize: hp(2.5),
        width: wp(60),
        textAlign: 'left'
    },
    brandLogoBackground: {
        left: wp(5),
        top: hp(1),
        backgroundColor: '#FFFFFF',
        width: wp(18),
        height: wp(18),
        alignSelf: 'flex-start',
        borderColor: 'transparent',
        borderWidth: hp(0.2),
        borderRadius: 70
    },
    unlinkedBrandLogoBackground: {
        left: wp(5),
        top: hp(1),
        backgroundColor: 'transparent',
        width: wp(18),
        height: wp(18),
        alignSelf: 'flex-start',
        borderColor: 'transparent',
        borderWidth: hp(0.2),
        borderRadius: 70
    },
    unlinkedBrandLogo: {
        alignSelf: 'center',
        width: wp(30),
        height: wp(30),
    },
    brandLogo: {
        alignSelf: 'center',
        width: wp(17),
        height: wp(17),
        borderRadius: 70
    },
    divider: {
        top: hp(2),
        marginBottom: hp(2),
        backgroundColor: '#303030',
        width: wp(90),
        left: wp(10)
    },
    continueButtonContentStyle: {
        color: '#313030',
        fontFamily: 'Saira-Medium',
        fontSize: hp(2.3),
        marginTop: hp(1),
        alignItems: 'center',
        alignSelf: 'center'
    },
    unlinkedContinueButton: {
        marginTop: hp(3.5),
        alignSelf: 'center',
        backgroundColor: '#F2FF5D',
        width: wp(30),
        height: hp(5.5),
        borderRadius: 0
    },
    continueButton: {
        marginTop: hp(5),
        alignSelf: 'center',
        backgroundColor: '#F2FF5D',
        width: wp(30),
        height: hp(5.5),
        borderRadius: 0
    },
});
