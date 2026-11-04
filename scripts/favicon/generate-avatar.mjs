import { mkdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

// Non-generative cutout of this specific avatar. Only alpha changes at full
// resolution; the JPEG's decoded RGB pixels remain untouched.
const source = new URL(
	"../../src/assets/personal/github-avatar.jpg",
	import.meta.url,
);
const output = new URL("../../public/favicon/", import.meta.url);
const { data: rgb, info } = await sharp(await readFile(source))
	.removeAlpha()
	.raw()
	.toBuffer({ resolveWithObject: true });
const { width, height } = info;
if (width !== 460 || height !== 460)
	throw new Error(
		"Review the protection mask before changing the source avatar.",
	);
const count = width * height;
const background = new Uint8Array(count);
const queue = new Uint32Array(count);
let start = 0;
let end = 0;

// Protect white artwork which touches the image boundary: the cropped left
// ear and the bottom of the garment. A global white-to-transparent filter
// would erase these parts of the character.
const protectedPolygons = [
	[
		[167, 0],
		[205, 0],
		[232, 86],
		[230, 109],
		[146, 135],
		[138, 119],
	],
	[
		[186, 392],
		[326, 393],
		[325, 460],
		[183, 460],
	],
];
function insidePolygon(x, y, points) {
	let inside = false;
	for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
		const [xi, yi] = points[i];
		const [xj, yj] = points[j];
		if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
			inside = !inside;
	}
	return inside;
}
function enqueue(x, y) {
	const index = y * width + x;
	if (background[index]) return;
	if (protectedPolygons.some((polygon) => insidePolygon(x, y, polygon))) return;
	const color = rgb.subarray(index * 3, index * 3 + 3);
	const low = Math.min(...color);
	if (low < 235 || Math.max(...color) - low > 25) return;
	background[index] = 1;
	queue[end++] = index;
}
for (let x = 0; x < width; x++) {
	enqueue(x, 0);
	enqueue(x, height - 1);
}
for (let y = 0; y < height; y++) {
	enqueue(0, y);
	enqueue(width - 1, y);
}
while (start < end) {
	const index = queue[start++];
	const x = index % width;
	const y = Math.floor(index / width);
	if (x > 0) enqueue(x - 1, y);
	if (x + 1 < width) enqueue(x + 1, y);
	if (y > 0) enqueue(x, y - 1);
	if (y + 1 < height) enqueue(x, y + 1);
}
const hardAlpha = Buffer.from(background.map((value) => (value ? 0 : 255)));
// A subpixel edge feather reduces JPEG fringes. It does not modify RGB.
const alpha = await sharp(hardAlpha, { raw: { width, height, channels: 1 } })
	.greyscale()
	.blur(0.7)
	.raw()
	.toBuffer();
if (alpha.length !== count)
	throw new Error("Unexpected alpha channel dimensions");
const rgba = Buffer.alloc(count * 4);
for (let i = 0; i < count; i++) {
	rgb.copy(rgba, i * 4, i * 3, i * 3 + 3);
	rgba[i * 4 + 3] = alpha[i];
}
await mkdir(output, { recursive: true });
const cutout = await sharp(rgba, { raw: { width, height, channels: 4 } })
	.png()
	.toBuffer();
await writeFile(new URL("avatar-transparent.png", output), cutout);
const icons = [];
for (const size of [16, 32, 48, 192]) {
	const png = await sharp(cutout).resize(size, size).png().toBuffer();
	await writeFile(new URL(`avatar-${size}.png`, output), png);
	if (size <= 48) icons.push({ size, png });
}
// ICO embeds the same transparent PNGs for clients requesting /favicon.ico.
const header = Buffer.alloc(6 + 16 * icons.length);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(icons.length, 4);
let offset = header.length;
icons.forEach(({ size, png }, index) => {
	const entry = 6 + index * 16;
	header[entry] = size;
	header[entry + 1] = size;
	header.writeUInt16LE(1, entry + 4);
	header.writeUInt16LE(32, entry + 6);
	header.writeUInt32LE(png.length, entry + 8);
	header.writeUInt32LE(offset, entry + 12);
	offset += png.length;
});
await writeFile(
	new URL("../../public/favicon.ico", import.meta.url),
	Buffer.concat([header, ...icons.map(({ png }) => png)]),
);
console.log(
	`Generated avatar favicons; removed ${end} edge-connected background pixels of ${count}.`,
);
