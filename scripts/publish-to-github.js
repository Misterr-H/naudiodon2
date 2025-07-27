#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Octokit } = require('@octokit/rest');

async function publishToGitHub() {
  const token = process.env.NODE_PRE_GYP_GITHUB_TOKEN || process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('NODE_PRE_GYP_GITHUB_TOKEN or GITHUB_TOKEN environment variable not found');
  }

  const octokit = new Octokit({
    auth: token
  });

  // Read package.json to get version and repository info
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const version = packageJson.version;
  const [owner, repo] = packageJson.repository.url.match(/github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?$/).slice(1);

  console.log(`Publishing binaries for ${owner}/${repo} version ${version}`);

  // Find the release
  let release;
  try {
    console.log(`Looking for releases in ${owner}/${repo}...`);
    const releases = await octokit.repos.listReleases({
      owner,
      repo
    });
    console.log(`Found ${releases.data.length} releases:`);
    releases.data.forEach(r => console.log(`  - ${r.tag_name} (${r.name})`));
    
    release = releases.data.find(r => r.tag_name === `v${version}`);
  } catch (error) {
    console.error('Error finding release:', error.message);
    if (error.status === 404) {
      console.error(`Repository ${owner}/${repo} not found or not accessible`);
    }
    throw error;
  }

  if (!release) {
    console.error(`Release v${version} not found. Available releases:`);
    const releases = await octokit.repos.listReleases({ owner, repo });
    releases.data.forEach(r => console.log(`  - ${r.tag_name} (${r.name})`));
    throw new Error(`Release v${version} not found. Please create a release first.`);
  }

  console.log(`Found release: ${release.name} (${release.id})`);

  // Find all binary files in the staging directory
  const stagingDir = path.join('build', 'stage', 'naudiodon2', version);
  if (!fs.existsSync(stagingDir)) {
    throw new Error(`Staging directory not found: ${stagingDir}`);
  }

  const files = fs.readdirSync(stagingDir).filter(file => file.endsWith('.tar.gz'));
  console.log(`Found ${files.length} binary files to upload`);

  // Upload each file
  for (const file of files) {
    const filePath = path.join(stagingDir, file);
    const fileContent = fs.readFileSync(filePath);
    
    console.log(`Uploading ${file}...`);
    
    try {
      await octokit.repos.uploadReleaseAsset({
        owner,
        repo,
        release_id: release.id,
        name: file,
        data: fileContent,
        headers: {
          'content-type': 'application/gzip'
        }
      });
      console.log(`✅ Successfully uploaded ${file}`);
    } catch (error) {
      console.error(`❌ Failed to upload ${file}:`, error.message);
      throw error;
    }
  }

  console.log('🎉 All binaries published successfully!');
}

if (require.main === module) {
  publishToGitHub().catch(error => {
    console.error('Error publishing binaries:', error.message);
    process.exit(1);
  });
}

module.exports = { publishToGitHub }; 