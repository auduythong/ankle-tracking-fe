/// <reference types="vite/client" />

interface ImportMetaEnv {
    // Authentication & API
    readonly VITE_APP_TOKEN_CLIENT_ID_GOOGLE: string;
    readonly VITE_APP_BACKEND_API_TEST_WIFI: string;
    readonly VITE_APP_API_URL: string;
    readonly VITE_APP_API_KEY: string;
    readonly VITE_APP_SECRET_KEY: string;

    // Map & Location
    readonly VITE_APP_MAPBOX_ACCESS_TOKEN: string;
    readonly VITE_APP_GOOGLE_MAPS_API_KEY: string;
    readonly VITE_APP_MAP_APPID: string;
    readonly VITE_APP_MAP_SECRET: string;
    readonly VITE_APP_BUILDING_ID: string;

    // App Configuration
    readonly VITE_APP_VERSION: string;
    readonly VITE_APP_ENV: string;
    readonly VITE_APP_BASE_NAME: string;
    readonly VITE_APP_BASENAME: string;
    readonly VITE_APP_DEFAULT_PATH: string;

    // Theme & UI
    readonly VITE_APP_FONT_FAMILY: string;
    readonly VITE_APP_I18N_LOCALE: string;
    readonly VITE_APP_MINI_DRAWER: string;
    readonly VITE_APP_THEME: string;
    readonly VITE_APP_PRESET_COLOR: string;
    readonly VITE_APP_THEME_DIRECTION: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

// SVG imports with ?react suffix (vite-plugin-svgr)
declare module '*.svg?react' {
    import { FunctionComponent, SVGProps } from 'react';
    const ReactComponent: FunctionComponent<SVGProps<SVGSVGElement>>;
    export default ReactComponent;
}

// Regular SVG imports (as URL)
declare module '*.svg' {
    const content: string;
    export default content;
}

// Other image formats
declare module '*.png' {
    const content: string;
    export default content;
}

declare module '*.jpg' {
    const content: string;
    export default content;
}

declare module '*.jpeg' {
    const content: string;
    export default content;
}

declare module '*.gif' {
    const content: string;
    export default content;
}

declare module '*.webp' {
    const content: string;
    export default content;
}

