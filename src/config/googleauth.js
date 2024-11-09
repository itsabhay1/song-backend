import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from "../models/user.model.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;

const generateTokens = async (user) => {
  const accessToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });
  
  return {
    accessToken,
    refreshToken,
  };
};

passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: "https://song-backend-bice.vercel.app/auth/google/callback"
},
  async (accessToken, refreshToken, profile, cb) => {
    try {
      let user = await User.findOne({ email: profile._json.email });
      if (!user) {
        const lastSixDigitsId = profile.id.substring(profile.id.length - 6);
        const lastTwoDigitsId = profile._json.name.substring(profile._json.name.length - 2);
        const newPass = lastTwoDigitsId + lastSixDigitsId;
        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashedPassword = await bcrypt.hash(newPass, salt);
        
        user = await User.create({
          fullName: profile._json.name,
          email: profile._json.email,
          is_verified: true,
          password: hashedPassword,
        });
      }

      const { accessToken, refreshToken } = await generateTokens(user);
      return cb(null, { user, accessToken, refreshToken });
    } catch (error) {
      console.error("Error during authentication:", error);
      return cb(error);
    }
  }
));