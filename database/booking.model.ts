import { Document, model, models, Schema, Types } from "mongoose";
import Event from "./event.model";

export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Verify that the referenced event exists before saving
BookingSchema.pre("save", async function (next) {
  try {
    const eventExists = await Event.exists({ _id: this.eventId });
    
    if (!eventExists) {
      return next(new Error("Referenced event does not exist"));
    }
    
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Create index on eventId for faster queries
BookingSchema.index({ eventId: 1 });

const Booking = models.Booking || model<IBooking>("Booking", BookingSchema);

export default Booking;
