# NebulaKit website

This repository contains the public browser files for the NebulaKit website. The Python application and API backend remain in the private server project.

## GitHub Pages

The Pages workflow deploys this repository after GitHub Pages is set to use **GitHub Actions** in the repository settings. The project-site URL is `https://mondetools.github.io/`.

## Backend requirement

GitHub Pages serves static files and does not run the Python API. This site sends API requests to `https://nebulakit-code.onrender.com`; the backend must be running for profile and server lookups, Discord sign-in, account history, and support tickets. Browser-only utilities work without the backend. Do not add `.env`, `monde.sqlite3`, or server credentials to this repository.
