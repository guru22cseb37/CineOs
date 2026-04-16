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
  watchHistory: Array<{
    movieId: number;
    watchedAt: Date;
    rating?: number;
  }>;
  journal: Array<{
    movieId: number;
    movieTitle: string;
    entry: string;
    vibe: string;
    createdAt: Date;
  }>;
  friends: mongoose.Types.ObjectId[];
  friendRequests: mongoose.Types.ObjectId[];
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
  ],
  watchHistory: [
    {
      movieId: { type: Number, required: true },
      watchedAt: { type: Date, default: Date.now },
      rating: { type: Number }
    }
  ],
  journal: [
    {
      movieId: { type: Number, required: true },
      movieTitle: { type: String, required: true },
      entry: { type: String, required: true },
      vibe: { type: String },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  friendRequests: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', UserSchema);
