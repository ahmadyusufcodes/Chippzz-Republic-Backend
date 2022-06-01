const Admin = require("../models/Admin")
const User = require("../models/User")
const Category = require("../models/Category")
const jwt = require("jsonwebtoken")
const Product = require("../models/Product")
const Order = require("../models/Order")
const { get } = require("express/lib/response")
const {groupBy, mapValues, omit, isDate} = require("lodash")
const Profile = require("../models/Profile")

module.exports.register = async (req, res) => {
    if(req.body == {}) return res.json({msg: "Please include required info as JSON"})
    const {username, firstName, lastName, password} = req.body
    const userExists = await Admin.findOne({username})
    if(userExists) return res.status(409).json({msg: "User already exists with same Email or Username"})
    const passwordRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})")
    if(!password.match(passwordRegex)) return res.json({msg: "Password must be at least 8 char. include at least one uppercase, lowercase and a special char."})
    const newUser = new Admin({
        username,
        password,
        firstName,
        lastName,
    })
    const doneCreate = await newUser.save()
    return res.json(doneCreate)
},

module.exports.create_staff = async (req, res) => {
    if(req.body == {}) return res.json({msg: "Please include required info as JSON"})
    const {username, firstName, lastName, password, role} = req.body
    if(role === "Staff") {
        const staffExists = await User.findOne({username})
        if(staffExists) return res.status(409).json({msg: "User already exists with same Email or Username"})
    }
    if(role === "Admin") {
        const adminExists = await Admin.findOne({username})
        if(adminExists) return res.status(409).json({msg: "User already exists with same Email or Username"})
    }

    if(!password.length > 6) return res.json({msg: "Password must be at least 8 char. include at least one uppercase, lowercase and a special char."})
    if(role === "Staff"){
        const newUser = new User({
            username,
            password,
            firstName,
            lastName
        })
        const doneCreate = await newUser.save()
        return res.json(doneCreate)
    }
    if(role === "Admin"){
        const newUser = new Admin({
            username,
            password,
            firstName,
            lastName
        })
        const doneCreate = await newUser.save()
        return res.json(doneCreate)
    }
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
    if(!name || !category || !price) return res.status(400).json({error: "Please include necessary info"})
    try {
        const newProduct = new Product({name, price, category, stock})
        const savedProduct = await newProduct.save()
        return res.json(savedProduct)
    } catch (error) {
        return res.status(500).json({error: "Internal server error"})
    }
}

module.exports.delete_product = async(req, res) => {
    if(!req.body) return res.json({msg: "Please include required info as JSON"})
    const {_id} = req.body
    try {
        const checkExist = await Product.findOneAndDelete({_id})
        if(!checkExist) return res.status(409).json({error: "Product Not Found"})
        return res.json(checkExist)
    } catch (error) {
        return res.status(500).json({error: "Internal server error"})
    }
}

module.exports.manage_profile = async(req, res) => {
    if(!req.body) return res.json({msg: "Please include required info as JSON"})
    const {name, receiptText, address, phoneNumber1, phoneNumber2} = req.body
    try {
        const checkExist = await Profile.findOneAndUpdate({}, {name, receiptText, address, phoneNumber1, phoneNumber2})
        if(!checkExist){
            const newProfile = new Profile({name, receiptText, address, phoneNumber1, phoneNumber2})
            const savedProfile = await newProfile.save()
            return res.json(savedProfile)
        }
        return res.json(checkExist)
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

module.exports.get_profile = async(req, res) => {
    try {
        const checkProfile = await Profile.findOne()
        return res.json(checkProfile)
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
        const allStaff = await User.find()
        const allAdmin = await Admin.find()
        return res.json({staffs: allStaff, admins: allAdmin})
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
        const allProduct = await Order.find({$or: [{orderType: "Shipment"}, {orderType: "Instant-Order"}]}).sort("-receiptNo").limit(10).skip(10 * nextPage)
        return res.json({orders: allProduct, nextPage: nextPage || 1})
    } catch (error) {
        return res.status(500).json({error: "Internal server error"})
    }
}

module.exports.get_report_today = async(req, res) => {
    const D = new Date().toLocaleString('en-US', {
        timeZone: 'Africa/Lagos'
        })
        
    const today = new Date(D)
    today.setHours(1)
    today.setMinutes(0)
    today.setSeconds(0)
    
    try {
        const getOrders = await Order.find({createdAt: {$gt: today.toISOString()}, $or: [{orderType: "Instant-Order"}, {orderType: "Shipment"}]})
        const getReservations = await Order.find({orderType: "Reservation", reservationFulfilled: true, reservationFulfilledOn: {$gt: today.toISOString()}})
        const getAllOrders = getOrders.map(order => {
            return order.items.map(item => {
                return {
                    ...item.item,
                    qty: item.qty,
                    price: item.item.price
                }
            })
        }).flat()

        const getAllReservations = getReservations.map(order => {
            return order.items.map(item => {
                return {
                    ...item.item,
                    qty: item.qty,
                    price: item.item.price
                }
            })
        }).flat()

        const getItAll = await getAllOrders.reduce((r, a) => {
            r[a.name] = [...r[a.name] || [], a];
            return r;
           }, {})

        const getItAllReservations = await getAllReservations.reduce((r, a) => {
            r[a.name] = [...r[a.name] || [], a];
            return r;
           }, {})

        //    const containAll = [..., ...getOrders]

           let ordersFinal = []
           let reservationsFinal = []

           Object.keys(getItAll).forEach(product => {
              ordersFinal.push({
                  name: product,
                  price: getItAll[product][0].price,
                  totalSale: getItAll[product][0].price * (getItAll[product].map(item => item.qty).reduce((prev, curr) => prev + curr, 0)),
                  qty: getItAll[product].map(item => item.qty).reduce((prev, curr) => prev + curr, 0)
              })
           })
           
           Object.keys(getItAllReservations).forEach(product => {
              reservationsFinal.push({
                  name: product,
                  price: getItAllReservations[product][0].price,
                  totalSale: getItAllReservations[product][0].price * (getItAllReservations[product].map(item => item.qty).reduce((prev, curr) => prev + curr, 0)),
                  qty: getItAllReservations[product].map(item => item.qty).reduce((prev, curr) => prev + curr, 0)
              })
           })


        return res.json({
        orders: {
            sales: getOrders,
            total: (ordersFinal.map(item => item.totalSale).reduce((prev, curr) => prev + curr, 0))
        }})
    } catch (error) {
        return res.json({msg: "Server Error"})
    }
}

module.exports.get_summary_today = async(req, res) => {
    const D = new Date().toLocaleString('en-US', {
        timeZone: 'Africa/Lagos'
        })
        
    const today = new Date(D)
    today.setHours(0)
    today.setMinutes(0)
    today.setSeconds(0)
    
    try {
        const getOrders = await Order.find({createdAt: {$gt: today.toISOString()}, $or: [{orderType: "Instant-Order"}, {orderType: "Shipment"}]})
        const getReservations = await Order.find({orderType: "Reservation", reservationFulfilled: true, reservationFulfilledOn: {$gt: today.toISOString()}})
        const getAllOrders = getOrders.map(order => {
            return order.items.map(item => {
                return {
                    ...item.item,
                    qty: item.qty,
                    price: item.item.price
                }
            })
        }).flat()

        const getAllReservations = getReservations.map(order => {
            return order.items.map(item => {
                return {
                    ...item.item,
                    qty: item.qty,
                    price: item.item.price
                }
            })
        }).flat()

        const getItAll = await getAllOrders.reduce((r, a) => {
            r[a.name] = [...r[a.name] || [], a];
            return r;
           }, {})

        const getItAllReservations = await getAllReservations.reduce((r, a) => {
            r[a.name] = [...r[a.name] || [], a];
            return r;
           }, {})

        //    const containAll = [..., ...getOrders]

           let ordersFinal = []
           let reservationsFinal = []

           Object.keys(getItAll).forEach(product => {
              ordersFinal.push({
                  name: product,
                  price: getItAll[product][0].price,
                  totalSale: getItAll[product][0].price * (getItAll[product].map(item => item.qty).reduce((prev, curr) => prev + curr, 0)),
                  qty: getItAll[product].map(item => item.qty).reduce((prev, curr) => prev + curr, 0)
              })
           })
           
           Object.keys(getItAllReservations).forEach(product => {
              reservationsFinal.push({
                  name: product,
                  price: getItAllReservations[product][0].price,
                  totalSale: getItAllReservations[product][0].price * (getItAllReservations[product].map(item => item.qty).reduce((prev, curr) => prev + curr, 0)),
                  qty: getItAllReservations[product].map(item => item.qty).reduce((prev, curr) => prev + curr, 0)
              })
           })


        return res.json({
            reservations: {
            sales: reservationsFinal,
            total: (reservationsFinal.map(item => item.totalSale).reduce((prev, curr) => prev + curr, 0))
        }, 
        orders: {
            sales: ordersFinal,
            total: (ordersFinal.map(item => item.totalSale).reduce((prev, curr) => prev + curr, 0))
        }})
    } catch (error) {
        return res.json({msg: "Server Error"})
    }
}

module.exports.get_summary_date_to_date = async(req, res) => {
    const {startDate, endDate} = req.body    
    const fromDate = new Date(startDate).toLocaleString('en-US', {
        timeZone: 'Africa/Lagos'
        })
        
    const toDate = new Date(endDate).toLocaleString('en-US', {
        timeZone: 'Africa/Lagos'
        })

    const start = new Date(fromDate)
    const end = new Date(toDate)

    start.setHours(0)
    start.setMinutes(0)
    start.setSeconds(0)
    end.setHours(0)
    end.setMinutes(0)
    end.setSeconds(0)

    start.setDate(start.getDate() - 1)
    end.setDate(end.getDate() + 1)
    
    
    try {
        const getOrders = await Order.find({createdAt: {$gt: start.toISOString(), $lt: end.toISOString()}, $or: [{orderType: "Instant-Order"}, {orderType: "Shipment"}]})
        const getReservations = await Order.find({orderType: "Reservation", reservationFulfilled: true, reservationFulfilledOn: {$gt: start.toISOString(), $lt: end.toISOString()}})
        const getAllOrders = getOrders.map(order => {
            return order.items.map(item => {
                return {
                    ...item.item,
                    qty: item.qty,
                    price: item.item.price
                }
            })
        }).flat()

        const getAllReservations = getReservations.map(order => {
            return order.items.map(item => {
                return {
                    ...item.item,
                    qty: item.qty,
                    price: item.item.price
                }
            })
        }).flat()

        const getItAll = await getAllOrders.reduce((r, a) => {
            r[a.name] = [...r[a.name] || [], a];
            return r;
           }, {})

        const getItAllReservations = await getAllReservations.reduce((r, a) => {
            r[a.name] = [...r[a.name] || [], a];
            return r;
           }, {})

        //    const containAll = [..., ...getOrders]

           let ordersFinal = []
           let reservationsFinal = []

           Object.keys(getItAll).forEach(product => {
              ordersFinal.push({
                  name: product,
                  price: getItAll[product][0].price,
                  totalSale: getItAll[product][0].price * (getItAll[product].map(item => item.qty).reduce((prev, curr) => prev + curr, 0)),
                  qty: getItAll[product].map(item => item.qty).reduce((prev, curr) => prev + curr, 0)
              })
           })
           
           Object.keys(getItAllReservations).forEach(product => {
              reservationsFinal.push({
                  name: product,
                  price: getItAllReservations[product][0].price,
                  totalSale: getItAllReservations[product][0].price * (getItAllReservations[product].map(item => item.qty).reduce((prev, curr) => prev + curr, 0)),
                  qty: getItAllReservations[product].map(item => item.qty).reduce((prev, curr) => prev + curr, 0)
              })
           })


        return res.json({
            reservations: {
            sales: reservationsFinal,
            total: (reservationsFinal.map(item => item.totalSale).reduce((prev, curr) => prev + curr, 0))
        }, 
        orders: {
            sales: ordersFinal,
            total: (ordersFinal.map(item => item.totalSale).reduce((prev, curr) => prev + curr, 0))
        }})
    } catch (error) {
        return res.json({msg: "Server Error"})
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

module.exports.edit_staff = async(req, res) => {
    if(!req.body) return res.json({msg: "Please include required info as JSON"})
    const {_id, username, firstName, lastName, password} = req.body
    if(!_id || !items || !customer || !total || !paid) return res.status(400).json({error: "Please include necessary info"})
    try {
        const modStaff = await User.findOneAndUpdate({_id}, {username, firstName, lastName, password})
        const savedStaff = await modStaff.save()
        return res.status(201).json(savedStaff)
    } catch (error) {
        return res.status(500).json({error: "Internal server error"})
    }
}

module.exports.fund_stock = async(req, res) => {
    if(!req.body) return res.json({msg: "Please include required info as JSON"})
    const {_id, amount} = req.body
    if(!_id || !amount) return res.status(400).json({error: "Please include necessary info"})
    try {
        const modProduct = await Product.findOneAndUpdate({_id}, {$inc: {stock: amount}})
        const savedProduct = await modProduct.save()
        return res.status(201).json(savedProduct)
    } catch (error) {
        return res.status(500).json({error: "Internal server error"})
    }
}

module.exports.edit_product = async(req, res) => {
    if(!req.body) return res.json({msg: "Please include required info as JSON"})
    const {_id, name, price, category} = req.body
    if(!_id || !name || !price || !category) return res.status(400).json({error: "Please include necessary info"})
    try {
        const modProduct = await Product.findOneAndUpdate({_id}, {name, price, category})
        const savedProduct = await modProduct.save()
        return res.status(201).json(savedProduct)
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