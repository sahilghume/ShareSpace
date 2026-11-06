const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  addShoppingItem,
  getShoppingItems,
  updateShoppingItem,
  updateItemStatus,
  deleteShoppingItem,
} = require("../controllers/shoppingController");

router.use(authMiddleware);

// Shopping routes
router.post("/", addShoppingItem);
router.get("/group/:groupId", getShoppingItems);
router.patch("/:id/status", updateItemStatus);
router.put("/:id", updateShoppingItem);
router.delete("/:id", deleteShoppingItem);

module.exports = router;
