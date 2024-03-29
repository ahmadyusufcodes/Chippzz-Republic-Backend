const AdminControllers = require("../controllers/AdminControllers")
const {authenticateJWT} = require("../utils/AdminAuthMiddleware")
const router = require("express").Router()

// router.post("/register", AdminControllers.register)
router.post("/login", AdminControllers.login)
router.post("/category/create", authenticateJWT, AdminControllers.create_category)
router.post("/product/create", authenticateJWT, AdminControllers.create_product)
router.post("/product/edit", authenticateJWT, AdminControllers.edit_product)
router.post("/product/delete", authenticateJWT, AdminControllers.delete_product)
router.get("/product/getall", authenticateJWT, AdminControllers.get_all_products)
router.get("/product/getall/bycat", authenticateJWT, AdminControllers.get_all_product_by_category)
router.post("/product/search", authenticateJWT, AdminControllers.search_products)
router.post("/product/stock/fund", authenticateJWT, AdminControllers.fund_stock)

router.post("/order/create", authenticateJWT, AdminControllers.create_order)
router.post("/order/edit", authenticateJWT, AdminControllers.edit_order)
router.post("/order/getall", authenticateJWT, AdminControllers.get_all_orders)
router.post("/orders/getallorders", authenticateJWT, AdminControllers.get_all_orders)
router.post("/order/revoke", authenticateJWT, AdminControllers.revoke_order)
router.post("/order/reservations", authenticateJWT, AdminControllers.get_all_reservations)
router.post("/order/reservation/fulfil", authenticateJWT, AdminControllers.fulfil_reservation)
router.get("/profile/", authenticateJWT, AdminControllers.get_profile)
router.post("/profile/", authenticateJWT, AdminControllers.manage_profile)

router.post("/staff/create", authenticateJWT, AdminControllers.create_staff)
router.post("/staff/edit", authenticateJWT, AdminControllers.edit_staff)
router.post("/staff/delete", authenticateJWT, AdminControllers.delete_staff)
router.get("/staff", authenticateJWT, AdminControllers.get_all_staff)
router.post("/branch/create", authenticateJWT, AdminControllers.create_branch)

router.get("/summary/today", authenticateJWT, AdminControllers.get_summary_today)
router.post("/summary/bydate", authenticateJWT, AdminControllers.get_summary_date_to_date)

router.get("/discount/all", authenticateJWT, AdminControllers.get_all_discounts)
router.put("/discount", authenticateJWT, AdminControllers.edit_discount)
router.post("/discount", authenticateJWT, AdminControllers.create_discount)
router.post("/discount/delete", authenticateJWT, AdminControllers.delete_discount)

module.exports = router