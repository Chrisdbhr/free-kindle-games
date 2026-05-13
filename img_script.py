import os
import subprocess

src = '/home/ubuntu/.gemini/antigravity/brain/1173ca07-ed40-4925-a514-daf94252ef15/crosswords_thumbnail_1773168743522.png'
dst = '/home/ubuntu/hd-externo/kindle-games/img/thumb_crosswords.png'

with open(src, 'rb') as f:
    with open(dst, 'wb') as f2:
        f2.write(f.read())

subprocess.run(['ffmpeg', '-y', '-i', dst, '-vf', 'scale=60:-1', '-pix_fmt', 'pal8', dst])
print("Done!")
