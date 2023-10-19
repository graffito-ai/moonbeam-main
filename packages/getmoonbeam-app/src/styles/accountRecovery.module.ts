import {StyleSheet} from "react-native";
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';

// styles to be used within the Account Recovery component
export const styles = StyleSheet.create({
    topContainer: {
        flex: 0.3,
        backgroundColor: 'transparent',
        width: wp(100)
    },
    greetingTitle: {
        fontFamily: 'Saira-Medium',
        alignSelf: 'flex-start',
        top: hp(2),
        marginLeft: wp(5),
        marginTop: hp(4),
        fontSize: hp(5),
        color: '#FFFFFF'
    },
    gettingSubtitle: {
        fontFamily: 'Saira-Medium',
        alignSelf: 'flex-start',
        top: hp(0.05),
        marginLeft: wp(5),
        bottom: hp(2),
        fontSize: hp(2.5),
        color: '#FFFFFF'
    },
    gettingSubtitleHighlighted: {
        fontFamily: 'Saira-SemiBold',
        alignSelf: 'flex-start',
        fontSize: hp(2.8),
        color: '#F2FF5D'
    },
    contentTitle: {
        fontFamily: 'Saira-Medium',
        alignSelf: 'flex-start',
        marginLeft: wp(5),
        marginBottom: hp(2),
        top: hp(2),
        fontSize: hp(3.5),
        width: wp(90),
        color: '#FFFFFF'
    },
    contentDescription: {
        fontFamily: 'Raleway-Regular',
        alignSelf: 'flex-start',
        marginLeft: wp(5.5),
        marginTop: hp(1.5),
        fontSize: hp(2),
        width: wp(90),
        color: '#FFFFFF'
    },
    bottomContainer: {
        backgroundColor: '#313030',
        flex: 0.7,
        width: wp(100),
        height: hp(100),
        flexDirection: 'column'
    },
    textInputContentStyle: {
        width: wp(75),
        fontSize: hp(2),
        fontFamily: 'Saira-Regular',
        color: '#FFFFFF'
    },
    textInput: {
        backgroundColor: '#1c1a1f',
        marginTop: hp(2),
        alignSelf: 'flex-start',
        marginLeft: hp(3),
        width: wp(87)
    },
    textInputFocus: {
        backgroundColor: '#1c1a1f',
        marginTop: hp(2),
        alignSelf: 'flex-start',
        marginLeft: hp(3),
        width: wp(87)
    },
    textPasswordInputFocus: {
        backgroundColor: '#1c1a1f',
        marginTop: hp(2),
        alignSelf: 'flex-start',
        marginLeft: hp(3),
        width: wp(87)
    },
    textPasswordInput: {
        backgroundColor: '#1c1a1f',
        marginTop: hp(2),
        alignSelf: 'flex-start',
        marginLeft: hp(3),
        width: wp(87)
    },
    button: {
        backgroundColor: '#F2FF5D',
        width: wp(30),
        height: hp(5),
        marginTop: hp(20),
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'center'
    },
    buttonText: {
        color: '#313030',
        fontFamily: 'Saira-Medium',
        fontSize: hp(2.3),
        marginTop: hp(1)
    },
    bottomAuthenticationText: {
        fontFamily: 'Saira-Regular',
        alignSelf: 'center',
        top: hp(3),
        fontSize: hp(2.3),
        color: '#FFFFFF'
    },
    bottomAuthenticationTextButton: {
        fontFamily: 'Saira-SemiBold',
        alignSelf: 'center',
        fontSize: hp(2.3),
        color: '#F2FF5D'
    },
    codeInputColumnView: {
        alignSelf: 'center',
        marginLeft: wp(8),
        marginTop: hp(10),
        flexDirection: 'row',
        width: wp(100),
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
        marginRight: wp(1.7),
        width: wp(14),
    },
    textInputCodeFocus: {
        backgroundColor: '#1c1a1f',
        marginTop: hp(2),
        bottom: hp(7),
        alignSelf: 'flex-start',
        marginRight: wp(1.7),
        width: wp(14),
    },
    resendCodeView: {
        flexDirection: 'row',
        width: wp(50),
        bottom: hp(5),
        alignSelf: 'flex-start',
        marginLeft: wp(4)
    },
    resendCode: {
        width: wp(50),
        alignSelf: 'flex-start',
        fontFamily: 'Changa-Medium',
        fontSize: hp(2.3),
        textDecorationLine: 'underline',
        color: '#F2FF5D'
    },
    resendCodeDisabled: {
        width: wp(50),
        alignSelf: 'flex-start',
        fontFamily: 'Changa-Medium',
        fontSize: hp(2.3),
        textDecorationLine: 'underline',
        color: '#D9D9D9'
    },
    countdownTimer: {
        width: wp(50),
        alignSelf: 'flex-start',
        fontFamily: 'Changa-Medium',
        fontSize: hp(2.5),
        color: '#D9D9D9'
    },
    errorMessage: {
        width: wp(90),
        marginTop: hp(1.5),
        marginLeft: wp(6),
        alignSelf: 'flex-start',
        fontFamily: 'Saira-Medium',
        fontSize: hp(1.8),
        color: '#F2FF5D'
    }
});
