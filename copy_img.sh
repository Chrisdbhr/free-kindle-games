#!/bin/bash
cp ~/.gemini/antigravity/brain/d0305522-72e6-4dd7-9522-fff752ca3ae9/dots_boxes_raw_1773169599040.png img/thumb_dots.png
ffmpeg -y -v warning -i img/thumb_dots.png -vf "scale=100:100:flags=neighbor" -pix_fmt monob img/thumb_dots.png
