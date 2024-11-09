import { Router } from "express";
import { session } from "passport";

app.get('/auth/google',
    passport.authenticate('google', { session: false, scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    function (req, res) {
        const { user, accessToken, refreshToken, accessTokenExp, refreshTokenExp } = req.user
        // Successful authentication, redirect home.
        res.redirect('/');
    });