import {Dimensions, StyleSheet} from "react-native";

// styles to be used within the SettingsList component
export const styles = StyleSheet.create({
    listSectionView: {
        marginTop: '10%',
        alignSelf: 'center',
        width: Dimensions.get('window').width/1.15,
        backgroundColor: '#5B5A5A',
        borderRadius: 10
    },
    settingsContentView: {
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
    subHeaderTitleTablet: {
        marginTop: '1.5%',
        alignSelf: 'center',
        color: '#F2FF5D',
        fontSize: Dimensions.get('window').width/43,
        fontFamily: 'Saira-Medium'
    },
    settingsItemTitle: {
        color: '#FFFFFF',
        fontFamily: 'Saira-Medium'
    },
    settingsItemDescription: {
        color: '#FFFFFF',
        fontFamily: 'Saira-Light',
        width: Dimensions.get('window').width / 1.7
    },
    divider: {
        width: Dimensions.get('window').width / 1.15,
        backgroundColor: '#FFFFFF'
    },
    settingsItemStyle: {
        alignSelf: 'center',
        alignItems: 'center',
        marginLeft: Dimensions.get('window').width/30
    },
    backButton: {
        marginTop: '-5%',
        marginLeft: `-10%`
    },
    backButtonTablet: {
        marginTop: '-5%',
        marginLeft: `-5%`
    }
});
