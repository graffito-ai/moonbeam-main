/**
 * Function used to export the CommitLint configuration.
 *
 * @param directoryPath path of the directory where the CommitLint will be set up.
 * @param lernaFlag flag to highlight whether the given repo is a mono repo or not.
 */
export const setCommitLintConfig = (
    directoryPath: string,
    lernaFlag: boolean
) => {
    const {
        utils: { getPackages }
    } = lernaFlag
        ? require('@commitlint/config-lerna-scopes')
        : { utils: { getPackages: 'not a monorepo' } };
    return {
        extends: [
            '@commitlint/config-conventional',
            '@commitlint/config-lerna-scopes'
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
            'scope-enum': async (ctx: any) => [
                2,
                'always',
                [
                    ...(lernaFlag ? await getPackages(ctx) : []),
                    directoryPath.split('/').pop()
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
                ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'revert']
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
