import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import sharp from "sharp";

const root = (path) => new URL(`../${path}`, import.meta.url);

test("full-resolution cutout preserves source RGB and white artwork", async () => {
	const original = await sharp(
		await readFile(root("src/assets/personal/github-avatar.jpg")),
	)
		.removeAlpha()
		.raw()
		.toBuffer();
	const { data, info } = await sharp(
		await readFile(root("public/favicon/avatar-transparent.png")),
	)
		.ensureAlpha()
		.raw()
		.toBuffer({ resolveWithObject: true });
	assert.equal(info.width, 460);
	assert.equal(info.height, 460);
	let transparent = 0;
	let opaque = 0;
	for (let i = 0; i < 460 * 460; i++) {
		assert.deepEqual(
			data.subarray(i * 4, i * 4 + 3),
			original.subarray(i * 3, i * 3 + 3),
		);
		if (data[i * 4 + 3] === 0) transparent++;
		if (data[i * 4 + 3] === 255) opaque++;
	}
	assert.ok(transparent > 80_000 && transparent < 105_000);
	assert.ok(opaque > 105_000);
	for (const [x, y] of [
		[170, 12],
		[162, 60],
		[210, 270],
		[240, 440],
	]) {
		assert.equal(
			data[(y * 460 + x) * 4 + 3],
			255,
			`Artwork must stay opaque at ${x},${y}`,
		);
	}
});

test("PNG and ICO favicon sizes retain transparent backgrounds", async () => {
	for (const size of [16, 32, 48, 192]) {
		const png = await readFile(root(`public/favicon/avatar-${size}.png`));
		const { data, info } = await sharp(png)
			.ensureAlpha()
			.raw()
			.toBuffer({ resolveWithObject: true });
		assert.equal(info.width, size);
		assert.equal(info.height, size);
		const alpha = data.filter((_, index) => index % 4 === 3);
		assert.equal(Math.min(...alpha), 0);
		assert.equal(Math.max(...alpha), 255);
	}
	const ico = await readFile(root("public/favicon.ico"));
	assert.equal(ico.readUInt16LE(0), 0);
	assert.equal(ico.readUInt16LE(2), 1);
	assert.equal(ico.readUInt16LE(4), 3);
	for (const [index, size] of [16, 32, 48].entries()) {
		const entry = 6 + index * 16;
		assert.equal(ico[entry], size);
		assert.equal(ico[entry + 1], size);
		const bytes = ico.subarray(
			ico.readUInt32LE(entry + 12),
			ico.readUInt32LE(entry + 12) + ico.readUInt32LE(entry + 8),
		);
		assert.deepEqual(
			bytes,
			await readFile(root(`public/favicon/avatar-${size}.png`)),
		);
	}
});

test("production pages reference local avatar favicons", async () => {
	for (const page of [
		"index.html",
		"about/index.html",
		"posts/nekokem/index.html",
	]) {
		const html = await readFile(root(`dist/${page}`), "utf8");
		const links = html.match(/<link\b[^>]*\brel="icon"[^>]*>/g) ?? [];
		assert.equal(links.length, 3, page);
		for (const size of [16, 32, 192]) {
			assert.ok(
				links.some(
					(link) =>
						link.includes(`href="/favicon/avatar-${size}.png"`) &&
						link.includes(`sizes="${size}x${size}"`),
				),
				page,
			);
			assert.deepEqual(
				await readFile(root(`dist/favicon/avatar-${size}.png`)),
				await readFile(root(`public/favicon/avatar-${size}.png`)),
			);
		}
		assert.ok(
			links.every(
				(link) => !link.includes("/logo/icon.svg") && !link.includes("media="),
			),
		);
	}
	assert.deepEqual(
		await readFile(root("dist/favicon.ico")),
		await readFile(root("public/favicon.ico")),
	);
});
