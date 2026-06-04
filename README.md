# Splitem Expo

Splitem is a kids' mix-and-match picture app. Each character is built from three swipeable image layers:

- `head1.png` through `head15.png`
- `body1.png` through `body15.png`
- `legs1.png` through `legs15.png`

The child swipes each strip left or right to create a different character. Backgrounds are also swipeable and use the available `back*.png` files.

## Run In Expo Go

```sh
npm install
npx expo start
```

Then open Expo Go on your phone and scan the QR code.

## Replacing The Images

Put new images in `assets/` using the same filenames. The app currently expects:

- Heads: `head1.png` to `head15.png`
- Bodies: `body1.png` to `body15.png`
- Legs: `legs1.png` to `legs15.png`
- Branding: `icon.png`, `logo.png`, `splash3.png`, `splitemmenu.png`
- Utility buttons: `menu.png`, `camera.png`
- About screen: `about.png`

The original layout is based on a 320x480 portrait canvas. Transparent PNGs work best for heads, bodies, and legs so they stack cleanly.

## Splitting Full Character Sheets

Full generated sheets can be split into app-ready pieces with:

```sh
python3 scripts/split_character_sheet.py "/Volumes/Application_Builds/split images/whole1.png" --slot 1 --replace
```

That command writes a preview to `assets/generated-splits/slot1/preview.png`, backs up the original `head1.png`, `body1.png`, and `legs1.png` into `assets/original-pieces-backup/`, then replaces slot 1.

Use `--slot 2`, `--slot 3`, and so on for the other character slots. The script includes crop presets for the current generated sheets in slots 1-5.

## Build With EAS

```sh
npx eas build --platform ios
```

Before App Store submission, set the final bundle identifier, app icon, screenshots, and your EAS project id in `app.json`.
