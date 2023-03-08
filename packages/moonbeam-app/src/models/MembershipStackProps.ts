import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from "react";

/**
 * The default list of params, to be used across all Membership derived stack props.
 */
export type MembershipStackParamList = {
    MembershipProfile: {
        setPointValueRedeemed: React.Dispatch<React.SetStateAction<number>>;
        currentUserInformation: any;
    }
};

// the MembershipProfile component props, within the Home stack
export type MembershipProfileProps = NativeStackScreenProps<MembershipStackParamList, 'MembershipProfile'>

