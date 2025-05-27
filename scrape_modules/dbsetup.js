const mongoose = require('mongoose');
const { Schema } = mongoose;




async function connectDB() {
    await mongoose.connect('mongodb+srv://naveedsiddiqui5589:Pakistan1947_@democluster.tl7t706.mongodb.net/jomashop?retryWrites=true&w=majority&appName=democluster');
    
    console.log("Connection Successful");
}

async function closeDB() {
    await mongoose.connection.close();
    console.log("Connection closed");
}




// Sub-schemas
const shippingAvailabilitySchema = new mongoose.Schema({
    message: { type: String, default: null },
    color: { type: String, default: null }
  }, { _id: false });
  
  
  const descriptionSchema = new mongoose.Schema({
    short: { type: String, default: null },
    complete: { type: String, default: null }
  }, { _id: false });
  
  const priceSchema = new mongoose.Schema({
    value: { type: Number, default: null },
    currency: { type: String, default: null }
  }, { _id: false });
  
  const pricingSchema = new mongoose.Schema({
    regularPrice: { type: priceSchema, default: null },
    finalPrice: { type: priceSchema, default: null },
    retailPrice: { type: priceSchema, default: null }
  }, { _id: false });
  
  const metaDataSchema = new mongoose.Schema({
    metaTitle: { type: String, default: null },
    metaKeywords: { type: [String], default: null },
    metaDescription: { type: String, default: null }
  }, { _id: false });
  
  // Main Product Schema
  const productSchema = new mongoose.Schema({
    id: { type: Number, index: true, default: null },
    product_type: { type: String, default: null },
    name: { type: String, default: null },
    brandName: { type: String, default: null },
    urlKey: { type: String, unique: true, default: null },
    stockStatus: { type: String, default: null },
    shippingQuestionMarkNote: { type: String, default: null },
    shippingAvailability: { type: shippingAvailabilitySchema, default: null },
    productImages: { type: [String], default: null },
    description: { type: descriptionSchema, default: null },
    genderLabel: { type: String, default: null },
    department: { type: String, default: null },
    pricing: { type: pricingSchema, default: null },
    metaData: { type: metaDataSchema, default: null }
  }, { timestamps: true });
  
  // Model
  const Product = mongoose.model('Product', productSchema);
  
  module.exports = {connectDB, Product, closeDB};