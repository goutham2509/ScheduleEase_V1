import express from "express";
import {
  getSlots,
  createSlot,
  updateSlot,
  deleteSlot,
  getVirtualAvailableSlots
} from "../controllers/slotController.js";
import Slot from "../models/Slot.js";

const router = express.Router();

router.get("/debug/:date", async (req, res) => {
  try {
    const { date } = req.params;
    const slots = await Slot.find({ date });
    console.log("DEBUG SLOTS:", slots);
    res.json(slots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

router.route("/")
  .get(getSlots)
  .post(createSlot);

router.route("/:id")
  .put(updateSlot)
  .delete(deleteSlot);

router.get("/available", getVirtualAvailableSlots);


export default router;
