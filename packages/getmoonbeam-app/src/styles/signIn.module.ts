import {StyleSheet} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';

// styles to be used within the SignIn component
export const styles = StyleSheet.create({
    topContainer: {
        flex: 0.3,
        backgroundColor: 'transparent',
        width: wp(100)
    },
    topContainerImage: {
        alignSelf: 'flex-start',
        marginLeft: wp(6),
        bottom: hp(16),
        height: hp(50),
        width: wp(75)
    },
    bottomContainer: {
        backgroundColor: '#313030',
        flex: 0.7,
        width: wp(100),
        height: hp(100),
        flexDirection: 'column'
    },
    greetingTitle: {
        fontFamily: 'Saira-Medium',
        alignSelf: 'flex-start',
        marginLeft: wp(5),
        marginTop: hp(4),
        fontSize: hp(5.5),
        color: '#FFFFFF'
    },
    gettingSubtitle: {
        fontFamily: 'Saira-Medium',
        alignSelf: 'flex-start',
        marginLeft: wp(5),
        bottom: hp(2),
        fontSize: hp(2.8),
        color: '#FFFFFF'
    },
    gettingSubtitleHighlighted: {
        fontFamily: 'Saira-SemiBold',
        alignSelf: 'flex-start',
        fontSize: hp(2.8),
        color: '#F2FF5D'
    },
    bottomTitle: {
        fontFamily: 'Saira-Medium',
        alignSelf: 'flex-start',
        marginLeft: wp(5),
        marginBottom: hp(2),
        top: hp(2),
        fontSize: hp(4.2),
        color: '#FFFFFF'
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
        width: wp(87),
    },
    textInputFocus: {
        backgroundColor: '#1c1a1f',
        marginTop: hp(2),
        alignSelf: 'flex-start',
        marginLeft: hp(3),
        width: wp(87),
    },
    errorMessage: {
        width: wp(87),
        marginLeft: hp(3),
        fontFamily: 'Saira-Medium',
        fontSize: hp(2),
        color: '#F2FF5D'
    },
    forgotPasswordButton: {
        alignSelf: 'flex-end',
        fontFamily: 'Raleway-SemiBold',
        fontSize: hp(2),
        color: '#FFFFFF',
        textDecorationLine: 'underline'
    },
    forgotPasswordView: {
        marginTop: '3%',
        marginRight: wp(8.5),
    },
    loginButtonContentStyle: {
        color: '#313030',
        fontFamily: 'Saira-Medium',
        fontSize: hp(2.3),
        marginTop: hp(1),
        alignItems: 'center',
        alignSelf: 'center'
    },
    logInButton: {
        marginTop: hp(5),
        alignSelf: 'center',
        backgroundColor: '#F2FF5D',
        width: wp(30),
        height: hp(5.5),
        borderRadius: 0
    },
    loginFooter: {
        marginTop: hp(1),
        alignSelf: 'center',
        fontFamily: 'Saira-Regular',
        fontSize: hp(2.2),
        color: '#FFFFFF'
    },
    loginFooterButton: {
        fontFamily: 'Saira-SemiBold',
        fontSize: hp(2.2),
        color: '#F2FF5D',
    },
    loginLogo: {
        alignSelf: 'center',
        height: hp(6),
        width: wp(20)
    }
});
