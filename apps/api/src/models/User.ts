import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name?: string;
  avatar?: string;
  preferences: {
    genres: number[];
    languages: string[];
    mood?: string;
  };
  watchlist: Array<{
    movieId: number;
    title: string;
    poster: string;
    rating: number;
    addedAt: Date;
  }>;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String },
  avatar: { type: String },
  preferences: {
    genres: [{ type: Number }],
    languages: [{ type: String }],
    mood: { type: String }
  },
  watchlist: [
    {
      movieId: { type: Number, required: true },
      title: { type: String },
      poster: { type: String },
      rating: { type: Number },
      addedAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', UserSchema);
