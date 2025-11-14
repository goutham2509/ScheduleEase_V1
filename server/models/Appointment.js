import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  slot: { type: mongoose.Schema.Types.ObjectId, ref: "Slot", required: true },
  
  title: { type: String, required: true },
  description: { type: String, required: true },

  role_name: { 
    type: String, 
    enum: ["internal user", "external user", "admin"], 
    required: true 
  },

  status: { 
    type: String, 
    enum: ["pending", "approved", "rejected", "cancelled"], 
    default: "pending" 
  },

  is_deleted: { type: Boolean, default: false },

}, { timestamps: true });

export default mongoose.model("Appointment", appointmentSchema);
