






const { getSingleProductDetail } = require('./getSingleProductDetail');
const { getSingleCatProductList } = require('./getSingleCatProductList');
const { connectDB, Product, closeDB } = require('./dbsetup');
const { randomDelay, delay } = require('./delay'); // Agar delay ki zarurat ho

// Main Function
async function main() {
  try {
    await connectDB();

    const catID = 63;
    const startPage = 100;

    const productUrlsWPageInfo = await getSingleCatProductList(catID);
    
    for (let pagenocounter = startPage; pagenocounter <= productUrlsWPageInfo[1].total_pages; pagenocounter++) {
      console.log(`${productUrlsWPageInfo[0].length} Product Found on Page No ${pagenocounter} out of ${productUrlsWPageInfo[1].total_pages}`);
      
      if (!productUrlsWPageInfo[0].length) {
        console.log('No Product Found in this Department...!');
        return;
      }

      const catProductList = await getSingleCatProductList(catID, pagenocounter);
      console.log(catProductList);

      for (const urlKey of catProductList[0]) {
        try {
          const productData = await getSingleProductDetail(urlKey);

          const newProduct = new Product(productData);
          await newProduct.save();
          console.log(`Saved: ${urlKey}`);

          // Optional: Request ko thoda delay den (e.g., 1-3 seconds)
          // await randomDelay(500, 2000); 

        } catch (err) {
          if (err.code === 11000 && err.keyPattern?.urlKey) {
            console.log(`Skipped: ${urlKey} (Already exists)`); // Custom message
          } else {
            console.error(`Error processing ${urlKey}:`, err.message);
          }
          // console.error(`Error processing ${urlKey}:`, err.message);

        }
      }

    }


  } catch (mainErr) {

    console.error('Main Error:', mainErr.message);
  } finally {
    // Step 4: Database connection close karein
    await closeDB();
  }
}

// Program start karein
main();