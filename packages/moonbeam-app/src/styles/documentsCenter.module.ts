import {Dimensions, StyleSheet} from "react-native";

// styles to be used within the Documents Center component
export const styles = StyleSheet.create({
    mainView: {
        flex: 1,
        flexGrow: 1,
        flexDirection: 'column',
        alignItems: 'center'
    },
    titleView: {
        right: '5%',
        alignSelf: 'flex-start'
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
    documentItemStyle: {},
    documentItemTitle: {
        color: '#313030',
        fontFamily: 'Raleway-Bold'
    },
    documentItemDetails: {
        color: 'grey',
        fontFamily: 'Raleway-Medium'
    }
});
