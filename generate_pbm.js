const fs = require('fs');

const size = 60;
const width = size;
const height = size;

// PBM Portable Bitmap format (P1 = ASCII, P4 = Binary)
// 1 = Black, 0 = White in PBM (Wait, actually PBM: 1 means black pixel, 0 means white)
let img = "P1\n" + width + " " + height + "\n";

// Black squares roughly matching the DALL-E image
const bs = [
    {x: 10, y: 10, w: 10, h: 10},
    {x: 30, y: 10, w: 10, h: 10},
    {x: 10, y: 30, w: 10, h: 10},
    {x: 30, y: 30, w: 10, h: 10},
    {x: 50, y: 30, w: 10, h: 10},
    {x: 10, y: 50, w: 10, h: 10},
    {x: 40, y: 40, w: 10, h: 10},
    {x: 0,  y: 20, w: 10, h: 10},
    {x: 50, y: 0,  w: 10, h: 10}
];

for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
        // Border
        if (x < 2 || y < 2 || x >= width-2 || y >= height-2) {
            img += "1 "; // Black
            continue;
        }

        // Grid lines (every 10 pixels)
        if (x % 10 === 0 || y % 10 === 0) {
            img += "1 ";
            continue;
        }

        // Black squares
        let isBs = false;
        for (let b of bs) {
            if (x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h) {
                isBs = true;
                break;
            }
        }

        if (isBs) {
            img += "1 ";
        } else {
            img += "0 "; // White
        }
    }
    img += "\n";
}

fs.writeFileSync('thumb.pbm', img);
console.log("Created thumb.pbm");
