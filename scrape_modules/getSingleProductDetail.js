const axios = require('axios');
const querystring = require('querystring');
// const { connectDB, Product, closeDB } = require('./dbsetup');

async function getSingleProductDetail(product_uri) {
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

    const product = {
        urlKey: product_uri,
        hash: "99e48d307bcd7c2d640eeda705ccdf6cd1086de1bf091df7e759a417ea45ae04" 
    };


    const variables = { urlKey: product.urlKey, onServer: true };
    const extensions = { persistedQuery: { version: 1, sha256Hash: product.hash } };
    const url = `https://www.jomashop.com/graphql?${querystring.stringify({
        operationName: "productDetail",
        variables: JSON.stringify(variables),
        extensions: JSON.stringify(extensions)
    })}`;

    const selectedUA = userAgents[Math.floor(Math.random() * userAgents.length)];
    const headers = {
        'accept': '*/*',
        'content-type': 'application/json',
        'cookie': '',
        'referer': `https://www.jomashop.com/${product.urlKey}.html`,
        'sec-ch-ua': selectedUA.secChUa,
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': selectedUA.platform,
        'user-agent': selectedUA.agent,
        'x-client-version': 'bb875a8281230f8b27c0'
    };





    const response = await axios.get(url, { headers });
    const rawProduct = response.data.data.productDetail.items[0];
    const productDetails = {
        id: rawProduct.id,
        product_type: rawProduct.__typename,
        name: rawProduct.name,
        brandName: rawProduct.brand_name,
        urlKey: rawProduct.url_key,
        stockStatus: rawProduct.stock_status,
        shippingQuestionMarkNote: rawProduct.shipping_question_mark_note,
        shippingAvailability: {
            message: rawProduct.shipping_availability_message.message,
            color: rawProduct.shipping_availability_message.color
        },
        productImages: rawProduct.media_gallery.map(img => img.url_nocache),
        description: {
            short: rawProduct.short_description.html,
            complete: rawProduct.description.html
        },
        genderLabel: rawProduct.moredetails.gender_label,
        department: rawProduct.moredetails.more_details_text.department,
        pricing: {
            regularPrice: {
                value: rawProduct.price_range.minimum_price.regular_price.value,
                currency: rawProduct.price_range.minimum_price.regular_price.currency
            },
            finalPrice: {
                value: rawProduct.price_range.minimum_price.final_price.value,
                currency: rawProduct.price_range.minimum_price.final_price.currency
            },
            retailPrice: {
                value: rawProduct.price_range.minimum_price.msrp_price.value,
                currency: rawProduct.price_range.minimum_price.msrp_price.currency
            }
        },
        metaData: {
            metaTitle: rawProduct.meta_title,
            metaKeywords: rawProduct.meta_keyword,
            metaDescription: rawProduct.meta_description,

        }


    };
    // console.log(productDetails);
    return productDetails;


}

module.exports = { getSingleProductDetail };


// getSingleProductDetail("tresorra-14k-yellow-gold-elephant-pendant-necklace-67469");
// getSingleProductDetail("pre-owned-cartier-love-bracelet-white-gold-144212");
getSingleProductDetail("montblanc-john-f-kennedy-special-edition-ballpoint-pen");









// axios.get(url, { headers })
//     .then(response => {
//         console.log('Respnose', response.data.data.productDetail.items);
//     })
//     .catch(error => {
//         console.error('Error from Axios Request', error.message);
//     });