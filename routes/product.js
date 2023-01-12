const express = require('express');
const router = express.Router();
const upload = require('../utils/fileUpload');
const { isAuthenticated, isSeller, isBuyer } = require('../middlewares/auth');
const Product = require("../models/productModel");
const Order = require("../models/orderModels")
const { stripeKey } = require('../config/credentials');
const stripe = require('stripe')(stripeKey);
const { WebhookClient } = require("discord.js");

const webhook = new WebhookClient({
    url: "https://discord.com/api/webhooks/1063107286320566412/1s8SH7iGn3agXcvjMpkd98VfgHWawg2Ul9RU_0TxGli-Gdd9OIZ8emyGr-xHXtcpmVPb"
})

router.post("/create", isAuthenticated, isSeller, (req, res)=> {
  upload(req, res, async (err)=> {
    if(err){
        console.log("coming in err", err);
        return res.status(500).send(err)
    }
    const { name, price }= req.body;
    if(!name || !price || !req.file) {
        return res.status(400).json({
            err: "we require all 3"
        })
    }
    if(Number.isNaN(price)){
        return res.status(400).json({
            err: "price should be number"
        })
    }
    let productDetails = {
        name,
        price,
        content: req.file.path
    }
    const savedProduct = await Product.create(productDetails);
    return res.status(200). json({
        status: 'ok',
        productDetails: savedProduct
    })
  })
});

router.get("/get/all", isAuthenticated, async(_req, res)=> {
    try{
    const products = await Product.findAll();
    return res.status(200).json({
        products
    })
    } catch(e){
    res.status(500).json({ err: e });
    }
});

router.post('/buy/:productID', isAuthenticated, isBuyer, async (req, res)=> {
    try{
    const product = await Product.findOne({
        where: {id: req.params.productID }
    })?.dataValues
    if(!product){
        return res.status(404).json({ err: "No product found" })
    }
    const orderDetails = {
        productID,
        buyerId: req.user.id

    }
    let paymentMethod = await stripe.paymentMethods.create({
        type: "card",
        card: {
            number: "555555555555",
            exp_month: 9,
            exp_year: 2023,
            cvc: "314"
        },
    });
    let paymentIntent = await stripe.paymentIntent.create({
        amount: product.price,
        currency: "inr",
        payment_method_types: ["card"],
        payment_method: paymentMethod.id,
        confirm: true
    });
    if(paymentIntent){
        const createOrder = await Order.create(orderDetails);
        webhook.send({
            content: ' i am sending it from day 10 for order id: ${createOrder.id}',
            username: "order-keeper",
            avatarURL: "https://thumbs2.imgbox.com/d2/78/s7XF3bBu_t.png"
        })
        return res.status(200).json({
            createOrder
        });
    } else {
        return res.status(400).json({
            err: "payment failed"
        })
    }
    }catch(e){
        return res.status(500).json({ err: e});
    }
})

module.exports = router;