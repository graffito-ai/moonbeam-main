import {Dimensions, StyleSheet} from "react-native";

// styles to be used within the BankAccounts component
export const styles = StyleSheet.create({
    mainView: {
        flex: 1,
        flexGrow: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    titleView: {
        alignSelf: 'flex-start'
    },
    bottomView: {
        alignItems: 'center',
    },
    content: {
        alignItems: 'flex-start',
    },
    mainTitle: {
        marginLeft: '5%',
        marginTop: '5%',
        fontSize: 30,
        fontFamily: 'Raleway-Bold',
        color: '#313030'
    },
    mainSubtitle: {
        fontSize: 15,
        fontFamily: 'Raleway-Regular',
        textAlign: 'center',
        height: Dimensions.get('window').height/5,
        width:  Dimensions.get('window').width/1.3,
        color: '#313030'
    },
    connectButton: {
        borderRadius: 25,
        borderColor: '#313030',
        height: 50,
        width: 350,
        marginTop: '5%',
        marginBottom: '20%'
    }
});
