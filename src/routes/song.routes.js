import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { songByName, songByArtist } from '../controllers/song.controller.js';

const router = Router();
router.use(verifyJWT);

router.route("/song").get(songByName)

router.route("/artist").get(songByArtist)

export default router;