import {
    DrawerContentComponentProps,
    DrawerContentScrollView,
    DrawerItem,
    DrawerItemList
} from '@react-navigation/drawer';
import {Dimensions, ImageBackground, Text, View} from 'react-native';
import {Avatar, Divider} from "@rneui/base";
import React, {useEffect, useState} from "react";
import {RootStackParamList} from "../../models/RootProps";
import {commonStyles} from "../../styles/common.module";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {styles} from '../../styles/customDrawer.module';

export const CustomDrawer = (props: DrawerContentComponentProps & (RootStackParamList["MainDash"])) => {
    // state driven key-value pairs for UI related elements
    const [currentUserTitle, setCurrentUserTitle] = useState<string>("N/A");

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // set the title of the user's avatar in the dashboard, based on the user's information
        const secondInitial = props.currentUserInformation["name"].split(" ").length > 2 ? 2 : 1;
        setCurrentUserTitle(`${Array.from(props.currentUserInformation["name"].split(" ")[0])[0] as string}${Array.from(props.currentUserInformation["name"].split(" ")[secondInitial])[0] as string}`);
    }, []);

    return (
        <View style={{flex: 1}}>
            <DrawerContentScrollView
                {...props}
                scrollEnabled={false}
                contentContainerStyle={{backgroundColor: '#f2f2f2', flexDirection: 'column'}}
            >
                <ImageBackground
                    imageStyle={{
                        resizeMode: 'cover'
                    }}
                    style={{padding: `${Dimensions.get('window').width/25}%`}}
                    source={require('../../../assets/sidebar.png')}>
                    <Avatar
                        size={Dimensions.get('window').width/4.5}
                        rounded
                        title={currentUserTitle}
                        containerStyle={styles.avatarStyle}
                        onPress={() => {
                            console.log('go to profile');
                        }}
                    >
                        <Avatar.Accessory
                            size={20}
                            style={styles.avatarAccessoryStyle}
                            onPress={() => {
                                console.log('go to profile');
                            }}
                        />
                    </Avatar>
                    {/*@ts-ignore*/}
                    <Text numberOfLines={2} style={styles.userNameStyle}>{props.currentUserInformation['name']}</Text>
                </ImageBackground>
                <View style={styles.drawerItemListView}>
                    <DrawerItemList {...props}/>
                </View>
            </DrawerContentScrollView>
            <View style={styles.bottomDrawerItemListView}>
                <Divider
                    style={[commonStyles.divider]}/>
                {/*@ts-ignore*/}
                <DrawerItem
                    activeBackgroundColor={'transparent'}
                    activeTintColor={'#A2B000'}
                    icon={() => <Icon size={25} name={'logout'}/>}
                    labelStyle={styles.drawerItemLabel}
                    label={'Log Out'}
                    onPress={() => {
                        console.log('sign out');
                    }}>
                </DrawerItem>
            </View>
        </View>
    )
}
