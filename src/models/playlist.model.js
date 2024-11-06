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
                type: mongoose.Types.ObjectId,
                ref: "song"
            }
        ],
        owner: {
            name: mongoose.Types.ObjectId,
            ref: "user"
        }

    }
)

export const Playlist = mongoose.model("Playlist", playlistSchema)