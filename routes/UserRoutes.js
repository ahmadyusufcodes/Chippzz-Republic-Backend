const router = require("express").Router()
const User = require("../models/User")
const {authenticateJWT} = require("../utils/AuthMiddleware")
const UserControllers = require("../controllers/UserControllers")


router.post("/login", UserControllers.login)
router.get("/product/getall", authenticateJWT, UserControllers.get_all_products)
router.get("/product/getall/bycat", authenticateJWT, UserControllers.get_all_product_by_category)
router.post("/product/search", authenticateJWT, UserControllers.search_products)

router.post("/order/create", authenticateJWT, UserControllers.create_order)
router.post("/order/edit", authenticateJWT, UserControllers.edit_order)
router.post("/order/getall", authenticateJWT, UserControllers.get_all_orders)
router.post("/order/reservations", authenticateJWT, UserControllers.get_all_reservations)
router.post("/order/revoke", authenticateJWT, UserControllers.revoke_order)
router.post("/order/reservation/fulfil", authenticateJWT, UserControllers.fulfil_reservation)

router.post("/getstaffname", authenticateJWT, UserControllers.get_staff)

router.get("/discount/all", authenticateJWT, UserControllers.get_all_discounts)

module.exports = router