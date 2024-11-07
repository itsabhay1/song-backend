import { Playlist } from "../models/playlist.model.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";


//creating playlist
const userPlaylist = asyncHandler(async (req, res) => {
    const currentUser = req.user;
    const {name, thumbnail, songs} = req.body;
    if(!name || !thumbnail || !songs) {
        throw new ApiError(301, "Insufficient Data")
    }
    const playlistData = {
        name,
        thumbnail,
        songs,
        owner: currentUser._id,
        collaborators: []
    };

    const playlist = await Playlist.create(playlistData)
    return res.status(200).json(playlist)
})

//getting playlist by Id
const getplaylist = asyncHandler(async (req, res) => {
    const playlistId = req.params.playlistId
    const playlist = await Playlist.findOne({_id: playlistId})
    if(!playlist) {
        throw new ApiError(302, "Invalid Id")
    }
    return res.status(200).json(playlist)
})

export{
    userPlaylist,
    getplaylist
}