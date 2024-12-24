#!/usr/bin/env node

const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const {
  getPackageJsonFiles,
  extractGitCommits,
  readFileAtCommit,
  getCommitDate,
} = require("./utils/gitUtils");
const { parseDependencyChanges } = require("./utils/dependencyUtils");
const {
  writeCsvFile,
  writeJsonFile,
  writeHumanReadableFile,
  formatCsv,
  formatJson,
  formatHumanReadable,
} = require("./utils/outputWriter");

// Parse CLI arguments
const argv = yargs(hideBin(process.argv))
  .option("since", {
    alias: "s",
    type: "string",
    description:
      "Start date for the commit history analysis (e.g., 2024-01-01)",
    demandOption: true,
  })
  .option("until", {
    alias: "u",
    type: "string",
    description: "End date for the commit history analysis (e.g., 2024-12-31)",
    demandOption: true,
  })
  .option("output", {
    alias: "o",
    type: "string",
    description: "Output file path for the results",
  })
  .option("format", {
    alias: "f",
    type: "string",
    description: "Output format: csv or json (default: csv)",
    choices: ["csv", "json", "human"],
    default: "human",
  })
  .help().argv;

function analyzeRepo() {
  const packageFiles = getPackageJsonFiles();
  const allUpdates = [];

  packageFiles.forEach((file) => {
    const commits = extractGitCommits(file, argv.since, argv.until);
    commits.reverse();

    if (commits.length > 0) {
      const result = parseDependencyChanges(
        file,
        commits,
        readFileAtCommit,
        getCommitDate
      );
      allUpdates.push(...result.updates);
    }
  });

  if (argv.output) {
    if (argv.format === "csv") {
      writeCsvFile(allUpdates, argv.output);
      console.log(`CSV file "${argv.output}" has been created successfully.`);
    } else if (argv.format === "json") {
      writeJsonFile(allUpdates, argv.output);
      console.log(`JSON file "${argv.output}" has been created successfully.`);
    } else {
      writeHumanReadableFile(allUpdates, argv.output);
      console.log(
        `Changelog file "${argv.output}" has been created successfully.`
      );
    }
  } else {
    if (argv.format === "csv") {
      console.log(formatCsv(allUpdates));
    } else if (argv.format === "json") {
      console.log(formatJson(allUpdates));
    } else {
      console.log(formatHumanReadable(allUpdates));
    }
  }
}

analyzeRepo();
