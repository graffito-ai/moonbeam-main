import {Dimensions, StyleSheet} from "react-native";

// styles to be used within the CodeVerification component
export const styles = StyleSheet.create({
    topContainer: {
        flex: 1,
        backgroundColor: 'transparent',
        width: '100%'
    },
    greetingTitle: {
        fontFamily: 'Saira-Medium',
        alignSelf: 'flex-start',
        marginLeft: Dimensions.get('window').width/22,
        fontSize: Dimensions.get('window').height/25,
        color: '#FFFFFF'
    },
    gettingSubtitle: {
        fontFamily: 'Saira-Medium',
        alignSelf: 'flex-start',
        width: Dimensions.get('window').width/1.15,
        marginLeft: Dimensions.get('window').width/20,
        fontSize: Dimensions.get('window').height/50,
        color: '#FFFFFF'
    },
    gettingSubtitleHighlighted: {
        fontFamily: 'Saira-SemiBold',
        alignSelf: 'flex-start',
        fontSize: Dimensions.get('window').height/50,
        color: '#F2FF5D'
    },
    greetingImage: {
        height: Dimensions.get('window').height/6,
        width: Dimensions.get('window').height/6,
        alignSelf: 'center',
        top: Dimensions.get('window').height/20
    },
    button: {
        backgroundColor: '#F2FF5D',
        width: Dimensions.get('window').width/3,
        height: Dimensions.get('window').height/20,
        marginLeft: Dimensions.get('window').width/3,
        position: 'absolute',
        top: Dimensions.get('window').height/2.4,
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
    codeInputColumnView: {
        bottom: -Dimensions.get('window').height / 12,
        left: Dimensions.get('window').width / 25,
        alignSelf: 'center',
        alignItems: 'center',
        alignContent: 'center',
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
        bottom: -Dimensions.get('window').height / 40,
        left: Dimensions.get('window').width/25,
        alignSelf: 'flex-start'
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
        top: Dimensions.get('window').height / 50,
        marginLeft: Dimensions.get('window').width/ 20,
        alignSelf: 'flex-start',
        fontFamily: 'Saira-Medium',
        fontSize: Dimensions.get('window').width/30,
        color: 'red'
    },
    errorMessageTablet: {
        width: Dimensions.get('window').width / 1.15,
        top: Dimensions.get('window').height / 50,
        marginLeft: Dimensions.get('window').width/ 20,
        alignSelf: 'flex-start',
        fontFamily: 'Saira-Medium',
        fontSize: Dimensions.get('window').width/45,
        color: 'red'
    }
});
