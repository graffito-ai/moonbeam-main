import {StyleSheet} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';

// styles to be used within the StoreOfferDetails component
export const styles = StyleSheet.create({
    mainView: {
        flex: 1,
        flexGrow: 1,
        width: wp(100),
        flexDirection: 'column',
        alignContent: 'center',
        alignItems: 'center',
        alignSelf: 'center'
    },
    brandView: {
        backgroundColor: '#F2FF5D',
        paddingTop: hp(5),
        width: wp(100),
        height: hp(50),
        flexDirection: 'column'
    },
    brandLogo: {
        alignSelf: 'center',
        height: hp(16),
        width: hp(16)
    },
    brandTitle: {
        alignSelf: 'center',
        fontFamily: 'Saira-SemiBold',
        fontSize: hp(2.5),
        lineHeight: hp(3),
        width: wp(95),
        textAlign: 'center',
        color: '#FFFFFF'
    },
    brandTitleAddress: {
        bottom: hp(2.5),
        alignSelf: 'center',
        fontFamily: 'Saira-Regular',
        fontSize: hp(2),
        width: wp(95),
        lineHeight: hp(3),
        textAlign: 'center',
        color: '#F2FF5D'
    },
    offerAccordionStyle: {
        backgroundColor: '#1c1a1f',
        height: hp(10)
    },
    offerListView: {
        bottom: hp(1),
        alignSelf: 'center',
        width: wp(100)
    },
    offerAccordionTitle: {
        left: wp(25),
        alignSelf: 'flex-end',
        fontFamily: 'Raleway-Medium',
        fontSize: hp(2.3),
        width: wp(65),
        color: '#FFFFFF',
    },
    offerRightIcon: {
        top: hp(0.5)
    },
    offerLeftView: {
        backgroundColor: '#252629',
        height: hp(6),
        width: wp(25),
        flexDirection: 'row',
        alignSelf: 'flex-start',
        left: wp(5)
    },
    offerLeftDiscountPercentage: {
        top: hp(0.75),
        right: wp(20),
        fontFamily: 'Changa-Medium',
        fontSize: hp(2.3),
        width: wp(65),
        textAlign: 'center',
        alignSelf: 'flex-start',
        color: '#FFFFFF'
    },
    offerLeftDiscount: {
        top: hp(0.75),
        right: wp(20),
        fontFamily: 'Changa-SemiBold',
        fontSize: hp(2.3),
        width: wp(65),
        textAlign: 'center',
        alignSelf: 'flex-start',
        color: '#F2FF5D'
    },
    offerItem: {
        borderColor: '#FFFFFF',
        borderTopWidth: hp(0.05),
        backgroundColor: '#1c1a1f'
    },
    offerItemTitle: {
        fontFamily: 'Saira-Medium',
        fontSize: hp(1.8),
        width: wp(80),
        right: wp(7),
        textAlign: 'justify',
        alignSelf: 'flex-start',
        textDecorationLine: 'underline',
        color: '#F2FF5D'
    },
    offerItemDescription: {
        fontFamily: 'Saira-Medium',
        fontSize: hp(1.5),
        width: wp(80),
        right: wp(7),
        textAlign: 'justify',
        alignSelf: 'flex-start',
        color: '#FFFFFF'
    },
    footerTitle: {
        top: hp(3),
        alignSelf: 'center',
        fontFamily: 'Raleway-Bold',
        fontSize: hp(2),
        width: wp(90),
        textAlign: 'center',
        color: '#F2FF5D'
    },
    footerDescription: {
        top: hp(3.5),
        alignSelf: 'center',
        fontFamily: 'Raleway-Medium',
        fontSize: hp(1.8),
        width: wp(95),
        textAlign: 'center',
        color: '#FFFFFF'
    },
    onlineShoppingButton: {
        top: hp(3),
        marginBottom: hp(1.5),
        alignSelf: 'center',
        backgroundColor: '#F2FF5D',
        width: wp(85),
        height: hp(5),
        borderRadius: 0
    },
    onlineShoppingButtonContent: {
        color: '#313030',
        fontFamily: 'Saira-Medium',
        fontSize: hp(2.5),
        marginTop: hp(0.5),
        alignItems: 'center',
        alignSelf: 'center'
    },
    directionsButtonContentStyle: {
        color: '#F2FF5D',
        fontFamily: 'Saira-Medium',
        fontSize: hp(2.3),
        marginTop: hp(0.5),
        alignItems: 'center',
        alignSelf: 'center'
    },
    directionsButton: {
        position: 'absolute',
        bottom: hp(1),
        alignSelf: 'center',
        backgroundColor: '#313030',
        width: wp(60),
        height: hp(5),
        borderRadius: 0
    }
});
