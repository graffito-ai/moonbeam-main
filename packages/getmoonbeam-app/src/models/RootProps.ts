import type {NativeStackScreenProps} from '@react-navigation/native-stack';

/**
 * The default list of params, to be used across all root stack props.
 */
export type RootStackParamList = {
    AppOverview: {
        onLayoutRootView: () => Promise<void>;
    }
    Authentication: {
        initialRender: boolean;
    }
};

// the AppOverview component props, within the root stack
export type AppOverviewProps = NativeStackScreenProps<RootStackParamList, 'AppOverview'>
// the Authentication component props, within the root stack
export type AuthenticationProps = NativeStackScreenProps<RootStackParamList, 'Authentication'>
