function parseDependencyChanges(
  filePath,
  commits,
  readFileAtCommit,
  getCommitDate
) {
  const updates = [];

  commits.forEach((commitHash, index) => {
    const fileContent = readFileAtCommit(filePath, commitHash);

    if (!fileContent) {
      return;
    }

    let packageJson;

    try {
      packageJson = JSON.parse(fileContent);
    } catch (error) {
      console.error(
        `Error parsing JSON for ${filePath} at commit ${commitHash}:`,
        error
      );
      return;
    }

    if (index > 0) {
      const prevFileContent = readFileAtCommit(filePath, commits[index - 1]);

      if (!prevFileContent) {
        return;
      }

      let prevPackageJson;

      try {
        prevPackageJson = JSON.parse(prevFileContent);
      } catch (error) {
        console.error(
          `Error parsing previous JSON for ${filePath} at commit ${
            commits[index - 1]
          }:`,
          error
        );
        return;
      }

      trackDependencyChanges(
        filePath,
        packageJson,
        prevPackageJson,
        commitHash,
        updates,
        getCommitDate
      );
    }
  });

  return { filePath, updates };
}

function trackDependencyChanges(
  filePath,
  current,
  previous,
  commitHash,
  updates,
  getCommitDate
) {
  const allDependencies = {
    ...current.dependencies,
    ...current.devDependencies,
  };
  const prevDependencies = {
    ...previous.dependencies,
    ...previous.devDependencies,
  };

  const commitDate = getCommitDate(commitHash);

  for (const [packageName, version] of Object.entries(allDependencies)) {
    const isDevDependency =
      current.devDependencies && current.devDependencies[packageName];
    const dependencyType = isDevDependency ? "devDependency" : "dependency";

    if (!prevDependencies[packageName]) {
      updates.push({
        packageName,
        filePath,
        version,
        changeType: "added",
        commitDate,
        dependencyType,
        oldVersion: "",
        newVersion: version,
        commitHash,
      });
    } else if (prevDependencies[packageName] !== version) {
      updates.push({
        packageName,
        filePath,
        oldVersion: prevDependencies[packageName],
        newVersion: version,
        changeType: "modified",
        commitDate,
        dependencyType,
        commitHash,
      });
    }
  }

  for (const packageName of Object.keys(prevDependencies)) {
    if (!allDependencies[packageName]) {
      const isDevDependency =
        previous.devDependencies && previous.devDependencies[packageName];
      const dependencyType = isDevDependency ? "devDependency" : "dependency";

      updates.push({
        packageName,
        filePath,
        version: prevDependencies[packageName],
        changeType: "deleted",
        commitDate,
        dependencyType,
        oldVersion: prevDependencies[packageName],
        newVersion: "",
        commitHash,
      });
    }
  }
}

module.exports = {
  parseDependencyChanges,
};
