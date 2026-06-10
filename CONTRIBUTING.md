# Contributing
This project is open to accept feature requests and contributions from the open source community.
Please fork the repo and start a new branch to work on.

## Adding a new organization
Append the organization to `site/organizations.json` following the existing format:
```json
{
  "id": <next id>,
  "name": "Organization display name",
  "url": "https://github.com/<owner>",
  "owner": "<owner>"
}
```

## Running locally
Requires Node.js 24+. Set a GitHub token to avoid rate-limiting:
```bash
export GH_TOKEN='your_github_token'
node scripts/fetch-data.js
```
Then open `site/index.html` in a browser.

## Pull Request Review
If you have a branch on your fork that is ready to be merged, please create a new pull request. The maintainers will review to make sure the above guidelines have been followed and if the changes are helpful to all library users, they will be merged.
