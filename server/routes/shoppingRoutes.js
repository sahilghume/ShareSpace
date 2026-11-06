const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  addShoppingItem,
  getShoppingItems,
  updateShoppingItem,
  submitItemForVerification,
  approveShoppingItem,
  deleteShoppingItem,
} = require("../controllers/shoppingController");

router.use(authMiddleware);

router.post("/", addShoppingItem);
router.get("/group/:groupId", getShoppingItems);
router.patch("/:id/submit", submitItemForVerification);
router.patch("/:id/approve", approveShoppingItem);
router.put("/:id", updateShoppingItem);
router.delete("/:id", deleteShoppingItem);

module.exports = router;
