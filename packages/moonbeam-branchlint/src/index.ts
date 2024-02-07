/**
 * Function used to export the Git Branch linting configuration.
 */
export const setBranchLintConfig = () => {
    return {
        "branchNameLinter": {
            "prefixes": [
                "feat",
                "fix",
                "docs",
                "style",
                "refactor",
                "test",
                "revert",
                "copy"
            ],
            "suggestions": {
                "feat": "feature",
                "fix": "hotfix",
                "docs": "documentation",
                "style": "style",
                "refactor": "refactor",
                "test": "test",
                "revert": "revert",
                "copy": "copy",
                "release": "releases",
            },
            "banned": [
                "wip"
            ],
            "skip": [
                "skip-ci"
            ],
            "disallowed": [
                "main",
                "master",
                "develop",
                "staging"
            ],
            "separator": "/",
            "msgBranchBanned": "Branches with the name \"%s\" are not allowed.",
            "msgBranchDisallowed": "Pushing to \"%s\" is not allowed, use git-flow.",
            "msgPrefixNotAllowed": "Branch prefix \"%s\" is not allowed.",
            "msgPrefixSuggestion": "Instead of \"%s\" try \"%s\".",
            "msgseparatorRequired": "Branch \"%s\" must contain a separator \"%s\"."
        }
    };
};
