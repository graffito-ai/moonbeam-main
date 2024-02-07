"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setBranchLintConfig = void 0;
/**
 * Function used to export the Git Branch linting configuration.
 */
const setBranchLintConfig = () => {
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
exports.setBranchLintConfig = setBranchLintConfig;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUE7O0dBRUc7QUFDSSxNQUFNLG1CQUFtQixHQUFHLEdBQUcsRUFBRTtJQUNwQyxPQUFPO1FBQ0gsa0JBQWtCLEVBQUU7WUFDaEIsVUFBVSxFQUFFO2dCQUNSLE1BQU07Z0JBQ04sS0FBSztnQkFDTCxNQUFNO2dCQUNOLE9BQU87Z0JBQ1AsVUFBVTtnQkFDVixNQUFNO2dCQUNOLFFBQVE7Z0JBQ1IsTUFBTTthQUNUO1lBQ0QsYUFBYSxFQUFFO2dCQUNYLE1BQU0sRUFBRSxTQUFTO2dCQUNqQixLQUFLLEVBQUUsUUFBUTtnQkFDZixNQUFNLEVBQUUsZUFBZTtnQkFDdkIsT0FBTyxFQUFFLE9BQU87Z0JBQ2hCLFVBQVUsRUFBRSxVQUFVO2dCQUN0QixNQUFNLEVBQUUsTUFBTTtnQkFDZCxRQUFRLEVBQUUsUUFBUTtnQkFDbEIsTUFBTSxFQUFFLE1BQU07Z0JBQ2QsU0FBUyxFQUFFLFVBQVU7YUFDeEI7WUFDRCxRQUFRLEVBQUU7Z0JBQ04sS0FBSzthQUNSO1lBQ0QsTUFBTSxFQUFFO2dCQUNKLFNBQVM7YUFDWjtZQUNELFlBQVksRUFBRTtnQkFDVixNQUFNO2dCQUNOLFFBQVE7Z0JBQ1IsU0FBUztnQkFDVCxTQUFTO2FBQ1o7WUFDRCxXQUFXLEVBQUUsR0FBRztZQUNoQixpQkFBaUIsRUFBRSxnREFBZ0Q7WUFDbkUscUJBQXFCLEVBQUUsaURBQWlEO1lBQ3hFLHFCQUFxQixFQUFFLHNDQUFzQztZQUM3RCxxQkFBcUIsRUFBRSwrQkFBK0I7WUFDdEQsc0JBQXNCLEVBQUUsZ0RBQWdEO1NBQzNFO0tBQ0osQ0FBQztBQUNOLENBQUMsQ0FBQztBQTVDVyxRQUFBLG1CQUFtQix1QkE0QzlCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBGdW5jdGlvbiB1c2VkIHRvIGV4cG9ydCB0aGUgR2l0IEJyYW5jaCBsaW50aW5nIGNvbmZpZ3VyYXRpb24uXG4gKi9cbmV4cG9ydCBjb25zdCBzZXRCcmFuY2hMaW50Q29uZmlnID0gKCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIFwiYnJhbmNoTmFtZUxpbnRlclwiOiB7XG4gICAgICAgICAgICBcInByZWZpeGVzXCI6IFtcbiAgICAgICAgICAgICAgICBcImZlYXRcIixcbiAgICAgICAgICAgICAgICBcImZpeFwiLFxuICAgICAgICAgICAgICAgIFwiZG9jc1wiLFxuICAgICAgICAgICAgICAgIFwic3R5bGVcIixcbiAgICAgICAgICAgICAgICBcInJlZmFjdG9yXCIsXG4gICAgICAgICAgICAgICAgXCJ0ZXN0XCIsXG4gICAgICAgICAgICAgICAgXCJyZXZlcnRcIixcbiAgICAgICAgICAgICAgICBcImNvcHlcIlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwic3VnZ2VzdGlvbnNcIjoge1xuICAgICAgICAgICAgICAgIFwiZmVhdFwiOiBcImZlYXR1cmVcIixcbiAgICAgICAgICAgICAgICBcImZpeFwiOiBcImhvdGZpeFwiLFxuICAgICAgICAgICAgICAgIFwiZG9jc1wiOiBcImRvY3VtZW50YXRpb25cIixcbiAgICAgICAgICAgICAgICBcInN0eWxlXCI6IFwic3R5bGVcIixcbiAgICAgICAgICAgICAgICBcInJlZmFjdG9yXCI6IFwicmVmYWN0b3JcIixcbiAgICAgICAgICAgICAgICBcInRlc3RcIjogXCJ0ZXN0XCIsXG4gICAgICAgICAgICAgICAgXCJyZXZlcnRcIjogXCJyZXZlcnRcIixcbiAgICAgICAgICAgICAgICBcImNvcHlcIjogXCJjb3B5XCIsXG4gICAgICAgICAgICAgICAgXCJyZWxlYXNlXCI6IFwicmVsZWFzZXNcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcImJhbm5lZFwiOiBbXG4gICAgICAgICAgICAgICAgXCJ3aXBcIlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwic2tpcFwiOiBbXG4gICAgICAgICAgICAgICAgXCJza2lwLWNpXCJcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcImRpc2FsbG93ZWRcIjogW1xuICAgICAgICAgICAgICAgIFwibWFpblwiLFxuICAgICAgICAgICAgICAgIFwibWFzdGVyXCIsXG4gICAgICAgICAgICAgICAgXCJkZXZlbG9wXCIsXG4gICAgICAgICAgICAgICAgXCJzdGFnaW5nXCJcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcInNlcGFyYXRvclwiOiBcIi9cIixcbiAgICAgICAgICAgIFwibXNnQnJhbmNoQmFubmVkXCI6IFwiQnJhbmNoZXMgd2l0aCB0aGUgbmFtZSBcXFwiJXNcXFwiIGFyZSBub3QgYWxsb3dlZC5cIixcbiAgICAgICAgICAgIFwibXNnQnJhbmNoRGlzYWxsb3dlZFwiOiBcIlB1c2hpbmcgdG8gXFxcIiVzXFxcIiBpcyBub3QgYWxsb3dlZCwgdXNlIGdpdC1mbG93LlwiLFxuICAgICAgICAgICAgXCJtc2dQcmVmaXhOb3RBbGxvd2VkXCI6IFwiQnJhbmNoIHByZWZpeCBcXFwiJXNcXFwiIGlzIG5vdCBhbGxvd2VkLlwiLFxuICAgICAgICAgICAgXCJtc2dQcmVmaXhTdWdnZXN0aW9uXCI6IFwiSW5zdGVhZCBvZiBcXFwiJXNcXFwiIHRyeSBcXFwiJXNcXFwiLlwiLFxuICAgICAgICAgICAgXCJtc2dzZXBhcmF0b3JSZXF1aXJlZFwiOiBcIkJyYW5jaCBcXFwiJXNcXFwiIG11c3QgY29udGFpbiBhIHNlcGFyYXRvciBcXFwiJXNcXFwiLlwiXG4gICAgICAgIH1cbiAgICB9O1xufTtcbiJdfQ==