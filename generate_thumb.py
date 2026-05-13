from PIL import Image, ImageDraw

# Create 60x60 black and white image
img = Image.new('1', (60, 60), color=1)
d = ImageDraw.Draw(img)

# Draw crossword grid pattern
# Border
d.rectangle([0, 0, 59, 59], outline=0, width=2)

# Black squares
black_squares = [
    (10, 10, 20, 20),
    (30, 10, 40, 20),
    (10, 30, 20, 40),
    (30, 30, 40, 40),
    (50, 30, 60, 40),
    (10, 50, 20, 60),
    (40, 40, 50, 50),
    (0, 20, 10, 30),
    (50, 0, 60, 10)
]

for sq in black_squares:
    d.rectangle(sq, fill=0)

# Grid lines
for i in range(10, 60, 10):
    d.line([(i, 0), (i, 60)], fill=0, width=1)
    d.line([(0, i), (60, i)], fill=0, width=1)

img.save('img/thumb_crosswords.png')
print("Generated img/thumb_crosswords.png")
