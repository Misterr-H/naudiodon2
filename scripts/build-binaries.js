#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Supported platforms and architectures
const platforms = [
  { platform: 'darwin', arch: 'x64' },
  { platform: 'darwin', arch: 'arm64' },
  { platform: 'linux', arch: 'x64' },
  { platform: 'linux', arch: 'arm64' },
  { platform: 'linux', arch: 'arm' },
  { platform: 'win32', arch: 'x64' },
  { platform: 'win32', arch: 'ia32' }
];

// Node.js versions to build for
const nodeVersions = ['16.20.2'];

function runCommand(command, options = {}) {
  console.log(`Running: ${command}`);
  try {
    execSync(command, { stdio: 'inherit', ...options });
  } catch (error) {
    console.error(`Command failed: ${command}`);
    process.exit(1);
  }
}

function buildForPlatform(platform, arch, nodeVersion) {
  console.log(`\n=== Building for ${platform}-${arch} with Node.js ${nodeVersion} ===`);
  
  const env = {
    ...process.env,
    npm_config_target: nodeVersion,
    npm_config_arch: arch,
    npm_config_target_platform: platform,
    npm_config_disturl: 'https://nodejs.org/dist',
    npm_config_runtime: 'node',
    npm_config_build_from_source: 'false'
  };

  // Clean previous builds
  if (fs.existsSync('build')) {
    runCommand('rm -rf build', { env });
  }

  // Install dependencies
  runCommand('npm install', { env });

  // Build the binary
  runCommand('npm run build', { env });

  // Package the binary
  runCommand('npm run package', { env });
}

function main() {
  console.log('Building binaries for all platforms...');
  
  for (const { platform, arch } of platforms) {
    for (const nodeVersion of nodeVersions) {
      buildForPlatform(platform, arch, nodeVersion);
    }
  }
  
  console.log('\n=== Build completed! ===');
  console.log('Binaries are available in the build/ directory');
  console.log('Run "npm run publish-binary" to publish them');
}

if (require.main === module) {
  main();
}

module.exports = { buildForPlatform, platforms, nodeVersions }; 