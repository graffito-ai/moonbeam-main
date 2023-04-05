import type {NativeStackScreenProps} from '@react-navigation/native-stack';

/**
 * The default list of params, to be used across all Store derived stack props.
 */
export type StoreStackParamList = {
    StoreHorizontal: {
        currentUserInformation: any;
    },
    StoreVertical: {
        currentUserInformation: any;
    }
};

// the horizontal Store component props, within the Store stack
export type StoreHorizontalProps = NativeStackScreenProps<StoreStackParamList, 'StoreHorizontal'>
// the vertical Store components props, within the Store stack
export type StoreVerticalProps = NativeStackScreenProps<StoreStackParamList, 'StoreVertical'>
