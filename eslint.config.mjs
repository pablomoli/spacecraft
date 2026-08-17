import coreWebVitals from "eslint-config-next/core-web-vitals";

export default [
  ...coreWebVitals,
  {
    rules: {
      // Static export ships unoptimized images by design; <img> is the tool
      "@next/next/no-img-element": "off",
      // r3f/three mutates cameras and uniforms in render loops, and browser
      // API init (matchMedia, sessionStorage) sets state in effects; the
      // strict hooks rules flag both patterns wholesale
      "react-hooks/immutability": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  { ignores: [".next/", "out/", "node_modules/"] },
];
