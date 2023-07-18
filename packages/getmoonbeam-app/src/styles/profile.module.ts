import {Dimensions, StyleSheet} from "react-native";

// styles to be used within the Profile component
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
    profileContentView: {
        backgroundColor: 'transparent',
        bottom: Dimensions.get('window').height/20,
        width: '100%'
    },
    profileContentViewTablet: {
        backgroundColor: 'transparent',
        bottom: Dimensions.get('window').height/12,
        width: '100%'
    },
    textInputNonEditable: {
        backgroundColor: '#484747',
        marginTop: Dimensions.get('window').height / 2.5,
        bottom: Dimensions.get('window').height / 2.5,
        alignSelf: 'center',
        width: Dimensions.get('window').width / 1.15,
    },
    textInput: {
        backgroundColor: '#313030',
        marginTop: Dimensions.get('window').height / 2.5,
        bottom: Dimensions.get('window').height / 2.5,
        alignSelf: 'center',
        width: Dimensions.get('window').width / 1.15,
    },
    textInputFocus: {
        backgroundColor: '#313030',
        marginTop: Dimensions.get('window').height / 2.5,
        bottom: Dimensions.get('window').height / 2.5,
        alignSelf: 'center',
        width: Dimensions.get('window').width / 1.15
    },
    textInputContentStyle: {
        fontSize: Dimensions.get('window').height/55,
        fontFamily: 'Saira-Regular'
    },
    titleStyle: {
        fontFamily: 'Raleway-Regular',
        color: '#FFFFFF'
    },
    avatarStyle: {
        alignSelf: 'center',
        backgroundColor: 'grey',
        top: '5%'
    },
    avatarAccessoryStyle: {
        left: '72%',
        top: '75%',
        backgroundColor: '#313030'
    },
    userNameStyle: {
        alignSelf: 'center',
        fontFamily: 'Saira-Medium',
        color: '#F2FF5D',
        textAlign: 'center'
    },
    pickerView: {
        zIndex: 2000,
        bottom: Dimensions.get('window').height / 2.75
    },
    dropdownContainerNonEditable: {
        backgroundColor: '#484747',
        borderColor: "#D9D9D9",
        alignSelf: 'center',
        marginTop: Dimensions.get('window').height / 30,
        width: Dimensions.get('window').width / 1.14,
        height: Dimensions.get('window').height / 5
    },
    dropdownContainer: {
        backgroundColor: '#313030',
        borderColor: "#D9D9D9",
        alignSelf: 'center',
        marginTop: Dimensions.get('window').height / 30,
        width: Dimensions.get('window').width / 1.14,
        height: Dimensions.get('window').height / 5
    },
    dropdownPickerNonEditable: {
        backgroundColor: '#484747',
        borderColor: "#D9D9D9",
        alignSelf: 'center',
        marginTop: Dimensions.get('window').height / 30,
        width: Dimensions.get('window').width / 1.14,
        height: Dimensions.get('window').height / 16
    },
    dropdownPickerNonEditableTablet: {
        backgroundColor: '#484747',
        borderColor: "#D9D9D9",
        alignSelf: 'center',
        marginTop: Dimensions.get('window').height / 30,
        width: Dimensions.get('window').width / 1.14,
        height: Dimensions.get('window').height / 22
    },
    dropdownPicker: {
        backgroundColor: '#313030',
        borderColor: "#D9D9D9",
        alignSelf: 'center',
        marginTop: Dimensions.get('window').height / 30,
        width: Dimensions.get('window').width / 1.14,
        height: Dimensions.get('window').height / 16
    },
    dropdownPickerTablet: {
        backgroundColor: '#313030',
        borderColor: "#D9D9D9",
        alignSelf: 'center',
        marginTop: Dimensions.get('window').height / 30,
        width: Dimensions.get('window').width / 1.14,
        height: Dimensions.get('window').height / 22
    },
    inputColumnViewAddress: {
        bottom: Dimensions.get('window').height / 3.4,
        flexDirection: 'row',
        alignSelf: 'center'
    },
    textInputNarrowContentStyle: {
        fontSize: Dimensions.get('window').height/55,
        fontFamily: 'Saira-Regular'
    },
    textInputNarrow: {
        backgroundColor: '#313030',
        bottom: Dimensions.get('window').height / 14,
        alignSelf: 'center',
        width: Dimensions.get('window').width / 2.5,
    },
    textInputNarrowNonEditable: {
        backgroundColor: '#484747',
        bottom: Dimensions.get('window').height / 14,
        alignSelf: 'center',
        width: Dimensions.get('window').width / 2.5,
    },
    textInputNarrowFocus: {
        backgroundColor: '#313030',
        bottom: Dimensions.get('window').height / 14,
        alignSelf: 'center',
        width: Dimensions.get('window').width / 2.5,
    },
    editButton: {
        backgroundColor: '#F2FF5D',
        width: Dimensions.get('window').width/1.4,
        height: Dimensions.get('window').height/20,
        bottom: Dimensions.get('window').width/5,
        left: Dimensions.get('window').width/7,
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
        width: Dimensions.get('window').width / 1.15,
        bottom: Dimensions.get('window').height / 15,
        fontFamily: 'Saira-Medium',
        textAlign: 'center',
        alignSelf: 'center',
        fontSize: Dimensions.get('window').width/30,
        color: '#F2FF5D'
    },
    errorMessageTablet: {
        width: Dimensions.get('window').width / 1.15,
        bottom: Dimensions.get('window').height / 9,
        fontFamily: 'Saira-Medium',
        textAlign: 'center',
        alignSelf: 'center',
        fontSize: Dimensions.get('window').width/40,
        color: '#F2FF5D'
    },
    bottomSheet: {
        backgroundColor: '#5B5A5A'
    }
});
