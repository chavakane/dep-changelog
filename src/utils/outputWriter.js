const fs = require("fs");

function formatCsv(data) {
  const header = [
    "Library Name",
    "Package Path",
    "Dependency Type",
    "Change Type",
    "Commit Date",
    "Previous Version",
    "New Version",
  ];

  const rows = data.map((update) => {
    const {
      packageName,
      filePath,
      version,
      changeType,
      oldVersion,
      newVersion,
      dependencyType,
      commitDate,
    } = update;
    const previousVersion =
      changeType === "modified" || changeType === "deleted" ? oldVersion : "";
    const currentVersion = changeType === "modified" ? newVersion : version;

    return [
      packageName,
      filePath,
      dependencyType,
      changeType,
      commitDate,
      previousVersion,
      currentVersion,
    ];
  });

  return [header, ...rows].map((row) => row.join(",")).join("\n");
}

function writeCsvFile(data, outputFilePath) {
  fs.writeFileSync(outputFilePath, formatCsv(data));
}

function formatJson(data) {
  return JSON.stringify(data, null, 2);
}

function writeJsonFile(data, outputFilePath) {
  fs.writeFileSync(outputFilePath, formatJson(data));
}

function writeHumanReadableFile(updates, outputFilePath) {
  fs.writeFileSync(outputFilePath, formatHumanReadable(updates));
}

function formatHumanReadable(updates) {
  const groupedUpdates = updates.reduce((acc, update) => {
    if (!acc[update.filePath]) {
      acc[update.filePath] = { dependencies: {}, devDependencies: {} };
    }
    const category =
      update.dependencyType === "dependency"
        ? "dependencies"
        : "devDependencies";
    if (!acc[update.filePath][category][update.packageName]) {
      acc[update.filePath][category][update.packageName] = [];
    }
    const changeDetails = `  - ${update.commitDate}: ${
      update.changeType === "added"
        ? `Added version ${update.newVersion}`
        : update.changeType === "modified"
        ? `Modified version ${update.oldVersion} -> ${update.newVersion}`
        : `Deleted version ${update.oldVersion}`
    } (#${update.commitHash})`;
    acc[update.filePath][category][update.packageName].push(changeDetails);
    return acc;
  }, {});

  return Object.entries(groupedUpdates)
    .map(([filePath, { dependencies, devDependencies }]) => {
      const formatCategory = (categoryData) => {
        return Object.entries(categoryData)
          .map(
            ([packageName, changes]) =>
              `- ${packageName}\n${changes.join("\n")}`
          )
          .join("\n");
      };
      const dependencySection =
        Object.keys(dependencies).length > 0
          ? `### dependencies\n${formatCategory(dependencies)}`
          : "";
      const devDependencySection =
        Object.keys(devDependencies).length > 0
          ? `### devDependencies\n${formatCategory(devDependencies)}`
          : "";
      return `## ${filePath}:\n${dependencySection}\n${devDependencySection}`;
    })
    .join("\n\n");
}

module.exports = {
  writeCsvFile,
  formatCsv,
  writeJsonFile,
  formatJson,
  writeHumanReadableFile,
  formatHumanReadable,
};
