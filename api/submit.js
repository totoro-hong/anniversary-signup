// Vercel Serverless Function — form submission handler
// Token is stored in Vercel env var GH_TOKEN (not exposed to client)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, cake, message } = req.body;

  if (!name || !phone || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const body = `## 💕 新报名

| 项目 | 内容 |
|------|------|
| **姓名** | ${name} |
| **电话** | ${phone} |
| **蛋糕** | ${cake || '未选择'} |
| **悄悄话** | ${message} |
| **时间** | ${new Date().toLocaleString('zh-CN')} |
`;

  try {
    const response = await fetch(
      'https://api.github.com/repos/totoro-hong/anniversary-signup/issues',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.GH_TOKEN}`,
          'Content-Type': 'application/json',
          Accept: 'application/vnd.github.v3+json',
        },
        body: JSON.stringify({
          title: `💕 ${name} 的报名`,
          body,
          labels: ['报名'],
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ error: 'GitHub API error', detail: err });
    }

    const issue = await response.json();
    return res.status(200).json({
      success: true,
      issue_url: issue.html_url,
      issue_number: issue.number,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
