import ghpages from 'gh-pages';

const dryRun = process.argv.includes('--dry-run');
const repo = 'git@github.com:shaijing/shaijing.github.io.git';
const branch = 'gh-pages';

try {
  await ghpages.publish('out', {
    repo,
    branch,
    nojekyll: true,
    cname: 'me.isom.top',
    push: !dryRun,
    message: 'Deploy site',
  });
  console.log(dryRun
    ? `Dry run complete; no changes pushed to ${repo} (${branch}).`
    : `Published out/ to ${repo} (${branch}).`);
} catch (error) {
  console.error('Failed to publish site:', error);
  process.exitCode = 1;
} finally {
  if (dryRun) ghpages.clean();
}
