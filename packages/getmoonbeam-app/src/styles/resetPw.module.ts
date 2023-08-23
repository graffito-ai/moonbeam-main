import {Dimensions, StyleSheet} from "react-native";

// styles to be used within the ResetPassword component
export const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        flexGrow: 1,
        flexDirection: 'column',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center'
    },
    topContainer: {
        width: '100%',
        marginBottom: -Dimensions.get('window').height/2.5,
    },
    topTextView: {
        top: Dimensions.get('window').height/30
    },
    resetPwTitle: {
        fontSize: Dimensions.get('window').height/33,
        width: Dimensions.get('window').width,
        left: Dimensions.get('window').width/15,
        fontFamily: 'Raleway-SemiBold',
        alignSelf: 'flex-start',
        textAlign: 'left',
        color: '#F2FF5D'
    },
    resetPwSubtitle: {
        top: Dimensions.get('window').height/85,
        left: Dimensions.get('window').width/15,
        fontSize: Dimensions.get('window').height/45,
        width: Dimensions.get('window').width/1.2,
        fontFamily: 'Raleway-Medium',
        alignSelf: 'flex-start',
        textAlign: 'left',
        color: '#FFFFFF'
    },
    textInputContentStyle: {
        fontSize: Dimensions.get('window').height/55,
        fontFamily: 'Saira-Regular'
    },
    textInputFocus: {
        marginTop: Dimensions.get('window').height / 10,
        bottom: Dimensions.get('window').height / 14,
        alignSelf: 'flex-start',
        width: Dimensions.get('window').width / 1.15
    },
    textInput: {
        marginTop: Dimensions.get('window').height / 10,
        bottom: Dimensions.get('window').height / 14,
        alignSelf: 'flex-start',
        width: Dimensions.get('window').width / 1.15
    },
    textPasswordInputFocus: {
        marginTop: Dimensions.get('window').height / 54,
        bottom: Dimensions.get('window').height / 14,
        alignSelf: 'flex-start',
        width: Dimensions.get('window').width / 1.15
    },
    textPasswordInput: {
        marginTop: Dimensions.get('window').height / 54,
        bottom: Dimensions.get('window').height / 14,
        alignSelf: 'flex-start',
        width: Dimensions.get('window').width / 1.15
    },
    inputFieldsView: {
        top: Dimensions.get('window').height/20,
        alignSelf: 'center'
    },
    button: {
        backgroundColor: '#F2FF5D',
        width: Dimensions.get('window').width/2,
        height: Dimensions.get('window').height/20,
        marginTop: Dimensions.get('window').height/25,
        marginLeft: Dimensions.get('window').width/4,
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
    errorMessage: {
        top: Dimensions.get('window').height / 50,
        width: Dimensions.get('window').width / 1.15,
        alignSelf: 'center',
        fontFamily: 'Saira-Medium',
        fontSize: 15,
        color: '#F2FF5D'
    }
});
