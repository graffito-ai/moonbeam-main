import {Dimensions, StyleSheet} from "react-native";

// styles to be used within the WebViewNavbar component
export const styles = StyleSheet.create({
    content: {
        backgroundColor: '#f2f2f2',
        justifyContent: 'space-between',
        flexDirection: 'row',
        flexWrap: 'nowrap'
    },
    backButton: {
        marginTop: '10%',
        paddingTop: Dimensions.get('window').height/45
    },
    urlBar: {
        top: Dimensions.get('window').height / 250,
        alignSelf: 'flex-end',
        right: '10%',
        backgroundColor: '#dbdbdb',
        width: Dimensions.get('window').width / 1.15,
        height: Dimensions.get('window').height / 25
    },
    urlInput: {
        alignSelf: 'center',
        fontFamily: 'Raleway-Medium',
        fontSize: Dimensions.get('window').height/55
    },
    urlBarOutline: {
        borderColor: '#dbdbdb',
        borderRadius: 10
    },
    urlLockIcon: {
        top: '25%',
        left: Dimensions.get('window').width/4.2
    },
    urlReloadIcon: {
        top: '25%'
    }
});
