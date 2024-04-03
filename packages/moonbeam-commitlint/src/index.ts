/**
 * Function used to export the CommitLint configuration.
 *
 * @param directoryPath path of the directory where the CommitLint will be set up.
 */
export const setCommitLintConfig = (
    directoryPath: string
) => {
    return {
        extends: [
            '@commitlint/config-conventional'
        ],
        /**
         * Any rules defined below here will override rules from @commitlint/config-conventional
         */
        rules: {
            'body-empty': [1, 'never'],
            'body-case': [2, 'always', ['sentence-case']],
            // this is set to a warning instead, since CommitLint has errors with this rule
            'body-leading-blank': [1, 'always'],
            'body-max-length': [2, 'always', 1000],
            'header-max-length': [2, 'always', 120],
            'header-full-stop': [2, 'always', '.'],
            'footer-empty': [2, 'never'],
            // this is set to a warning instead, since CommitLint has errors with this rule
            'footer-leading-blank': [1, 'always'],
            'footer-max-length': [2, 'always', 120],
            'references-empty': [2, 'never'],
            'scope-empty': [2, 'never'],
            // Adding the global-level-scope for this package in the list of scopes
            'scope-enum': async (_: any) => [
                2,
                'always', [
                    directoryPath.split('/').pop(),
                    'getmoonbeam-app',
                    'getmoonbeam-cdk',
                    'moonbeam-commitlint',
                    'moonbeam-models',
                    'moonbeam-tsconfig',
                    'moonbeam-branchlint',
                    'moonbeam-app-review-lambda',
                    'moonbeam-app-upgrade-lambda',
                    'moonbeam-card-linking-lambda',
                    'moonbeam-faq-lambda',
                    'moonbeam-logging-lambda',
                    'moonbeam-military-verification-lambda',
                    'moonbeam-military-verification-notification-consumer-lambda',
                    'moonbeam-military-verification-notification-producer-lambda',
                    'moonbeam-military-verification-reporting-consumer-lambda',
                    'moonbeam-military-verification-reporting-producer-lambda',
                    'moonbeam-notification-reminder-consumer-lambda',
                    'moonbeam-notification-reminder-producer-lambda',
                    'moonbeam-notification-reminder-lambda',
                    'moonbeam-notifications-lambda',
                    'moonbeam-utilities-lambda',
                    'moonbeam-offers-lambda',
                    'moonbeam-physical-devices-lambda',
                    'moonbeam-referral-consumer-lambda',
                    'moonbeam-referral-lambda',
                    'moonbeam-referral-producer-lambda',
                    'moonbeam-storage-lambda',
                    'moonbeam-transactional-notifications-offers-consumer-lambda',
                    'moonbeam-transactional-offers-consumer-lambda',
                    'moonbeam-transactions-lambda',
                    'moonbeam-transactions-producer-lambda',
                    'moonbeam-updated-transactional-offers-consumer-lambda',
                    'moonbeam-updated-transactions-producer-lambda',
                    'moonbeam-user-auth-session-lambda',
                    'moonbeam-utilities-lambda',
                    'moonbeam-scripts-lambda',
                    'moonbeam-service-partners-lambda',
                    'moonbeam-location-reminders-consumer-lambda',
                    'moonbeam-location-reminders-producer-lambda'
                ]
            ],
            'subject-case': [
                2,
                'always',
                [
                    'lower-case', // default
                    'upper-case', // UPPERCASE
                    'camel-case', // camelCase
                    'kebab-case', // kebab-case
                    'pascal-case', // PascalCase
                    'sentence-case', // Sentence case
                    'snake-case', // snake_case
                    'start-case' // Start Case
                ]
            ],
            'subject-empty': [2, 'never'],
            'subject-full-stop': [2, 'always', '.'],
            'subject-max-length': [2, 'always', 72],
            'type-enum': [
                2,
                'always',
                ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'revert', 'copy']
            ],
            'type-case': [2, 'always', 'lower-case'],
            'type-empty': [2, 'never']
        },
        parserPreset: {
            parserOpts: {
                referenceActions: [],
                issuePrefixes: [
                    'MOONBM-'
                ]
            }
        }
    };
};
