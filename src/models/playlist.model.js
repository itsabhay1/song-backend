import mongoose, { Schema } from "mongoose";

const playlistSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        thumbnail: {
            type: String,
            required: true
        },
        songs: [
            {
                type: String,
                required: true
            }
        ],
        owner: {
            name: mongoose.Types.ObjectId,
            ref: "User"
        }

    }
)

export const Playlist = mongoose.model("Playlist", playlistSchema)