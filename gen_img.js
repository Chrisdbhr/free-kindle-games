const fs = require('fs');

// A simple 60x60 pixel art for Crosswords (grid-like)
// This is a valid PNG base64 for a small grid icon
const base64Data = "iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6/NlyAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH6AMKDBEnm509uQAAAJFJREFUaN7t2bENgDAMRNEvByGisP8u7D8LI6BAt0iRInmK9EnunYPrS97H8zxXf67S2m7ttv9X+9id9L2Tvp+ks6S7pPOknSTtJGknSTtJ2kn6f96D7STpJGknSTtJ2knSTpJeSRdJl0m7SdpF0mXSPpIuYztG7MfYj7EfYz9G7MfYj7EfYz9G7MfYjzE9uCcAtpC91w5G6RMAAAAASUVORK5CYII=";

try {
    fs.writeFileSync('/home/ubuntu/hd-externo/kindle-games/img/thumb_crosswords.png', Buffer.from(base64Data, 'base64'));
    console.log("Image generated successfully.");
} catch (e) {
    console.error("Failed to write image:", e);
}
