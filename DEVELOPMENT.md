# Development Guide

This guide explains how to build and publish binaries for naudiodon2 using `node-pre-gyp`.

## Prerequisites

- Node.js 16+ installed
- Git access to the repository
- GitHub access for publishing releases

## Building Binaries Locally

### Single Platform Build

To build for your current platform:

```bash
npm install
npm run build
npm run package
```

### Multi-Platform Build

Use the build script to create binaries for all supported platforms:

```bash
node scripts/build-binaries.js
```

This will build binaries for:
- macOS (x64, arm64)
- Linux (x64, arm64, arm)
- Windows (x64, ia32)
- Node.js versions 16, 18, 20

## Publishing Binaries

### Manual Publishing

1. Build the binaries for all platforms
2. Run the publish command:

```bash
npm run publish-binary
```

### Automated Publishing via GitHub Actions

The easiest way to publish binaries is through GitHub Actions:

1. Create a new release on GitHub
2. Tag it with a version (e.g., `v2.4.2`)
3. The GitHub Action will automatically:
   - Build binaries for all platforms
   - Upload them to the GitHub release
   - Update the `node-pre-gyp` configuration

## Binary Configuration

The binary configuration is in `package.json`:

```json
{
  "binary": {
    "module_name": "naudiodon",
    "module_path": "./build/Release/",
    "remote_path": "./{name}/v{version}/",
    "package_name": "{node_abi}-{platform}-{arch}.tar.gz",
    "host": "https://github.com/Streampunk/naudiodon/releases/download/"
  }
}
```

### Configuration Variables

- `{name}`: Package name from package.json
- `{version}`: Version from package.json
- `{node_abi}`: Node.js ABI version
- `{platform}`: Platform (darwin, linux, win32)
- `{arch}`: Architecture (x64, arm64, arm, ia32)

## Troubleshooting

### Build Failures

If builds fail, check:
1. All dependencies are installed
2. PortAudio binaries are in the correct location
3. Platform-specific build tools are available

### Publishing Issues

If publishing fails:
1. Ensure you have GitHub token with appropriate permissions
2. Check that the release exists on GitHub
3. Verify the binary files are in the correct location

### Testing Binaries

To test a binary before publishing:

```bash
# Install the package with the local binary
npm install --build-from-source=false
```

## Release Process

1. Update version in `package.json`
2. Commit changes
3. Create a GitHub release with the same version tag
4. GitHub Actions will automatically build and publish binaries
5. Test the installation on different platforms
6. Update npm package if needed

## Cross-Platform Building

For cross-platform builds, you can use Docker or CI/CD:

```bash
# Example Docker command for Linux builds
docker run --rm -v $(pwd):/app -w /app node:18 npm run build
```

## Binary Hosting

Binaries are hosted on GitHub Releases. The URL structure is:
`https://github.com/Streampunk/naudiodon/releases/download/v{version}/naudiodon2-v{version}-{node_abi}-{platform}-{arch}.tar.gz` 