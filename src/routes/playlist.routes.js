import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { userPlaylist, getplaylist } from "../controllers/playlist.controller.js";



const router = Router();
router.use(verifyJWT);

router.route("/create").post(userPlaylist)

router.route("/:playlistId").get(getplaylist)

export default router;