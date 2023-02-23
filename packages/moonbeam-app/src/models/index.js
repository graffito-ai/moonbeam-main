// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';

const ReferralStatus = {
  "REDEEMED": "REDEEMED",
  "NOT_REDEEMED": "NOT_REDEEMED",
  "INITIATED": "INITIATED"
};

const OfferType = {
  "WELCOME_REFERRAL_BONUS": "WELCOME_REFERRAL_BONUS"
};

const { Referral } = initSchema(schema);

export {
  Referral,
  ReferralStatus,
  OfferType
};