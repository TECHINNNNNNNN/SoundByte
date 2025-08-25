import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GithubStrategy } from "passport-github2";
import { prisma } from "../lib/db.js";


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.NODE_ENV === 'production' 
        ? `${process.env.BACKEND_URL}/api/auth/google/callback`
        : "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // check if user already exists in this Google account Id
        const account = await prisma.account.findUnique({
            where: {
                provider_providerAccountId: {
                    provider: "google",
                    providerAccountId: profile.id
                }
            },
            include: {
                user: true
            }
        })

        if (account) {
            // user already exists
            return done(null, account.user)
        }

        // check if user already exists in this email
        const email = profile.emails?.[0]?.value;
        if (!email) {
            return done(new Error("Email not found"), null)
        }

        // check if user already exists in this email
        let user = await prisma.user.findUnique({
            where: {
                email: email
            }
        })

        if (!user) {
            // create new user
            user = await prisma.user.create({
                data: {
                    email: email,
                    name: profile.displayName,
                    avatar: profile.photos?.[0]?.value,
                    provider: "google",
                    emailVerified: true,
                }
            })

            await prisma.account.create({
                data: {
                    userId: user.id,
                    type: "oauth",
                    provider: "google",
                    providerAccountId: profile.id,
                    access_token: accessToken,
                    refresh_token: refreshToken,
                }
            });

        }

        return done(null, user);

    } catch (error) {
        console.error("Error in Google OAuth strategy:", error)
        return done(error, null)
    }
}
))

// Github Oauth Strategy
passport.use(new GithubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.NODE_ENV === 'production' 
        ? `${process.env.BACKEND_URL}/api/auth/github/callback`
        : "/api/auth/github/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // check if user already exists in this Github account id
        let account = await prisma.account.findUnique({
            where: {
                provider_providerAccountId: {
                    provider: "github",
                    providerAccountId: profile.id
                }
            },
            include: {
                user: true
            }
        })

        if (account) {
            // user already exists
            return done(null, account.user)
        }

        // check if user already exists in this email
        const email = profile.emails && profile.emails[0].value ? profile.emails[0].value : null;
        let user = null;

        if (email) {
            user = await prisma.user.findUnique({
                where: {
                    email: email
                }
            })
        }

        if (!user) {
            // create new user
            user = await prisma.user.create({
                data: {
                    email: email || `${profile.username}@github.local`,
                    name: profile.displayName || profile.username,
                    avatar: profile.photos?.[0]?.value,
                    provider: "github",
                    emailVerified: !!email
                }
            })
        }

        // create account link
        await prisma.account.create({
            data: {
                userId: user.id,
                type: "oauth",
                provider: "github",
                providerAccountId: profile.id,
                access_token: accessToken,
                refresh_token: refreshToken,
            }
        })

        return done(null, user);

    } catch (error) {
        console.error("Error in Github OAuth strategy:", error)
        return done(error, null)
    }
}
))


passport.serializeUser((user, done) => {
    done(null, user.id);
})

passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: id
            }
        })

        done(null, user);
    } catch (error) {
        console.error("Error in deserializing user:", error)
        done(error, null)
    }
})

