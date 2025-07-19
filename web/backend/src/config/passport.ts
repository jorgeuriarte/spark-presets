import passport from 'passport';
// @ts-ignore - No types available for passport-dropbox-oauth2
import { Strategy as DropboxOAuth2Strategy } from 'passport-dropbox-oauth2';
import { Request } from 'express';

// Define user type for serialization
interface SerializedUser {
  id: string;
  email: string;
  displayName: string;
  dropboxId: string;
  accessToken?: string;
}

// Configure Dropbox OAuth2 Strategy
passport.use(new DropboxOAuth2Strategy({
  apiVersion: '2',
  clientID: process.env.DROPBOX_APP_KEY || '',
  clientSecret: process.env.DROPBOX_APP_SECRET || '',
  callbackURL: process.env.DROPBOX_REDIRECT_URI || '',
  passReqToCallback: true
},
async (req: Request, accessToken: string, refreshToken: string, profile: any, done: any) => {
  try {
    // In production, you would save this to your database
    const user: SerializedUser = {
      id: profile.id,
      dropboxId: profile.id,
      email: profile.emails?.[0]?.value || '',
      displayName: profile.displayName || profile.emails?.[0]?.value || 'User',
      accessToken: accessToken // Store encrypted in production
    };

    // Store in session for now
    if (req.session) {
      req.session.dropboxAccessToken = accessToken;
    }

    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

// Serialize user for session
passport.serializeUser((user: any, done: any) => {
  done(null, user);
});

// Deserialize user from session
passport.deserializeUser((user: any, done: any) => {
  done(null, user);
});

export default passport;