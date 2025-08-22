import mongoose, { Schema, Document } from "mongoose";

export interface IMeeting extends Document {
  meetingId: string;
  host: string;  
}

const MeetingSchema: Schema = new Schema({
  meetingId: { type: String, required: true, unique: true },
  host: { type: String, required: true }, 
});

export default mongoose.model<IMeeting>("Meeting", MeetingSchema);
