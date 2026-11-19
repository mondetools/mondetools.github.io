# NebulaKit website

This repository contains the public browser files for the NebulaKit website. The Python application and API backend remain in the private server project.

## GitHub Pages

The Pages workflow deploys this repository after GitHub Pages is set to use **GitHub Actions** in the repository settings. The project-site URL is `https://mondetools.github.io/`.

## Backend requirement

GitHub Pages serves static files and does not run the Python API. The page's profile and server lookups, Discord sign-in, account history, and support tickets need the private Python backend on the same site origin (typically through a reverse proxy). Browser-only utilities work without that backend. Do not add `.env`, `monde.sqlite3`, or server credentials to this repository.