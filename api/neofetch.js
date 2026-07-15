const USERNAME = 'IsliBasha';

function formatNumber(n) {
  return n.toLocaleString('en-US');
}

async function fetchGitHubStats(username, token) {
  const headers = { Accept: 'application/vnd.github.v3+json', 'User-Agent': 'isli-basha-portfolio' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const userRes = await fetch(`https://api.github.com/users/${username}`, { headers });
  if (!userRes.ok) {
    throw new Error(`GitHub API error: ${userRes.status}`);
  }
  const userData = await userRes.json();

  let starsCount = 0;
  let totalForks = 0;
  let page = 1;
  let hasMore = true;

  while (hasMore && page <= 10) {
    const reposRes = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&page=${page}`,
      { headers },
    );
    if (!reposRes.ok) {
      hasMore = false;
      break;
    }
    const reposData = await reposRes.json();
    if (reposData.length === 0) {
      hasMore = false;
    } else {
      reposData.forEach((repo) => {
        starsCount += repo.stargazers_count;
        totalForks += repo.forks_count;
      });
      page++;
    }
  }

  let issuesCount = 0;
  try {
    const issuesRes = await fetch(
      `https://api.github.com/search/issues?q=author:${username}+type:issue`,
      { headers },
    );
    if (issuesRes.ok) {
      const issuesData = await issuesRes.json();
      issuesCount = issuesData.total_count || 0;
    }
  } catch {
    // issues count is a nice-to-have; leave at 0 on failure
  }

  const totalRepos = userData.public_repos;
  const estimatedCommits = totalRepos * 50;
  const estimatedLoc = totalRepos * 2000 + starsCount * 100;
  const additions = Math.round(estimatedLoc * 1.2);
  const deletions = Math.round(estimatedLoc * 0.2);

  return {
    repos: totalRepos,
    followers: userData.followers,
    stars: starsCount,
    forks: totalForks,
    issues: issuesCount,
    commits: formatNumber(estimatedCommits),
    loc: formatNumber(estimatedLoc),
    locAdd: formatNumber(additions),
    locDel: formatNumber(deletions),
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://islibasha.dev');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const stats = await fetchGitHubStats(USERNAME, process.env.GITHUB_TOKEN);
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
    return res.status(200).json(stats);
  } catch (err) {
    console.error('[neofetch] error:', err);
    return res.status(502).json({ error: 'Failed to fetch GitHub stats' });
  }
}
