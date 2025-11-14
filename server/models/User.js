import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, unique: true, required: true },

    // google_id MUST NOT be required
    // MUST use sparse:true to allow multiple null values
    google_id: { type: String, unique: true, sparse: true },

    profileImage: { type: String },

    role: {
      type: String,
      enum: ["internal user", "external user", "admin"],
      default: "external user",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

export default mongoose.model("User", userSchema, "users");
