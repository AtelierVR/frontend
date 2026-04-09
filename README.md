<div align="center">
  <img src="public/logo.png" width="320" alt="NoxVR" />
  <h1>Frontend</h1>
  <p>Web client for the NoxVR federated social VR platform.</p>

  ![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)
  ![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)
  ![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4-06b6d4?logo=tailwindcss&logoColor=white)
  ![Docker](https://img.shields.io/badge/Docker-ready-2496ed?logo=docker&logoColor=white)
  ![License](https://img.shields.io/badge/License-AGPL--3.0-22c55e)

  <p>Part of the <a href="https://github.com/AtelierVR"><strong>NoxVR</strong></a> ecosystem</p>
</div>

---

## Overview

**NoxVR Frontend** is the main web client for the NoxVR platform. It lets users browse worlds and avatars, manage their profile, follow other users, send messages, and configure their account. It communicates with the [NoxVR Node](https://github.com/AtelierVR/node) backend API.

## Features

- **Authentication** — login, register, session management with OTP confirmation
- **User profiles** — avatar, banner, bio (Markdown), tags, follow/unfollow, activity feed
- **Worlds** — browse, search, view details (description, versions, contributors, tags), edit
- **Avatars** — browse and manage avatars per platform
- **Messages** — direct messaging between users
- **Settings** — account, profile, security, appearance (dark/light mode)
- **i18n** — multi-language support via `i18next`
- **Federated** — supports users and content from remote NoxVR instances

## Documentation

- [Getting Started](docs/getting-started.md) — installation, Docker, environment
- [Structure & Scripts](docs/structure.md) — routes, components, commands

---

<div align="center">
  <p>Made with ♥ by <a href="https://github.com/AtelierVR">AtelierVR</a> &nbsp;·&nbsp; <a href="https://www.gnu.org/licenses/agpl-3.0">AGPL-3.0</a></p>
  <p>Part of the <strong>NoxVR</strong> project — a federated social VR platform</p>
</div>