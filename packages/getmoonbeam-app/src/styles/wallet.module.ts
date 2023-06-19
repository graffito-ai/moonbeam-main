import {Dimensions, StyleSheet} from "react-native";

// styles to be used within the Wallet component
export const styles = StyleSheet.create({
    walletView: {
        flex: 1,
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        alignContent: 'center',
        alignItems: 'center',
        alignSelf: 'center'
    },
    linkingButton: {
        backgroundColor: '#F2FF5D',
        width: Dimensions.get('window').width/1.4,
        height: Dimensions.get('window').height/20,
        marginTop: Dimensions.get('window').height/2.8,
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
    listSectionView: {
        left: Dimensions.get('window').width / 20,
        marginTop: Dimensions.get('window').height / 20,
        alignSelf: 'flex-start',
        width: Dimensions.get('window').width/1.15,
        backgroundColor: '#5B5A5A',
        borderRadius: 10
    },
    subHeaderTitle: {
        alignSelf: 'flex-start',
        color: '#F2FF5D',
        fontSize: Dimensions.get('window').height/65,
        fontFamily: 'Raleway-Medium'
    },
    cardItemStyle: {},
    cardItemTitle: {
        color: '#FFFFFF',
        fontFamily: 'Saira-Bold'
    },
    cardItemDetails: {
        color: '#FFFFFF',
        fontFamily: 'Saira-Medium'
    },
    bottomSheetContainerContent: {
        backgroundColor: '#5B5A5A',
        alignItems: 'center',
        height: Dimensions.get('window').height
    },
});
