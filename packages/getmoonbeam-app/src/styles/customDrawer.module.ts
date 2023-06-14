import {StyleSheet} from "react-native";

// styles to be used within the CustomDrawer component
export const styles = StyleSheet.create({
    avatarStyle: {
        alignSelf: 'flex-start',
        left: '10%',
        backgroundColor: 'white',
        top: '5%'
    },
    avatarAccessoryStyle: {
        left: '72%',
        top: '75%',
        backgroundColor: '#303030'
    },
    userNameStyle: {
        alignSelf: 'flex-start',
        fontFamily: 'Saira-Medium',
        color: 'white',
        textAlign: 'left'
    },
    titleStyle: {
        fontFamily: 'Raleway-Regular',
        color: 'grey'
    },
    drawerItemListView: {
        flex: 1,
        backgroundColor: '#5B5A5A',
        padding: 5
    },
    bottomDrawerItemListView: {
        backgroundColor: '#5B5A5A',
        marginLeft: '2%',
        marginBottom: '10%'
    },
    drawerItemLabel: {
        fontFamily: 'Raleway-Medium',
        color: '#FFFFFF'
    }
});
