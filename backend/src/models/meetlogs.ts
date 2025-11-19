import mongoose from 'mongoose';

const { Schema } = mongoose;
const objectId = mongoose.Types.ObjectId;

const meetStatuses = ['met', 'notmet', 'meetagain'];

const meetlogSchema = new Schema(
  {
    clientId: { type: objectId, ref: 'clients', required: true },
    fieldPersonId: { type: objectId, ref: 'users', required: true },
    meetStatus: { type: String, enum: meetStatuses, required: true },
    distanceTravelled: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

meetlogSchema.index({ fieldPersonId: 1, timestamp: -1 });
meetlogSchema.index({ clientId: 1 });

export const meetlogModel = mongoose.model('meetlogs', meetlogSchema);