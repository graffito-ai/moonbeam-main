/**
 * Function used to export the CommitLint configuration.
 *
 * @param directoryPath path of the directory where the CommitLint will be set up.
 * @param lernaFlag flag to highlight whether the given repo is a mono repo or not.
 */
export declare const setCommitLintConfig: (directoryPath: string, lernaFlag: boolean) => {
    extends: string[];
    /**
     * Any rules defined below here will override rules from @commitlint/config-conventional
     */
    rules: {
        'body-empty': (string | number)[];
        'body-case': (string | number | string[])[];
        'body-leading-blank': (string | number)[];
        'body-max-length': (string | number)[];
        'header-max-length': (string | number)[];
        'header-full-stop': (string | number)[];
        'footer-empty': (string | number)[];
        'footer-leading-blank': (string | number)[];
        'footer-max-length': (string | number)[];
        'references-empty': (string | number)[];
        'scope-empty': (string | number)[];
        'scope-enum': (ctx: any) => Promise<(string | number | any[])[]>;
        'subject-case': (string | number | string[])[];
        'subject-empty': (string | number)[];
        'subject-full-stop': (string | number)[];
        'subject-max-length': (string | number)[];
        'type-enum': (string | number | string[])[];
        'type-case': (string | number)[];
        'type-empty': (string | number)[];
    };
    parserPreset: {
        parserOpts: {
            referenceActions: never[];
            issuePrefixes: string[];
        };
    };
};
