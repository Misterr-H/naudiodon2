#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function install() {
  console.log('Installing naudiodon2...');
  
  // Check if node-pre-gyp is available
  const nodePreGypPath = path.join(__dirname, '..', 'node_modules', '@mapbox', 'node-pre-gyp', 'bin', 'node-pre-gyp');
  const nodePreGypCmdPath = path.join(__dirname, '..', 'node_modules', '@mapbox', 'node-pre-gyp', 'bin', 'node-pre-gyp.cmd');
  
  if (fs.existsSync(nodePreGypPath) || fs.existsSync(nodePreGypCmdPath)) {
    console.log('node-pre-gyp found, attempting to install binary...');
    try {
      // Use the appropriate path for the platform
      const executablePath = fs.existsSync(nodePreGypPath) ? nodePreGypPath : nodePreGypCmdPath;
      execSync(`node "${executablePath}" install --fallback-to-build`, { 
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });
      console.log('✅ Installation completed successfully');
    } catch (error) {
      console.log('❌ node-pre-gyp install failed, falling back to node-gyp...');
      try {
        execSync('node-gyp rebuild', { 
          stdio: 'inherit',
          cwd: path.join(__dirname, '..')
        });
        console.log('✅ Installation completed with node-gyp');
      } catch (gypError) {
        console.error('❌ Both node-pre-gyp and node-gyp failed');
        process.exit(1);
      }
    }
  } else {
    console.log('node-pre-gyp not found, using node-gyp...');
    try {
      execSync('node-gyp rebuild', { 
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });
      console.log('✅ Installation completed with node-gyp');
    } catch (error) {
      console.error('❌ node-gyp failed');
      process.exit(1);
    }
  }
}

if (require.main === module) {
  install();
}

module.exports = { install }; 