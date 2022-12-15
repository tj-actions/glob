[![Codacy Badge](https://app.codacy.com/project/badge/Grade/f7bad194af30455bbeea51747d7b5d61)](https://www.codacy.com/gh/tj-actions/glob/dashboard?utm_source=github.com\&utm_medium=referral\&utm_content=tj-actions/glob\&utm_campaign=Badge_Grade)
[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/f7bad194af30455bbeea51747d7b5d61)](https://www.codacy.com/gh/tj-actions/glob/dashboard?utm_source=github.com\&utm_medium=referral\&utm_content=tj-actions/glob\&utm_campaign=Badge_Coverage)
[![build-test](https://github.com/tj-actions/glob/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/tj-actions/glob/actions/workflows/test.yml)
[![Update release version.](https://github.com/tj-actions/glob/workflows/Update%20release%20version./badge.svg)](https://github.com/tj-actions/glob/actions?query=workflow%3A%22Update+release+version.%22)
[![Public workflows that use this action.](https://img.shields.io/endpoint?url=https%3A%2F%2Fused-by.vercel.app%2Fapi%2Fgithub-actions%2Fused-by%3Faction%3Dtj-actions%2Fglob%26badge%3Dtrue)](https://github.com/search?l=YAML\&o=desc\&q=tj-actions+glob\&s=\&type=Code)

[![Ubuntu](https://img.shields.io/badge/Ubuntu-E95420?logo=ubuntu\&logoColor=white)](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#jobsjob_idruns-on)
[![Mac OS](https://img.shields.io/badge/mac%20os-000000?logo=macos\&logoColor=F0F0F0)](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#jobsjob_idruns-on)
[![Windows](https://img.shields.io/badge/Windows-0078D6?logo=windows\&logoColor=white)](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#jobsjob_idruns-on)

## glob

Search for files matching [glob patterns](https://docs.github.com/en/actions/learn-github-actions/workflow-syntax-for-github-actions#filter-pattern-cheat-sheet) with support for returning matching deleted git tracked files and also excludes all files and folders specified in `.gitignore` and the `.git` directory.

## Usage

> NOTE: :warning:
>
> *   Ensure that subdirectory patterns are prefixed with `**/`
> *   All multi line string patterns are specified without quotes. See: https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#filter-pattern-cheat-sheet

```yaml
...
    steps:
      - uses: actions/checkout@v2

      - name: Glob match
        uses: tj-actions/glob@v16
        id: glob
        with:
          files: |
            *.md
            **.yaml
            **.yml
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
|                 base-ref                  | string |  false   |             `"${{ github.base_ref }}"`              |                   Specify a base ref used<br>for comparing changes, when `include-deleted-files`<br>is set to `true`                    |
|                 base-sha                  | string |  false   |                                                     |              Specify a base commit SHA<br>used for comparing changes, when<br>`include-deleted-files` is set to `true`<br>              |
|               escape-paths                | string |  false   |                      `"false"`                      |                                Escape special characters of filenames<br>used in the `paths` output<br>                                 |
|              excluded-files               | string |  false   |                                                     |               Excluded file patterns (optionally include<br>`!` before the file pattern<br>or it would be prepended)<br>                |
|      excluded-files-from-source-file      | string |  false   |                                                     |                                          Source file to populate the<br>`excluded-files` input                                          |
| excluded-files-from-source-file-separator | string |  false   |                       `"\n"`                        |                                 Separator used to split the<br>`excluded-files-from-source-file` input                                  |
|         excluded-files-separator          | string |  false   |                       `"\n"`                        |                                          Separator used to split the<br>`excluded-files` input                                          |
|                   files                   | string |  false   |                                                     |                                                              File patterns                                                              |
|          files-from-source-file           | string |  false   |                                                     |                                              Source file to populate the<br>`files` input                                               |
|     files-from-source-file-separator      | string |  false   |                       `"\n"`                        |                                      Separator used to split the<br>`files-from-source-file` input                                      |
|              files-separator              | string |  false   |                       `"\n"`                        |                                              Separator used to split the<br>`files` input                                               |
|           follow-symbolic-links           | string |   true   |                      `"true"`                       |                                              Indicates whether to follow symbolic<br>links                                              |
|              head-repo-fork               | string |  false   | `"${{ github.event.pull_request.head.repo.fork }}"` | Specify a boolean indicating a<br>PR from a fork is<br>used for comparing changes, when<br>`include-deleted-files` is set to `true`<br> |
|           include-deleted-files           | string |  false   |                      `"false"`                      |                                                 Include all matching deleted files<br>                                                  |
|             match-directories             | string |   true   |                      `"true"`                       |                                            Indicates whether to include match<br>directories                                            |
|           match-gitignore-files           | string |   true   |                      `"false"`                      |                                           Indicates whether to match files<br>in `.gitignore`                                           |
|                 separator                 | string |   true   |                        `" "`                        |                                                 Separator used for the paths<br>output.                                                 |
|                    sha                    | string |   true   |                `"${{ github.sha }}"`                |            Specify a current commit SHA<br>used for comparing changes, when<br>`include-deleted-files` is set to `true`<br>             |
|            strip-top-level-dir            | string |  false   |                      `"true"`                       |                                        Strip the `$GITHUB_WORKSPACE` from the<br>`paths` output                                         |
|             working-directory             | string |   true   |                        `"."`                        |                             Specify a relative path under<br>$GITHUB\_WORKSPACE to locate the repository<br>                             |

<!-- AUTO-DOC-INPUT:END -->

## Outputs

<!-- AUTO-DOC-OUTPUT:START - Do not remove or modify this section -->

|       OUTPUT        |  TYPE  |                                              DESCRIPTION                                               |
|---------------------|--------|--------------------------------------------------------------------------------------------------------|
| has-custom-patterns | string |                             Indicates whether custom patterns were<br>used                             |
|        paths        | string |                List of filtered paths using<br>the specified patterns and separator<br>                |
|  paths-output-file  | string | List of filtered paths using<br>the specified patterns and separator<br>stored in a temporary file<br> |

<!-- AUTO-DOC-OUTPUT:END -->

## Patterns

### Glob behavior

Patterns `*`, `?`, `[...]`, `**` (globstar) are supported.

With the following behaviors:

*   File names that begin with `.` may be included in the results
*   Case insensitive on Windows
*   Directory separator `/` and `\` both supported on Windows

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

If you are reporting a bug, please include:

*   Your operating system name and version.
*   Any details about your workflow that might be helpful in troubleshooting.
*   Detailed steps to reproduce the bug.
