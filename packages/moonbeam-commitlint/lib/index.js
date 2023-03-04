"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCommitLintConfig = void 0;
/**
 * Function used to export the CommitLint configuration.
 *
 * @param directoryPath path of the directory where the CommitLint will be set up.
 * @param lernaFlag flag to highlight whether the given repo is a mono repo or not.
 */
const setCommitLintConfig = (directoryPath, lernaFlag) => {
    const { utils: { getPackages } } = lernaFlag
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
            'scope-enum': async (ctx) => [
                2,
                'always',
                [
                    ...(lernaFlag ? await getPackages(ctx) : []),
                    // adding these manually because lerna scopes started failing
                    'moonbeam-app',
                    'moonbeam-cdk',
                    'moonbeam-commitlint',
                    'moonbeam-tsconfig',
                    directoryPath.split('/').pop()
                ]
            ],
            'subject-case': [
                2,
                'always',
                [
                    'lower-case',
                    'upper-case',
                    'camel-case',
                    'kebab-case',
                    'pascal-case',
                    'sentence-case',
                    'snake-case',
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
exports.setCommitLintConfig = setCommitLintConfig;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUE7Ozs7O0dBS0c7QUFDSSxNQUFNLG1CQUFtQixHQUFHLENBQy9CLGFBQXFCLEVBQ3JCLFNBQWtCLEVBQ3BCLEVBQUU7SUFDQSxNQUFNLEVBQ0YsS0FBSyxFQUFFLEVBQUUsV0FBVyxFQUFFLEVBQ3pCLEdBQUcsU0FBUztRQUNULENBQUMsQ0FBQyxPQUFPLENBQUMsaUNBQWlDLENBQUM7UUFDNUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsV0FBVyxFQUFFLGdCQUFnQixFQUFFLEVBQUUsQ0FBQztJQUNuRCxPQUFPO1FBQ0gsT0FBTyxFQUFFO1lBQ0wsaUNBQWlDO1lBQ2pDLGlDQUFpQztTQUNwQztRQUNEOztXQUVHO1FBQ0gsS0FBSyxFQUFFO1lBQ0gsWUFBWSxFQUFFLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQztZQUMxQixXQUFXLEVBQUUsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDN0MsK0VBQStFO1lBQy9FLG9CQUFvQixFQUFFLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQztZQUNuQyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDO1lBQ3RDLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxHQUFHLENBQUM7WUFDdkMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLEdBQUcsQ0FBQztZQUN0QyxjQUFjLEVBQUUsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDO1lBQzVCLCtFQUErRTtZQUMvRSxzQkFBc0IsRUFBRSxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUM7WUFDckMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLEdBQUcsQ0FBQztZQUN2QyxrQkFBa0IsRUFBRSxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUM7WUFDaEMsYUFBYSxFQUFFLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQztZQUMzQix1RUFBdUU7WUFDdkUsWUFBWSxFQUFFLEtBQUssRUFBRSxHQUFRLEVBQUUsRUFBRSxDQUFDO2dCQUM5QixDQUFDO2dCQUNELFFBQVE7Z0JBQ1I7b0JBQ0ksR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsTUFBTSxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztvQkFDNUMsNkRBQTZEO29CQUM3RCxjQUFjO29CQUNkLGNBQWM7b0JBQ2QscUJBQXFCO29CQUNyQixtQkFBbUI7b0JBQ25CLGFBQWEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFO2lCQUNqQzthQUNKO1lBQ0QsY0FBYyxFQUFFO2dCQUNaLENBQUM7Z0JBQ0QsUUFBUTtnQkFDUjtvQkFDSSxZQUFZO29CQUNaLFlBQVk7b0JBQ1osWUFBWTtvQkFDWixZQUFZO29CQUNaLGFBQWE7b0JBQ2IsZUFBZTtvQkFDZixZQUFZO29CQUNaLFlBQVksQ0FBQyxhQUFhO2lCQUM3QjthQUNKO1lBQ0QsZUFBZSxFQUFFLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQztZQUM3QixtQkFBbUIsRUFBRSxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsR0FBRyxDQUFDO1lBQ3ZDLG9CQUFvQixFQUFFLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxFQUFFLENBQUM7WUFDdkMsV0FBVyxFQUFFO2dCQUNULENBQUM7Z0JBQ0QsUUFBUTtnQkFDUixDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLFFBQVEsQ0FBQzthQUNqRTtZQUNELFdBQVcsRUFBRSxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsWUFBWSxDQUFDO1lBQ3hDLFlBQVksRUFBRSxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUM7U0FDN0I7UUFDRCxZQUFZLEVBQUU7WUFDVixVQUFVLEVBQUU7Z0JBQ1IsZ0JBQWdCLEVBQUUsRUFBRTtnQkFDcEIsYUFBYSxFQUFFO29CQUNYLFNBQVM7aUJBQ1o7YUFDSjtTQUNKO0tBQ0osQ0FBQztBQUNOLENBQUMsQ0FBQztBQS9FVyxRQUFBLG1CQUFtQix1QkErRTlCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBGdW5jdGlvbiB1c2VkIHRvIGV4cG9ydCB0aGUgQ29tbWl0TGludCBjb25maWd1cmF0aW9uLlxuICpcbiAqIEBwYXJhbSBkaXJlY3RvcnlQYXRoIHBhdGggb2YgdGhlIGRpcmVjdG9yeSB3aGVyZSB0aGUgQ29tbWl0TGludCB3aWxsIGJlIHNldCB1cC5cbiAqIEBwYXJhbSBsZXJuYUZsYWcgZmxhZyB0byBoaWdobGlnaHQgd2hldGhlciB0aGUgZ2l2ZW4gcmVwbyBpcyBhIG1vbm8gcmVwbyBvciBub3QuXG4gKi9cbmV4cG9ydCBjb25zdCBzZXRDb21taXRMaW50Q29uZmlnID0gKFxuICAgIGRpcmVjdG9yeVBhdGg6IHN0cmluZyxcbiAgICBsZXJuYUZsYWc6IGJvb2xlYW5cbikgPT4ge1xuICAgIGNvbnN0IHtcbiAgICAgICAgdXRpbHM6IHsgZ2V0UGFja2FnZXMgfVxuICAgIH0gPSBsZXJuYUZsYWdcbiAgICAgICAgPyByZXF1aXJlKCdAY29tbWl0bGludC9jb25maWctbGVybmEtc2NvcGVzJylcbiAgICAgICAgOiB7IHV0aWxzOiB7IGdldFBhY2thZ2VzOiAnbm90IGEgbW9ub3JlcG8nIH0gfTtcbiAgICByZXR1cm4ge1xuICAgICAgICBleHRlbmRzOiBbXG4gICAgICAgICAgICAnQGNvbW1pdGxpbnQvY29uZmlnLWNvbnZlbnRpb25hbCcsXG4gICAgICAgICAgICAnQGNvbW1pdGxpbnQvY29uZmlnLWxlcm5hLXNjb3BlcydcbiAgICAgICAgXSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFueSBydWxlcyBkZWZpbmVkIGJlbG93IGhlcmUgd2lsbCBvdmVycmlkZSBydWxlcyBmcm9tIEBjb21taXRsaW50L2NvbmZpZy1jb252ZW50aW9uYWxcbiAgICAgICAgICovXG4gICAgICAgIHJ1bGVzOiB7XG4gICAgICAgICAgICAnYm9keS1lbXB0eSc6IFsxLCAnbmV2ZXInXSxcbiAgICAgICAgICAgICdib2R5LWNhc2UnOiBbMiwgJ2Fsd2F5cycsIFsnc2VudGVuY2UtY2FzZSddXSxcbiAgICAgICAgICAgIC8vIHRoaXMgaXMgc2V0IHRvIGEgd2FybmluZyBpbnN0ZWFkLCBzaW5jZSBDb21taXRMaW50IGhhcyBlcnJvcnMgd2l0aCB0aGlzIHJ1bGVcbiAgICAgICAgICAgICdib2R5LWxlYWRpbmctYmxhbmsnOiBbMSwgJ2Fsd2F5cyddLFxuICAgICAgICAgICAgJ2JvZHktbWF4LWxlbmd0aCc6IFsyLCAnYWx3YXlzJywgMTAwMF0sXG4gICAgICAgICAgICAnaGVhZGVyLW1heC1sZW5ndGgnOiBbMiwgJ2Fsd2F5cycsIDEyMF0sXG4gICAgICAgICAgICAnaGVhZGVyLWZ1bGwtc3RvcCc6IFsyLCAnYWx3YXlzJywgJy4nXSxcbiAgICAgICAgICAgICdmb290ZXItZW1wdHknOiBbMiwgJ25ldmVyJ10sXG4gICAgICAgICAgICAvLyB0aGlzIGlzIHNldCB0byBhIHdhcm5pbmcgaW5zdGVhZCwgc2luY2UgQ29tbWl0TGludCBoYXMgZXJyb3JzIHdpdGggdGhpcyBydWxlXG4gICAgICAgICAgICAnZm9vdGVyLWxlYWRpbmctYmxhbmsnOiBbMSwgJ2Fsd2F5cyddLFxuICAgICAgICAgICAgJ2Zvb3Rlci1tYXgtbGVuZ3RoJzogWzIsICdhbHdheXMnLCAxMjBdLFxuICAgICAgICAgICAgJ3JlZmVyZW5jZXMtZW1wdHknOiBbMiwgJ25ldmVyJ10sXG4gICAgICAgICAgICAnc2NvcGUtZW1wdHknOiBbMiwgJ25ldmVyJ10sXG4gICAgICAgICAgICAvLyBBZGRpbmcgdGhlIGdsb2JhbC1sZXZlbC1zY29wZSBmb3IgdGhpcyBwYWNrYWdlIGluIHRoZSBsaXN0IG9mIHNjb3Blc1xuICAgICAgICAgICAgJ3Njb3BlLWVudW0nOiBhc3luYyAoY3R4OiBhbnkpID0+IFtcbiAgICAgICAgICAgICAgICAyLFxuICAgICAgICAgICAgICAgICdhbHdheXMnLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgLi4uKGxlcm5hRmxhZyA/IGF3YWl0IGdldFBhY2thZ2VzKGN0eCkgOiBbXSksXG4gICAgICAgICAgICAgICAgICAgIC8vIGFkZGluZyB0aGVzZSBtYW51YWxseSBiZWNhdXNlIGxlcm5hIHNjb3BlcyBzdGFydGVkIGZhaWxpbmdcbiAgICAgICAgICAgICAgICAgICAgJ21vb25iZWFtLWFwcCcsXG4gICAgICAgICAgICAgICAgICAgICdtb29uYmVhbS1jZGsnLFxuICAgICAgICAgICAgICAgICAgICAnbW9vbmJlYW0tY29tbWl0bGludCcsXG4gICAgICAgICAgICAgICAgICAgICdtb29uYmVhbS10c2NvbmZpZycsXG4gICAgICAgICAgICAgICAgICAgIGRpcmVjdG9yeVBhdGguc3BsaXQoJy8nKS5wb3AoKVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAnc3ViamVjdC1jYXNlJzogW1xuICAgICAgICAgICAgICAgIDIsXG4gICAgICAgICAgICAgICAgJ2Fsd2F5cycsXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnbG93ZXItY2FzZScsIC8vIGRlZmF1bHRcbiAgICAgICAgICAgICAgICAgICAgJ3VwcGVyLWNhc2UnLCAvLyBVUFBFUkNBU0VcbiAgICAgICAgICAgICAgICAgICAgJ2NhbWVsLWNhc2UnLCAvLyBjYW1lbENhc2VcbiAgICAgICAgICAgICAgICAgICAgJ2tlYmFiLWNhc2UnLCAvLyBrZWJhYi1jYXNlXG4gICAgICAgICAgICAgICAgICAgICdwYXNjYWwtY2FzZScsIC8vIFBhc2NhbENhc2VcbiAgICAgICAgICAgICAgICAgICAgJ3NlbnRlbmNlLWNhc2UnLCAvLyBTZW50ZW5jZSBjYXNlXG4gICAgICAgICAgICAgICAgICAgICdzbmFrZS1jYXNlJywgLy8gc25ha2VfY2FzZVxuICAgICAgICAgICAgICAgICAgICAnc3RhcnQtY2FzZScgLy8gU3RhcnQgQ2FzZVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAnc3ViamVjdC1lbXB0eSc6IFsyLCAnbmV2ZXInXSxcbiAgICAgICAgICAgICdzdWJqZWN0LWZ1bGwtc3RvcCc6IFsyLCAnYWx3YXlzJywgJy4nXSxcbiAgICAgICAgICAgICdzdWJqZWN0LW1heC1sZW5ndGgnOiBbMiwgJ2Fsd2F5cycsIDcyXSxcbiAgICAgICAgICAgICd0eXBlLWVudW0nOiBbXG4gICAgICAgICAgICAgICAgMixcbiAgICAgICAgICAgICAgICAnYWx3YXlzJyxcbiAgICAgICAgICAgICAgICBbJ2ZlYXQnLCAnZml4JywgJ2RvY3MnLCAnc3R5bGUnLCAncmVmYWN0b3InLCAndGVzdCcsICdyZXZlcnQnXVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICd0eXBlLWNhc2UnOiBbMiwgJ2Fsd2F5cycsICdsb3dlci1jYXNlJ10sXG4gICAgICAgICAgICAndHlwZS1lbXB0eSc6IFsyLCAnbmV2ZXInXVxuICAgICAgICB9LFxuICAgICAgICBwYXJzZXJQcmVzZXQ6IHtcbiAgICAgICAgICAgIHBhcnNlck9wdHM6IHtcbiAgICAgICAgICAgICAgICByZWZlcmVuY2VBY3Rpb25zOiBbXSxcbiAgICAgICAgICAgICAgICBpc3N1ZVByZWZpeGVzOiBbXG4gICAgICAgICAgICAgICAgICAgICdNT09OQk0tJ1xuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG59O1xuIl19