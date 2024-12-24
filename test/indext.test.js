const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const TEMP_REPO = path.join(__dirname, "../temp-test-repo");

// Helper functions
function setupGitRepo() {
  execSync("git init", { cwd: TEMP_REPO });
  execSync('git config user.name "Test User"', { cwd: TEMP_REPO });
  execSync('git config user.email "test@example.com"', { cwd: TEMP_REPO });
}

function cleanUpGitRepo() {
  fs.rmSync(TEMP_REPO, { recursive: true });
}

function writePackageJson(content, commitMessage) {
  const filePath = path.join(TEMP_REPO, "package.json");
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
  execSync("git add package.json", { cwd: TEMP_REPO });
  execSync(`git commit -m "${commitMessage}"`, { cwd: TEMP_REPO });
}

function getFutureDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    separator: "/",
  }).format(date);

  return formattedDate;
}

beforeEach(() => {
  fs.mkdirSync(TEMP_REPO, { recursive: true });
  setupGitRepo();
});

afterEach(() => {
  cleanUpGitRepo();
});

describe("JSON format", () => {
  test("should detect added dependencies", () => {
    writePackageJson({ dependencies: {} }, "Add package json");
    writePackageJson(
      { dependencies: { lodash: "^4.17.21" } },
      "Add lodash dependency"
    );

    const result = execSync(
      `node ${path.join(
        __dirname,
        "../src/index.js"
      )} --since="2020-01-01" --until="${getFutureDate()}" --format=json`,
      {
        cwd: TEMP_REPO,
      }
    );

    const output = JSON.parse(result.toString());
    expect(output).toBeInstanceOf(Array);
    expect(output).toHaveLength(1);
    expect(output[0]).toMatchObject({
      packageName: "lodash",
      changeType: "added",
    });
  });

  test("should detect modified dependencies", () => {
    writePackageJson(
      { dependencies: { lodash: "^4.17.21" } },
      "Add lodash dependency"
    );
    writePackageJson(
      { dependencies: { lodash: "^4.17.22" } },
      "Modify lodash dependency"
    );

    const result = execSync(
      `node ${path.join(
        __dirname,
        "../src/index.js"
      )} --since="2020-01-01" --until="${getFutureDate()}" --format=json`,
      {
        cwd: TEMP_REPO,
      }
    );

    const output = JSON.parse(result.toString());
    expect(output).toBeInstanceOf(Array);
    expect(output).toHaveLength(1);
    expect(output[0]).toMatchObject({
      packageName: "lodash",
      changeType: "modified",
    });
  });

  test("should detect deleted dependencies", () => {
    writePackageJson(
      { dependencies: { lodash: "^4.17.21" } },
      "Add lodash dependency"
    );
    writePackageJson({ dependencies: {} }, "Deleted lodash dependency");

    const result = execSync(
      `node ${path.join(
        __dirname,
        "../src/index.js"
      )} --since="2020-01-01" --until="${getFutureDate()}" --format=json`,
      {
        cwd: TEMP_REPO,
      }
    );

    const output = JSON.parse(result.toString());
    expect(output).toBeInstanceOf(Array);
    expect(output).toHaveLength(1);
    expect(output[0]).toMatchObject({
      packageName: "lodash",
      changeType: "deleted",
    });
  });
});
