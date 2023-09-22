import {StyleSheet} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';

// styles to be used within the Profile component
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
        width: wp(100),
        marginBottom: -hp(2),
    },
    profileContentView: {
        backgroundColor: 'transparent',
        bottom: hp(5),
        width: wp(100)
    },
    textInputNonEditable: {
        backgroundColor: '#484747',
        marginTop: hp(42),
        bottom: hp(40),
        alignSelf: 'center',
        width: wp(87)
    },
    textInput: {
        backgroundColor: '#313030',
        marginTop: hp(42),
        bottom: hp(40),
        alignSelf: 'center',
        width: wp(87)
    },
    textInputFocus: {
        backgroundColor: '#313030',
        marginTop: hp(42),
        bottom: hp(40),
        alignSelf: 'center',
        width: wp(87)
    },
    textInputContentStyle: {
        width: wp(60),
        fontSize: hp(2),
        fontFamily: 'Saira-Regular',
        color: '#FFFFFF',
    },
    titleStyle: {
        fontFamily: 'Raleway-Regular',
        color: '#FFFFFF',
        fontSize: hp(6)
    },
    avatarStyle: {
        alignSelf: 'center',
        backgroundColor: 'grey',
        top: hp(2)
    },
    avatarAccessoryStyle: {
        backgroundColor: '#313030'
    },
    userNameStyle: {
        alignSelf: 'center',
        fontFamily: 'Saira-Medium',
        color: '#F2FF5D',
        textAlign: 'center',
        fontSize: hp(3),
        top: hp(2.2),
        marginBottom: hp(15),
        width: wp(80)
    },
    pickerView: {
        zIndex: 2000,
        bottom: hp(36.5)
    },
    dropdownContainerNonEditable: {
        backgroundColor: '#484747',
        borderColor: "#D9D9D9",
        alignSelf: 'center',
        marginTop: hp(3),
        width: wp(87),
        height: hp(10)
    },
    dropdownContainer: {
        backgroundColor: '#313030',
        borderColor: "#D9D9D9",
        alignSelf: 'center',
        marginTop: hp(3),
        width: wp(87),
        height: hp(10)
    },
    dropdownPickerNonEditable: {
        backgroundColor: '#484747',
        borderColor: "#D9D9D9",
        alignSelf: 'center',
        marginTop: hp(3),
        width: wp(87),
        height: hp(7)
    },
    dropdownPicker: {
        backgroundColor: '#313030',
        borderColor: "#D9D9D9",
        alignSelf: 'center',
        marginTop: hp(3),
        width: wp(87),
        height: hp(7),
        borderRadius: 4
    },
    inputColumnViewAddress: {
        bottom: hp(30),
        flexDirection: 'row',
        alignSelf: 'center'
    },
    textInputNarrowContentStyle: {
        width: wp(25),
        fontSize: hp(2),
        fontFamily: 'Saira-Regular',
        color: '#FFFFFF',
    },
    textInputNarrow: {
        backgroundColor: '#313030',
        bottom: hp(7),
        alignSelf: 'center',
        width: wp(40)
    },
    textInputNarrowNonEditable: {
        backgroundColor: '#484747',
        bottom: hp(7),
        alignSelf: 'center',
        width: wp(40)
    },
    textInputNarrowFocus: {
        backgroundColor: '#313030',
        bottom: hp(7),
        alignSelf: 'center',
        width: wp(40)
    },
    editButton: {
        backgroundColor: '#F2FF5D',
        width: wp(70),
        height: hp(5),
        bottom: hp(10),
        left: wp(15),
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
        width: wp(85),
        bottom: hp(7),
        fontFamily: 'Saira-Medium',
        textAlign: 'center',
        alignSelf: 'center',
        fontSize: hp(2),
        color: '#F2FF5D'
    },
    bottomSheet: {
        backgroundColor: '#5B5A5A'
    }
});
