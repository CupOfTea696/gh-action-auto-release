# GitHub Action // Auto-Release on Commit

A [GitHub][github] Action to automatically create a Release when a commit message matches a pattern.

Auto-Release on Commit will create a release for you when you push a commit with a message matching
a pattern. It will use your CHANGELOG file to determine the description of your Release. 

## Usage

### Workflow

To get started, create a workflow `.yml` file in your `.github/workflows` directory. There is an [example workflow](#example) below. For more information, take a look at the
GitHub Help Documentation for [GitHub Actions][actions]

### Replacements

Certain [inputs] can use replacements that use the version information from the commit message.

The following replacements can be used in the `title`, `tag`, and `changelog-entry` [inputs].
You can define your own replacements by using a custom `regex` input, see the [Patterns section][patterns] for more info.

 - `version`: The full version string, including the `v` prefix if it was found.
   e.g. `1.4.2` or `v0.2.3-alpha`.
 - `prefix`: The character `v` if the version had a prefix.
   e.g. `'v'` from `v1.4.2`, or `''` from `2.3.9`.
 - `semver`: The version string _without_ the prefix, regardless of its presence in the full version string.
   e.g. `1.4.2` or `0.2.3-alpha`.
 - `major`: The major version number, e.g. `1` from `v1.4.2`.
 - `minor`: The minor version number, e.g. `4` from `v1.4.2`.
 - `patch`: The patch number, e.g. `2` from `v1.4.2`.
 - `prerelease`: The pre-release identifier, if present. Otherwise, an empty string.
   e.g. `alpha` from `v0.2.3-alpha`.
 - `build`: The build metadata, if present. Otherwise, an empty string.
   e.g. `build.1848` from `v1.0.3+build.1848`.

### Inputs

The inputs below are available for this workflow. All inputs are optional. 

 - `title`: The title for the Release.
   Default: `Version $semver`
 - `tag`: The name for the git tag that will be created for this Release.
   Default: `$version`
 - `draft`: Whether new releases should be published as a draft.
   Default `false`
 - `changelog`: The path to your CHANGELOG.
   Default: `CHANGELOG.md`
 - `changelog-entry`: String a CHANGELOG entry must contain to be used as the entry for this Release.
   Default: `$version`
   
   More info in the [CHANGELOG section](#about-changelogs).
 - `regex`: Pattern a commit message must match for a Release to be created.
   Default: Any version string following [SemVer][semver], surrounded by either whitespace, special characters, or the
   string boundaries.
   
   More info in the [Patterns section][patterns].
 - `prerelease-regex`: Pattern the commit message must match to mark the Release as a pre-release.
   Default: Any version string that has pre-release identifier.
   
### About CHANGELOGs

This Action uses your CHANGELOG file to populate the description of a Release. You must commit the CHANGELOG containing
the changes for your release before or with the release commit.

This Action will parse your CHANGELOG as markdown, and attempt to find a heading containing the `changelog-entry` input
string. Any content below this heading up until the next heading at the same level, or the end of the CHANGELOG, will
be used as the description for your release. 

### Outputs

 - `released`: A boolean value representing whether a release was created.
 - `id`: The ID of the Release.
 - `html_url`: The URL users can navigate to in order to view the Release.
 - `upload_url`: The URL for uploading release assets, which can be used by GitHub actions in subsequent steps,
   for example with the [@actions/upload-release-asset](https://github.com/actions/upload-release-asset) Action.

If the `released` output is `false`, none of the other outputs will be set.

### Example

One every `push` event containing a commit message matching the pattern, create a Release.

```yml
# This is a basic workflow to help you get started with the GitHub Auto-Release on Commit Action.

name: AutoRelease

on:
  push:
    branches: [ master ]

# A workflow run is made up of one or more jobs that can run sequentially or in parallel
jobs:
  # This workflow contains a single job called "build"
  release:
    # The type of runner that the job will run on
    runs-on: ubuntu-latest

    # Steps represent a sequence of tasks that will be executed as part of the job
    steps:
      - uses: actions/checkout@v2
      - uses: CupOfTea696/gh-action-auto-release@v1.0.2
        with:
          title: "Release: $version"
          tag: "v$semver"
          draft: false
          regex: "/^Release: #{semver}$/i"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Given the CHANGELOG below,

```markdown
# Changelog
All notable changes to this project will be documented in this file.

## v1.2.1
### Changed
 - Fixed a typo in the README
 - Bugfix for #24

## v1.2.0
...
```

The description for Release `v1.2.1` will be

```markdown
### Changed
 - Fixed a typo in the README
 - Bugfix for #24
```

### Patterns and Replacements

Patterns are valid RegEx strings, and can be as simple as `/^release: v(.*)$/i` or as complex as a pattern matching
only valid [SemVer][semver] verions. In fact, that is what this Action does by default. You can use capturing groups as 
replacements in certain [inputs], e.g. `v$1` for the `tag` [input][inputs], and you can even use named capturing groups to make replacements even more convenient.

Lastly, you can include `#{semver}` in your regex pattern, and Auto-Release will automatically
insert its [SemVer pattern][semver-regex] in its place.

The default pattern used for the `regex` [input][inputs] is `(?<=^|[^a-zA-Z0-9.+-])#{semver}(?=[^a-zA-Z0-9.+-]|$)`.

Below is the full [SemVer pattern][semver-regex] replacing `#{semver}`.

```regexp
(?<version>(?<prefix>v?)(?<semver>(?<major>0|[1-9]\d*)\.(?<minor>0|[1-9]\d*)\.(?<patch>0|[1-9]\d*)(?:-(?<prerelease>(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+(?<build>[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?))
```

The [Pre-release pattern][pre-release-regex] is a simplified version of the [SemVer pattern][semver-regex] that makes the 
pre-release identifier required. It doesn't care about the prefix, doesn't have named capturing groups, and does not
include build-meta. This is because it is only used after the commit message has already matched the
[SemVer pattern][semver-regex]. It is recommended you do not change the `prerelease-regex` [input][inputs] unless your
pattern does not adhere to [SemVer][semver], or does not use the version string to mark the Release as a pre-release.

Below is the [Pre-release pattern][pre-release-regex] for reference.

```regexp
(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:\d*[a-zA-Z-][0-9a-zA-Z-]*|[1-9]\d*|0)(?:\.(?:\d*[a-zA-Z-][0-9a-zA-Z-]*|[1-9]\d*|0))*))
```

## License

This project is open-sourced software licensed under the [MIT License](LICENSE).


[github]: https://github.com "GitHub"
[actions]: https://docs.github.com/en/actions "GitHub Actions Documentation"
[semver]: https://semver.org "Semantic Versioning"
[semver-regex]: https://regex101.com/r/PtMYpd/1 "SemVer RegEx Pattern"
[pre-release-regex]: https://regex101.com/r/nZdGtQ/1 "Pre-release RegEx Pattern"
[inputs]: #inputs "Inputs"
[patterns]: #patterns-and-replacements "Patterns"
