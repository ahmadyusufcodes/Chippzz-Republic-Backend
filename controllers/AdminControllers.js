const Admin = require("../models/Admin")
const User = require("../models/User")
const Category = require("../models/Category")
const jwt = require("jsonwebtoken")
const Product = require("../models/Product")
const Branch = require("../models/Branch")
const Order = require("../models/Order")
const Profile = require("../models/Profile")
const Discount = require("../models/Discount")

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

module.exports.create_branch = async(req, res) => {
    if(!req.body) return res.json({msg: "Please include required info as JSON"})
    const {name, address, phone, email, phone1, owner} = req.body
    const branchExists = await Branch.findOne({name})
    if(branchExists) return res.status(409).json({msg: "Branch already exists with same name"})
    try {
        const newBranch = new Branch({
            name,
            address,
            phone,
            phone1,
            owner,
            email
        })
        const doneCreate = await newBranch.save()
        return res.json(doneCreate)
    } catch (error) {
        return res.status(500).json({error: "Internal server error"})
    }
}

// create a module to get branch information
module.exports.get_branch_info = async(req, res) => {
    if(!req.body) return res.json({msg: "Please include required info as JSON"})
    const {name} = req.body
    const branchExists = await Branch.findOne({name})
    if(!branchExists) return res.status(409).json({msg: "Branch does not exist"})
    return res.json(branchExists)
}

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

module.exports.delete_staff = async(req, res) => {
    if(!req.body) return res.json({msg: "Please include required info as JSON"})
    const {_id, role} = req.body
    try {
        if(role === "Staff") {
            const checkExist = await User.findOneAndDelete({_id})
            if(!checkExist) return res.status(409).json({error: "User Not Found"})
            return res.json(checkExist)
        }
        if(role === "Admin") {
            const checkExist = await Admin.findOneAndDelete({_id})
            if(!checkExist) return res.status(409).json({error: "User Not Found"})
            return res.json(checkExist)
        }
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
        const getAllProducts = await Product.find().sort({category: 1, name: 1})
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
        const allProduct = await Product.find().sort({name: 1})
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
        const allOrders = await Order.find({$or: [{orderType: "Shipment"}, {orderType: "Instant-Order"}]}).sort("-receiptNo").limit(10).skip(10 * nextPage)
        return res.json({orders: allOrders, nextPage: nextPage || 1})
    } catch (error) {
        return res.status(500).json({error: "Internal server error"})
    }
}

const group_by = (items, key) => items.reduce(
    (result, item) => ({
      ...result,
      [item[key]]: [
        ...(result[item[key]] || []),
        item,
      ],
    }), 
    {},
  );

module.exports.get_summary_date_to_date = async(req, res) => {
    const {startDate, endDate} = req.body

    const fromDate = new Date(startDate).toLocaleString('en-US', {timeZone: 'Africa/Lagos'})
    const toDate = new Date(endDate).toLocaleString('en-US', {timeZone: 'Africa/Lagos'})

    
    const fromDateDate = new Date(fromDate)
    const toDateDate = new Date(toDate)

    fromDateDate.setHours(0,0,0,0)
    toDateDate.setHours(23,59,59,999)

    const fromDateISO = fromDateDate.toISOString()
    const toDateISO = toDateDate.toISOString()
    

    const getAllOrders = await Order.find({createdAt: {$gt: fromDateISO, $lt: toDateISO}, $or: [{orderType: "Instant-Order"}, {orderType: "Shipment"}], revoked: false})
    const getAllReservations = await Order.find({orderType: "Reservation", reservationFulfilled: true, reservationFulfilledOn: {$gt: fromDateISO, $lt: toDateISO}})
    const allStaff = await User.aggregate([{$project: {_id: 1, username: 1, firstName: 1, lastName: 1}}])

    const groupedOrders = group_by(getAllOrders, 'createdBy')
    const groupedReservations = group_by(getAllReservations, 'createdBy')
    
    const groupedOrdersArray = Object.keys(groupedOrders).map(key => {
        const host = allStaff.find(staff => staff._id.toString() === key) || {firstName: "Unknown", lastName: "Unknown", username: "Unknown"}
        const items = groupedOrders[key].map(order => order.items.map(item => ({name: item.item.name, qtySold: item.qty, price: item.item.price - (item.item.price * ((item.item.discount / 100) || 0)), totalSale: item.qty * (item.item.price - (item.item.price * ((item.item.discount / 100) || 0)))})))
        return {host: host, items: items.flat()}
    })
    const groupedReservationsArray = Object.keys(groupedReservations).map(key => {
        const host = allStaff.find(staff => staff._id.toString() === key) || {firstName: "Unknown", lastName: "Unknown", username: "Unknown"}
        const items = groupedReservations[key].map(order => order.items.map(item => ({name: item.item.name, qtySold: item.qty, price: item.item.price - (item.item.price * ((item.item.discount / 100) || 0)), totalSale: item.qty * (item.item.price - (item.item.price * ((item.item.discount / 100) || 0)))})))
        return {host: host, items: items.flat()}
    }) 
    const groupedOrdersArrayWithDuplicates = groupedOrdersArray.map(host => {
        const items = host.items.reduce((acc, item) => {
            const existingItem = acc.find(i => i.name === item.name)
            if (existingItem) {
                existingItem.qtySold += item.qtySold
                existingItem.totalSale += item.totalSale
            } else {
                acc.push(item)
            }
            return acc
        }, [])
        return {host: host.host, items: items, totalSale: items.reduce((acc, item) => acc + item.totalSale, 0)}
    })
    const groupedReservationsArrayWithDuplicates = groupedReservationsArray.map(host => {
        const items = host.items.reduce((acc, item) => {
            const existingItem = acc.find(i => i.name === item.name)
            if (existingItem) {
                existingItem.qtySold += item.qtySold
                existingItem.totalSale += item.totalSale
            } else {
                acc.push(item)
            }
            return acc
        }, [])
        return {host: host.host, items: items, totalSale: items.reduce((acc, item) => acc + item.totalSale, 0)}
    })
    return res.json({orders: groupedOrdersArrayWithDuplicates, reservations: groupedReservationsArrayWithDuplicates})
}

module.exports.get_summary_today = async(req, res) => {
    const D = new Date().toLocaleString('en-US', {timeZone: 'Africa/Lagos'})
    const today = new Date(D)
    today.setHours(0, 0, 0, 0)
    const todayISO = today.toISOString()

    const allStaff = await User.aggregate([{$project: {_id: 1, username: 1, firstName: 1, lastName: 1}}])
    const getAllOrders = await Order.find({createdAt: {$gt: todayISO}, $or: [{orderType: "Instant-Order"}, {orderType: "Shipment"}],  revoked: false})
    const getAllReservations = await Order.find({orderType: "Reservation", reservationFulfilled: true, reservationFulfilledOn: {$gt: todayISO}})
    
    const groupedOrders = group_by(getAllOrders, 'createdBy')
    const groupedReservations = group_by(getAllReservations, 'createdBy')
    const groupedOrdersArray = Object.keys(groupedOrders).map(key => {
        const host = allStaff.find(staff => staff._id.toString() === key) || {firstName: "Unknown", lastName: "Unknown", username: "Unknown"}
        const items = groupedOrders[key].map(order => order.items.map(item => ({name: item.item.name, qtySold: item.qty, price: item.item.price - (item.item.price * ((item.item.discount / 100) || 0)), totalSale: item.qty * (item.item.price - (item.item.price * ((item.item.discount / 100) || 0)))})))
        return {host: host, items: items.flat()}
    })
    const groupedReservationsArray = Object.keys(groupedReservations).map(key => {
        const host = allStaff.find(staff => staff._id.toString() === key) || {firstName: "Unknown", lastName: "Unknown", username: "Unknown"}
        const items = groupedReservations[key].map(order => order.items.map(item => ({name: item.item.name, qtySold: item.qty, price: item.item.price - (item.item.price * ((item.item.discount / 100) || 0)), totalSale: item.qty * (item.item.price - (item.item.price * ((item.item.discount / 100) || 0)))})))
        return {host: host, items: items.flat()}
    }) 
    const groupedOrdersArrayWithDuplicates = groupedOrdersArray.map(host => {
        const items = host.items.reduce((acc, item) => {
            const existingItem = acc.find(i => i.name === item.name)
            if (existingItem) {
                existingItem.qtySold += item.qtySold
                existingItem.totalSale += item.totalSale
            } else {
                acc.push(item)
            }
            return acc
        }, [])
        return {host: host.host, items: items, totalSale: items.reduce((acc, item) => acc + item.totalSale, 0)}
    })
    const groupedReservationsArrayWithDuplicates = groupedReservationsArray.map(host => {
        const items = host.items.reduce((acc, item) => {
            const existingItem = acc.find(i => i.name === item.name)
            if (existingItem) {
                existingItem.qtySold += item.qtySold
                existingItem.totalSale += item.totalSale
            } else {
                acc.push(item)
            }
            return acc
        }, [])
        return {host: host.host, items: items, totalSale: items.reduce((acc, item) => acc + item.totalSale, 0)}
    })
    return res.json({orders: groupedOrdersArrayWithDuplicates, reservations: groupedReservationsArrayWithDuplicates})
}

module.exports.create_discount = async(req, res) => {
    if(!req.body) return res.json({msg: "Please include required info as JSON"})
    const {title, percentage} = req.body
    if(!title || !percentage) return res.status(400).json({error: "Please include necessary info"})
    try {
        const newDiscount = new Discount({title, percentage})
        await newDiscount.save()
        return res.json(await Discount.find({}))
    } catch (error) {
        return res.status(500).json({error: "Internal server error"})
    }
}

module.exports.delete_discount = async(req, res) => {
    const {_id} = req.body
    if(!_id) return res.status(400).json({error: "Please include necessary info"})
    try {
        await Discount.findByIdAndDelete({_id})
        return res.json(await Discount.find({}))
    } catch (error) {
        return res.status(500).json({error: "Internal server error"})
    }
}

module.exports.edit_discount = async(req, res) => {
    const {discountId, title, percentage} = req.body
    if(!discountId || !title || !percentage) return res.status(400).json({error: "Please include necessary info"})
    try {
        const editedDiscount = await Discount.findByIdAndUpdate(discountId, {title, percentage})
        return res.json(editedDiscount)
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

module.exports.create_order = async(req, res) => {
    if(!req.body) return res.json({msg: "Please include required info as JSON"})
    const {customer, items, total} = req.body
    if(!items || !customer || !total) return res.status(400).json({error: "Please include necessary info"})
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
    if(!_id || !username || !firstName || !lastName) return res.status(400).json({error: "Please include necessary info"})
    try {
        await User.findOneAndUpdate({_id}, {username, firstName, lastName})
        const modStaff = await User.findOne({_id})
        if(password) modStaff.password = await User.hashPassword(password)
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