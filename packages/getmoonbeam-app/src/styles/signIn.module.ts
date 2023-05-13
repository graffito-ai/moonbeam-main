import {Dimensions, StyleSheet} from "react-native";

// styles to be used within the SignIn component
export const styles = StyleSheet.create({
    topContainer: {
        flex: 0.3,
        backgroundColor: 'transparent',
        width: '100%'
    },
    topContainerImage: {
        alignSelf: 'flex-start',
        marginLeft: Dimensions.get('window').width/20,
        marginTop: Dimensions.get('window').height/12
    },
    bottomContainer: {
        backgroundColor: '#313030',
        flex: 0.7,
        width: '100%',
        height: '100%',
        flexDirection: 'column'
    },
    greetingTitle: {
        fontFamily: 'Saira-Medium',
        alignSelf: 'flex-start',
        marginLeft: Dimensions.get('window').width/20,
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
    bottomTitle: {
        fontFamily: 'Saira-Medium',
        alignSelf: 'flex-start',
        marginLeft: Dimensions.get('window').width/20,
        marginBottom: Dimensions.get('window').height/50,
        top: Dimensions.get('window').height/50,
        fontSize: Dimensions.get('window').height/25,
        color: '#FFFFFF'
    },
    textInputContentStyle: {
        fontSize: Dimensions.get('window').height/55,
        fontFamily: 'Saira-Regular'
    },
    textInput: {
        marginTop: Dimensions.get('window').height/45,
        alignSelf: 'flex-start',
        marginLeft: Dimensions.get('window').width/20,
        width: Dimensions.get('window').width/1.15,
    },
    textInputFocus: {
        marginTop: Dimensions.get('window').height/25,
        alignSelf: 'flex-start',
        marginLeft: Dimensions.get('window').width/20,
        width: Dimensions.get('window').width/1.15,
    },
    errorMessage: {
        width: Dimensions.get('window').width/1.15,
        marginLeft: Dimensions.get('window').width/20,
        fontFamily: 'Saira-Medium',
        fontSize: 15,
        color: '#F2FF5D'
    },
    forgotPasswordButton: {
        alignSelf: 'flex-end',
        fontFamily: 'Raleway-SemiBold',
        fontSize: 17,
        color: '#FFFFFF',
        textDecorationLine: 'underline'
    },
    forgotPasswordView: {
        marginTop: '3%',
        alignSelf: 'flex-end',
        marginRight: Dimensions.get('window').width/12,
    },
    loginButtonContentStyle: {
        color: '#313030',
        fontFamily: 'Saira-Medium',
        fontSize: Dimensions.get('window').height/50,
        marginTop: Dimensions.get('window').height / 250,
        alignItems: 'center',
        alignSelf: 'center'
    },
    logInButton: {
        marginTop: '10%',
        alignSelf: 'center',
        backgroundColor: '#F2FF5D',
        width: Dimensions.get('window').width/4,
        height: Dimensions.get('window').height/25,
        borderRadius: 0
    },
    bottomView: {
        marginTop: Dimensions.get('window').height/20
    },
    loginFooter: {
        marginTop: '2%',
        alignSelf: 'center',
        fontFamily: 'Saira-Regular',
        fontSize: Dimensions.get('window').height/52,
        color: '#FFFFFF'
    },
    loginFooterButton: {
        fontFamily: 'Saira-SemiBold',
        fontSize: Dimensions.get('window').height/52,
        color: '#F2FF5D',
    },
    loginLogo: {
        alignSelf: 'center',
        height: Dimensions.get('window').height/20,
        width: Dimensions.get('window').width/9
    }
});
