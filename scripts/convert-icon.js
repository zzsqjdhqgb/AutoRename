const sharp = require('sharp');
const pngToIco = require('png-to-ico').default; // Access the default export
const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '..', 'build');
const assetsDir = path.join(__dirname, '..', 'assets');
const svgPath = path.join(buildDir, 'icon.svg');
const pngPath = path.join(buildDir, 'icon.png');
const assetsPngPath = path.join(assetsDir, 'icon.png');
const icoPath = path.join(buildDir, 'icon.ico');

async function convertIcons() {
    try {
        console.log('Converting SVG to PNG (512x512)...');
        await sharp(svgPath)
            .resize(512, 512)
            .png()
            .toFile(pngPath);
        console.log('Created build/icon.png');

        // Also save to assets for runtime use
        await sharp(svgPath)
            .resize(512, 512)
            .png()
            .toFile(assetsPngPath);
        console.log('Created assets/icon.png');

        console.log('Creating temporary 256x256 PNG for ICO...');
        const tempPngPath = path.join(buildDir, 'temp_icon_256.png');
        await sharp(svgPath)
            .resize(256, 256)
            .png()
            .toFile(tempPngPath);

        console.log('Converting PNG to ICO...');
        const buf = await pngToIco([tempPngPath]); // Pass as array
        fs.writeFileSync(icoPath, buf);
        console.log('Created icon.ico');
        
        // Clean up temp file
        fs.unlinkSync(tempPngPath);
        
        console.log('Icon conversion complete!');
    } catch (error) {
        console.error('Error converting icons:', error);
        process.exit(1);
    }
}

convertIcons();