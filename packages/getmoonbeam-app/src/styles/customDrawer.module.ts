import {StyleSheet} from "react-native";

// styles to be used within the CustomDrawer component
export const styles = StyleSheet.create({
    avatarStyle: {
        alignSelf: 'flex-start',
        right: '10%',
        backgroundColor: 'grey',
        top: '-20%'
    },
    avatarAccessoryStyle: {
        left: '75%',
        top: '75%'
    },
    userNameStyle: {
        alignSelf: 'flex-start',
        top: '-5%',
        right: '8%',
        fontFamily: 'Raleway-Medium',
        fontSize: 22
    },
    drawerItemListView: {
        flex: 1,
        backgroundColor: 'white',
        padding: 5
    },
    bottomDrawerItemListView: {
        backgroundColor: 'white',
        marginLeft: '2%',
        marginBottom: '5%'
    },
    drawerItemLabel: {
        fontFamily: 'Raleway-Bold',
        fontSize: 16
    }
});
