import type {NativeStackScreenProps} from '@react-navigation/native-stack';

/**
 * The default list of params, to be used across all Membership derived stack props.
 */
export type MembershipStackParamList = {
    MembershipProfile: {
        currentUserInformation: any;
    }
};

// the MembershipProfile component props, within the Home stack
export type MembershipProfileProps = NativeStackScreenProps<MembershipStackParamList, 'MembershipProfile'>

