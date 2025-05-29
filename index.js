const express = require("express");
const mongoose = require('mongoose');





const { connectDB, Product, closeDB } = require('./scrape_modules/dbsetup');
const { getSingleProductDetail } = require('./scrape_modules/getSingleProductDetail');
const { getSingleCatProductList } = require('./scrape_modules/getSingleCatProductList');

const path = require("path");
const bodyParser = require('body-parser');

const app = express();


connectDB();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


let scrapingStatus = {
    done: false,
    message: "",
    currentPage: 0,
    totalPages: 0,
    savedCount: 0,
    duplication: 0
};



app.get("/dashboard", async (req, res) => {
    try {

        if (req.query.bpsmsg) {
            scrapingStatus = {
        done: false,
        message: "",
        currentPage: 0,
        totalPages: 0,
        savedCount: 0,
        duplication: 0
    };
        }

        const dbProductsCount = await Product.countDocuments({});
        const count = await Product.aggregate([
            {
                $group: {
                    _id: "$urlKey",
                    count: { $sum: 1 }
                }
            },
            {
                $match: {
                    count: { $gt: 1 }
                }
            },
            {
                $count: "duplicateCount"
            }
        ]);

        const data = {
            dbProductsCount: dbProductsCount,
            dbDuplicateProductCount: count[0]?.duplicateCount || 0,
            spurl: req.query.spurl || null,
            bpsmsg: req.query.bpsmsg || null,
            scrapingstatus: false
        };

        res.render("dashboard", { data });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send(error);
    }
});





app.get("/products", async (req, res) => {
    try {

        const from = parseInt(req.query.from) || 1;
        const to = parseInt(req.query.to) || 50;

        const totalProducts = await Product.countDocuments();

        const productsData = await Product.find().skip(from - 1).limit(to - from + 1)
        // console.log(productsData);

        res.render("products", {
            productsData,
            totalProducts: totalProducts,
            range: { from, to }
        });

        // const productsData = await Product.find({});
        // console.log(productsData[0]);
        // res.render("products", { productsData });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});



//----- Scrape Single Product ------
app.get("/scrape-single-product/:urlkey", async (req, res) => {
    try {

        // const dbProductsCount = await Product.countDocuments({});
        // const count = await Product.aggregate([
        //     {
        //         $group: {
        //             _id: "$urlKey",
        //             count: { $sum: 1 }
        //         }
        //     },
        //     {
        //         $match: {
        //             count: { $gt: 1 }
        //         }
        //     },
        //     {
        //         $count: "duplicateCount"
        //     }
        // ]);

        // const data = {
        //     dbProductsCount: dbProductsCount,
        //     dbDuplicateProductCount: count[0]?.duplicateCount || 0
        // };


        const scraped_single_product = await getSingleProductDetail(req.params.urlkey);

        const singleProduct = new Product(scraped_single_product);
        await singleProduct.save();
        res.redirect('/dashboard?spurl=' + encodeURIComponent(req.params.urlkey));

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});






//----- Scrape Whole Category Products ------
app.get("/scrape-category-products/:catid/:startpageno/:endpageno", async (req, res) => {
    try {

        const dbProductsCount = await Product.countDocuments({});
        const count = await Product.aggregate([
            {
                $group: {
                    _id: "$urlKey",
                    count: { $sum: 1 }
                }
            },
            {
                $match: {
                    count: { $gt: 1 }
                }
            },
            {
                $count: "duplicateCount"
            }
        ]);

        const data = {
            dbProductsCount: dbProductsCount,
            dbDuplicateProductCount: count[0]?.duplicateCount || 0,
            scrapingstatus: true
        };

        res.render("dashboard", { data });
        // return "";

        const catid = req.params.catid;
        const startpageno = req.params.startpageno;
        const endpageno = req.params.endpageno;

        const productUrlsWPageInfo = await getSingleCatProductList(catid);

        let productcounter = 0;
        let targetpageno;
        if (endpageno <= productUrlsWPageInfo[1].total_pages) {
            targetpageno = endpageno;
        } else {
            targetpageno = productUrlsWPageInfo[1].total_pages;
        }

        scrapingStatus.totalPages = targetpageno;

        for (let pagenocounter = startpageno; pagenocounter <= targetpageno; pagenocounter++) {
            console.log(`${productUrlsWPageInfo[0].length} Product Found on Page No ${pagenocounter} out of ${productUrlsWPageInfo[1].total_pages}`);
            scrapingStatus.currentPage = pagenocounter;

            if (!productUrlsWPageInfo[0].length) {
                console.log('No Product Found in this Department...!');
                return;
            }

            const catProductList = await getSingleCatProductList(catid, pagenocounter);
            console.log(catProductList);

            for (const urlKey of catProductList[0]) {
                try {
                    const productData = await getSingleProductDetail(urlKey);

                    const newProduct = new Product(productData);
                    await newProduct.save();
                    console.log(`Saved: ${urlKey}`);
                    productcounter++;
                    scrapingStatus.savedCount++;

                    // await randomDelay(500, 2000); 

                } catch (err) {
                    if (err.code === 11000 && err.keyPattern?.urlKey) {
                        scrapingStatus.duplication++;
                        console.log(`Skipped: ${urlKey} (Already exists)`);
                    } else {
                        console.error(`Error processing ${urlKey}:`, err.message);
                    }
                    // console.error(`Error processing ${urlKey}:`, err.message);

                }
            }

        }

        scrapingStatus.done = true;
        scrapingStatus.message = productcounter + " Products has saved to Database...!";
        // res.redirect('/dashboard?bpsmsg=' + encodeURIComponent(productcounter) + ' Products has been saved to Database..!');

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
    //     finally { await closeDB(); }
});


app.get("/scraping-status", (req, res) => {
    res.json(scrapingStatus);
});


module.exports = app;