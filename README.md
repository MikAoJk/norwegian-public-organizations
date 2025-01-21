# norwegian-public-organizations

## Technologies used
* Bun
* TypeScript
* Next.js
* Tailwind

## Getting Started
### Prerequisites
Make sure you have bun installed
See [bun Installation](https://bun.sh/docs/installation) on how to install it locally
You can check which bun version you have installed
```bash
bun --version
```

Install deps:
```bash
bun run build
```

Environment variable:
Need to set an environment variable
GH_TOKEN to your GitHub token
```bash
.bashrc example:
``` shell bash
export GH_TOKEN='supersecretkey'
```

First, run the development server:
```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployed to GitHub pages
The application is live at: https://mikaojk.github.io/norwegian-public-organizations

## Organization is missing!!
Follow the guide in the: [CONTRIBUTING.md](CONTRIBUTING.md)
and append the organization in this file:  src/components/data/organizations.json
