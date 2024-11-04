import mongoose, {Schema} from "mongoose";

const songSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        thumbnail: {
            type: String,
            required: true
        },
        track: {
            type: String,
            required: true
        },
        artist: {
            name: String,
            required: true
        }

    },
    {
        timestamps: true
    }
)

export const Song = mongoose.model("Song", songSchema)