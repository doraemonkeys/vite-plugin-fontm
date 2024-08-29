
# vite-plugin-fontm

A Vite plugin for compressing font files using Fontmin.

## Installation

```bash
npm i vite-plugin-fontm
```

## Usage

Add the plugin to your `vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import fontminPlugin from 'vite-plugin-fontm'

export default defineConfig({
  plugins: [
    fontminPlugin({
      fonts: [
        {
          fontSrc: ['./src/fonts/*.ttf'],
          fontDest: './src/compressed-fonts/',
          inputPath: ['./src/**/*.{vue,js,ts}'], // or input: 'Your text here',
          // input: 'Your text here', 
        }
      ],
      runOnceInDev: true // Optional: compress fonts in development mode
    })
  ]
})
```

## Configuration

The plugin accepts the following options:

- `fonts`: An array of font configurations
  - `fontSrc`: Source font file(s) (glob patterns supported)
  - `fontDest`: Destination folder for compressed fonts
  - `input`: Text to use for font subsetting
  - `inputPath`: File paths to scan for text (glob patterns supported)
- `runOnceInDev`: Whether to run font compression in development mode

