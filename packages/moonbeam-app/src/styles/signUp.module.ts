import {Platform, StyleSheet} from "react-native";

// styles to be used within the SignUp component
export const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center'
    },
    signupTitle: {
        fontFamily: 'Raleway-Medium',
        fontSize: 39,
        color: 'black',
    },
    signupSubtitle: {
        marginTop: '1%',
        fontFamily: 'Raleway-Medium',
        fontSize: 22,
        color: '#A2B000',
        width: 300
    },
    initialTextInput: {
        marginTop: 10,
        width: 350,
        backgroundColor: '#f2f2f2',
        shadowColor: '#313030',
        shadowOffset: {width: -2, height: 5},
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8
    },
    initialTextInputFocus: {
        marginTop: 10,
        width: 350,
        backgroundColor: '#f2f2f2',
        shadowColor: '#313030',
        shadowOffset: {width: -2, height: 5},
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8
    },
    textInput: {
        marginTop: 30,
        width: 350,
        backgroundColor: '#f2f2f2',
        shadowColor: '#313030',
        shadowOffset: {width: -2, height: 5},
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8
    },
    textInputFocus: {
        marginTop: 30,
        width: 350,
        backgroundColor: '#f2f2f2',
        shadowColor: '#313030',
        shadowOffset: {width: -2, height: 5},
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8
    },
    initialNextBtnStyle: {},
    lastPrevBtnStyle: {},
    nextBtnStyle: {},
    prevBtnStyle: {},
    btnStyleText: {
        color: '#2A3779',
        fontFamily: 'Raleway-Medium',
        fontSize: 20
    },
    contactProgressTitle: {
        marginTop: '1%',
        fontFamily: 'Raleway-Regular',
        fontSize: 25,
        color: '#2A3779',
    },
    militaryProgressTitle: {
        marginTop: '1%',
        fontFamily: 'Raleway-Regular',
        fontSize: 25,
        color: '#2A3779',
    },
    securityProgressTitle: {
        marginTop: '1%',
        fontFamily: 'Raleway-Regular',
        fontSize: 25,
        color: '#2A3779',
    },
    initialDropdownPicker: {
        marginTop: 10,
        alignSelf: 'center',
        width: 350,
        height: 70,
        backgroundColor: '#f2f2f2',
        borderColor: '#f2f2f2',
        shadowColor: '#313030',
        shadowOffset: {width: -2, height: 5},
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8
    },
    dropdownPicker: {
        marginTop: 30,
        width: 330,
        height: 70,
        backgroundColor: '#f2f2f2',
        borderColor: '#f2f2f2',
        shadowColor: '#313030',
        shadowOffset: {width: -2, height: 5},
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8
    },
    dropdownContainer: {
        backgroundColor: "#f2f2f2",
        borderColor: "lightgrey",
        width: 350,
        alignSelf: 'center'
    },
    signUpView: {
        marginBottom: Platform.OS === 'android' ? '20%' : '0%'
    },
    signUpFooterButton: {
        borderRadius: 25,
        borderColor: '#313030',
        height: 50,
        width: 350
    },
    disclaimerText: {
        fontFamily: 'Raleway-Medium',
        color: '#313030',
        fontSize: 13,
        width: 350,
        marginTop: '3%',
        textAlign: 'center'
    },
    termsFooter: {
        fontFamily: 'Raleway-Bold',
        fontSize: 13,
        color: '#2A3779'
    },
    errorMessage: {
        width: 350,
        marginTop: 5,
        fontFamily: 'Raleway-Bold',
        fontSize: 12,
        color: 'red'
    },
    errorMessageMain: {
        alignSelf: 'center',
        fontFamily: 'Raleway-Bold',
        fontSize: 12,
        color: 'red'
    },
    modelTitle: {
        marginBottom: '5%',
        fontFamily: 'Raleway-Medium',
        fontSize: 55,
        width: 300,
        color: '#313030',
    },
    modalParagraph: {
        textAlign: 'center',
        alignSelf: 'flex-start',
        fontFamily: 'Raleway-Regular',
        fontSize: 16,
        width: 350,
        color: '#313030'
    },
    modalContainer: {
        alignSelf: 'center',
        backgroundColor: 'white',
        width: 400,
        borderRadius: 15,
        padding: 20,
        borderWidth: 1,
        borderColor: 'red'
    },
    modalButton: {
        borderRadius: 25,
        borderColor: 'red',
        height: 40,
        width: 350,
        marginTop: '10%'
    },
    progressStepView: {
        alignItems: 'center',
        alignSelf: 'center',
        width: 450,
    }
});
