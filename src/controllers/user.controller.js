import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {jwt} from "jsonwebtoken";



const generateAcessAndRefreshTokens = async(userId) => 
{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {refreshToken, accessToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong")
    }
}
const registerUser = asyncHandler(async (req,res) => {
   
    //taking user details from frontend
    const {fullName, email, username, password } = req.body
    
    
    //checking empty field
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    //checking if user is  already registered
    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })
    if(existedUser){
        throw new ApiError(409, "User already exists")
    }

    //creating user object
    const user = await User.create({
        fullName,
        email,
        password,
        username
    })

    //removing password and refreshToken
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    //giving error if user is not created
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong please try again")
    }

    //returning response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    )
});

//user login
const loginUser = asyncHandler(async (req, res) => {

    //taking email or username and password
    const {email, username, password} = req.body
    console.log(email);

    if (!(username || email )) {
        throw new ApiError(400,"username or email is required")
    }

    //finding user
    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    //checking if user exists
    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    //checking password
    const ispassword = await user.isPasswordCorrect(password)

    if (!ispassword) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const {refreshToken, accessToken} = await generateAcessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .cookie("accessToken",accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,{
                user: loggedInUser, accessToken, refreshToken
            },
            "User Loggedin Successfully"
        )
    )

})

//user logout
const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res 
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200, {}, "User Logged Out"))
})

//generating access token after expiry with refresh token
const refreshAccessToken = asyncHandler(async(req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user= await User.findById(decodedToken?._id)
    
        if(!user) {
            throw new ApiError(401, "Invalid refresh Token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken}= await generateAcessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("newRefreshToken", newRefreshToken, options)
        .json(
            200,
            {accessToken, refreshToken: newRefreshToken},
            "Access Token Refreshed"
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token")
    }


})
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
};