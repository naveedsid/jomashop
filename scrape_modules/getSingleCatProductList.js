




const axios = require('axios');
const querystring = require('querystring');
// const { connectDB, Product, closeDB } = require('./dbsetup');







async function getSingleCatProductList(categoryId, currentPage = 1, categoryName="",  pageSize = 60) {
    const singleCatProductListWPageInfo = [];
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

    const variables = {
        currentPage: parseInt(currentPage),
        id: categoryId.toString(),
        onServer: true,
        pageSize: parseInt(pageSize),
        filter: {
            category_id: { 
                eq: categoryId.toString() 
            }
        },
        sort: {}
    };

    const extensions = {
        persistedQuery: {
            version: 1,
            sha256Hash: "39eb08ac6e70e0c9a72474f735320396645bf9b77352cb1041a639d00e80e6bf"
        }
    };

    const queryParams = querystring.stringify({
        operationName: "category",
        variables: JSON.stringify(variables),
        extensions: JSON.stringify(extensions)
    });
    const url = `https://www.jomashop.com/graphql?${queryParams}`;

    const selectedUA = userAgents[Math.floor(Math.random() * userAgents.length)];
    const headers = {
        'accept': '*/*',
        'content-type': 'application/json',
        'cookie': '', 
        'referer': ``,//`https://www.jomashop.com/${categoryName}.html`,
        'sec-ch-ua': selectedUA.secChUa,
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': selectedUA.platform,
        'user-agent': selectedUA.agent,
        'x-client-version': 'bb875a8281230f8b27c0'
    };

    try {
        const response = await axios.get(url, { headers });
        // console.log(response.data.data.products.items[0]);
        const items = response.data.data.products?.items || [];
        const urlKeysArray = items.map(product => product.url_key);
        singleCatProductListWPageInfo.push(urlKeysArray);
        singleCatProductListWPageInfo.push(response.data.data.products.page_info);
        // console.log(singleCatProductListWPageInfo);
        return singleCatProductListWPageInfo;

    } catch (error) {
        throw new Error(`Category request failed: ${error.message}`);
    }
}

module.exports = { getSingleCatProductList};

// getSingleCatProductList(17045,3);