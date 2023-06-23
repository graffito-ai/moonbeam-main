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
        alignSelf: 'center',
        backgroundColor: '#313030'
    },
    cardRemovalButton: {
        backgroundColor: '#F2FF5D',
        position: 'absolute',
        width: Dimensions.get('window').width/1.4,
        height: Dimensions.get('window').height/20,
        bottom: -Dimensions.get('window').height/9,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center'
    },
    linkingButton: {
        backgroundColor: '#F2FF5D',
        width: Dimensions.get('window').width/1.4,
        height: Dimensions.get('window').height/20,
        left: Dimensions.get('window').width/13,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center'
    },
    linkingButtonDisabled: {
        backgroundColor: '#D9D9D9',
        width: Dimensions.get('window').width/1.4,
        height: Dimensions.get('window').height/20,
        left: Dimensions.get('window').width/13,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center'
    },
    splashButton: {
        backgroundColor: '#F2FF5D',
        width: Dimensions.get('window').width/1.4,
        height: Dimensions.get('window').height/20,
        marginBottom: Dimensions.get('window').width/30,
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
    cardLinkingParentView: {
        backgroundColor: '#5B5A5A',
        alignContent: 'center',
        alignSelf: 'center',
        alignItems: 'center'
    },
    cardLinkingIframeView: {
        left: Dimensions.get('window').width / 2.03,
        backgroundColor: 'transparent',
        width: Dimensions.get('window').width*2,
        flexGrow: 1
    },
    disclaimerTextView: {
        position: 'absolute',
        bottom: Dimensions.get('window').height/40,
        alignSelf: 'center',
        textAlign: 'center'
    },
    disclaimerText: {
        fontFamily: 'Saira-Regular',
        fontSize: Dimensions.get('window').width / 28,
        width: Dimensions.get('window').width / 1.15,
        textAlign: 'center'
    },
    walletTextView: {
        alignSelf: 'flex-start',
        marginTop: Dimensions.get('window').height / 20,
        left: Dimensions.get('window').width / 20
    },
    walletTitle: {
        fontFamily: 'Saira-SemiBold',
        fontSize: Dimensions.get('window').width / 13,
        color: '#FFFFFF'
    },
    walletSubtitle: {
        fontFamily: 'Raleway-Regular',
        fontSize: Dimensions.get('window').width / 22,
        width: Dimensions.get('window').width / 1.15,
        textAlign: 'justify',
        color: '#FFFFFF'
    },
    cardRemovalTitle: {
        fontFamily: 'Saira-Medium',
        fontSize: Dimensions.get('window').width / 13,
        color: '#FFFFFF'
    },
    cardRemovalDetails: {
        fontFamily: 'Saira-Medium',
        fontSize: Dimensions.get('window').width / 23,
        bottom: Dimensions.get('window').height / 80,
        color: '#F2FF5D'
    },
    cardRemovalSubtitle: {
        fontFamily: 'Raleway-Regular',
        fontSize: Dimensions.get('window').width / 22,
        width: Dimensions.get('window').width / 1.15,
        top: Dimensions.get('window').height / 100,
        textAlign: 'center',
        color: '#FFFFFF'
    },
    bottomSheet: {
        backgroundColor: '#5B5A5A'
    },
    highlightedText: {
        color: '#F2FF5D'
    }
});
