[![Ubuntu](https://img.shields.io/badge/Ubuntu-E95420?style=for-the-badge\&logo=ubuntu\&logoColor=white)](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#jobsjob_idruns-on)
[![Mac OS](https://img.shields.io/badge/mac%20os-000000?style=for-the-badge\&logo=macos\&logoColor=F0F0F0)](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#jobsjob_idruns-on)
[![Windows](https://img.shields.io/badge/Windows-0078D6?style=for-the-badge\&logo=windows\&logoColor=white)](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#jobsjob_idruns-on)
[![Public workflows that use this action.](https://img.shields.io/endpoint?style=for-the-badge\&url=https%3A%2F%2Fused-by.vercel.app%2Fapi%2Fgithub-actions%2Fused-by%3Faction%3Dtj-actions%2Fglob%26badge%3Dtrue)](https://github.com/search?l=YAML\&o=desc\&q=tj-actions+glob\&s=\&type=Code)

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/f7bad194af30455bbeea51747d7b5d61)](https://www.codacy.com/gh/tj-actions/glob/dashboard?utm_source=github.com\&utm_medium=referral\&utm_content=tj-actions/glob\&utm_campaign=Badge_Grade)
[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/f7bad194af30455bbeea51747d7b5d61)](https://www.codacy.com/gh/tj-actions/glob/dashboard?utm_source=github.com\&utm_medium=referral\&utm_content=tj-actions/glob\&utm_campaign=Badge_Coverage)
[![build-test](https://github.com/tj-actions/glob/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/tj-actions/glob/actions/workflows/test.yml)
[![Update release version.](https://github.com/tj-actions/glob/workflows/Update%20release%20version./badge.svg)](https://github.com/tj-actions/glob/actions?query=workflow%3A%22Update+release+version.%22)

## glob

Search for files matching [glob patterns](https://docs.github.com/en/actions/learn-github-actions/workflow-syntax-for-github-actions#filter-pattern-cheat-sheet) with support for returning matching deleted git tracked files, omits files and directories specified in the projects `.gitignore`, and excludes the `.git` and `node_modules` folders except explicitly specified.

## Table of Contents

*   [Usage](#usage)
*   [Inputs](#inputs)
*   [Outputs](#outputs)
*   [Path filtering](#path-filtering)
    *   [minimatch options](#minimatch-options)
        *   [Enabled](#enabled)
        *   [Optionally enabled](#optionally-enabled)
        *   [Disabled](#disabled)
    *   [Pattern Gotcha](#pattern-gotcha)
*   [Patterns](#patterns)
    *   [Glob behaviour](#glob-behaviour)
    *   [Tilde expansion](#tilde-expansion)
    *   [Comments](#comments)
    *   [Exclude patterns](#exclude-patterns)
    *   [Escaping](#escaping)
*   [Credits](#credits)
*   [Report Bugs](#report-bugs)

## Usage

> **Warning**
>
> *   Ensure that subdirectory patterns are prefixed with `**/` as `**.yml` only matches yml files in the top level directory and should be replaced with `**/*.yml`.
> *   All multi-line string patterns are specified without quotes. See: https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#filter-pattern-cheat-sheet for more examples of filter patterns

```yaml
...
    steps:
      - uses: actions/checkout@v2

      - name: Glob match
        uses: tj-actions/glob@v17
        id: glob
        with:
          files: |
            *.md
            **/*.yaml
            !action.yml
            **/rebase.yml

      - name: Show all matching files
        run: |
          echo "${{ steps.glob.outputs.paths }}"
        # Outputs: .github/workflows/rebase.yml .github/workflows/sync-release-version.yml .github/workflows/test.yml...
```

## Inputs

<!-- AUTO-DOC-INPUT:START - Do not remove or modify this section -->

|                   INPUT                   |  TYPE  | REQUIRED |                       DEFAULT                       |                                                               DESCRIPTION                                                               |
|-------------------------------------------|--------|----------|-----------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------|
|                 base-ref                  | string |  false   |    `"${{ github.event.pull_request.base.ref }}"`    |                  Specify a base ref used <br>for comparing changes, when `include-deleted-files` <br>is set to `true`                   |
|                 base-sha                  | string |  false   |                                                     |              Specify a base commit SHA <br>used for comparing changes, when <br>`include-deleted-files` is set to `true`                |
|                   diff                    | string |  false   |                                                     |       Specify a diff string `..` <br>or `...` used for comparing <br>changes, when `include-deleted-files` is set <br>to `true`         |
|               escape-paths                | string |  false   |                      `"false"`                      |                                 Escape special characters of filenames <br>used in the `paths` output                                   |
|              excluded-files               | string |  false   |                                                     |                    Excluded file patterns (optionally include `!` before the file pattern or it would be prepended)                     |
|      excluded-files-from-source-file      | string |  false   |                                                     |                                         Source file to populate the <br>`excluded-files` input                                          |
| excluded-files-from-source-file-separator | string |  false   |                       `"\n"`                        |                                Separator used to split the <br>`excluded-files-from-source-file` input                                  |
|         excluded-files-separator          | string |  false   |                       `"\n"`                        |                                         Separator used to split the <br>`excluded-files` input                                          |
|                   files                   | string |  false   |                                                     |                                                              File patterns                                                              |
|          files-from-source-file           | string |  false   |                                                     |                                             Source file to populate the <br>`files` input                                               |
|     files-from-source-file-separator      | string |  false   |                       `"\n"`                        |                                     Separator used to split the <br>`files-from-source-file` input                                      |
|              files-separator              | string |  false   |                       `"\n"`                        |                                             Separator used to split the <br>`files` input                                               |
|           follow-symbolic-links           | string |   true   |                      `"true"`                       |                                             Indicates whether to follow symbolic <br>links                                              |
|              head-repo-fork               | string |  false   | `"${{ github.event.pull_request.head.repo.fork }}"` | Specify a boolean indicating a <br>PR from a fork is <br>used for comparing changes, when <br>`include-deleted-files` is set to `true`  |
|           include-deleted-files           | string |  false   |                      `"false"`                      |                                                   Include all matching deleted files                                                    |
|             match-directories             | string |   true   |                      `"true"`                       |                                          Indicates whether to include matched <br>directories                                           |
|           match-gitignore-files           | string |   true   |                      `"false"`                      |                                          Indicates whether to match files <br>in `.gitignore`                                           |
|                 separator                 | string |   true   |                        `" "`                        |                                                Separator used for the paths <br>output.                                                 |
|                    sha                    | string |   true   |                `"${{ github.sha }}"`                |             Specify a current commit SHA <br>used for comparing changes, when <br>`include-deleted-files` is set to `true`              |
|            strip-top-level-dir            | string |  false   |                      `"true"`                       |                                       Strip the `$GITHUB_WORKSPACE` from the <br>`paths` output                                         |
|             working-directory             | string |   true   |                        `"."`                        |                     Provide a path that is <br>relative to `$GITHUB_WORKSPACE` for identifying <br>the repository.                      |

<!-- AUTO-DOC-INPUT:END -->

## Outputs

<!-- AUTO-DOC-OUTPUT:START - Do not remove or modify this section -->

|       OUTPUT        |  TYPE  |                                              DESCRIPTION                                              |
|---------------------|--------|-------------------------------------------------------------------------------------------------------|
| has-custom-patterns | string |                       Indicates whether at least one <br>pattern was provided                         |
|        paths        | string |                List of filtered paths using <br>the specified patterns and separator                  |
|  paths-output-file  | string | List of filtered paths using <br>the specified patterns and separator <br>stored in a temporary file  |

<!-- AUTO-DOC-OUTPUT:END -->

## Path filtering

File and Directory patterns are evaluted using [minimatch](https://github.com/isaacs/minimatch) with the help of the [@actions/glob](https://github.com/actions/toolkit/tree/main/packages/glob) package.

### [minimatch options](https://github.com/isaacs/minimatch#options)

#### Enabled

*   [dot](https://github.com/isaacs/minimatch#dot)
*   [nocomment](https://github.com/isaacs/minimatch#nocomment)
*   [noext](https://github.com/isaacs/minimatch#noext)
*   [nonegate](https://github.com/isaacs/minimatch#nonegate): This is handled by the [@actions/glob](https://github.com/actions/toolkit/tree/main/packages/glob) package.

#### Optionally enabled

*   [nocase](https://github.com/isaacs/minimatch#nobrace): Enabled for windows

#### Disabled

*   [nobrace](https://github.com/isaacs/minimatch#nobrace): Ensures that brace or brace sets can be used.

### Pattern Gotcha

The `**` pattern in [minimatch](https://github.com/isaacs/minimatch) matches any number of directories and files recursively, but it must be followed by a directory separator (`/` on Unix-like systems) to be effective. If you want to match all files with the `.js` extension in a directory and its subdirectories, you should use the `**/*.js` pattern as opposed to `**.js`

## Patterns

### Glob behaviour

Patterns `*`, `?`, `[...]`, and `**` (globstar) are supported.

With the following behaviours:

*   File names that begin with `.` may be included in the results
*   Case insensitive on Windows
*   Directory separators `/` and `\` are both supported on Windows

### Tilde expansion

Supports basic tilde expansion, for current user HOME replacement only.

Example:

*   `~` may expand to /Users/johndoe
*   `~/foo` may expand to /Users/johndoe/foo

### Comments

Patterns that begin with `#` are treated as comments.

### Exclude patterns

Leading `!` changes the meaning of an include pattern to exclude.

Multiple leading `!` flips the meaning.

### Escaping

Wrapping special characters in `[]` can be used to escape literal glob characters
in a file name. For example the literal file name `hello[a-z]` can be escaped as `hello[[]a-z]`.

On Linux/macOS `\` is also treated as an escape character.

*   Free software: [MIT license](LICENSE)

If you feel generous and want to show some extra appreciation:

[![Buy me a coffee][buymeacoffee-shield]][buymeacoffee]

[buymeacoffee]: https://www.buymeacoffee.com/jackton1

[buymeacoffee-shield]: https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png

## Credits

This package was created with [Cookiecutter](https://github.com/cookiecutter/cookiecutter)
using [cookiecutter-action](https://github.com/tj-actions/cookiecutter-action)

*   [@actions/glob](https://github.com/actions/toolkit/tree/main/packages/glob)
*   [@actions/core](https://github.com/actions/toolkit/tree/main/packages/core)
*   [@actions/exec](https://github.com/actions/toolkit/tree/main/packages/exec)
*   [@actions/github](https://github.com/actions/toolkit/tree/main/packages/github)
*   [@actions/io](https://github.com/actions/toolkit/tree/main/packages/io)

## Report Bugs

Report bugs at https://github.com/tj-actions/glob/issues.

If you are reporting a bug, please include the following:

*   Your operating system name and version.
*   Any details about your workflow that might be helpful in troubleshooting.
*   Detailed steps to reproduce the bug.
