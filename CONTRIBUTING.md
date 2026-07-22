# Contributing to Meridian

Meridian is a local-first DICOM research and education tool. Never commit patient
data, credentials, or identifying screenshots. Changes must preserve the
research-only disclaimer and offline/privacy contract unless the project owner
has explicitly approved a product-level change.

## Changelog entries are mandatory

Every pull request and every direct change must update
[`CHANGELOG.md`](CHANGELOG.md). Add the entry under **Unreleased** in the same
change set; the repository's pull-request check rejects branches that omit it.

- Describe the user, operator, or contributor impact rather than restating a
  filename or commit subject.
- Use `Added`, `Changed`, `Fixed`, `Removed`, `Security`, or `Maintenance`.
- Keep entries concise and present tense.
- Record documentation, dependency, workflow, and internal maintenance changes
  too. Use `Maintenance` when there is no user-facing behavior change.
- Do not edit a dated historical section except to correct a factual error.
- During a release, move Unreleased entries into a versioned section with an ISO
  date, then restore an empty Unreleased section.

## Validation

For volume-renderer or application-shell changes, run:

```bash
npm run test:browser
```

The browser regression requires Node.js 22 or newer, Python 3, and a
`google-chrome` executable; it does not install npm packages.

Also open a representative de-identified study when the change touches decoding,
geometry, measurements, persistence, or rendering. Never add private test data to
the repository.
