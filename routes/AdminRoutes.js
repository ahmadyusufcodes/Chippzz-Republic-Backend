const AdminControllers = require("../controllers/AdminControllers")
const {authenticateJWT} = require("../utils/AdminAuthMiddleware")
const router = require("express").Router()

router.post("/register", AdminControllers.register)
router.post("/login", AdminControllers.login)
router.post("/category/create", authenticateJWT, AdminControllers.create_category)
router.post("/product/create", authenticateJWT, AdminControllers.create_product)
router.get("/product/getall", authenticateJWT, AdminControllers.get_all_products)
router.get("/product/getall/bycat", authenticateJWT, AdminControllers.get_all_product_by_category)
router.post("/product/search", authenticateJWT, AdminControllers.search_products)

router.post("/order/create", authenticateJWT, AdminControllers.create_order)
router.post("/order/edit", authenticateJWT, AdminControllers.edit_order)
router.post("/order/getall", authenticateJWT, AdminControllers.get_all_orders)
router.post("/order/revoke", authenticateJWT, AdminControllers.revoke_order)
router.post("/order/reservations", authenticateJWT, AdminControllers.get_all_reservations)
router.post("/order/reservation/fulfil", authenticateJWT, AdminControllers.fulfil_reservation)

router.post("/order/getspec", authenticateJWT, AdminControllers.get_specified)


router.post("/staff/create", AdminControllers.create_staff)
router.get("/staff", AdminControllers.get_all_staff)

module.exports = router