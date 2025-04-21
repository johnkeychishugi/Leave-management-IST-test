import { Configuration, LogLevel } from "@azure/msal-browser";

// Microsoft Authentication Library configuration
export const msalConfig: Configuration = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID || "",
    authority: process.env.NEXT_PUBLIC_AZURE_AUTHORITY,
    redirectUri: process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI,
    postLogoutRedirectUri: process.env.NEXT_PUBLIC_AZURE_POST_LOGOUT_REDIRECT_URI,
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
          default:
            return;
        }
      },
      logLevel: LogLevel.Error,
    },
  },
};

// Login request with scopes for Microsoft Graph API access (needed for profile picture)
export const loginRequest = {
  scopes: ["openid", "profile", "email", "User.Read"],
};

// Get Microsoft Graph photo endpoint for user's profile picture
export const getProfilePictureUrl = (accessToken: string): string => {
  return `${process.env.NEXT_PUBLIC_AZURE_GRAPH_ENDPOINT}/me/photo/$value`;
};

// Check if email domain is allowed for login
export const isAllowedDomain = (email: string | undefined): boolean => {
  if (!email) return false;
  
  // Get current environment
  const isProduction = process.env.NODE_ENV === 'production';
  
  // In production, only allow IST domain
  if (isProduction) {
    const allowedDomains = process.env.NEXT_PUBLIC_ALLOWED_DOMAINS?.split(',') || ['ist.com'];
    const emailDomain = email.substring(email.indexOf('@') + 1).toLowerCase();
    return allowedDomains.some(domain => emailDomain === domain.trim().toLowerCase());
  }
  
  // In development/testing, allow any domain
  return true;
}; 