import {Dimensions, StyleSheet} from "react-native";

// styles to be used within the PartnerMerchantStore component
export const styles = StyleSheet.create({
    mainView: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    messageView: {
        marginTop: '40%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomMessageView: {
        marginTop: '40%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    messageTitle: {
        marginTop: '2.5%',
        fontSize: Dimensions.get('window').height / 30,
        fontFamily: 'Raleway-Medium',
        color: '#313030'
    },
    messageSubtitle: {
        fontSize:  Dimensions.get('window').height / 40,
        fontFamily: 'Raleway-Regular',
        textAlign: 'center',
        height: Dimensions.get('window').height / 5,
        width: Dimensions.get('window').width / 1.3,
        color: '#575757',
        marginBottom: '-15%'
    },
    referralArt: {
        alignSelf: 'center',
        width: Dimensions.get('window').width / 1.5,
        height: Dimensions.get('window').height / 2.8,
    },
    messageFooterTitle: {
        fontSize:  Dimensions.get('window').height / 45,
        fontFamily: 'Raleway-Medium',
        textAlign: 'center',
        color: '#313030'
    },
    messageFooterSubtitle: {
        fontSize: Dimensions.get('window').height / 60,
        fontFamily: 'Raleway-Light',
        textAlign: 'center',
        width: Dimensions.get('window').width / 1.2,
        color: '#575757'
    },
    referButton: {
        borderRadius: 25,
        borderColor: '#313030',
        height: Dimensions.get('window').height/19,
        width: Dimensions.get('window').width/1.15,
        marginBottom: '5%'
    },
});
