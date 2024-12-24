# dep-changelog

**A CLI tool to track changes in `package.json` dependencies and devDependencies over a specified date range using Git commit history.**

## Features
- Analyze changes to `dependencies` and `devDependencies` in `package.json` files.
- Specify a time range to focus on specific commits.
- Support for multiple output formats:
  - **Human-readable** (default)
  - **JSON**
  - **CSV**
- Group changes by package name and file path for better clarity.

## Installation
Install globally via npm:
```bash
npm install -g dep-changelog
```

Or use it directly with `npx`:
```bash
npx dep-changelog
```

## Usage
Run the tool in a Git repository to analyze dependency changes:

```bash
dep-changelog --since <start-date> --until <end-date> [options]
```

### Options
| Option         | Alias | Description                                                      | Default                    |
|----------------|-------|------------------------------------------------------------------|----------------------------|
| `--since`      | `-s`  | Start date for analysis (e.g., `2024-01-01`).                    | Required                   |
| `--until`      | `-u`  | End date for analysis (e.g., `2024-12-31`).                      | Required                   |
| `--output`     | `-o`  | Output file path for results.                                    | `dependency_changes.csv`   |
| `--format`     | `-f`  | Output format (`human`, `json`, `csv`).                          | `human`                    |
| `--help`       |       | Show help information.                                           |                            |

### Examples
1. **Default Human-Readable Format**:
   ```bash
   dep-changelog --since 2024-01-01 --until 2024-12-31
   ```

2. **Output in JSON Format**:
   ```bash
   dep-changelog --since 2024-01-01 --until 2024-12-31 --format=json --output=changes.json
   ```

3. **Output in CSV Format**:
   ```bash
   dep-changelog --since 2024-01-01 --until 2024-12-31 --format=csv --output=changes.csv
   ```

## Output Formats

### Human-Readable Format (Default)
```plaintext
## docs/accessibility/package.json:
### dependencies
- some-library
      - 2024/01/05: Added version 1.0 (#commit-hash)
      - 2024/02/04: Modified version 1.0 -> 1.2
### devDependencies
- another-library
      - 2024/01/05: Added version 1.0 (#commit-hash)
      - 2024/02/04: Modified version 1.0 -> 1.2
```

### JSON Format
```json
[
  {
    "packageName": "some-library",
    "filePath": "docs/accessibility/package.json",
    "dependencyType": "dependency",
    "changeType": "added",
    "commitDate": "2024-01-05",
    "newVersion": "1.0",
    "commitHash": "commit-hash"
  },
  ...
]
```

### CSV Format
```csv
Library Name,Package Path,Dependency Type,Change Type,Commit Date,Previous Version,New Version
some-library,docs/accessibility/package.json,dependency,added,2024-01-05,,1.0
some-library,docs/accessibility/package.json,dependency,modified,2024-02-04,1.0,1.2
```

## Testing
To test the project, ensure Jest is installed and run:
```bash
npm test
```

## Contribution
Contributions are welcome! Please:
1. Fork the repository.
2. Create a feature branch.
3. Submit a pull request with a clear description of changes.

## License
This project is licensed under the MIT License.
