import {Dimensions, StyleSheet} from "react-native";

// styles to be used within the StoreOfferDetails component
export const styles = StyleSheet.create({
    mainView: {
        flex: 1,
        flexGrow: 1,
        width: '100%',
        flexDirection: 'column',
        alignContent: 'center',
        alignItems: 'center',
        alignSelf: 'center'
    },
    brandView: {
        top: Dimensions.get('window').height/10,
        width: Dimensions.get('window').width,
        flexDirection: 'column',
        paddingBottom: Dimensions.get('window').height/50
    },
    brandLogo: {
        alignSelf: 'center'
    },
    brandTitle: {
        top: Dimensions.get('window').height/100,
        alignSelf: 'center',
        fontFamily: 'Saira-SemiBold',
        fontSize: Dimensions.get('window').width / 20,
        width: Dimensions.get('window').width / 1.1,
        textAlign: 'center',
        color: '#FFFFFF'
    },
    brandTitleAddress: {
        top: Dimensions.get('window').height/100,
        alignSelf: 'center',
        fontFamily: 'Saira-Regular',
        fontSize: Dimensions.get('window').width / 25,
        width: Dimensions.get('window').width / 1.1,
        textAlign: 'center',
        color: '#F2FF5D'
    },
    offerAccordionStyle: {
        backgroundColor: '#1c1a1f',
        height: Dimensions.get('window').height/12
    },
    offerListView: {
        bottom: Dimensions.get('window').height/145,
        alignSelf: 'center',
        width: Dimensions.get('window').width
    },
    offerAccordionTitle: {
        left: Dimensions.get('window').width/4,
        alignSelf: 'flex-end',
        fontFamily: 'Raleway-Medium',
        fontSize: Dimensions.get('window').width / 22,
        width: Dimensions.get('window').width / 1.5,
        color: '#FFFFFF',
    },
    offerRightIcon: {
        top: Dimensions.get('window').height/150
    },
    offerLeftView: {
        backgroundColor: '#252629',
        height: Dimensions.get('window').height/17,
        width: Dimensions.get('window').width/4,
        flexDirection: 'row',
        alignSelf: 'flex-start',
        left: Dimensions.get('window').width/20,
        bottom: Dimensions.get('window').height/500
    },
    offerLeftDiscountPercentage: {
        top: Dimensions.get('window').height/80,
        right: Dimensions.get('window').height/10,
        fontFamily: 'Changa-Medium',
        fontSize: Dimensions.get('window').width / 20,
        width: Dimensions.get('window').width / 1.5,
        textAlign: 'center',
        alignSelf: 'flex-start',
        color: '#FFFFFF'
    },
    offerLeftDiscount: {
        top: Dimensions.get('window').height/80,
        right: Dimensions.get('window').height/10,
        fontFamily: 'Changa-SemiBold',
        fontSize: Dimensions.get('window').width / 20,
        width: Dimensions.get('window').width / 1.5,
        textAlign: 'center',
        alignSelf: 'flex-start',
        color: '#F2FF5D'
    },
    offerItem: {
        borderColor: '#FFFFFF',
        borderTopWidth: Dimensions.get('window').height/2000,
        backgroundColor: '#1c1a1f'
    },
    offerItemTitle: {
        fontFamily: 'Saira-Medium',
        fontSize: Dimensions.get('window').width / 30,
        width: Dimensions.get('window').width / 1.15,
        right: Dimensions.get('window').width/15,
        textAlign: 'justify',
        alignSelf: 'flex-start',
        textDecorationLine: 'underline',
        color: '#F2FF5D'
    },
    offerItemDescription: {
        fontFamily: 'Saira-Medium',
        fontSize: Dimensions.get('window').width / 30,
        width: Dimensions.get('window').width / 1.15,
        textAlign: 'justify',
        alignSelf: 'flex-start',
        color: '#FFFFFF',
        right: Dimensions.get('window').width/15,
    },
    footerTitle: {
        top: Dimensions.get('window').height/30,
        alignSelf: 'center',
        fontFamily: 'Raleway-Bold',
        fontSize: Dimensions.get('window').width / 28,
        width: Dimensions.get('window').width / 1.5,
        textAlign: 'center',
        color: '#F2FF5D'
    },
    footerDescription: {
        top: Dimensions.get('window').height/30,
        alignSelf: 'center',
        fontFamily: 'Raleway-Medium',
        fontSize: Dimensions.get('window').width / 30,
        width: Dimensions.get('window').width / 1.1,
        textAlign: 'center',
        color: '#FFFFFF'
    },
    onlineShoppingButton: {
        top: Dimensions.get('window').height/30,
        marginBottom: Dimensions.get('window').height/100,
        alignSelf: 'center',
        backgroundColor: '#F2FF5D',
        width: Dimensions.get('window').width/1.1,
        height: Dimensions.get('window').height/20,
        borderRadius: 0
    },
    onlineShoppingButtonContent: {
        color: '#313030',
        fontFamily: 'Saira-Medium',
        fontSize: Dimensions.get('window').height/45,
        marginTop: Dimensions.get('window').height / 200,
        alignItems: 'center',
        alignSelf: 'center'
    },
});
