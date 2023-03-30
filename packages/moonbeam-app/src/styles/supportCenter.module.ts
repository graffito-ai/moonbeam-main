import {Dimensions, StyleSheet} from "react-native";

// styles to be used within the Support component
export const styles = StyleSheet.create({
    mainView: {
        flex: 1,
        flexGrow: 1,
        flexDirection: 'column',
        alignItems: 'center'
    },
    titleView: {
        left: '1.5%',
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
        fontFamily: 'Raleway-Medium',
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
        marginTop: '5%'
    },
    listSectionView: {
        marginTop: '10%',
        alignSelf: 'center',
        width: Dimensions.get('window').width/1.15,
        backgroundColor: '#f2f2f2',
        shadowColor: '#313030',
        shadowOffset: {width: -2, height: 2},
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 15,
        borderRadius: 10
    },
    subHeaderTitle: {
        alignSelf: 'flex-start',
        color: '#313030',
        fontSize: 15,
        fontFamily: 'Raleway-Medium'
    },
    supportItemStyle: {},
    supportItemTitle: {
        color: '#313030',
        fontFamily: 'Raleway-Bold'
    },
    supportItemDetails: {
        color: 'grey',
        fontFamily: 'Raleway-Medium'
    },
    supportItemRightIcon: {
        alignItems: 'flex-end',
        top: '1.5%'
    },
    bottomTextView: {
        marginTop: '5%'
    },
    bottomText: {
        textAlign: 'center',
        alignSelf: 'center',
        color: 'grey',
        fontSize: 15,
        fontFamily: 'Raleway-Medium'
    },
    bottomTextButton: {
        textAlign: 'center',
        fontFamily: 'Raleway-Bold',
        fontSize: 15,
        color: '#2A3779'
    },
    modalParagraph: {
        textAlign: 'center',
        alignSelf: 'flex-start',
        fontFamily: 'Raleway-Regular',
        fontSize: 16,
        width: 350,
        color: '#313030'
    },
    modalContainer: {
        alignSelf: 'center',
        backgroundColor: 'white',
        height: Dimensions.get('window').height/6,
        borderRadius: 15,
        padding: 20,
        borderWidth: 1,
        borderColor: 'grey'
    },
    modalButton: {
        borderRadius: 25,
        height: 40,
        width: 300,
        top: '15%',
        alignSelf: 'center'
    }
});