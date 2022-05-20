const Admin = require("../models/Admin")
const User = require("../models/User")
const Category = require("../models/Category")
const jwt = require("jsonwebtoken")
const Product = require("../models/Product")
const Order = require("../models/Order")
const { get } = require("express/lib/response")
const {groupBy, mapValues, omit} = require("lodash")

module.exports.register = async (req, res) => {
    if(req.body == {}) return res.json({msg: "Please include required info as JSON"})
    const {username, email, firstName, lastName, password} = req.body
    const userExists = await Admin.findOne({$or: [{username}, {email}]})
    if(userExists) return res.status(409).json({msg: "User already exists with same Email or Username"})
    const passwordRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})")
    if(!password.match(passwordRegex)) return res.json({msg: "Password must be at least 8 char. include at least one uppercase, lowercase and a special char."})
    const newUser = new Admin({
        username,
        password,
        firstName,
        lastName,
        email
    })
    const doneCreate = await newUser.save()
    return res.json(doneCreate)
},

module.exports.create_staff = async (req, res) => {
    if(req.body == {}) return res.json({msg: "Please include required info as JSON"})
    const {username, phone, firstName, lastName, password} = req.body
    const userExists = await User.findOne({username})
    if(userExists) return res.status(409).json({msg: "User already exists with same Email or Username"})
    // const passwordRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})")
    if(!password.length > 6) return res.json({msg: "Password must be at least 8 char. include at least one uppercase, lowercase and a special char."})
    const newUser = new User({
        username,
        password,
        firstName,
        lastName,
        phone
    })
    const doneCreate = await newUser.save()
    return res.json(doneCreate)
},

module.exports.login = async (req, res) => {
    if(req.body == {}) return res.json({msg: "Please include required info as JSON"})
    const {username, email, password} = req.body
    const adminExists = await Admin.findOne({username})
    if(!adminExists) return res.status(404).json({msg: "Admin not found!"})
    const comparePasswords = await adminExists.comparePassword(password)
    if(!comparePasswords) return res.status(401).json({msg: "Incorrect Password"})
    const token = jwt.sign({
        ...adminExists._doc
      }, process.env.JWT_SECRET, { expiresIn: 600000 });
    //   console.log(token)
      return res.json({...adminExists._doc, token})
}

module.exports.test = async(req, res) => {
    res.json('search_product')
}

module.exports.create_category = async(req, res) => {
    if(!req.body) return res.json({msg: "Please include required info as JSON"})
    const {name} = req.body
    const checkExist = await Category.findOne({name})
    if(checkExist) return res.status(409).json({error: "A category exists with same name"})
    try {
        const newCategory = new Category({name})
        const savedCategory = await newCategory.save()
        return res.json(savedCategory)
    } catch (error) {
        return res.status(500).json({error: "Internal server error"})
    }
}

module.exports.create_product = async(req, res) => {
    if(!req.body) return res.json({msg: "Please include required info as JSON"})
    const {name, category, price, stock} = req.body
    const checkExist = await Product.findOne({name, category})
    if(checkExist) return res.status(409).json({error: "A product exists with same name and category"})
    if(!await Category.findOne({name: category})) return res.status(404).json({error: "Category not found"})
    if(!name || !category || !price) return res.status(400).json({error: "Please include necessary info"})
    try {
        const newProduct = new Product({name, price, category, stock})
        const savedProduct = await newProduct.save()
        return res.json(savedProduct)
    } catch (error) {
        return res.status(500).json({error: "Internal server error"})
    }
}

module.exports.get_product_by_category = async(req, res) => {
    if(!req.body) return res.json({msg: "Please include required info as JSON"})
    const {name} = req.body
    const checkExist = await Category.findOne({name})
    if(checkExist) return res.status(409).json({error: "A category exists with same name"})
    try {
        const newCategory = new Category({name})
        const savedCategory = await newCategory.save()
        return res.json(savedCategory)
    } catch (error) {
        return res.status(500).json({error: "Internal server error"})
    }
}

module.exports.get_all_product_by_category = async(req, res) => {
    try {
        const getAllProducts = await Product.find()
        if(!getAllProducts) return res.status(404).json([])
        return res.json(getAllProducts.reduce(function (r, a) {
            r[a.category] = r[a.category] || [];
            r[a.category].push(a);
            return r;
        }, Object.create(null)))
    } catch (error) {
        return res.status(500).json({error: "Internal server error"})
    }
}

module.exports.get_all_products = async(req, res) => {
    try {
        const allProduct = await Product.find()
        return res.json({products: allProduct})
    } catch (error) {
        return res.status(500).json({error: "Internal server error"})
    }
}

module.exports.get_all_staff = async(req, res) => {
    try {
        const allProduct = await User.find()
        return res.json({staffs: allProduct})
    } catch (error) {
        return res.status(500).json({error: "Internal server error"})
    }
}

module.exports.search_products = async(req, res) => {
    const {keyword} = req.body
    try {
        const searchProduct = await Product.find({name: new RegExp('.*' + keyword + '.*')})
        return res.json(searchProduct)
    } catch (error) {
        return res.status(500)
    }
}

module.exports.get_all_orders = async(req, res) => {
    const {nextPage} = req.body
    try {
        const allProduct = await Order.find().limit(10).skip(10 * nextPage)
        return res.json({orders: allProduct, nextPage: nextPage || 1})
    } catch (error) {
        return res.status(500).json({error: "Internal server error"})
    }
}

module.exports.get_specified = async(req, res) => {
    const {toDate, fromDate} = req.body
    // Get for spec date
    try {
        if(!fromDate) return res.status(400).json({"msg": "Request must contain `fromDate` path"})
        if(!toDate && fromDate){
            const allProduct = await Order.find({createdAt: {$gte: fromDate, $lt: new Date()}})
            return res.json(allProduct)
        }
        if(toDate && fromDate){
            const allProduct = await Order.find({createdAt: {$gte: fromDate, $lt: toDate}})
            return res.json(allProduct)
        }
    } catch (error) {
        return res.status(500).json({error: "Internal server error"})
    }
    // if(toDate && fromDate){
    //     const allProduct = await Order.find({createdAt:{$gte: toDate, $lt: fromDate}})
    //     return res.json(allProduct)
    // }
    
    try {
        // const allProduct = await Order.find()
        return res.json({orders: "allProduct"})
    } catch (error) {
        return res.status(500).json({error: "Internal server error"})
    }
}

module.exports.create_order = async(req, res) => {
    if(!req.body) return res.json({msg: "Please include required info as JSON"})
    const {customer, items, total, paid} = req.body
    if(!items || !customer || !total || !paid) return res.status(400).json({error: "Please include necessary info"})
    try {
        await items.forEach(async(item) => {
            await Product.findOneAndUpdate({_id: item.item._id}, {$inc: {stock: - item.qty}})
        })
        const newOrder = new Order({customer, items, total, paid})
        const savedOrder = await newOrder.save()
        return res.json(savedOrder)
    } catch (error) {
        return res.status(500).json({error: "Internal server error"})
    }
}


module.exports.get_all_reservations = async(req, res) => {
    const {nextPage} = req.body
    try {
        const allProduct = await Order.find({orderType: "Reservation"}).sort("-receiptNo").skip(10 * nextPage).limit(10)
        return res.json({orders: allProduct, pagesCount: Math.floor(await Order.countDocuments() / 10), nextPage: nextPage || 1, prevPage: nextPage > 0 ? nextPage - 1 : 0 })
    } catch (error) {
        return res.status(500).json({error: "Internal server error"})
    }
}


module.exports.edit_order = async(req, res) => {
    if(!req.body) return res.json({msg: "Please include required info as JSON"})
    const {_id, customer, items, total, paid} = req.body
    if(!_id || !items || !customer || !total || !paid) return res.status(400).json({error: "Please include necessary info"})
    try {
        const modOrder = await Order.findOneAndUpdate({_id}, {customer, items, total, paid})
        const savedOrder = await modOrder.save()
        return res.status(201).json(savedOrder)
    } catch (error) {
        return res.status(500).json({error: "Internal server error"})
    }
}

module.exports.revoke_order = async(req, res) => {
    if(!req.body) return res.json({msg: "Please include required info as JSON"})
    const {_id} = req.body
    if(!_id) return res.status(400).json({error: "Please include necessary info"})
    try {
        const modOrder = await Order.findOneAndUpdate({_id}, {revoked: true})
        const savedOrder = await modOrder.save()
        return res.status(201).json(savedOrder)
    } catch (error) {
        return res.status(500).json({error: "Internal server error"})
    }
}

module.exports.fulfil_reservation = async(req, res) => {
    if(!req.body) return res.json({msg: "Please include required info as JSON"})
    const {_id} = req.body
    if(!_id) return res.status(400).json({error: "Please include necessary info"})
    try {
        const modOrder = await Order.findOneAndUpdate({_id}, {reservationFulfilled: true})
        const savedOrder = await modOrder.save()
        return res.status(201).json(savedOrder)
    } catch (error) {
        return res.status(500).json({error: "Internal server error"})
    }
}