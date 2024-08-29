import fs from 'fs/promises';
import path from 'path';
import Fontmin from 'fontmin';
import { glob, globSync } from 'glob'




interface FontConfig {
    fontSrc: string[];
    fontDest: string;
    input?: string;
    inputPath?: string[];
}

interface PluginOptions {
    fonts: FontConfig[];
    runOnceInDev?: boolean;
}
export default function fontminPlugin(options: PluginOptions) {
    let isBuild = false;
    return {
        name: 'vite-plugin-fontmin',
        config(conf: any, { command }: { command: string }) {
            isBuild = command === 'build';
            return conf;
        },
        async buildStart() {
            if (!options || !options.fonts || !Array.isArray(options.fonts)) {
                console.warn('Invalid or missing font configuration');
                return;
            }

            if (!isBuild && options.runOnceInDev) {
                let shouldCompress = false;
                // check if the font files are already compressed
                outerLoop: for (const font of options.fonts) {
                    const { fontSrc, fontDest } = font;
                    for (const src of fontSrc) {
                        const files = globSync(src);
                        if (!files || files.length === 0) {
                            console.warn('Font file not found:', src);
                            continue;
                        }
                        const dest = path.resolve(fontDest);
                        const compressedFiles = globSync(dest + '/*.ttf');
                        for (const file of files) {
                            const filename = path.basename(file);
                            const compressedFile = compressedFiles.find(f => path.basename(f) === filename);
                            if (!compressedFile) {
                                console.warn('Font needs to be compressed:', src);
                                shouldCompress = true;
                                break outerLoop;
                            }
                        }
                    }
                }
                if (!shouldCompress) {
                    console.log('Fonts are already compressed');
                    return;
                }
            }
            for (const font of options.fonts) {
                const { fontSrc, fontDest, input, inputPath } = font;
                if (!fontSrc || !fontDest || (!input && !inputPath)) {
                    console.warn('Invalid font configuration:', font);
                    continue;
                }
                let text: string = '';
                if (input) {
                    text = input;
                } else if (inputPath) {
                    try {
                        text = await scanPaths(inputPath);
                    } catch (error) {
                        console.error('Error reading input:', error);
                        continue;
                    }
                }
                for (const src of fontSrc) {
                    await compressFont(src, fontDest, text);
                }
            }
        },
    };
}


async function scanPaths(paths: string[]): Promise<string> {
    let text = '';
    for (const pattern of paths) {
        const files = await glob(pattern, { nodir: true });
        for (const file of files) {
            // console.log('Reading:', file);
            text += await fs.readFile(file, 'utf-8');
        }
    }
    return text;
}

function compressFont(src: ArrayLike<number> | Buffer | string, dest: string, text: string) {
    return new Promise((resolve, reject) => {
        const fontmin = new Fontmin()
            .src(src)
            .dest(dest)
            .use(Fontmin.glyph({ text, hinting: false }));

        fontmin.run((err, files) => {
            if (err) {
                reject(err);
            } else {
                console.log(`Font compressed: ${src} -> ${dest}`);
                resolve(files);
            }
        });
    });
}
