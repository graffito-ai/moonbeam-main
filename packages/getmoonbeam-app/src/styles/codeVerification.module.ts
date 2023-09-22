import {StyleSheet} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";

// styles to be used within the CodeVerification component
export const styles = StyleSheet.create({
    topContainer: {
        flex: 1,
        backgroundColor: 'transparent',
        width: wp(100)
    },
    greetingTitle: {
        fontFamily: 'Saira-Medium',
        alignSelf: 'flex-start',
        marginLeft: wp(5),
        fontSize: hp(4),
        color: '#FFFFFF'
    },
    gettingSubtitle: {
        fontFamily: 'Saira-Medium',
        alignSelf: 'flex-start',
        width: wp(90),
        marginLeft: wp(5),
        fontSize: hp(2),
        color: '#FFFFFF'
    },
    gettingSubtitleHighlighted: {
        fontFamily: 'Saira-SemiBold',
        alignSelf: 'flex-start',
        fontSize: wp(4.5),
        color: '#F2FF5D'
    },
    greetingImage: {
        height: hp(15),
        width: wp(30),
        alignSelf: 'center',
        top: hp(5)
    },
    button: {
        backgroundColor: '#F2FF5D',
        width: wp(35),
        height: hp(5),
        marginTop: hp(15),
        alignSelf: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonText: {
        color: '#313030',
        fontFamily: 'Saira-Medium',
        fontSize: hp(2.3),
        marginTop: hp(1)
    },
    codeInputColumnView: {
        bottom: -hp(8),
        left: wp(5),
        alignSelf: 'center',
        alignItems: 'center',
        alignContent: 'center',
        flexDirection: 'row',
        width: '100%',
    },
    textInputCodeContentStyle: {
        fontSize: hp(4),
        width: wp(15),
        marginLeft: wp(1.2),
        fontFamily: 'Saira-Regular',
        alignSelf: 'center',
        textAlign: 'center',
        color: '#FFFFFF'
    },
    textInputCode: {
        backgroundColor: '#1c1a1f',
        marginTop: hp(2),
        bottom: hp(7),
        alignSelf: 'flex-start',
        marginRight: wp(1.5),
        width: wp(14),
    },
    textInputCodeFocus: {
        backgroundColor: '#1c1a1f',
        marginTop: hp(2),
        bottom: hp(7),
        alignSelf: 'flex-start',
        marginRight: wp(1.5),
        width: wp(14),
    },
    resendCodeView: {
        flexDirection: 'row',
        width: wp(85),
        bottom: -hp(3),
        left: wp(5),
        alignSelf: 'flex-start'
    },
    resendCode: {
        width: wp(85),
        alignSelf: 'flex-start',
        fontFamily: 'Changa-Medium',
        fontSize: hp(2),
        textDecorationLine: 'underline',
        color: '#F2FF5D'
    },
    resendCodeDisabled: {
        width: wp(85),
        alignSelf: 'flex-start',
        fontFamily: 'Changa-Medium',
        fontSize: hp(2),
        textDecorationLine: 'underline',
        color: '#D9D9D9'
    },
    countdownTimer: {
        width: wp(85),
        alignSelf: 'flex-start',
        fontFamily: 'Changa-Medium',
        fontSize: hp(2),
        color: '#D9D9D9'
    },
    errorMessage: {
        width: wp(85),
        top: hp(2),
        marginLeft: wp(5.2),
        alignSelf: 'flex-start',
        fontFamily: 'Saira-Medium',
        fontSize: hp(1.7),
        color: '#F2FF5D'
    }
});
