import {Dimensions, StyleSheet} from "react-native";

// styles to be used within the Store component
export const styles = StyleSheet.create({
    mainView: {
        flex: 1,
        flexGrow: 1,
        width: '100%',
        flexDirection: 'column',
        backgroundColor: '#313030'
    },
    titleView: {
        alignContent: 'flex-end',
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    mainTitle: {
        alignSelf: 'flex-start',
        marginLeft: '7%',
        fontSize: Dimensions.get('window').width / 11,
        fontFamily: 'Saira-SemiBold',
        color: '#FFFFFF',
    },
    mainSubtitle: {
        marginLeft: '7%',
        bottom: Dimensions.get('window').height / 100,
        fontSize: Dimensions.get('window').width / 25,
        fontFamily: 'Raleway-Light',
        color: '#FFFFFF'
    },
    toggleViewButton: {
        width: Dimensions.get('window').width / 11,
        height: Dimensions.get('window').width / 11,
        marginTop: "2%"
    },
    searchBar: {
        marginTop: "2%",
        width: Dimensions.get('window').width / 1.05,
        height: Dimensions.get('window').height / 22,
        alignSelf: 'flex-start',
        marginLeft: Dimensions.get('window').width / 30,
        backgroundColor: '#5B5A5A',
        borderRadius: 10
    },
    searchBarInput: {
        fontFamily: 'Raleway-Light',
        fontSize: Dimensions.get('window').width / 25,
        bottom: Dimensions.get('window').height / 120,
        color: '#FFFFFF'
    },
    filterChip: {
        marginRight: '5%',
        width: Dimensions.get('window').width / 3.7,
        height: Dimensions.get('window').height / 25,
        borderColor: 'transparent'
    },
    filterChipText: {
        fontFamily: 'Raleway-Medium',
        color: '#F2FF5D'
    },
    filterChipView: {
        marginLeft: '2%',
        alignSelf: 'center',
        marginTop: '3%',
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    content: {
        flex: 1,
        flexGrow: 1,
        alignItems: 'flex-start'
    },
    horizontalScrollView: {
        marginTop: '5%',
        flexDirection: 'column',
        flex: 1,
        flexGrow: 1
    },
    featuredPartnersView: {
        height: '100%'
    },
    featuredPartnersTitle: {
        fontSize: Dimensions.get('window').height / 45,
        fontFamily: 'Changa-Medium',
        textDecorationLine: 'underline',
        left: '5%',
        alignSelf: 'flex-start'
    },
    onlineOffersView: {
        height: '100%',
        bottom: '122%',
        left: '1.5%'
    },
    onlineOffersTitleView: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        top: '1%'
    },
    onlineOffersLeftTitleView: {
        flexDirection: 'column'
    },
    onlineOffersTitle: {
        fontSize: Dimensions.get('window').height / 45,
        fontFamily: 'Changa-Medium',
        textDecorationLine: 'underline',
        left: '10%',
        alignSelf: 'flex-start'
    },
    onlineOffersTitleSub: {
        fontSize: Dimensions.get('window').height / 75,
        fontFamily: 'Changa-Medium',
        textDecorationLine: 'none',
        color: '#F2FF5D',
        left: '10%',
        alignSelf: 'flex-start'
    },
    onlineOffersTitleButton: {
        right: Dimensions.get('window').width/25,
        fontSize: Dimensions.get('window').height / 55,
        fontFamily: 'Raleway-Bold',
        color: '#F2FF5D',
        textDecorationLine: 'underline',
        alignSelf: 'flex-end',
        top: '16%'
    },
    onlineOffersScrollView: {
        right: Dimensions.get('window').width / 30,
        height: '50%'
    },
    onlineOfferCard: {
        right: Dimensions.get('window').width / 30,
        backgroundColor: 'transparent',
        width: Dimensions.get('window').width / 3,
        height: Dimensions.get('window').height / 3.8,
    },
    onlineOfferCardTitle: {
        fontFamily: 'Raleway-Medium',
        fontSize: Dimensions.get('window').height / 60,
        alignSelf: 'center',
        textAlign: 'center',
        bottom: Dimensions.get('window').height / 1200
    },
    onlineOfferCardSubtitle: {
        fontSize: Dimensions.get('window').height / 70,
        fontFamily: 'Raleway-Bold',
        alignSelf: 'center',
        textAlign: 'center',
        color: '#F2FF5D',
        bottom: Dimensions.get('window').height / 500
    },
    onlineOfferCardCover: {
        width: Dimensions.get('window').width / 3.8,
        height: Dimensions.get('window').height / 8.5,
        borderBottomRightRadius: 5,
        borderBottomLeftRadius: 5,
    },
    nearbyOffersView: {
        height: '100%',
        bottom: '65%',
        left: '1.5%'
    },
    nearbyOffersTitleView: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        bottom: '2%'
    },
    nearbyOffersLeftTitleView: {
        flexDirection: 'column'
    },
    nearbyOffersTitle: {
        fontSize: Dimensions.get('window').height / 45,
        fontFamily: 'Changa-Medium',
        textDecorationLine: 'underline',
        left: '10%',
        alignSelf: 'flex-start'
    },
    nearbyOffersTitleSub: {
        fontSize: Dimensions.get('window').height / 75,
        fontFamily: 'Changa-Medium',
        textDecorationLine: 'none',
        color: '#F2FF5D',
        left: '10%',
        alignSelf: 'flex-start'
    },
    nearbyOffersTitleButton: {
        right: Dimensions.get('window').width/25,
        fontSize: Dimensions.get('window').height / 55,
        fontFamily: 'Raleway-Bold',
        color: '#F2FF5D',
        textDecorationLine: 'underline',
        alignSelf: 'flex-end',
        top: '16%'
    },
    nearbyOffersScrollView: {
        height: '50%',
        bottom: '80%'
    },
    featuredPartnerCard: {
        top: '0.5%',
        left: '2%',
        backgroundColor: '#5B5A5A',
        width: Dimensions.get('window').width / 1.15,
        height: Dimensions.get('window').height / 4,
        shadowColor: 'black',
        shadowOffset: {width: -2, height: 1},
        shadowOpacity: 0.6,
        shadowRadius: 2,
        elevation: 15
    },
    featuredPartnerCardCover: {
        alignSelf: 'flex-end',
        top: '10%',
        left: '65%',
        width: Dimensions.get('window').width / 3.5,
        height: Dimensions.get('window').width / 4,
    },
    featuredPartnerCardTitle: {
        right: '5%',
        fontFamily: 'Raleway-Medium',
        fontSize: Dimensions.get('window').height / 48,
        width: Dimensions.get('window').width / 1.9,
        alignSelf: 'flex-start',
        color: '#FFFFFF'
    },
    featuredPartnerCardSubtitle: {
        right: '5%',
        fontSize: Dimensions.get('window').height / 60,
        fontFamily: 'Raleway-SemiBold',
        alignSelf: 'flex-start',
        bottom: '3%',
        width: Dimensions.get('window').width / 2,
        color: '#F2FF5D',
    },
    featuredPartnerCardParagraph: {
        top: '10%',
        padding: 8,
        textAlign: 'justify',
        fontFamily: 'Raleway-Bold',
        fontSize: Dimensions.get('window').height / 75,
        color: '#FFFFFF'
    },
    featuredPartnerCardActionButton: {
        top: '10%',
        left: '5%',
        height: Dimensions.get('window').height / 25,
        width: Dimensions.get('window').width / 3,
        borderRadius: 5
    },
    featuredPartnerCardActionButtonLabel: {
        fontFamily: 'Saira-SemiBold',
        fontSize: Dimensions.get('window').height / 60
    },
    nearbyOfferCard: {
        top: '0.5%',
        left: '1.5%',
        backgroundColor: '#5B5A5A',
        width: Dimensions.get('window').width / 1.3,
        height: Dimensions.get('window').height / 3.2,
        shadowColor: 'black',
        shadowOffset: {width: -2, height: 1},
        shadowOpacity: 0.6,
        shadowRadius: 2,
        elevation: 15
    },
    nearbyOfferCardTitle: {
        bottom: '15%',
        right: '5%',
        fontFamily: 'Raleway-Medium',
        fontSize: Dimensions.get('window').height / 48,
        width: Dimensions.get('window').width / 1.3,
        alignSelf: 'flex-start',
        color: '#FFFFFF'
    },
    nearbyOfferCardSubtitle: {
        right: '5%',
        fontSize: Dimensions.get('window').height / 60,
        fontFamily: 'Raleway-SemiBold',
        alignSelf: 'flex-start',
        bottom: '20%',
        width: Dimensions.get('window').width / 2,
        color: '#F2FF5D',
    },
    nearbyOfferCardActionButton: {
        top: '2%',
        alignSelf: 'flex-end',
        height: Dimensions.get('window').height / 25,
        width: Dimensions.get('window').width / 3,
        borderRadius: 5
    },
    nearbyOfferCardActionButtonLabel: {
        fontFamily: 'Saira-SemiBold',
        fontSize: Dimensions.get('window').height / 60
    },
    offerMapView: {
        height: Dimensions.get('window').height/7,
        width: Dimensions.get('window').width / 1.3,
        bottom: Dimensions.get('window').height/55,
        left: -Dimensions.get('window').width / 28
    },
    mapTooltip: {
        zIndex: 500,
        backgroundColor: "transparent",
    },
    mapTooltipSquare: {
        zIndex: 600,
        height: Dimensions.get('window').height / 25,
        width: Dimensions.get('window').width / 4.5,
        backgroundColor: "#313030",
        borderRadius: 10,
        borderColor: '#F2FF5D',
        borderWidth: 4
    },
    mapTooltipArrow: {
        zIndex: 700,
        position: "absolute",
        top: -Dimensions.get('window').height / 100,
        right: Dimensions.get('window').width / 17.4,
        width: 0,
        height: 0,
        borderStyle: "solid",
        borderLeftWidth: Dimensions.get('window').height / 45,
        borderRightWidth: Dimensions.get('window').height / 45,
        borderBottomWidth: Dimensions.get('window').height / 35,
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderBottomColor: "#313030"
    },
    mapTooltipArrowOverlay: {
        position: "absolute",
        top: -Dimensions.get('window').height / 60,
        right: Dimensions.get('window').width / 17.4,
        width: 0,
        height: 0,
        borderStyle: "solid",
        borderLeftWidth: Dimensions.get('window').height / 45,
        borderRightWidth: Dimensions.get('window').height / 45,
        borderBottomWidth: Dimensions.get('window').height / 35,
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderBottomColor: "#F2FF5D"
    },
    toolTipDetailsView: {
        backgroundColor: "transparent",
        flexDirection: 'row',
        alignSelf: 'center',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        bottom: Dimensions.get('window').height/30,
        zIndex: 1000
    },
    toolTipImageDetail: {
        alignSelf: 'center',
        right: Dimensions.get('window').width / 55
    },
    toolTipImagePrice: {
        left: Dimensions.get('window').width / 50,
        top: Dimensions.get('window').width / 500,
        alignSelf: 'center',
        fontFamily: 'Raleway-ExtraBold',
        fontSize: Dimensions.get('window').width / 24,
        textAlign: 'center',
        color: '#F2FF5D'
    },
    verticalOfferBenefit: {
        fontFamily: 'Raleway-Bold',
        color: '#F2FF5D'
    },
    verticalOfferBenefits: {
        marginTop: '2%',
        fontFamily: 'Raleway-SemiBold',
        color: '#FFFFFF',
        fontSize: 14
    },
    verticalOfferName: {
        fontFamily: 'Raleway-SemiBold',
        color: '#FFFFFF',
        fontSize: Dimensions.get('window').height / 50
    }
});
