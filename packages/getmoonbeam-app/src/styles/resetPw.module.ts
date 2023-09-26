import {StyleSheet} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';

// styles to be used within the ResetPassword component
export const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        flexGrow: 1,
        flexDirection: 'column',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center'
    },
    topContainer: {
        width: wp(100)
    },
    topTextView: {
        top: hp(3)
    },
    resetPwTitle: {
        fontSize: hp(3),
        width: wp(100),
        left: wp(6.5),
        fontFamily: 'Raleway-SemiBold',
        alignSelf: 'flex-start',
        textAlign: 'left',
        color: '#F2FF5D'
    },
    resetPwSubtitle: {
        top: hp(1.5),
        left: wp(6.5),
        fontSize: hp(2.5),
        width: wp(90),
        fontFamily: 'Raleway-Medium',
        alignSelf: 'flex-start',
        textAlign: 'left',
        color: '#FFFFFF'
    },
    textInputContentStyle: {
        width: wp(75),
        fontSize: hp(2.5),
        fontFamily: 'Saira-Regular',
        color: '#FFFFFF'
    },
    textInputFocus: {
        backgroundColor: '#1c1a1f',
        marginTop: hp(10),
        bottom: hp(8),
        alignSelf: 'flex-start',
        width: wp(90)
    },
    textInput: {
        backgroundColor: '#1c1a1f',
        marginTop: hp(10),
        bottom: hp(8),
        alignSelf: 'flex-start',
        width: wp(90)
    },
    textPasswordInputFocus: {
        backgroundColor: '#1c1a1f',
        marginTop: hp(2),
        bottom: hp(8),
        alignSelf: 'flex-start',
        width: wp(90)
    },
    textPasswordInput: {
        backgroundColor: '#1c1a1f',
        marginTop: hp(2),
        bottom: hp(8),
        alignSelf: 'flex-start',
        width: wp(90)
    },
    inputFieldsView: {
        top: hp(5),
        alignSelf: 'center'
    },
    button: {
        backgroundColor: '#F2FF5D',
        width: wp(50),
        height: hp(5),
        marginTop: hp(5),
        marginLeft: wp(25),
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
    errorMessage: {
        top: hp(2),
        width: wp(90),
        alignSelf: 'center',
        fontFamily: 'Saira-Medium',
        fontSize: hp(1.7),
        color: '#F2FF5D'
    }
});
