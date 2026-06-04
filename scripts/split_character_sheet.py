#!/usr/bin/env python3
from collections import deque
from pathlib import Path
from PIL import Image, ImageChops, ImageFilter
import argparse
import colorsys


PARTS = {
    "head": {
        "crop": (300, 30, 710, 420),
        "target": (854, 391),
        "prefix": "head",
    },
    "body": {
        "crop": (220, 500, 760, 805),
        "target": (867, 431),
        "prefix": "body",
    },
    "legs": {
        "crop": (820, 550, 1385, 935),
        "target": (866, 413),
        "prefix": "legs",
    },
}

SLOT_CROPS = {
    1: {
        "head": (300, 30, 710, 420),
        "body": (220, 500, 760, 805),
        "legs": (820, 550, 1385, 935),
    },
    2: {
        "head": (270, 20, 720, 455),
        "body": (200, 455, 800, 825),
        "legs": (885, 475, 1385, 990),
    },
    3: {
        "head": (240, 15, 645, 455),
        "body": (175, 430, 760, 910),
        "legs": (825, 415, 1375, 975),
    },
    4: {
        "head": (45, 200, 470, 775),
        "body": (450, 245, 1035, 805),
        "legs": (1080, 280, 1515, 825),
    },
    5: {
        "head": (0, 95, 475, 480),
        "body": (500, 225, 1065, 665),
        "legs": (1080, 365, 1495, 965),
    },
    6: {
        "head": (40, 80, 470, 600),
        "body": (465, 260, 1040, 860),
        "legs": (1080, 315, 1505, 925),
    },
    7: {
        "head": (40, 20, 490, 610),
        "body": (440, 150, 1060, 885),
        "legs": (1160, 335, 1505, 950),
    },
    8: {
        "head": (95, 35, 525, 480),
        "body": (430, 210, 1160, 895),
        "legs": (1130, 230, 1535, 910),
    },
    9: {
        "head": (60, 55, 390, 430),
        "body": (300, 235, 1135, 740),
        "legs": (1065, 300, 1510, 910),
    },
    10: {
        "head": (50, 0, 610, 365),
        "body": (600, 250, 1425, 950),
        "legs": (105, 365, 535, 975),
    },
    11: {
        "head": (55, 0, 455, 420),
        "body": (350, 335, 910, 910),
        "legs": (0, 455, 400, 1095),
    },
    12: {
        "head": (55, 110, 500, 520),
        "body": (470, 300, 1075, 790),
        "legs": (1130, 360, 1510, 900),
    },
    13: {
        "head": (20, 245, 410, 690),
        "body": (430, 205, 1085, 800),
        "legs": (1060, 205, 1510, 885),
    },
    14: {
        "head": (40, 75, 480, 470),
        "body": (450, 140, 1140, 780),
        "legs": (1160, 175, 1515, 930),
    },
    15: {
        "head": (30, 65, 430, 500),
        "body": (450, 105, 1120, 650),
        "legs": (610, 130, 1515, 930),
    },
}

SLOT_COMPOSITE_CROPS = {
    15: {
        "legs": [
            {
                "crop": (1120, 130, 1515, 720),
                "box": (180, 0, 600, 520),
            },
            {
                "crop": (600, 610, 1110, 940),
                "box": (135, 455, 645, 785),
            },
        ],
    },
}


def color_distance(a, b):
    return sum((a[i] - b[i]) * (a[i] - b[i]) for i in range(3)) ** 0.5


def saturation(pixel):
    r, g, b = [value / 255 for value in pixel[:3]]
    return colorsys.rgb_to_hsv(r, g, b)[1]


def luma(pixel):
    return pixel[0] * 0.299 + pixel[1] * 0.587 + pixel[2] * 0.114


def can_be_background(pixel):
    # The generated sheets use a mostly grey painted background with a soft
    # glow. Strongly saturated colors and black outlines belong to the costume.
    brightness = luma(pixel)
    return 50 < brightness < 210 and saturation(pixel) < 0.26


def background_mask(image):
    rgb = image.convert("RGB")
    width, height = rgb.size
    pixels = rgb.load()
    visited = bytearray(width * height)
    queue = deque()

    def add(x, y):
        index = y * width + x
        if not visited[index]:
            visited[index] = 1
            queue.append((x, y))

    for x in range(width):
        add(x, 0)
        add(x, height - 1)
    for y in range(height):
        add(0, y)
        add(width - 1, y)

    while queue:
        x, y = queue.popleft()
        current = pixels[x, y]
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if nx < 0 or ny < 0 or nx >= width or ny >= height:
                continue
            index = ny * width + nx
            if visited[index]:
                continue

            candidate = pixels[nx, ny]
            # Follow the smooth painted background and glow, but stop at black
            # outlines and strongly changing character edges.
            local_delta = color_distance(current, candidate)
            if luma(candidate) >= 210:
                continue
            muted = saturation(candidate) < 0.26
            gentle_shift = local_delta <= 32
            grey_sheet = can_be_background(candidate) and (local_delta <= 42 or saturation(current) < 0.26)
            dark_sheet = muted and luma(candidate) > 8 and gentle_shift
            if grey_sheet or dark_sheet:
                visited[index] = 1
                queue.append((nx, ny))

    mask = Image.new("L", (width, height), 0)
    data = bytearray(width * height)
    for index, is_background in enumerate(visited):
        data[index] = 0 if is_background else 255
    mask.frombytes(bytes(data))
    return mask


def trim_to_alpha(image):
    alpha = image.getchannel("A")
    bbox = alpha.getbbox()
    if not bbox:
        return image
    return image.crop(bbox)


def remove_small_alpha_components(image, minimum_area=1200):
    alpha = image.getchannel("A")
    width, height = alpha.size
    pixels = alpha.load()
    visited = bytearray(width * height)
    keep = bytearray(width * height)

    for start_y in range(height):
        for start_x in range(width):
            start_index = start_y * width + start_x
            if visited[start_index] or pixels[start_x, start_y] < 12:
                visited[start_index] = 1
                continue

            queue = deque([(start_x, start_y)])
            visited[start_index] = 1
            component = []
            while queue:
                x, y = queue.popleft()
                index = y * width + x
                component.append(index)
                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if nx < 0 or ny < 0 or nx >= width or ny >= height:
                        continue
                    next_index = ny * width + nx
                    if visited[next_index]:
                        continue
                    visited[next_index] = 1
                    if pixels[nx, ny] >= 12:
                        queue.append((nx, ny))

            if len(component) >= minimum_area:
                for index in component:
                    keep[index] = 255

    cleaned_alpha = Image.new("L", (width, height), 0)
    cleaned_alpha.frombytes(bytes(keep))
    cleaned = Image.new("RGBA", image.size, (0, 0, 0, 0))
    cleaned.alpha_composite(image)
    cleaned.putalpha(ImageChops.multiply(alpha, cleaned_alpha))
    return cleaned


def has_source_transparency(image):
    low, high = image.getchannel("A").getextrema()
    return low < 255 and high > 0


def remove_low_alpha_glow(image, threshold=70):
    alpha = image.getchannel("A")
    cleaned_alpha = alpha.point(lambda value: value if value >= threshold else 0)
    cleaned = Image.new("RGBA", image.size, (0, 0, 0, 0))
    cleaned.alpha_composite(image)
    cleaned.putalpha(cleaned_alpha)
    return cleaned


def fit_on_canvas(image, target_size, padding=0.94):
    target_width, target_height = target_size
    image = trim_to_alpha(image)
    scale = min((target_width * padding) / image.width, (target_height * padding) / image.height)
    new_size = (max(1, round(image.width * scale)), max(1, round(image.height * scale)))
    resized = image.resize(new_size, Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", target_size, (0, 0, 0, 0))
    position = ((target_width - resized.width) // 2, (target_height - resized.height) // 2)
    canvas.alpha_composite(resized, position)
    return canvas


def extract_part(source, config):
    crop = source.crop(config["crop"]).convert("RGBA")
    transparent = Image.new("RGBA", crop.size, (0, 0, 0, 0))
    transparent.alpha_composite(crop)
    if has_source_transparency(crop):
        transparent = remove_low_alpha_glow(transparent)
    else:
        mask = background_mask(crop)
        mask = mask.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(1.1))
        transparent.putalpha(ImageChops.multiply(transparent.getchannel("A"), mask))
    transparent = remove_small_alpha_components(transparent)
    return fit_on_canvas(transparent, config["target"])


def extract_transparent_crop(source, crop_box):
    crop = source.crop(crop_box).convert("RGBA")
    transparent = Image.new("RGBA", crop.size, (0, 0, 0, 0))
    transparent.alpha_composite(crop)
    if has_source_transparency(crop):
        transparent = remove_low_alpha_glow(transparent)
    else:
        mask = background_mask(crop)
        mask = mask.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(1.1))
        transparent.putalpha(ImageChops.multiply(transparent.getchannel("A"), mask))
    transparent = remove_small_alpha_components(transparent)
    return trim_to_alpha(transparent)


def extract_composite_part(source, config, pieces):
    working_size = (760, 820)
    working = Image.new("RGBA", working_size, (0, 0, 0, 0))
    for piece in pieces:
        image = extract_transparent_crop(source, piece["crop"])
        left, top, right, bottom = piece["box"]
        box_width = right - left
        box_height = bottom - top
        scale = min(box_width / image.width, box_height / image.height)
        resized = image.resize(
            (max(1, round(image.width * scale)), max(1, round(image.height * scale))),
            Image.Resampling.LANCZOS,
        )
        working.alpha_composite(resized, (left + (box_width - resized.width) // 2, top + (box_height - resized.height) // 2))
    return fit_on_canvas(working, config["target"])


def make_preview(parts, output_path):
    gap = 24
    width = max(image.width for image in parts.values())
    height = sum(image.height for image in parts.values()) + gap * (len(parts) - 1)
    preview = Image.new("RGBA", (width, height), (248, 234, 162, 255))
    y = 0
    for image in parts.values():
        preview.alpha_composite(image, ((width - image.width) // 2, y))
        y += image.height + gap
    preview.save(output_path)


def output_name(config, slot):
    return f"{config['prefix']}{slot}.png"


def main():
    parser = argparse.ArgumentParser(description="Split a Splitem full character sheet into head/body/legs assets.")
    parser.add_argument("source", type=Path)
    parser.add_argument("--slot", type=int, default=1)
    parser.add_argument("--assets", type=Path, default=Path("assets"))
    parser.add_argument("--preview-dir", type=Path)
    parser.add_argument("--replace", action="store_true")
    args = parser.parse_args()

    source = Image.open(args.source).convert("RGBA")
    for name, crop in SLOT_CROPS.get(args.slot, {}).items():
        PARTS[name]["crop"] = crop
    if args.preview_dir is None:
        args.preview_dir = args.assets / "generated-splits" / f"slot{args.slot}"
    args.preview_dir.mkdir(parents=True, exist_ok=True)

    extracted = {}
    composite_crops = SLOT_COMPOSITE_CROPS.get(args.slot, {})
    for name, config in PARTS.items():
        if name in composite_crops:
            image = extract_composite_part(source, config, composite_crops[name])
        else:
            image = extract_part(source, config)
        extracted[name] = image
        image.save(args.preview_dir / output_name(config, args.slot))

    make_preview(extracted, args.preview_dir / "preview.png")

    if args.replace:
        backup_dir = args.assets / "original-pieces-backup"
        backup_dir.mkdir(parents=True, exist_ok=True)
        for config in PARTS.values():
            filename = output_name(config, args.slot)
            output_path = args.assets / filename
            backup_path = backup_dir / filename
            if output_path.exists() and not backup_path.exists():
                output_path.replace(backup_path)
            extracted_name = args.preview_dir / filename
            Image.open(extracted_name).save(output_path)


if __name__ == "__main__":
    main()
