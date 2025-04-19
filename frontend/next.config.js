/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Remove serverActions flag as it's enabled by default in Next.js 14
    // Ensure server component packages are properly handled
    serverComponentsExternalPackages: [],
  },
  
  // Ensure these packages are transpiled by Next.js to be compatible with React 18.2.0
  transpilePackages: [
    '@radix-ui/react-dropdown-menu',
    '@radix-ui/react-popover',
    '@radix-ui/react-use-callback-ref',
    '@radix-ui/react-use-controllable-state',
    '@radix-ui/react-use-effect-event',
    'lucide-react',
    'react-day-picker',
    '@fullcalendar/common',
    '@fullcalendar/core',
    '@fullcalendar/daygrid',
    '@fullcalendar/interaction',
    '@fullcalendar/react',
    '@fullcalendar/timegrid'
  ],
  
  // Handle module resolution issues
  webpack: (config, { isServer, dev }) => {
    // This is needed for the case sensitivity issue
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    
    // Fix React compatibility issues
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Override problematic useEffectEvent implementation
        '@radix-ui/react-use-effect-event': require.resolve('./shims/use-effect-event-shim.js'),
      };
    }
    
    return config;
  },
  
  // Set output to 'standalone' to enable Docker deployment
  output: 'standalone',
};

module.exports = nextConfig; 