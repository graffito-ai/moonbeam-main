import {Dimensions, StyleSheet} from "react-native";

// styles to be used within the HomeDash component
export const styles = StyleSheet.create({
    topBarColumnView: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    subHeaderTitle: {
        alignSelf: 'center',
        color: '#313030',
        fontSize: 18,
        fontFamily: 'Raleway-Bold'
    },
    dashboardItemTitle: {
        color: '#313030',
        fontFamily: 'Raleway-Bold'
    },
    dashboardItemDescription: {
        color: '#313030',
        fontFamily: 'Raleway-Medium'
    },
    topListItemRightView: {
        flexDirection: 'row'
    },
    topPriceView: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        flexDirection: 'column'
    },
    listItemPrice: {
        fontSize: 16,
        fontFamily: 'Raleway-Bold',
        color: '#313030',
    },
    topPaymentView: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        flexDirection: 'row'
    },
    listItemPaymentAmount: {
        fontSize: 16,
        fontFamily: 'Raleway-Bold',
        color: '#313030',
        marginBottom: '17%'
    },
    listItemDiscount: {
        marginTop: '5%',
        fontSize: 13,
        fontFamily: 'Raleway-Medium',
        color: '#2A3779',
        backgroundColor: '#c9d179'
    },
    listItemIcon: {
        alignItems: 'flex-end',
        justifyContent: 'center'
    },
    listItemView: {
        marginTop: '-10%'
    },
    segmentedButtons: {
        marginTop: Dimensions.get('window').height / 2.3,
        width: 350,
        alignSelf: 'center'
    }
});
