# Changelog

All notable changes to this project will be documented in this file.

## [1.0.1] - 2025-01-03

### Changed
- **BREAKING:** Removed `DISCORD_CLIENT_SECRET` requirement
  - Discord has removed Client Secret from the Developer Portal
  - Only `DISCORD_BOT_TOKEN` and `DISCORD_CLIENT_ID` are now required
  - Updated all documentation and examples to reflect this change
- Updated validation scripts to no longer require `DISCORD_CLIENT_SECRET`
- Updated configuration service to not use client secret
- Added deprecation notices in all relevant files

### Documentation
- Updated `env.example` to comment out `DISCORD_CLIENT_SECRET`
- Updated `README.md` with current Discord Developer Portal structure
- Updated `docs/SETUP.md` with detailed explanation of the change
- Updated Docker and Kubernetes configuration examples

## [1.0.0] - 2025-01-03

### Added
- Initial release of NoseCone Discord Bot
- Discord.js integration with slash commands
- n8n webhook integration
- Modular architecture with services, commands, events, and utilities
- Docker support with multi-stage builds
- Kubernetes deployment manifests
- Comprehensive documentation
- Input validation and error handling
- Logging system with file and console output
- Environment-based configuration management 