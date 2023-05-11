#!/bin/bash
# This script will set up/initialize, pull or push into any Amplify environment from scratch,
# by parsing through the environment variable, as well as the type of amplify command,
# passed in as a command line arguments, and then reading the appropriate exports file, from the moonbeam-cdk
# sub-package.
#
# Note: This file/script should only be used when initializing, pulling or pushing into a new/existing Amplify environment,
# after all the backend specific resources used here are properly deployed through the moonbeam-cdk sub-package.
#
# Warning: Before running this script, you need to have your AWS credentials properly configured with the appropriate
# AWS Moonbeam profile names locally. We use (moonbeam-dev, moonbeam-staging, moonbeam-preview and moonbeam-prod) for
# the names of the profiles.
set -e
IFS='|'

# switch case based on the arguments passed in
while getopts c:e:h option; do
  case "${option}" in
  c) command=${OPTARG} ;;
  e) env=${OPTARG} ;;
  h) echo "$0 [-c COMMAND_OF_CHOICE(init, pull, push, etc.)][-e ENVIRONMENT_OF_CHOICE]" && exit ;;
  *) ;;
  esac
done
# make sure that an environment is passed in
if [[ -z "$env" ]] || [[ -z "$command" ]]; then
  echo "Must provide a environment and command as options, see the help menu, for more information ($0 -h)" 1>&2
  exit 1
fi

# parse the CDK exports file to retrieve all necessary information
EXPORTS_FILE=$(dirname "$(pwd)")/getmoonbeam-cdk/exports/cdk-exports-$env.json
AMPLIFY_APP_ID=$(< "$EXPORTS_FILE" cat | jq '."'moonbeam-amplify-$env-us-west-2'".amplifyappid')
REGION=$(< "$EXPORTS_FILE" cat | jq  '."'moonbeam-amplify-$env-us-west-2'".awsprojectregion')
DEPLOYMENT_BUCKET=$(< "$EXPORTS_FILE" cat | jq '."'moonbeam-amplify-$env-us-west-2'".amplifydeploymentbucket')
USER_POOL_ID=$(< "$EXPORTS_FILE" cat | jq '."'moonbeam-amplify-$env-us-west-2'".awsuserpoolsid')
COGNITO_WEB_CLIENT_ID=$(< "$EXPORTS_FILE" cat | jq '."'moonbeam-amplify-$env-us-west-2'".awsuserpoolswebclientid')
COGNITO_IDENTITY_POOL_ID=$(< "$EXPORTS_FILE" cat | jq '."'moonbeam-amplify-$env-us-west-2'".awscognitoidentitypoolid')

REACTCONFIG="{\
\"SourceDir\":\"src\",\
\"DistributionDir\":\"build\",\
\"BuildCommand\":\"yarn run-script build\",\
\"StartCommand\":\"yarn run-script start-clean\"\
}"

AWSCLOUDFORMATIONCONFIG="{\
\"configLevel\":\"project\",\
\"useProfile\":true,\
\"profileName\":\"moonbeam-$env\",\
\"region\":$REGION\
}"

AMPLIFY="{\
\"projectName\":\"getmoonbeamapp\",\
\"appId\":$AMPLIFY_APP_ID,\
\"envName\":\"$env\",\
\"defaultEditor\":\"intellij\"\
}"

FRONTEND="{\
\"frontend\":\"javascript\",\
\"framework\":\"react-native\",\
\"config\":$REACTCONFIG}"

PROVIDERS="{\
\"awscloudformation\":$AWSCLOUDFORMATIONCONFIG}"

AUTHCONFIG="{\
\"userPoolId\": $USER_POOL_ID,\
\"webClientId\": $COGNITO_WEB_CLIENT_ID,\
\"identityPoolId\": $COGNITO_IDENTITY_POOL_ID}"

STORAGECONFIG="{\
  \"region\": $REGION,\
  \"bucketName\": $DEPLOYMENT_BUCKET\
}"

CATEGORIES="{\
\"auth\":$AUTHCONFIG,\
\"storage\":$STORAGECONFIG}"

# Execute Amplify command, with given configuration
amplify "$command" \
--amplify "$AMPLIFY" \
--frontend "$FRONTEND" \
--providers "$PROVIDERS" \
--categories "$CATEGORIES" \
--yes
