import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import { Cache } from 'aws-amplify';
import {ExpoPushToken} from "expo-notifications";

/**
 * The default list of params, to be used across all Root stack props.
 */
export type RootStackParamList = {
    AppOverview: {
        cache: typeof Cache,
        marketplaceCache: typeof Cache,
        expoPushToken: ExpoPushToken,
        onLayoutRootView: () => Promise<void>,
    }
    Authentication: {
        cache: typeof Cache,
        marketplaceCache: typeof Cache,
        expoPushToken: ExpoPushToken
    }
};

// the AppOverview component props, within the Root stack
export type AppOverviewProps = NativeStackScreenProps<RootStackParamList, 'AppOverview'>;
// the Authentication component props, within the Root stack
export type AuthenticationProps = NativeStackScreenProps<RootStackParamList, 'Authentication'>;
