import {Dimensions, StyleSheet} from "react-native";

// styles to be used within the DocumentsCenter component
export const styles = StyleSheet.create({
    content: {
        alignItems: 'center',
    },
    listSectionView: {
        marginTop: '10%',
        alignSelf: 'center',
        width: Dimensions.get('window').width/1.15,
        backgroundColor: '#5B5A5A',
        borderRadius: 10
    },
    documentsContentView: {
        flex: 1,
        flexGrow: 1,
        flexDirection: 'column',
        backgroundColor: '#313030'
    },
    subHeaderTitle: {
        marginTop: '1.5%',
        alignSelf: 'center',
        color: '#F2FF5D',
        fontSize: Dimensions.get('window').width/23,
        fontFamily: 'Saira-Medium'
    },
    divider: {
        width: Dimensions.get('window').width / 1.15,
        backgroundColor: '#FFFFFF'
    },
    documentsItemStyle: {
        alignSelf: 'center',
        alignItems: 'center',
        marginLeft: Dimensions.get('window').width/30
    },
    documentsItemTitle: {
        color: '#FFFFFF',
        fontFamily: 'Saira-Medium'
    },
    documentsItemDescription: {
        color: '#FFFFFF',
        fontFamily: 'Saira-Light',
        width: Dimensions.get('window').width / 1.7
    },
});
