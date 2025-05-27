const axios = require('axios');
const querystring = require('querystring');

// رینڈم یوزر ایجنٹس
const userAgents = [
  {
    agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
    platform: '"Windows"',
    secChUa: '"Not A(Brand";v="8", "Chromium";v="132", "Google Chrome";v="132"'
  },
  {
    agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
    platform: '"macOS"',
    secChUa: '"Not A(Brand";v="8", "Chromium";v="132", "Google Chrome";v="132"'
  }
];

async function fetchNavigationMenu(navigationMenuId = 2) {
  const variables = { id: navigationMenuId };
  const extensions = {
    persistedQuery: {
      version: 1,
      sha256Hash: "8520df318aa7bf8f89cc27b80f1ecee314ba7fccfeaccf4b5361b35dd34f3168"
    }
  };

  // URL بنائیں
  const queryParams = querystring.stringify({
    operationName: "navigationMenu",
    variables: JSON.stringify(variables),
    extensions: JSON.stringify(extensions)
  });
  const url = `https://www.jomashop.com/graphql?${queryParams}`;

  // رینڈم ہیڈرز
  const selectedUA = userAgents[Math.floor(Math.random() * userAgents.length)];
  const headers = {
    'accept': '*/*',
    'content-type': 'application/json',
    'referer': 'https://www.jomashop.com/watches.html', // ضرورت کے مطابق تبدیل کریں
    'sec-ch-ua': selectedUA.secChUa,
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': selectedUA.platform,
    'user-agent': selectedUA.agent,
    'x-client-version': 'bb875a8281230f8b27c0'
  };

  try {
    const response = await axios.get(url, { headers });
    return response.data.data;
  } catch (error) {
    throw new Error(`نیویگیشن مینو fetch کرنے میں ناکامی: ${error.message}`);
  }
}

fetchNavigationMenu(2)
  .then(data => {
    // console.log('Menu:', data.megamenu.children);

    data.megamenu.children.forEach(child => {
      console.log('Name:', child.name);
      console.log('ID:', child.id);
    });
  })
  .catch(error => console.error(error));

// ایکسپورٹ کریں
module.exports = { fetchNavigationMenu };