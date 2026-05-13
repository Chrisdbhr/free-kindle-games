const fs = require('fs');
const http = require('http');

// Simple minimal PNG (1x1 transparent) base64 as placeholder initially if script fails 
// Let's generate a full manual PBM and convert it within node without shelling out
const { execSync } = require('child_process');

try {
    fs.writeFileSync('thumb.pbm', "P1\n60 60\n" + [...Array(3600)].map((_, i) => (Math.random() > 0.5 ? "1 " : "0 ")).join(""));
    execSync('ffmpeg -y -i thumb.pbm -vf scale=60:-1 -pix_fmt pal8 img/thumb_crosswords.png');
    // clean up
    fs.unlinkSync('thumb.pbm');
    console.log("Success");
} catch(e) {
    console.log("Failed", e);
}
