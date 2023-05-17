import {Dimensions, StyleSheet} from "react-native";

// styles to be used within the Registration component
export const styles = StyleSheet.create({
    titleView: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        width: '100%',
        marginLeft: Dimensions.get('window').width/ 10,
        bottom: Dimensions.get('window').height / 10
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
        width: '100%',
    },
    resendCode: {
        width: Dimensions.get('window').width / 1.15,
        bottom: Dimensions.get('window').height / 15,
        alignSelf: 'flex-start',
        fontFamily: 'Changa-Medium',
        fontSize: Dimensions.get('window').height/40,
        textDecorationLine: 'underline',
        color: '#F2FF5D'
    },
    countdownTimer: {
        width: Dimensions.get('window').width / 1.15,
        bottom: Dimensions.get('window').height / 15,
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
    triangleIcon: {
        marginRight: Dimensions.get('window').width/ 60
    },
    textInputContentStyle: {
        fontSize: Dimensions.get('window').height/55,
        fontFamily: 'Saira-Regular'
    },
    textInputNarrowContentStyle: {
        fontSize: Dimensions.get('window').height/55,
        fontFamily: 'Saira-Regular'
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
        fontFamily: 'Saira-Regular'
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
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonRight: {
        backgroundColor: '#F2FF5D',
        width: Dimensions.get('window').width/3,
        height: Dimensions.get('window').height/20,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center'
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
        paddingRight: Dimensions.get('window').width/ 8,
    },
    documentSelectionView: {
        bottom: Dimensions.get('window').height/30,
        flexDirection: 'column',
        width: '100%'
    },
    documentSelectionOptionTop: {
        marginBottom: Dimensions.get('window').height/50,
        alignSelf: 'flex-start',
        flexDirection: 'row',
        width: '50%'
    },
    documentSelectionOptionBottom: {
        marginTop: Dimensions.get('window').height/30,
        marginBottom: Dimensions.get('window').height/30,
        alignSelf: 'flex-start',
        flexDirection: 'row',
        width: '50%'
    },
    documentSelectionOptionImage: {
        height: Dimensions.get('window').height/7,
        width: Dimensions.get('window').height/7
    },
    documentSelectionDescriptionView: {
        top: Dimensions.get('window').height / 25,
        left: Dimensions.get('window').width / 10,
        flexDirection: 'column',
        width: '100%'
    },
    documentSelectionOptionDescription: {
        alignSelf: 'center',
        fontFamily: 'Raleway-Medium',
        bottom: Dimensions.get('window').height / 60,
        fontSize: Dimensions.get('window').height / 55,
        width: Dimensions.get('window').width/ 2,
        color: '#FFFFFF'
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
    pickerView: {
        zIndex: 2000,
        bottom: Dimensions.get('window').height / 20
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
    }
});