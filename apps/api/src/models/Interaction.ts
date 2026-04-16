import mongoose, { Schema, Document } from 'mongoose';
import { InteractionType } from '@cineos/types';

export interface IInteraction extends Document {
  userId: mongoose.Types.ObjectId;
  movieId: number;
  type: InteractionType;
  timestamp: Date;
  sessionId?: string;
}

const InteractionSchema = new Schema<IInteraction>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  movieId: { type: Number, required: true },
  type: { type: String, enum: ['like', 'dislike', 'view', 'complete'], required: true },
  timestamp: { type: Date, default: Date.now },
  sessionId: { type: String }
});

// Index for fast lookup of a user's interactions for recommendations
InteractionSchema.index({ userId: 1, type: 1, movieId: 1 });

export const Interaction = mongoose.model<IInteraction>('Interaction', InteractionSchema);
