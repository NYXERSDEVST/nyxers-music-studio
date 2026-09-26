/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ELEVENLABS_API_KEY?: string;
  readonly VITE_MUSICAPI_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
