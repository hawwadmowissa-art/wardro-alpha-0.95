"""Remove white/near-white corner pixels from PWA icon PNGs, making them transparent."""
import os
from PIL import Image

ICONS_DIR = os.path.join(os.path.dirname(__file__), '..', 'icons')
WHITE_THRESHOLD = 240  # R,G,B all above this → treat as white edge


def flood_fill_transparent(img, start_x, start_y):
    """Flood-fill from a corner pixel, replacing near-white pixels with transparent."""
    pixels = img.load()
    w, h = img.size
    stack = [(start_x, start_y)]
    visited = set()

    while stack:
        x, y = stack.pop()
        if (x, y) in visited:
            continue
        if x < 0 or x >= w or y < 0 or y >= h:
            continue
        visited.add((x, y))
        r, g, b, a = pixels[x, y]
        # Stop if pixel is already transparent or not near-white
        if a < 128:
            continue
        if r < WHITE_THRESHOLD or g < WHITE_THRESHOLD or b < WHITE_THRESHOLD:
            continue
        pixels[x, y] = (0, 0, 0, 0)
        stack.extend([(x+1, y), (x-1, y), (x, y+1), (x, y-1)])


def fix_icon(path):
    img = Image.open(path).convert('RGBA')
    w, h = img.size
    corners = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]
    for cx, cy in corners:
        flood_fill_transparent(img, cx, cy)
    img.save(path, format='PNG')
    print(f'  fixed: {os.path.basename(path)} ({w}x{h})')


def main():
    icons_dir = os.path.abspath(ICONS_DIR)
    print(f'Processing icons in: {icons_dir}')
    for fname in sorted(os.listdir(icons_dir)):
        if fname.lower().endswith('.png'):
            fix_icon(os.path.join(icons_dir, fname))
    print('Done.')


if __name__ == '__main__':
    main()
