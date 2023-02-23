export const schema = {
    "models": {
        "Referral": {
            "name": "Referral",
            "fields": {
                "id": {
                    "name": "id",
                    "isArray": false,
                    "type": "ID",
                    "isRequired": true,
                    "attributes": []
                },
                "createdAt": {
                    "name": "createdAt",
                    "isArray": false,
                    "type": "AWSDateTime",
                    "isRequired": true,
                    "attributes": []
                },
                "updatedAt": {
                    "name": "updatedAt",
                    "isArray": false,
                    "type": "AWSDateTime",
                    "isRequired": true,
                    "attributes": []
                },
                "status": {
                    "name": "status",
                    "isArray": false,
                    "type": {
                        "enum": "ReferralStatus"
                    },
                    "isRequired": true,
                    "attributes": []
                },
                "offerType": {
                    "name": "offerType",
                    "isArray": false,
                    "type": {
                        "enum": "OfferType"
                    },
                    "isRequired": true,
                    "attributes": []
                },
                "inviteeEmail": {
                    "name": "inviteeEmail",
                    "isArray": false,
                    "type": "String",
                    "isRequired": true,
                    "attributes": []
                },
                "inviterEmail": {
                    "name": "inviterEmail",
                    "isArray": false,
                    "type": "String",
                    "isRequired": true,
                    "attributes": []
                },
                "inviterName": {
                    "name": "inviterName",
                    "isArray": false,
                    "type": "String",
                    "isRequired": true,
                    "attributes": []
                },
                "statusInviter": {
                    "name": "statusInviter",
                    "isArray": false,
                    "type": {
                        "enum": "ReferralStatus"
                    },
                    "isRequired": true,
                    "attributes": []
                },
                "statusInvitee": {
                    "name": "statusInvitee",
                    "isArray": false,
                    "type": {
                        "enum": "ReferralStatus"
                    },
                    "isRequired": true,
                    "attributes": []
                }
            },
            "syncable": true,
            "pluralName": "Referrals",
            "attributes": [
                {
                    "type": "model",
                    "properties": {}
                },
                {
                    "type": "auth",
                    "properties": {
                        "rules": [
                            {
                                "provider": "userPools",
                                "ownerField": "owner",
                                "allow": "owner",
                                "identityClaim": "cognito:username",
                                "operations": [
                                    "create",
                                    "update",
                                    "delete",
                                    "read"
                                ]
                            }
                        ]
                    }
                }
            ]
        }
    },
    "enums": {
        "ReferralStatus": {
            "name": "ReferralStatus",
            "values": [
                "REDEEMED",
                "NOT_REDEEMED",
                "INITIATED",
                "INVALID"
            ]
        },
        "OfferType": {
            "name": "OfferType",
            "values": [
                "WELCOME_REFERRAL_BONUS"
            ]
        }
    },
    "nonModels": {},
    "codegenVersion": "3.3.5",
    "version": "097573183fc235a937cb0ea3b8b0ea4d"
};