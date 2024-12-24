const { execSync } = require("child_process");
const path = require("path");

function getPackageJsonFiles() {
  try {
    return execSync('git ls-tree -r HEAD --name-only | grep "package.json"')
      .toString()
      .trim()
      .split("\n");
  } catch (error) {
    console.error("Error listing package.json files:", error);
    return [];
  }
}

function extractGitCommits(filePath, since, until) {
  try {
    return execSync(
      `git log --since="${since}" --until="${until}" --format="%H" -- ${filePath}`
    )
      .toString()
      .trim()
      .split("\n");
  } catch (error) {
    console.error(`Error extracting git commits for ${filePath}:`, error);
    return [];
  }
}

function readFileAtCommit(filePath, commitHash) {
  try {
    const normalizedPath = path.normalize(filePath);
    return execSync(`git show ${commitHash}:${normalizedPath}`).toString();
  } catch (error) {
    console.error(`Error reading ${filePath} at commit ${commitHash}:`, error);
    return null;
  }
}

function getCommitDate(commitHash) {
  try {
    return execSync(`git show -s --format=%ci ${commitHash}`).toString().trim();
  } catch (error) {
    console.error(`Error extracting commit date for ${commitHash}:`, error);
    return "";
  }
}

module.exports = {
  getPackageJsonFiles,
  extractGitCommits,
  readFileAtCommit,
  getCommitDate,
};
