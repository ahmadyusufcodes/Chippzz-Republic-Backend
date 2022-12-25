const User = require("../models/User")
const Admin = require("../models/Admin")
const Category = require("../models/Category")
const jwt = require("jsonwebtoken")
const Product = require("../models/Product")
const Order = require("../models/Order")
const Discount = require("../models/Discount")

module.exports.register = async (req, res) => {
    if(req.body == {}) return res.json({msg: "Please include required info as JSON"})
    const {username, email, firstName, lastName, password} = req.body
    const userExists = await User.findOne({$or: [{username}, {email}]})
    if(userExists) return res.status(409).json({msg: "User already exists with same Email or Username"})
    const passwordRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})")
    if(!password.match(passwordRegex)) return res.json({msg: "Password must be at least 8 char. include at least one uppercase, lowercase and a special char."})
    const newUser = new User({
        username,
        password,
        firstName,
        lastName,
        email
    })
    const doneCreate = await newUser.save()
    return res.json(doneCreate)
},

module.exports.login = async (req, res) => {
    if(req.body == {}) return res.json({msg: "Please include required info as JSON"})
    const {username, password} = req.body
    const adminExists = await User.findOne({username})
    if(!adminExists) return res.status(404).json({msg: "Staff not found!"})
    const comparePasswords = await adminExists.comparePassword(password)
    if(!comparePasswords) return res.status(401).json({msg: "Incorrect Password"})
    const token = jwt.sign({
        ...adminExists._doc
      }, process.env.JWT_SECRET, { expiresIn: 600000 });
      console.log(token)
      return res.json({...adminExists._doc, token})
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
        const getAllProducts = await Product.find().sort({name: 1})
        if(!getAllProducts) return res.status(404).json([])
        const result = getAllProducts.reduce((h, obj) => Object.assign(h, { [obj.category]:( h[obj.category] || [] ).concat(obj) }), {})
        return res.json(result)
    } catch (error) {
        return res.status(500).json({error: "Internal server error"})
    }
}


module.exports.get_all_discounts = async(req, res) => {
    try {
        const allDiscounts = await Discount.find({})
        return res.json(allDiscounts)
    } catch (error) {
        return res.status(500).json({error: "Internal server error"})
    }
}

module.exports.get_staff = async(req, res) => {
    try {
        if(!req.body._id) return res.status(404).json("Unknown")
        const getStaff = await User.findOne({_id: req.body._id})
        return res.json(getStaff)
    } catch (error) {
        return res.status(500).json({error: "Internal server error"})
    }
}

module.exports.get_all_products = async(req, res) => {
    try {
        const allProduct = await Product.find().sort({name: 1})
        return res.json({products: allProduct})
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
        const allOrders = await Order.find({$or: [{orderType: "Shipment"}, {orderType: "Instant-Order"}]}).sort({receiptNo: -1}).limit(10).skip(10 * nextPage)
        return res.json({orders: allOrders, pagesCount: Math.floor(await Order.countDocuments() / 10), nextPage: nextPage || 1, prevPage: nextPage > 0 ? nextPage - 1 : 0 })
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

module.exports.create_order = async(req, res) => {
    if(!req.body) return res.json({msg: "Please include required info as JSON"})
    const D = new Date().toLocaleString('en-US', {
        timeZone: 'Africa/Lagos'
        })
    const today = new Date(D)
    const {customer, items, orderType, createdBy, shipmentFee, reservationDate, discount, isReserved} = req.body
    if(!items || !orderType || !createdBy) return res.status(400).json({error: "Please include necessary info"})
    const getCount = await Order.countDocuments()
    const customerId = await customer  || ("Customer#" + (getCount + 1))
    try {
        const newOrder = new Order({customer: customerId, discount, createdAt: today.toISOString(), items, shipmentFee, orderType, isReserved, reservationDate, createdBy, receiptNo: getCount + 1})
        const savedOrder = await newOrder.save()
        return res.json(savedOrder)
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
    const {_id, staff} = req.body
    if(!_id || !staff) return res.status(400).json({error: "Please include necessary info"})
    try {
        const modOrder = await Order.findOneAndUpdate({_id}, {reservationFulfilled: true, createdBy: staff})
        const savedOrder = await modOrder.save()
        return res.status(201).json(savedOrder)
    } catch (error) {
        return res.status(500).json({error: "Internal server error"})
    }
}

