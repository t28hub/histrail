import { globSync } from 'node:fs';
import { RuleConfigSeverity, type UserConfig } from '@commitlint/types';

const scopes = globSync('{crates,apps,packages}/*', {
  cwd: import.meta.dirname,
  withFileTypes: true,
})
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      RuleConfigSeverity.Error,
      'always',
      ['build', 'chore', 'ci', 'docs', 'feat', 'fix', 'perf', 'refactor', 'test'],
    ],
    'scope-enum': [RuleConfigSeverity.Error, 'always', scopes],
    'subject-case': [RuleConfigSeverity.Error, 'always', 'lower-case'],
    'body-empty': [RuleConfigSeverity.Error, 'always'],
    'footer-empty': [RuleConfigSeverity.Error, 'always'],
  },
} satisfies UserConfig;
