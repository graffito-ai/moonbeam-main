import {Dimensions, StyleSheet} from "react-native";

// styles to be used within the Account Recovery component
export const styles = StyleSheet.create({
    topContainer: {
        flex: 0.3,
        backgroundColor: 'transparent',
        width: '100%'
    },
    greetingTitle: {
        fontFamily: 'Saira-Medium',
        alignSelf: 'flex-start',
        marginLeft: Dimensions.get('window').width/22,
        marginTop: Dimensions.get('window').height/20,
        fontSize: Dimensions.get('window').height/18,
        color: '#FFFFFF'
    },
    gettingSubtitle: {
        fontFamily: 'Saira-Medium',
        alignSelf: 'flex-start',
        marginLeft: Dimensions.get('window').width/20,
        bottom: Dimensions.get('window').height/50,
        fontSize: Dimensions.get('window').height/40,
        color: '#FFFFFF'
    },
    gettingSubtitleHighlighted: {
        fontFamily: 'Saira-SemiBold',
        alignSelf: 'flex-start',
        fontSize: Dimensions.get('window').height/40,
        color: '#F2FF5D'
    },
    contentTitle: {
        fontFamily: 'Saira-Medium',
        alignSelf: 'flex-start',
        marginLeft: Dimensions.get('window').width/20,
        marginTop: Dimensions.get('window').height/20,
        fontSize: Dimensions.get('window').height/28,
        width: Dimensions.get('window').width/1.1,
        color: '#FFFFFF'
    },
    contentDescription: {
        fontFamily: 'Raleway-Regular',
        alignSelf: 'flex-start',
        marginLeft: Dimensions.get('window').width/20,
        marginTop: Dimensions.get('window').height/100,
        fontSize: Dimensions.get('window').height/48,
        width: Dimensions.get('window').width/1.1,
        color: '#FFFFFF'
    },
    bottomContainer: {
        backgroundColor: '#313030',
        flex: 0.7,
        width: '100%',
        height: '100%',
        flexDirection: 'column'
    },
    textInputContentStyle: {
        fontSize: Dimensions.get('window').height/55,
        fontFamily: 'Saira-Regular'
    },
    textInputFocus: {
        marginTop: Dimensions.get('window').height / 10,
        bottom: Dimensions.get('window').height / 14,
        alignSelf: 'flex-start',
        marginLeft: Dimensions.get('window').width / 20,
        width: Dimensions.get('window').width / 1.15
    },
    textInput: {
        marginTop: Dimensions.get('window').height / 10,
        bottom: Dimensions.get('window').height / 14,
        alignSelf: 'flex-start',
        marginLeft: Dimensions.get('window').width / 20,
        width: Dimensions.get('window').width / 1.15
    },
    textPasswordInputFocus: {
        marginTop: Dimensions.get('window').height / 54,
        bottom: Dimensions.get('window').height / 14,
        alignSelf: 'flex-start',
        marginLeft: Dimensions.get('window').width / 20,
        width: Dimensions.get('window').width / 1.15
    },
    textPasswordInput: {
        marginTop: Dimensions.get('window').height / 54,
        bottom: Dimensions.get('window').height / 14,
        alignSelf: 'flex-start',
        marginLeft: Dimensions.get('window').width / 20,
        width: Dimensions.get('window').width / 1.15
    },
    button: {
        backgroundColor: '#F2FF5D',
        width: Dimensions.get('window').width/3,
        height: Dimensions.get('window').height/20,
        marginTop: Dimensions.get('window').height/10,
        marginLeft: Dimensions.get('window').width/3,
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
    bottomAuthenticationText: {
        fontFamily: 'Saira-Regular',
        alignSelf: 'center',
        top: Dimensions.get('window').height/40,
        fontSize: Dimensions.get('window').height/50,
        color: '#FFFFFF'
    },
    bottomAuthenticationTextButton: {
        fontFamily: 'Saira-SemiBold',
        alignSelf: 'center',
        fontSize: Dimensions.get('window').height/50,
        color: '#F2FF5D'
    },
    codeInputColumnView: {
        marginLeft: Dimensions.get('window').width/20,
        marginTop: Dimensions.get('window').height / 15,
        flexDirection: 'row',
        width: '100%',
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
    resendCodeView: {
        flexDirection: 'row',
        width: Dimensions.get('window').width / 3,
        bottom: Dimensions.get('window').height / 15,
        alignSelf: 'flex-start',
        marginLeft: Dimensions.get('window').width/20
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
        fontSize: Dimensions.get('window').height/40,
        color: '#D9D9D9'
    },
    errorMessage: {
        width: Dimensions.get('window').width / 1.15,
        marginTop: Dimensions.get('window').height /70,
        marginLeft: Dimensions.get('window').width/ 20,
        alignSelf: 'flex-start',
        fontFamily: 'Saira-Medium',
        fontSize: 15,
        color: '#F2FF5D'
    }
});
