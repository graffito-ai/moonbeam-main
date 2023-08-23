import {Dimensions, StyleSheet} from "react-native";

// styles to be used within the Wallet component
export const styles = StyleSheet.create({
    cardView: {
        flexDirection: 'column',
        alignContent: 'center',
        alignItems: 'center',
        alignSelf: 'center'
    },
    mainCardView: {
        flex: 1,
        width: '100%'
    },
    noCardImage: {
        height: Dimensions.get('window').height * 0.55,
        width: Dimensions.get('window').width * 0.55,
        bottom: Dimensions.get('window').height / 25,
        alignSelf: 'center'
    },
    walletTopTitleView: {
        width: Dimensions.get('window').width,
        flexDirection: 'row',
        alignContent: 'flex-start',
        alignItems: 'flex-start',
        alignSelf: 'flex-start'
    },
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
        width: Dimensions.get('window').width / 1.4,
        height: Dimensions.get('window').height / 20,
        bottom: -Dimensions.get('window').height / 9,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center'
    },
    linkingButton: {
        backgroundColor: '#F2FF5D',
        width: Dimensions.get('window').width / 1.4,
        height: Dimensions.get('window').height / 20,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center'
    },
    linkingButtonDisabled: {
        display: "none"
    },
    splashButton: {
        backgroundColor: '#F2FF5D',
        width: Dimensions.get('window').width / 1.4,
        height: Dimensions.get('window').height / 20,
        marginBottom: Dimensions.get('window').width / 30,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonText: {
        color: '#313030',
        fontFamily: 'Saira-Medium',
        fontSize: Dimensions.get('window').height / 45,
        marginTop: Dimensions.get('window').height / 90
    },
    listSectionView: {
        left: Dimensions.get('window').width / 20,
        marginTop: Dimensions.get('window').height / 20,
        alignSelf: 'flex-start',
        width: Dimensions.get('window').width / 1.1,
        borderRadius: 10
    },
    subHeaderTitle: {
        alignSelf: 'flex-start',
        color: '#F2FF5D',
        fontSize: Dimensions.get('window').height / 65,
        fontFamily: 'Raleway-Medium'
    },
    cardItemStyle: {
        backgroundColor: '#F2FF5D',
        height: Dimensions.get('window').height / 4,
        width: Dimensions.get('window').width / 1.1,
        borderRadius: 20
    },
    cardItemTitle: {
        color: '#313030',
        fontFamily: 'Saira-Bold',
        fontSize: Dimensions.get('window').height / 40,
        width: Dimensions.get('window').width / 3,
        bottom: Dimensions.get('window').height / 40
    },
    cardItemDetails: {
        color: '#313030',
        fontFamily: 'Saira-Regular',
        fontSize: Dimensions.get('window').height / 50
    },
    cardLinkingParentView: {
        backgroundColor: '#5B5A5A',
        alignContent: 'center',
        alignSelf: 'center',
        alignItems: 'center'
    },
    cardLinkingIframeView: {
        backgroundColor: 'transparent',
        width: Dimensions.get('window').width * 1.3,
        flexGrow: 1
    },
    disclaimerTextView: {
        position: 'absolute',
        bottom: Dimensions.get('window').height / 30,
        alignItems: 'center',
        alignSelf: 'center',
        textAlign: 'center'
    },
    disclaimerText: {
        fontFamily: 'Saira-Regular',
        fontSize: Dimensions.get('window').width / 23,
        width: Dimensions.get('window').width / 1.5,
        textAlign: 'center'
    },
    disclaimerTextTablet: {
        fontFamily: 'Saira-Regular',
        fontSize: Dimensions.get('window').width / 35,
        width: Dimensions.get('window').width / 1.7,
        textAlign: 'center'
    },
    walletTextView: {
        alignSelf: 'flex-start',
        flexDirection: 'column',
        marginTop: Dimensions.get('window').height / 30,
        left: Dimensions.get('window').width / 20
    },
    walletTitle: {
        fontFamily: 'Saira-SemiBold',
        fontSize: Dimensions.get('window').width / 13,
        color: '#FFFFFF'
    },
    walletTitleTablet: {
        fontFamily: 'Saira-SemiBold',
        fontSize: Dimensions.get('window').width / 19,
        color: '#FFFFFF'
    },
    walletSubtitle: {
        fontFamily: 'Raleway-Regular',
        fontSize: Dimensions.get('window').width / 22,
        width: Dimensions.get('window').width / 1.15,
        textAlign: 'justify',
        color: '#FFFFFF'
    },
    walletSubtitleTablet: {
        fontFamily: 'Raleway-Regular',
        fontSize: Dimensions.get('window').width / 28,
        width: Dimensions.get('window').width / 1.15,
        textAlign: 'justify',
        color: '#FFFFFF'
    },
    cardRemovalTitle: {
        fontFamily: 'Saira-Medium',
        fontSize: Dimensions.get('window').width / 13,
        color: '#FFFFFF'
    },
    cardRemovalTitleTablet: {
        fontFamily: 'Saira-Medium',
        fontSize: Dimensions.get('window').width / 18,
        color: '#FFFFFF'
    },
    cardRemovalDetails: {
        fontFamily: 'Saira-Medium',
        fontSize: Dimensions.get('window').width / 23,
        bottom: Dimensions.get('window').height / 80,
        color: '#F2FF5D'
    },
    cardRemovalDetailsTablet: {
        fontFamily: 'Saira-Medium',
        fontSize: Dimensions.get('window').width / 33,
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
    cardRemovalSubtitleTablet: {
        fontFamily: 'Raleway-Regular',
        fontSize: Dimensions.get('window').width / 32,
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
