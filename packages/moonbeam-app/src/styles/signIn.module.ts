import {StyleSheet} from "react-native";

// styles to be used within the SignIn component
export const styles = StyleSheet.create({
    loginLogo: {
        marginLeft: '20%',
        height: 90,
        width: 200
    },
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
    loginTitle: {
        fontFamily: 'Raleway-Medium',
        fontSize: 60,
        color: 'black',
        alignSelf: 'flex-start'
    },
    loginSubtitle: {
        fontFamily: 'Raleway-Medium',
        fontSize: 25,
        color: '#A2B000',
        alignSelf: 'flex-start'
    },
    loginFooter: {
        marginLeft: '8%',
        fontFamily: 'Raleway-Medium',
        fontSize: 20,
        color: '#313030'
    },
    forgotPasswordButton: {
        alignSelf: 'flex-end',
        fontFamily: 'Raleway-Bold',
        fontSize: 16,
        color: '#313030',
        textDecorationLine: 'underline'
    },
    loginFooterButton: {
        fontFamily: 'Raleway-Bold',
        fontSize: 20,
        color: '#2A3779',
    },
    signInFooterButton: {
        borderRadius: 25,
        borderColor: '#313030',
        height: 50,
        width: 350,
        marginTop: '10%'
    },
    mainView: {
        width: 350
    },
    forgotPasswordView: {
        marginTop: '5%',
        alignSelf: 'flex-end'
    },
    bottomView: {
        marginTop: '15%'
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
