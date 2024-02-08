import {StyleSheet} from "react-native";
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';

// styles to be used within the Registration component
export const styles = StyleSheet.create({
    duplicateEmailImage: {
        height: hp(25),
        width: wp(75),
        alignSelf: 'center'
    },
    additionalRegistrationBottomInputsView: {
        marginTop: hp(9),
        width: wp(87)
    },
    titleView: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        width: '100%',
        marginLeft: wp(5),
        bottom: hp(10)
    },
    titleViewDescription: {
        flexDirection: 'row',
        alignItems: 'flex-start'
    },
    inputColumnView: {
        flexDirection: 'row',
        width: wp(100),
    },
    inputColumnViewAddress: {
        marginTop: hp(1),
        flexDirection: 'row',
        width: '100%',
    },
    codeInputColumnView: {
        flexDirection: 'row',
        width: wp(100),
        left: wp(3.5)
    },
    resendCodeView: {
        flexDirection: 'row',
        width: wp(30),
        bottom: hp(5),
        left: wp(3.5)
    },
    resendCode: {
        width: wp(80),
        alignSelf: 'flex-start',
        fontFamily: 'Changa-Medium',
        fontSize: hp(2.3),
        textDecorationLine: 'underline',
        color: '#F2FF5D'
    },
    resendCodeDisabled: {
        width: wp(80),
        alignSelf: 'flex-start',
        fontFamily: 'Changa-Medium',
        fontSize: hp(2.3),
        textDecorationLine: 'underline',
        color: '#D9D9D9'
    },
    countdownTimer: {
        width: wp(30),
        alignSelf: 'flex-start',
        fontFamily: 'Changa-Medium',
        fontSize: 25,
        color: '#D9D9D9'
    },
    stepTitle: {
        fontFamily: 'Saira-Medium',
        alignSelf: 'flex-start',
        fontSize: hp(3.75),
        color: '#FFFFFF'
    },
    stepDescription: {
        fontFamily: 'Raleway-Regular',
        alignSelf: 'flex-start',
        marginLeft: wp(6),
        bottom: hp(10),
        fontSize: hp(2),
        width: wp(85),
        color: '#FFFFFF'
    },
    stepDescriptionUnderline: {
        fontFamily: 'Raleway-Bold',
        alignSelf: 'flex-start',
        textDecorationLine: 'underline',
        marginLeft: wp(6),
        bottom: hp(10),
        fontSize: hp(2),
        width: wp(85),
        color: '#F2FF5D'
    },
    permissionsStepTitle: {
        fontFamily: 'Raleway-Bold',
        alignSelf: 'center',
        textAlign: 'center',
        top: hp(3),
        fontSize: hp(2.3),
        width: wp(90),
        color: '#F2FF5D'
    },
    permissionsStepDescription: {
        fontFamily: 'Raleway-Regular',
        alignSelf: 'center',
        textAlign: 'center',
        top: hp(3),
        fontSize: hp(2),
        width: wp(80),
        color: '#FFFFFF'
    },
    triangleIcon: {
        marginRight: wp(5)
    },
    fileUploadTextInputContentStyle: {
        fontSize: hp(1.25),
        width: wp(15),
        fontFamily: 'Saira-Regular',
        color: '#FFFFFF',
        textAlign: 'center'
    },
    textInputNarrowContentStyle: {
        fontSize: hp(1.8),
        height: hp(6),
        width: wp(40),
        fontFamily: 'Saira-Regular',
        color: '#FFFFFF'
    },
    textInputNarrow: {
        backgroundColor: '#1c1a1f',
        bottom: hp(7.25),
        alignSelf: 'flex-start',
        height: hp(5),
        width: wp(40),
        marginLeft: wp(5),
    },
    textInputNarrowFocus: {
        backgroundColor: '#1c1a1f',
        bottom: hp(7.25),
        alignSelf: 'flex-start',
        height: hp(5),
        width: wp(40),
        marginLeft: wp(5),
    },
    textInputCodeContentStyle: {
        fontSize: hp(4),
        height: hp(6),
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
    fileUploadedTextInput: {
        backgroundColor: '#1c1a1f',
        bottom: wp(2),
        right: wp(5),
        width: wp(50)
    },
    pictureUploadedTextInput: {
        backgroundColor: '#1c1a1f',
        bottom: wp(2),
        width: wp(50)
    },
    textInputAddressLine: {
        zIndex: 2000,
        backgroundColor: '#1c1a1f',
        alignSelf: 'flex-start',
        height: hp(5),
        width: wp(87),
    },
    textInputFocusAddressLine: {
        zIndex: 2000,
        backgroundColor: '#1c1a1f',
        alignSelf: 'flex-start',
        height: hp(5),
        width: wp(87),
    },
    textInput: {
        backgroundColor: '#1c1a1f',
        marginTop: hp(2),
        bottom: hp(8),
        alignSelf: 'flex-start',
        marginLeft: wp(5),
        height: hp(5),
        width: wp(87),
    },
    textInputFocus: {
        backgroundColor: '#1c1a1f',
        marginTop: hp(2),
        bottom: hp(8),
        alignSelf: 'flex-start',
        marginLeft: wp(5),
        height: hp(5),
        width: wp(87),
    },
    textInputContentStyle: {
        height: hp(6),
        width: wp(75),
        fontSize: hp(1.8),
        fontFamily: 'Saira-Regular',
        color: '#FFFFFF'
    },
    dropdownTextInputContentStyle: {
        height: hp(6),
        width: wp(87),
        fontSize: hp(1.8),
        top: hp(1.5),
        fontFamily: 'Saira-Regular',
        color: '#FFFFFF'
    },
    errorMessage: {
        width: wp(90),
        bottom: hp(8),
        marginLeft: wp(5.5),
        alignSelf: 'flex-start',
        fontFamily: 'Saira-Medium',
        fontSize: hp(2),
        color: '#F2FF5D'
    },
    disclaimerView: {
        left: wp(5),
        marginTop: hp(2),
        flexDirection: 'row',
        alignContent: 'space-between',
        width: wp(100)
    },
    disclaimerCheckbox: {
        bottom: hp(2),
        alignSelf: 'flex-start'
    },
    disclaimerText: {
        bottom: hp(2),
        left: wp(2),
        textAlign: 'justify',
        fontFamily: 'Raleway-Regular',
        alignSelf: 'flex-end',
        fontSize: hp(1.5),
        width: wp(80),
        color: '#FFFFFF'
    },
    disclaimerTextHighlighted: {
        fontFamily: 'Raleway-Bold',
        textDecorationLine: 'underline',
        color: '#F2FF5D'
    },
    buttonSkip: {
        backgroundColor: 'transparent',
        width: wp(10),
        height: hp(6),
        top: wp(3.2),
        left: wp(2.5),
        marginTop: wp(0.5),
        marginBottom: wp(0.5),
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        justifyContent: 'flex-start'
    },
    buttonLeft: {
        backgroundColor: '#F2FF5D',
        width: wp(30),
        height: hp(5),
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignSelf: 'flex-start',
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonRightDisabled: {
        backgroundColor: '#D9D9D9',
        width: wp(30),
        height: hp(5),
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignSelf: 'flex-end',
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonRight: {
        backgroundColor: '#F2FF5D',
        width: wp(30),
        height: hp(5),
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignSelf: 'flex-end',
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonSkipText: {
        color: '#F2FF5D',
        fontFamily: 'Saira-Medium',
        fontSize: hp(1.65),
        width: wp(10)
    },
    documentButtonText: {
        color: '#313030',
        fontFamily: 'Saira-Medium',
        fontSize: hp(1.8),
        marginTop: hp(1)
    },
    buttonText: {
        color: '#313030',
        fontFamily: 'Saira-Medium',
        fontSize: hp(2.2),
        marginTop: hp(1)
    },
    bottomContainerButtons: {
        flexDirection: 'row',
        marginTop: hp(3),
        width: wp(100),
        flexWrap: 'wrap',
        alignSelf: 'center',
        alignItems: 'center',
        alignContent: 'space-between',
        justifyContent: 'center'
    },
    documentSelectionView: {
        zIndex: 1000,
        bottom: hp(5),
        flexDirection: 'column',
        width: wp(100),
        alignItems: 'center',
        alignContent: 'center',
        alignSelf: 'center'
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
    pickerView: {
        zIndex: 2000,
        bottom: hp(5),
        marginLeft: wp(5)
    },
    documentsDropdownPicker: {
        marginBottom: hp(3.5),
        alignSelf: 'center',
        backgroundColor: '#1c1a1f',
        borderColor: "#D9D9D9",
        width: wp(87),
        height: hp(6),
        borderRadius: 4
    },
    documentsDropdownContainer: {
        alignSelf: 'center',
        backgroundColor: '#1c1a1f',
        borderColor: "#D9D9D9",
        width: wp(87)
    },
    dropdownContainer: {
        backgroundColor: '#1c1a1f',
        borderColor: "#D9D9D9",
        width: wp(87)
    },
    dropdownPicker: {
        backgroundColor: '#1c1a1f',
        borderRadius: 4,
        borderColor: "#D9D9D9",
        width: wp(87),
        height: hp(6)
    },
    additionalRegistrationView: {
        zIndex: 1000,
        marginBottom: hp(24)
    },
    securityRegistrationView: {
        zIndex: 1000,
        top: hp(8),
        marginBottom: hp(24)
    },
    permissionsView: {
        flex: 1,
        bottom: hp(5),
        alignContent: 'center',
        alignItems: 'center',
        width: wp(100)
    },
    permissionsImage: {
        resizeMode: 'contain',
        height: hp(65),
        width: wp(75),
        alignSelf: 'center',
        flex: 0.75
    },
    militaryVerificationImage: {
        resizeMode: 'contain',
        height: hp(25),
        width: wp(55),
        alignSelf: 'center'
    },
    cardLinkingParentView: {
        backgroundColor: '#313030',
        marginTop: hp(10),
        alignContent: 'center',
        alignSelf: 'center',
        alignItems: 'center'
    },
    cardLinkingIframeView: {
        backgroundColor: 'transparent',
        width: wp(130),
        right: wp(15),
        flexGrow: 1
    },
    militaryAffiliationView: {
        bottom: hp(5)
    },
    topMilitaryAffiliationTile: {
        left: wp(6),
        alignSelf: 'flex-start',
        height: hp(33),
        width: wp(85)
    },
    militaryAffiliationTile: {
        top: hp(5),
        left: wp(6),
        alignSelf: 'flex-start',
        height: hp(33),
        width: wp(85)
    },
    militaryAffiliationTileView: {
        flexDirection: 'column',
        alignContent: 'center',
        alignSelf: 'flex-start',
        height: hp(33),
        width: wp(85),
        backgroundColor: '#5B5A5A'
    },
    militaryAffiliationImage: {
        alignSelf: 'center',
        height: hp(18),
        width: hp(18),
        top: hp(1)
    },
    militaryAffiliationTopView: {
        height: hp(13),
        width: wp(85),
        backgroundColor: '#1e1e21',
        flexDirection: 'column'
    },
    militaryAffiliationDescription: {
        left: wp(3),
        fontFamily: 'Raleway-SemiBold',
        top: hp(5.5),
        alignSelf: 'flex-start',
        fontSize: hp(1.6),
        width: wp(80),
        color: '#FFFFFF',
        lineHeight: hp(2),
        textAlign: 'center'
    },
    militaryAffiliationButton: {
        top: hp(9),
        backgroundColor: '#F2FF5D',
        width: wp(24),
        height: hp(4),
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center'
    },
    militaryAffiliationButtonText: {
        color: '#313030',
        fontFamily: 'Saira-Medium',
        fontSize: hp(2),
        marginTop: hp(0.5)
    },
    addressLinePredictionsDropdownView: {
        top: hp(1.2),
        height: hp(30),
        width: wp(87),
        backgroundColor: '#D9D9D9',
        left: wp(5),
        marginBottom: hp(35)
    },
    addressLinePredictionItem: {
        backgroundColor: '#808080',
        width: wp(87),
        height: hp(7.5),
        flexDirection: 'row',
        alignContent: 'space-between'
    },
    addressLinePredictionDescription: {
        top: hp(2),
        fontSize: hp(1.45),
        width: wp(87),
        fontFamily: 'Raleway-Bold',
        color: '#FFFFFF',
        left: wp(5)
    }
});
