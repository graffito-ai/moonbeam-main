import {Dimensions, StyleSheet} from "react-native";

// styles to be used within the Home component
export const styles = StyleSheet.create({
    mainView: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    messageView: {
        flex: 0.3,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    messageTitle: {
        marginTop: '10%',
        fontSize: 25,
        fontFamily: 'Raleway-Medium',
        color: '#313030'
    },
    messageSubtitle: {
        fontSize: 15,
        fontFamily: 'Raleway-Regular',
        textAlign: 'center',
        height: Dimensions.get('window').height/5,
        width:  Dimensions.get('window').width/1.3,
        color: '#313030'
    },
    referralArt: {
        alignSelf: 'center',
        width: Dimensions.get('window').width / 1.5,
        height: Dimensions.get('window').height / 3.5,
    },
    messageFooterTitle: {
        marginTop: '10%',
        fontSize: 20,
        fontFamily: 'Raleway-Medium',
        textAlign: 'center',
        color: '#313030'
    },
    messageFooterSubtitle: {
        fontSize: 15,
        fontFamily: 'Raleway-Regular',
        textAlign: 'center',
        width: Dimensions.get('window').width / 1.2,
        color: '#313030'
    },
    referButton: {
        borderRadius: 25,
        borderColor: '#313030',
        height: 50,
        width: 350,
        marginTop: '20%'
    }
});
