import {StyleSheet} from "react-native";

// styles to be used within the EmailVerify component
export const styles = StyleSheet.create({
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
    mainView: {
        width: 350,
        alignSelf: 'center',
        marginBottom: '20%'
    },
    topView: {
        marginTop: '15%'
    },
    bottomView: {
        marginTop: '10%',
        alignSelf: 'center'
    },
    emailVerifyTitle: {
        fontFamily: 'Raleway-Medium',
        fontSize: 40,
        color: 'black',
        alignSelf: 'flex-start'
    },
    emailVerifySubtitle: {
        fontFamily: 'Raleway-Medium',
        fontSize: 25,
        color: '#A2B000',
        alignSelf: 'flex-start'
    },
    congratulationsSplash: {},
    textInput: {
        marginTop: 50,
        width: 350,
        backgroundColor: '#f2f2f2',
        shadowColor: '#313030',
        shadowOffset: {width: -2, height: 10},
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 15
    },
    textInputFocus: {
        marginTop: 50,
        width: 350,
        backgroundColor: '#f2',
        shadowColor: '#313030',
        shadowOffset: {width: -2, height: 10},
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 15
    },
    confirmButton: {
        borderRadius: 25,
        borderColor: '#313030',
        height: 50,
        width: 350,
        marginTop: '15%'
    },
    resendCodeButton: {
        borderRadius: 25,
        borderColor: '#313030',
        height: 50,
        width: 350,
        marginTop: '5%'
    },
    backToSignInFooter: {
        fontFamily: 'Raleway-Medium',
        fontSize: 20,
        color: '#313030'
    },
    backToSignInButton: {
        fontFamily: 'Raleway-Bold',
        fontSize: 20,
        color: '#2A3779',
    },
    disclaimerView: {
        marginTop: '20%'
    },
    disclaimerText: {
        fontFamily: 'Raleway-Medium',
        color: '#313030',
        fontSize: 13,
        width: 350,
        marginTop: '3%',
        textAlign: 'center'
    },
    disclaimerModified: {
        fontFamily: 'Raleway-Bold',
        color: '#2A3779',
        fontSize: 13,
        width: 350,
        marginTop: '3%',
        textAlign: 'center'
    },
    errorMessageMain: {
        alignSelf: 'center',
        fontFamily: 'Raleway-Bold',
        fontSize: 12,
        color: 'red'
    },
    errorMessage: {
        width: 350,
        marginTop: 5,
        fontFamily: 'Raleway-Bold',
        fontSize: 12,
        color: 'red'
    }
});
