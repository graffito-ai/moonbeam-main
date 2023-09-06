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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUE7Ozs7O0dBS0c7QUFDSSxNQUFNLG1CQUFtQixHQUFHLENBQy9CLGFBQXFCLEVBQ3JCLFNBQWtCLEVBQ3BCLEVBQUU7SUFDQSxNQUFNLEVBQ0YsS0FBSyxFQUFFLEVBQUUsV0FBVyxFQUFFLEVBQ3pCLEdBQUcsU0FBUztRQUNULENBQUMsQ0FBQyxPQUFPLENBQUMsaUNBQWlDLENBQUM7UUFDNUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsV0FBVyxFQUFFLGdCQUFnQixFQUFFLEVBQUUsQ0FBQztJQUNuRCxPQUFPO1FBQ0gsT0FBTyxFQUFFO1lBQ0wsaUNBQWlDO1lBQ2pDLGlDQUFpQztTQUNwQztRQUNEOztXQUVHO1FBQ0gsS0FBSyxFQUFFO1lBQ0gsWUFBWSxFQUFFLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQztZQUMxQixXQUFXLEVBQUUsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDN0MsK0VBQStFO1lBQy9FLG9CQUFvQixFQUFFLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQztZQUNuQyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDO1lBQ3RDLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxHQUFHLENBQUM7WUFDdkMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLEdBQUcsQ0FBQztZQUN0QyxjQUFjLEVBQUUsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDO1lBQzVCLCtFQUErRTtZQUMvRSxzQkFBc0IsRUFBRSxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUM7WUFDckMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLEdBQUcsQ0FBQztZQUN2QyxrQkFBa0IsRUFBRSxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUM7WUFDaEMsYUFBYSxFQUFFLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQztZQUMzQix1RUFBdUU7WUFDdkUsWUFBWSxFQUFFLEtBQUssRUFBRSxHQUFRLEVBQUUsRUFBRSxDQUFDO2dCQUM5QixDQUFDO2dCQUNELFFBQVE7Z0JBQ1I7b0JBQ0ksR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsTUFBTSxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztvQkFDNUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUU7aUJBQ2pDO2FBQ0o7WUFDRCxjQUFjLEVBQUU7Z0JBQ1osQ0FBQztnQkFDRCxRQUFRO2dCQUNSO29CQUNJLFlBQVk7b0JBQ1osWUFBWTtvQkFDWixZQUFZO29CQUNaLFlBQVk7b0JBQ1osYUFBYTtvQkFDYixlQUFlO29CQUNmLFlBQVk7b0JBQ1osWUFBWSxDQUFDLGFBQWE7aUJBQzdCO2FBQ0o7WUFDRCxlQUFlLEVBQUUsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDO1lBQzdCLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxHQUFHLENBQUM7WUFDdkMsb0JBQW9CLEVBQUUsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLEVBQUUsQ0FBQztZQUN2QyxXQUFXLEVBQUU7Z0JBQ1QsQ0FBQztnQkFDRCxRQUFRO2dCQUNSLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsUUFBUSxDQUFDO2FBQ2pFO1lBQ0QsV0FBVyxFQUFFLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxZQUFZLENBQUM7WUFDeEMsWUFBWSxFQUFFLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQztTQUM3QjtRQUNELFlBQVksRUFBRTtZQUNWLFVBQVUsRUFBRTtnQkFDUixnQkFBZ0IsRUFBRSxFQUFFO2dCQUNwQixhQUFhLEVBQUU7b0JBQ1gsU0FBUztpQkFDWjthQUNKO1NBQ0o7S0FDSixDQUFDO0FBQ04sQ0FBQyxDQUFDO0FBMUVXLFFBQUEsbUJBQW1CLHVCQTBFOUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEZ1bmN0aW9uIHVzZWQgdG8gZXhwb3J0IHRoZSBDb21taXRMaW50IGNvbmZpZ3VyYXRpb24uXG4gKlxuICogQHBhcmFtIGRpcmVjdG9yeVBhdGggcGF0aCBvZiB0aGUgZGlyZWN0b3J5IHdoZXJlIHRoZSBDb21taXRMaW50IHdpbGwgYmUgc2V0IHVwLlxuICogQHBhcmFtIGxlcm5hRmxhZyBmbGFnIHRvIGhpZ2hsaWdodCB3aGV0aGVyIHRoZSBnaXZlbiByZXBvIGlzIGEgbW9ubyByZXBvIG9yIG5vdC5cbiAqL1xuZXhwb3J0IGNvbnN0IHNldENvbW1pdExpbnRDb25maWcgPSAoXG4gICAgZGlyZWN0b3J5UGF0aDogc3RyaW5nLFxuICAgIGxlcm5hRmxhZzogYm9vbGVhblxuKSA9PiB7XG4gICAgY29uc3Qge1xuICAgICAgICB1dGlsczogeyBnZXRQYWNrYWdlcyB9XG4gICAgfSA9IGxlcm5hRmxhZ1xuICAgICAgICA/IHJlcXVpcmUoJ0Bjb21taXRsaW50L2NvbmZpZy1sZXJuYS1zY29wZXMnKVxuICAgICAgICA6IHsgdXRpbHM6IHsgZ2V0UGFja2FnZXM6ICdub3QgYSBtb25vcmVwbycgfSB9O1xuICAgIHJldHVybiB7XG4gICAgICAgIGV4dGVuZHM6IFtcbiAgICAgICAgICAgICdAY29tbWl0bGludC9jb25maWctY29udmVudGlvbmFsJyxcbiAgICAgICAgICAgICdAY29tbWl0bGludC9jb25maWctbGVybmEtc2NvcGVzJ1xuICAgICAgICBdLFxuICAgICAgICAvKipcbiAgICAgICAgICogQW55IHJ1bGVzIGRlZmluZWQgYmVsb3cgaGVyZSB3aWxsIG92ZXJyaWRlIHJ1bGVzIGZyb20gQGNvbW1pdGxpbnQvY29uZmlnLWNvbnZlbnRpb25hbFxuICAgICAgICAgKi9cbiAgICAgICAgcnVsZXM6IHtcbiAgICAgICAgICAgICdib2R5LWVtcHR5JzogWzEsICduZXZlciddLFxuICAgICAgICAgICAgJ2JvZHktY2FzZSc6IFsyLCAnYWx3YXlzJywgWydzZW50ZW5jZS1jYXNlJ11dLFxuICAgICAgICAgICAgLy8gdGhpcyBpcyBzZXQgdG8gYSB3YXJuaW5nIGluc3RlYWQsIHNpbmNlIENvbW1pdExpbnQgaGFzIGVycm9ycyB3aXRoIHRoaXMgcnVsZVxuICAgICAgICAgICAgJ2JvZHktbGVhZGluZy1ibGFuayc6IFsxLCAnYWx3YXlzJ10sXG4gICAgICAgICAgICAnYm9keS1tYXgtbGVuZ3RoJzogWzIsICdhbHdheXMnLCAxMDAwXSxcbiAgICAgICAgICAgICdoZWFkZXItbWF4LWxlbmd0aCc6IFsyLCAnYWx3YXlzJywgMTIwXSxcbiAgICAgICAgICAgICdoZWFkZXItZnVsbC1zdG9wJzogWzIsICdhbHdheXMnLCAnLiddLFxuICAgICAgICAgICAgJ2Zvb3Rlci1lbXB0eSc6IFsyLCAnbmV2ZXInXSxcbiAgICAgICAgICAgIC8vIHRoaXMgaXMgc2V0IHRvIGEgd2FybmluZyBpbnN0ZWFkLCBzaW5jZSBDb21taXRMaW50IGhhcyBlcnJvcnMgd2l0aCB0aGlzIHJ1bGVcbiAgICAgICAgICAgICdmb290ZXItbGVhZGluZy1ibGFuayc6IFsxLCAnYWx3YXlzJ10sXG4gICAgICAgICAgICAnZm9vdGVyLW1heC1sZW5ndGgnOiBbMiwgJ2Fsd2F5cycsIDEyMF0sXG4gICAgICAgICAgICAncmVmZXJlbmNlcy1lbXB0eSc6IFsyLCAnbmV2ZXInXSxcbiAgICAgICAgICAgICdzY29wZS1lbXB0eSc6IFsyLCAnbmV2ZXInXSxcbiAgICAgICAgICAgIC8vIEFkZGluZyB0aGUgZ2xvYmFsLWxldmVsLXNjb3BlIGZvciB0aGlzIHBhY2thZ2UgaW4gdGhlIGxpc3Qgb2Ygc2NvcGVzXG4gICAgICAgICAgICAnc2NvcGUtZW51bSc6IGFzeW5jIChjdHg6IGFueSkgPT4gW1xuICAgICAgICAgICAgICAgIDIsXG4gICAgICAgICAgICAgICAgJ2Fsd2F5cycsXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAuLi4obGVybmFGbGFnID8gYXdhaXQgZ2V0UGFja2FnZXMoY3R4KSA6IFtdKSxcbiAgICAgICAgICAgICAgICAgICAgZGlyZWN0b3J5UGF0aC5zcGxpdCgnLycpLnBvcCgpXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdzdWJqZWN0LWNhc2UnOiBbXG4gICAgICAgICAgICAgICAgMixcbiAgICAgICAgICAgICAgICAnYWx3YXlzJyxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdsb3dlci1jYXNlJywgLy8gZGVmYXVsdFxuICAgICAgICAgICAgICAgICAgICAndXBwZXItY2FzZScsIC8vIFVQUEVSQ0FTRVxuICAgICAgICAgICAgICAgICAgICAnY2FtZWwtY2FzZScsIC8vIGNhbWVsQ2FzZVxuICAgICAgICAgICAgICAgICAgICAna2ViYWItY2FzZScsIC8vIGtlYmFiLWNhc2VcbiAgICAgICAgICAgICAgICAgICAgJ3Bhc2NhbC1jYXNlJywgLy8gUGFzY2FsQ2FzZVxuICAgICAgICAgICAgICAgICAgICAnc2VudGVuY2UtY2FzZScsIC8vIFNlbnRlbmNlIGNhc2VcbiAgICAgICAgICAgICAgICAgICAgJ3NuYWtlLWNhc2UnLCAvLyBzbmFrZV9jYXNlXG4gICAgICAgICAgICAgICAgICAgICdzdGFydC1jYXNlJyAvLyBTdGFydCBDYXNlXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdzdWJqZWN0LWVtcHR5JzogWzIsICduZXZlciddLFxuICAgICAgICAgICAgJ3N1YmplY3QtZnVsbC1zdG9wJzogWzIsICdhbHdheXMnLCAnLiddLFxuICAgICAgICAgICAgJ3N1YmplY3QtbWF4LWxlbmd0aCc6IFsyLCAnYWx3YXlzJywgNzJdLFxuICAgICAgICAgICAgJ3R5cGUtZW51bSc6IFtcbiAgICAgICAgICAgICAgICAyLFxuICAgICAgICAgICAgICAgICdhbHdheXMnLFxuICAgICAgICAgICAgICAgIFsnZmVhdCcsICdmaXgnLCAnZG9jcycsICdzdHlsZScsICdyZWZhY3RvcicsICd0ZXN0JywgJ3JldmVydCddXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ3R5cGUtY2FzZSc6IFsyLCAnYWx3YXlzJywgJ2xvd2VyLWNhc2UnXSxcbiAgICAgICAgICAgICd0eXBlLWVtcHR5JzogWzIsICduZXZlciddXG4gICAgICAgIH0sXG4gICAgICAgIHBhcnNlclByZXNldDoge1xuICAgICAgICAgICAgcGFyc2VyT3B0czoge1xuICAgICAgICAgICAgICAgIHJlZmVyZW5jZUFjdGlvbnM6IFtdLFxuICAgICAgICAgICAgICAgIGlzc3VlUHJlZml4ZXM6IFtcbiAgICAgICAgICAgICAgICAgICAgJ01PT05CTS0nXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbn07XG4iXX0=