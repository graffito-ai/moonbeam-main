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
    nameView: {
        flexDirection: 'row',
        width: '100%',
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
        width: Dimensions.get('window').width/ 1.25,
        color: '#FFFFFF'
    },
    triangleIcon: {
        marginRight: Dimensions.get('window').width/ 60
    },
    textInputContentStyle: {
        fontSize: Dimensions.get('window').height/65,
        fontFamily: 'Saira-Regular'
    },
    textInputNarrowContentStyle: {
        fontSize: Dimensions.get('window').height/65,
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
    textInput: {
        marginTop: Dimensions.get('window').height / 50,
        bottom: Dimensions.get('window').height / 14,
        alignSelf: 'flex-start',
        marginRight: Dimensions.get('window').width / 8,
        width: Dimensions.get('window').width / 1.15,
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
    disclaimerText: {
        fontFamily: 'Raleway-Regular',
        alignSelf: 'flex-start',
        bottom: Dimensions.get('window').height / 17,
        fontSize: Dimensions.get('window').height / 75,
        width: Dimensions.get('window').width/ 1.15,
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
        width: Dimensions.get('window').width/3.5,
        height: Dimensions.get('window').height/25,
        marginRight: Dimensions.get('window').width/5,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonRight: {
        backgroundColor: '#F2FF5D',
        width: Dimensions.get('window').width/3.5,
        height: Dimensions.get('window').height/25,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonText: {
        color: '#313030',
        fontFamily: 'Saira-Medium',
        fontSize: Dimensions.get('window').height/52,
        marginTop: Dimensions.get('window').height / 90
    },
    bottomContainerButtons: {
        flexDirection: 'row',
        marginTop: Dimensions.get('window').height / 40,
        paddingRight: Dimensions.get('window').width/ 8,
    }
});
