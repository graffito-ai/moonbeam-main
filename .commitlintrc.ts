/*
This code package needs to import the `moonbeam-commitlint` locally, instead
of referring to it as a published first-party dependency. The reasoning behind
it is because this mono repo is the one publishing `moonbeam-commitlint`, so it
cannot reference it globally until it builds.
The other modules will just use: '@moonbeam/moonbeam-commitlint' as the import source
*/
import {setCommitLintConfig} from "./packages/moonbeam-commitlint/src/index";
let commitLintConfig = setCommitLintConfig(__dirname,  false);
module.exports = {
    ...commitLintConfig
};
