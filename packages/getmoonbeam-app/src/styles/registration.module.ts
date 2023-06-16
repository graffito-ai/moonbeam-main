import {Dimensions, StyleSheet} from "react-native";

// styles to be used within the Registration component
export const styles = StyleSheet.create({
    titleView: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        width: '100%',
        marginLeft: Dimensions.get('window').width/ 10,
        bottom: Dimensions.get('window').height / 10
    },
    titleViewDescription: {
        flexDirection: 'row',
        alignItems: 'flex-start'
    },
    inputColumnView: {
        flexDirection: 'row',
        width: '100%',
    },
    inputColumnViewAddress: {
        marginTop: Dimensions.get('window').height/55,
        flexDirection: 'row',
        width: '100%',
    },
    codeInputColumnView: {
        marginRight: Dimensions.get('window').width/15,
        flexDirection: 'row',
        width: '100%',
    },
    resendCodeView: {
        flexDirection: 'row',
        width: Dimensions.get('window').width / 3,
        bottom: Dimensions.get('window').height / 15
    },
    resendCode: {
        width: Dimensions.get('window').width / 3,
        alignSelf: 'flex-start',
        fontFamily: 'Changa-Medium',
        fontSize: Dimensions.get('window').height/40,
        textDecorationLine: 'underline',
        color: '#F2FF5D'
    },
    countdownTimer: {
        width: Dimensions.get('window').width /3,
        alignSelf: 'flex-start',
        fontFamily: 'Changa-Medium',
        fontSize: 25,
        color: '#D9D9D9'
    },
    stepTitle: {
        fontFamily: 'Saira-Medium',
        alignSelf: 'flex-start',
        fontSize: Dimensions.get('window').height / 22,
        color: '#FFFFFF'
    },
    stepDescription: {
        fontFamily: 'Raleway-Regular',
        alignSelf: 'flex-start',
        marginLeft: Dimensions.get('window').width/ 18,
        bottom: Dimensions.get('window').height / 10,
        fontSize: Dimensions.get('window').height / 52,
        width: Dimensions.get('window').width/ 1.15,
        color: '#FFFFFF'
    },
    permissionsStepTitle: {
        fontFamily: 'Raleway-Bold',
        alignSelf: 'center',
        textAlign: 'center',
        marginRight: Dimensions.get('window').width/ 10,
        top: Dimensions.get('window').height / 35,
        fontSize: Dimensions.get('window').height / 42,
        width: Dimensions.get('window').width/ 1.35,
        color: '#F2FF5D'
    },
    permissionsStepDescription: {
        fontFamily: 'Raleway-Regular',
        alignSelf: 'center',
        textAlign: 'center',
        marginRight: Dimensions.get('window').width/ 10,
        top: Dimensions.get('window').height / 35,
        fontSize: Dimensions.get('window').height / 52,
        width: Dimensions.get('window').width/ 1.35,
        color: '#FFFFFF'
    },
    triangleIcon: {
        marginRight: Dimensions.get('window').width/ 60
    },
    fileUploadTextInputContentStyle: {
        fontSize: Dimensions.get('window').height/105,
        fontFamily: 'Saira-Regular'
    },
    textInputContentStyle: {
        fontSize: Dimensions.get('window').height/55,
        fontFamily: 'Saira-Regular'
    },
    textInputNarrowContentStyle: {
        fontSize: Dimensions.get('window').height/55,
        fontFamily: 'Saira-Regular'
    },
    textInputNarrowCardLinked: {
        bottom: Dimensions.get('window').height / 16,
        alignSelf: 'flex-start',
        width: Dimensions.get('window').width / 2.5,
    },
    textInputNarrowFocusCardLinked: {
        bottom: Dimensions.get('window').height / 16,
        alignSelf: 'flex-start',
        width: Dimensions.get('window').width / 2.5,
    },
    textInputNarrow: {
        bottom: Dimensions.get('window').height / 14,
        alignSelf: 'flex-start',
        width: Dimensions.get('window').width / 2.5,
    },
    textInputNarrowFocus: {
        bottom: Dimensions.get('window').height / 14,
        alignSelf: 'flex-start',
        width: Dimensions.get('window').width / 2.5,
    },
    textInputCodeContentStyle: {
        fontSize: Dimensions.get('window').height/25,
        fontFamily: 'Saira-Regular',
        alignSelf: 'center',
    },
    textInputCode: {
        marginTop: Dimensions.get('window').height / 50,
        bottom: Dimensions.get('window').height / 14,
        alignSelf: 'flex-start',
        marginRight: Dimensions.get('window').width / 80,
        width: Dimensions.get('window').width / 7,
    },
    textInputCodeFocus: {
        marginTop: Dimensions.get('window').height / 50,
        bottom: Dimensions.get('window').height / 14,
        alignSelf: 'flex-start',
        marginRight: Dimensions.get('window').width /80,
        width: Dimensions.get('window').width / 7,
    },
    fileUploadedTextInput: {
        bottom: Dimensions.get('window').width / 50,
        right: Dimensions.get('window').width / 220,
        width: Dimensions.get('window').width / 2
    },
    textInput: {
        marginTop: Dimensions.get('window').height / 50,
        bottom: Dimensions.get('window').height / 14,
        alignSelf: 'flex-start',
        marginRight: Dimensions.get('window').width / 8,
        width: Dimensions.get('window').width / 1.15
    },
    textInputFocus: {
        marginTop: Dimensions.get('window').height / 50,
        bottom: Dimensions.get('window').height / 14,
        alignSelf: 'flex-start',
        marginRight: Dimensions.get('window').width / 8,
        width: Dimensions.get('window').width / 1.15,
    },
    errorMessage: {
        width: Dimensions.get('window').width / 1.15,
        bottom: Dimensions.get('window').height / 12,
        marginLeft: Dimensions.get('window').width/ 17,
        alignSelf: 'flex-start',
        fontFamily: 'Saira-Medium',
        fontSize: 15,
        color: '#F2FF5D'
    },
    disclaimerView: {
        marginTop: Dimensions.get('window').height/55,
        flexDirection: 'row',
        alignContent: 'space-between',
        width: '100%'
    },
    disclaimerCheckbox: {
        alignSelf: 'flex-start'
    },
    disclaimerText: {
        left: Dimensions.get('window').width/50,
        fontFamily: 'Raleway-Regular',
        alignSelf: 'flex-end',
        fontSize: Dimensions.get('window').height / 65,
        width: Dimensions.get('window').width/ 1.25,
        color: '#FFFFFF'
    },
    disclaimerTextHighlighted: {
        fontFamily: 'Raleway-Bold',
        fontStyle: 'italic',
        textDecorationLine: 'underline',
        color: '#F2FF5D'
    },
    buttonSkip: {
        backgroundColor: 'transparent',
        width: Dimensions.get('window').width/10,
        height: Dimensions.get('window').height/30,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        justifyContent: 'flex-start'
    },
    buttonLeft: {
        backgroundColor: '#F2FF5D',
        width: Dimensions.get('window').width/3,
        height: Dimensions.get('window').height/20,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonRightDisabled: {
        backgroundColor: '#D9D9D9',
        width: Dimensions.get('window').width/3,
        height: Dimensions.get('window').height/20,
        right: Dimensions.get('window').width/20,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonRight: {
        backgroundColor: '#F2FF5D',
        width: Dimensions.get('window').width/3,
        height: Dimensions.get('window').height/20,
        right: Dimensions.get('window').width/20,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonSkipText: {
        color: '#F2FF5D',
        fontFamily: 'Saira-Medium',
        fontSize: Dimensions.get('window').height/55,
        marginTop: Dimensions.get('window').height / 200
    },
    documentButtonText: {
        color: '#313030',
        fontFamily: 'Saira-Medium',
        fontSize: Dimensions.get('window').height/55,
        marginTop: Dimensions.get('window').height / 90
    },
    buttonText: {
        color: '#313030',
        fontFamily: 'Saira-Medium',
        fontSize: Dimensions.get('window').height/45,
        marginTop: Dimensions.get('window').height / 90
    },
    bottomContainerButtons: {
        flexDirection: 'row',
        marginTop: Dimensions.get('window').height / 40,
        paddingRight: Dimensions.get('window').width/ 20,
    },
    documentSelectionView: {
        zIndex: 1000,
        bottom: Dimensions.get('window').height/30,
        flexDirection: 'column',
        width: '100%'
    },
    documentSelectionOptionTop: {
        zIndex: 2000,
        marginBottom: Dimensions.get('window').height/20,
        alignSelf: 'flex-start',
        flexDirection: 'column',
        width: '100%'
    },
    documentSelectionOptionBottom: {
        marginTop: Dimensions.get('window').height/70,
        marginBottom: Dimensions.get('window').height/70,
        alignSelf: 'flex-start',
        flexDirection: 'row',
        width: '50%'
    },
    documentSelectionOptionImage: {
        height: Dimensions.get('window').height/8,
        width: Dimensions.get('window').height/6
    },
    photoUploadOptionImage: {
        height: Dimensions.get('window').height/6,
        width: Dimensions.get('window').height/6
    },
    documentUploadOptionImage: {
        height: Dimensions.get('window').height/7,
        width: Dimensions.get('window').height/6
    },
    documentCapturingDescriptionView: {
        top: Dimensions.get('window').height / 25,
        left: Dimensions.get('window').width / 20,
        flexDirection: 'column',
        width: '100%'
    },
    documentCapturingOptionDescription: {
        alignSelf: 'center',
        fontFamily: 'Raleway-Medium',
        bottom: Dimensions.get('window').height / 60,
        fontSize: Dimensions.get('window').height / 55,
        width: Dimensions.get('window').width/ 2,
        color: '#FFFFFF'
    },
    documentSelectionOptionDescription: {
        alignSelf: 'flex-start',
        fontFamily: 'Raleway-Medium',
        marginBottom: Dimensions.get('window').height / 55,
        fontSize: Dimensions.get('window').height / 55,
        width: Dimensions.get('window').width,
        color: '#FFFFFF'
    },
    documentSelectionOptionDescriptionButton: {
        alignSelf: 'flex-start',
        fontFamily: 'Raleway-Medium',
        fontSize: Dimensions.get('window').height / 55,
        width: Dimensions.get('window').width/ 1.5,
        color: '#F2FF5D',
        textDecorationLine: 'underline'
    },
    documentSelectionDivider: {
        width: Dimensions.get('window').width / 1.15,
        backgroundColor: '#D9D9D9'
    },
    documentSelectionButton: {
        backgroundColor: '#F2FF5D',
        width: Dimensions.get('window').width / 3.5,
        height: Dimensions.get('window').height / 25,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center'
    },
    documentSelectionButtonDisabled: {
        backgroundColor: '#D9D9D9',
        width: Dimensions.get('window').width / 3.5,
        height: Dimensions.get('window').height / 25,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center'
    },
    pickerView: {
        zIndex: 2000,
        bottom: Dimensions.get('window').height / 20
    },
    documentsDropdownPicker: {
        backgroundColor: '#1c1a1f',
        borderColor: "#D9D9D9",
        width: Dimensions.get('window').width / 1.15,
        height: Dimensions.get('window').height / 25,
    },
    documentsDropdownContainer: {
        backgroundColor: '#1c1a1f',
        borderColor: "#D9D9D9",
        width: Dimensions.get('window').width / 1.15,
        height: Dimensions.get('window').height / 5
    },
    dropdownContainer: {
        backgroundColor: '#1c1a1f',
        borderColor: "#D9D9D9",
        width: Dimensions.get('window').width / 1.15,
        height: Dimensions.get('window').height / 8
    },
    dropdownPicker: {
        backgroundColor: '#1c1a1f',
        borderColor: "#D9D9D9",
        width: Dimensions.get('window').width / 1.15,
        height: Dimensions.get('window').height / 25
    },
    dropdownImage: {
        height: Dimensions.get('window').height / 45,
        width: Dimensions.get('window').height / 45
    },
    militaryRegistrationView: {
        zIndex: 1000,
        marginBottom: Dimensions.get('window').height/30
    },
    permissionsView: {
        flex: 1,
        bottom: Dimensions.get('window').height/20,
        alignSelf: 'center',
        alignContent: 'center'
    },
    permissionsImage: {
        resizeMode: 'contain',
        height: Dimensions.get('window').height * 0.65,
        width: Dimensions.get('window').width * 0.75,
        flex: 0.75
    },
    militaryVerificationImage: {
        resizeMode: 'contain',
        height: Dimensions.get('window').height * 0.65,
        width: Dimensions.get('window').width * 0.75,
        flex: 0.55
    },
    cardLinkingParentView: {
        backgroundColor: '#313030', marginTop: -Dimensions.get('window').height/20, alignContent: 'center',  alignSelf: 'center', alignItems: 'center'
    },
    cardLinkingIframeView: {
        left: Dimensions.get('window').width / 2.03,
        backgroundColor: 'transparent',
        width: Dimensions.get('window').width*2,
        flexGrow: 1
    }
});
