/* eslint-disable no-undef */
/* eslint-disable unicorn/prefer-module */
/* eslint-disable no-useless-escape */

const content = `#
**/public
**/lib
**/es
**/docs
**/coverage
**/.history
**/.vs
**/.swc
**/docs

*.d.ts
*.log
*.zip
*.txt
*.7z
*.min.js
rollup.config-*.cjs

.eslintrc.js
.prettierrc.js
.stylelintrc.js
.lintstagedrc
`;

module.exports = {
  content,
};
