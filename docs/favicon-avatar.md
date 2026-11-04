# GitHub avatar favicon

The favicon uses the current avatar of [Shixiaoshi0417](https://github.com/Shixiaoshi0417), retrieved on 2026-11-04 from <https://avatars.githubusercontent.com/u/142963842?v=4> at the user's request. The original 460×460 JPEG remains in `src/assets/personal/github-avatar.jpg`.

This is an ordinary background cutout, not a generated or redrawn illustration. `scripts/favicon/generate-avatar.mjs` removes only edge-connected near-white background and adds a small alpha-edge feather. Its protection polygons preserve the white ear and garment at the image boundary. Full-resolution RGB values are unchanged from Sharp's decoding of the source JPEG.

Regenerate with `node scripts/favicon/generate-avatar.mjs`. Review the mask if the source avatar changes. The output includes a full-resolution transparent PNG, 16/32/48/192-pixel PNGs, and a root `favicon.ico` containing 16/32/48-pixel images. The explicit HTML icon links use 16/32/192-pixel PNGs in both light and dark mode. The old S logo remains as an unused asset.

The source is a publicly visible GitHub avatar, but no separate artwork license or artist attribution was supplied. Public availability is not an open-license claim. Reuse here is based on the user's explicit instruction; confirm any underlying artwork rights before broader reuse.
