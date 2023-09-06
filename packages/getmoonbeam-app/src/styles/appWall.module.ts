import {StyleSheet} from "react-native";
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from "react-native-responsive-screen";

// styles to be used within the AppWall component
export const styles = StyleSheet.create({
    titleView: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        width: wp(100),
        marginLeft: wp(10),
        bottom: hp(10)
    },
    titleViewDescription: {
        flexDirection: 'row',
        alignItems: 'flex-start'
    },
    stepTitle: {
        fontFamily: 'Saira-Medium',
        alignSelf: 'flex-start',
        fontSize: hp(4.5),
        color: '#FFFFFF'
    },
    triangleIcon: {
        marginRight: wp(5)
    },
    stepDescription: {
        fontFamily: 'Raleway-Regular',
        alignSelf: 'flex-start',
        marginLeft: wp(5),
        bottom: hp(10),
        fontSize: hp(2),
        width: wp(90),
        color: '#FFFFFF'
    },
    bottomContainerSplashView: {
        flexDirection: 'row',
        bottom: hp(35),
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center'
    },
    dropdownTextInputContentStyle: {
        height: hp(5.2),
        width: wp(87),
        fontSize: hp(1.5),
        top: hp(1.5),
        fontFamily: 'Saira-Regular',
        color: '#FFFFFF'
    },
    bottomContainerButtonView: {
        flexDirection: 'row',
        bottom: hp(12),
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: wp(10)
    },
    bottomButtonDisabled: {
        backgroundColor: '#D9D9D9',
        width: wp(30),
        height: hp(5),
        top: hp(28),
        right: wp(10),
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center'
    },
    bottomButton: {
        backgroundColor: '#F2FF5D',
        width: wp(30),
        height: hp(5),
        top: hp(28),
        right: wp(10),
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center'
    },
    bottomButtonStep1: {
        backgroundColor: '#F2FF5D',
        width: wp(30),
        height: hp(5),
        top: hp(28),
        right: wp(10),
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonText: {
        color: '#313030',
        fontFamily: 'Saira-Medium',
        fontSize: hp(2.1),
        marginTop: hp(1.3)
    },
    disclaimerView: {
        flexDirection: 'row',
        alignContent: 'space-between',
        width: wp(100),
        bottom: hp(3)
    },
    disclaimerCheckbox: {
        alignSelf: 'flex-start'
    },
    disclaimerText: {
        left: wp(2),
        fontFamily: 'Raleway-Regular',
        alignSelf: 'flex-end',
        textAlign: 'justify',
        fontSize: hp(1.6),
        width: wp(80),
        color: '#FFFFFF'
    },
    disclaimerTextHighlighted: {
        fontFamily: 'Raleway-Bold',
        textDecorationLine: 'underline',
        color: '#F2FF5D'
    },
    errorMessage: {
        width: wp(85),
        bottom: hp(9),
        marginLeft: wp(5),
        alignSelf: 'flex-start',
        fontFamily: 'Saira-Medium',
        fontSize: hp(2),
        color: '#F2FF5D'
    },
    militaryVerificationImage: {
        resizeMode: 'contain',
        height: hp(35),
        width: wp(65)
    },
    documentSelectionView: {
        zIndex: 1000,
        bottom: hp(5),
        flexDirection: 'column',
        width: wp(100),
        alignItems: 'center',
        alignContent: 'center',
        alignSelf: 'flex-start'
    },
    documentSelectionOptionTop: {
        zIndex: 2000,
        marginBottom: hp(3.5),
        marginLeft: wp(12),
        alignSelf: 'center',
        flexDirection: 'column',
        width: wp(100)
    },
    documentSelectionOptionBottom: {
        marginTop: hp(2),
        marginBottom: hp(2),
        marginLeft: wp(5),
        alignSelf: 'flex-start',
        flexDirection: 'row',
        width: wp(50)
    },
    photoUploadOptionImage: {
        height: hp(15),
        width: wp(28)
    },
    documentUploadOptionImage: {
        height: hp(15),
        width: wp(33)
    },
    captureSelectionButton: {
        backgroundColor: '#F2FF5D',
        width: wp(30),
        height: hp(4.3),
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center'
    },
    captureSelectionButtonDisabled: {
        backgroundColor: '#D9D9D9',
        width: wp(30),
        height: hp(4.3),
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center'
    },
    documentCapturingDescriptionView: {
        top: hp(3),
        left: wp(10),
        flexDirection: 'column',
        width: wp(100)
    },
    documentCapturingOptionDescription: {
        alignSelf: 'flex-start',
        fontFamily: 'Raleway-Medium',
        bottom: hp(4),
        fontSize: hp(2),
        width: wp(50),
        color: '#FFFFFF'
    },
    documentUploadOptionDescription: {
        alignSelf: 'flex-start',
        fontFamily: 'Raleway-Medium',
        right: wp(5),
        bottom: hp(2),
        fontSize: hp(2),
        width: wp(50),
        color: '#FFFFFF'
    },
    documentSelectionDivider: {
        width: wp(90),
        backgroundColor: '#D9D9D9'
    },
    documentSelectionButton: {
        backgroundColor: '#F2FF5D',
        right: wp(5),
        width: wp(30),
        height: hp(4.3),
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center'
    },
    documentSelectionButtonDisabled: {
        backgroundColor: '#D9D9D9',
        right: wp(5),
        width: wp(30),
        height: hp(4.3),
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center'
    },
    documentsDropdownPicker: {
        marginBottom: hp(3.5),
        alignSelf: 'center',
        backgroundColor: '#1c1a1f',
        borderColor: "#D9D9D9",
        width: wp(87),
        height: hp(5)
    },
    documentsDropdownContainer: {
        alignSelf: 'center',
        backgroundColor: '#1c1a1f',
        borderColor: "#D9D9D9",
        width: wp(87)
    },
    fileUploadTextInputContentStyle: {
        fontSize: hp(1),
        fontFamily: 'Saira-Regular',
        color: '#FFFFFF'
    },
    textInputContentStyle: {
        height: hp(5.2),
        width: wp(87),
        fontSize: hp(1.8),
        fontFamily: 'Saira-Regular',
        color: '#FFFFFF'
    },
    documentButtonText: {
        color: '#313030',
        fontFamily: 'Saira-Medium',
        fontSize: hp(1.8),
        marginTop: hp(1)
    },
    fileUploadedTextInput: {
        backgroundColor: '#1c1a1f',
        bottom: wp(2),
        right: wp(1),
        width: wp(50)
    },
    pictureUploadedTextInput: {
        backgroundColor: '#1c1a1f',
        bottom: wp(2),
        width: wp(50),
        right: wp(6),
    }
});
