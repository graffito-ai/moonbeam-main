import {NativeStackScreenProps} from "@react-navigation/native-stack";

/**
 * The default list of params, to be used across all sidebar stack props.
 */
export type DrawerPropsParamList = {
    Dashboard: {
        oauthStateId?: string;
        currentUserInformation: any;
    },
    ["Bank Accounts"]: {},
    ["Card Services"]: {},
    Documents: {},
    Settings: {},
    Support: {}
};

// the Dashboard component props, within the sidebar stack
export type DashboardProps = NativeStackScreenProps<DrawerPropsParamList, 'Dashboard'>
