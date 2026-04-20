import mongoose, { Document, Schema } from 'mongoose';

export interface IMoodHistory {
  value: number;
  date: Date;
}

export interface IDashboard extends Document {
  userId: mongoose.Types.ObjectId;
  moodScore: number;
  totalActivities: number;
  therapySessions: number;
  moodHistory: IMoodHistory[];
  lastUpdated: Date;
}

const DashboardSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  moodScore: { type: Number, default: 50 },
  totalActivities: { type: Number, default: 0 },
  therapySessions: { type: Number, default: 0 },
  moodHistory: [{
    value: { type: Number, required: true },
    date: { type: Date, default: Date.now }
  }],
  lastUpdated: { type: Date, default: Date.now }
});

export default mongoose.model<IDashboard>('Dashboard', DashboardSchema);
