import os

def draw_thumbnail(path):
    print(f"Tentando gerar imagem em {path}...")
    try:
        from PIL import Image, ImageDraw
        img = Image.new('1', (100, 100), 1) # 1 is white in mode '1'
        draw = ImageDraw.Draw(img)
        
        # Dots
        dot_size = 6
        spacing = 28
        offset = 8
        for i in range(4):
            for j in range(4):
                x = offset + i * spacing
                y = offset + j * spacing
                draw.rectangle([x, y, x+dot_size, y+dot_size], fill=0) # 0 is black
                
        # Lines
        line_w = 2
        # Horizontal lines (row 0)
        draw.rectangle([offset+dot_size, offset+dot_size/2-line_w/2, offset+spacing, offset+dot_size/2+line_w/2], fill=0) 
        draw.rectangle([offset+spacing+dot_size, offset+dot_size/2-line_w/2, offset+spacing*2, offset+dot_size/2+line_w/2], fill=0) 
        
        # Vertical lines
        draw.rectangle([offset+dot_size/2-line_w/2, offset+dot_size, offset+dot_size/2+line_w/2, offset+spacing], fill=0) 
        
        # A completed box
        draw.rectangle([offset+dot_size/2-line_w/2, offset+spacing+dot_size, offset+dot_size/2+line_w/2, offset+spacing*2], fill=0)
        draw.rectangle([offset+spacing+dot_size/2-line_w/2, offset+spacing+dot_size, offset+spacing+dot_size/2+line_w/2, offset+spacing*2], fill=0)
        draw.rectangle([offset+dot_size, offset+spacing+dot_size/2-line_w/2, offset+spacing, offset+spacing+dot_size/2+line_w/2], fill=0)
        draw.rectangle([offset+dot_size, offset+spacing*2+dot_size/2-line_w/2, offset+spacing, offset+spacing*2+dot_size/2+line_w/2], fill=0)
        
        # Draw an X in the completed box
        box_center_x = offset + spacing/2 + dot_size/2
        box_center_y = offset + spacing*1.5 + dot_size/2
        x_size = 6
        draw.line([box_center_x-x_size, box_center_y-x_size, box_center_x+x_size, box_center_y+x_size], fill=0, width=2)
        draw.line([box_center_x-x_size, box_center_y+x_size, box_center_x+x_size, box_center_y-x_size], fill=0, width=2)

        img.save(path)
        print(f"Sucesso! Use este comando: ffmpeg -y -i {path} -vf 'scale=100:100:flags=neighbor' -pix_fmt monob img/thumb_dots.png")
    except ImportError:
        pbm_path = path.replace('.png', '.pbm')
        print(f"PIL (Pillow) não encontrado. Gerando formato PBM em {pbm_path}...")
        with open(pbm_path, 'w') as f:
            f.write("P1\n100 100\n")
            grid = [[0 for _ in range(100)] for _ in range(100)]
            dot_size, spacing, offset, line_w = 6, 28, 8, 2
            for i in range(4):
                for j in range(4):
                    x, y = offset + i * spacing, offset + j * spacing
                    for dx in range(dot_size):
                        for dy in range(dot_size):
                            if 0 <= y+dy < 100 and 0 <= x+dx < 100: grid[int(y+dy)][int(x+dx)] = 1
            def draw_rect(x1, y1, x2, y2):
                for cy in range(int(y1), int(y2)+1):
                    for cx in range(int(x1), int(x2)+1):
                         if 0 <= cy < 100 and 0 <= cx < 100: grid[cy][cx] = 1
            draw_rect(offset+dot_size, offset+dot_size/2-line_w, offset+spacing, offset+dot_size/2+line_w)
            draw_rect(offset+spacing+dot_size, offset+dot_size/2-line_w, offset+spacing*2, offset+dot_size/2+line_w)
            draw_rect(offset+dot_size/2-line_w, offset+dot_size, offset+dot_size/2+line_w, offset+spacing)
            # Box
            draw_rect(offset+dot_size/2-line_w, offset+spacing+dot_size, offset+dot_size/2+line_w, offset+spacing*2)
            draw_rect(offset+spacing+dot_size/2-line_w, offset+spacing+dot_size, offset+spacing+dot_size/2+line_w, offset+spacing*2)
            draw_rect(offset+dot_size, offset+spacing+dot_size/2-line_w, offset+spacing, offset+spacing+dot_size/2+line_w)
            draw_rect(offset+dot_size, offset+spacing*2+dot_size/2-line_w, offset+spacing, offset+spacing*2+dot_size/2+line_w)
            # X (simplified for PBM)
            bx, by = int(offset + spacing/2 + dot_size/2), int(offset + spacing*1.5 + dot_size/2)
            for d in range(-6, 7):
                if 0 <= by+d < 100 and 0 <= bx+d < 100: grid[by+d][bx+d] = 1
                if 0 <= by-d < 100 and 0 <= bx+d < 100: grid[by-d][bx+d] = 1
            rows = []
            for row in grid: rows.append(" ".join(map(str, row)))
            f.write("\n".join(rows))
        print(f"Sucesso! Use este comando: ffmpeg -y -i {pbm_path} -vf 'scale=100:100:flags=neighbor' -pix_fmt monob img/thumb_dots.png")

if __name__ == "__main__":
    if not os.path.exists('img'): os.makedirs('img')
    draw_thumbnail("img/thumb_dots_raw.png")
