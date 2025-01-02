const express = require("express");
const {protect, isSeller} = require("../middleware/authMiddleware");
const { getBiddinghistory, placeBid, sellProduct } = require("../controllers/biddingController");
const router = express.Router();

router.get("/:productId",getBiddinghistory);
router.post("/", protect, placeBid);
router.post("/sell",protect,isSeller,sellProduct);

module.exports= router;