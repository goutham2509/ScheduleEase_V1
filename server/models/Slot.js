import mongoose from "mongoose";

const SlotSchema = new mongoose.Schema({
  date: String,
  timeStart: String,
  timeEnd: String,
  isBooked: { type: Boolean, default: false },
  duration: { type: Number, default: 60 },   // <-- added
}, { timestamps: true });

export default mongoose.model("Slot", SlotSchema);
