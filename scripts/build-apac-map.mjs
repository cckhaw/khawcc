// Builds src/data/apac-map.json: simplified APAC land + border paths and projected pin positions.
// Run once: node scripts/build-apac-map.mjs   (devDeps: d3-geo, topojson-client, world-atlas)
import { readFileSync, writeFileSync } from "node:fs";
import { geoContains, geoMercator, geoPath } from "d3-geo";
import { feature, mesh } from "topojson-client";
import { presimplify, simplify, quantile } from "topojson-simplify";

const raw = JSON.parse(readFileSync("node_modules/world-atlas/countries-50m.json", "utf8"));
// Drop fine detail: keep the arcs in the top ~3% by visual weight (small islands survive via the pins).
const pre = presimplify(raw);
const world = simplify(pre, quantile(pre, Number(process.env.KEEP ?? 0.05)));
const countries = feature(world, world.objects.countries);
const borders = mesh(world, world.objects.countries, (a, b) => a !== b);

// Region of interest (lon/lat box). Everything is clipped to it.
const W = 900;
const H = 1100;
const box = { type: "MultiPoint", coordinates: [[58, -50], [192, -50], [192, 60], [58, 60]] }; // corners (a Polygon would be read as its complement)
const projection = geoMercator().rotate([-125, 0]).clipExtent([[0, 0], [W, H]]).fitExtent(
  [
    [6, 6],
    [W - 6, H - 6],
  ],
  box,
);
// Plain Mercator stretches the north; compress it a little for a friendlier shape.
const path = geoPath(projection).digits(1);

// Keep only countries that touch the box (keeps the file small).
const inRegion = (f) => {
  const [[x0, y0], [x1, y1]] = geoPath(projection).bounds(f);
  return x1 > 0 && x0 < W && y1 > 0 && y0 < H && f.properties.name !== "Antarctica";
};
const land = { type: "FeatureCollection", features: countries.features.filter(inRegion) };

// Pin locations [lon, lat] (+ optional pixel nudge so neighbours don't overlap)
const pins = {
  A: { lonlat: [103.82, 1.35], dx: 12, dy: 6 }, // M1 Singapore
  B: { lonlat: [100.33, 5.41], dx: -4, dy: -6 }, // TM, Malaysia (north peninsula)
  C: { lonlat: [106.85, -6.2], dx: 0, dy: 4 }, // STP Tower, Indonesia
  D: { lonlat: [113.5, 3.2], dx: 0, dy: 0 }, // Celcom, Malaysia (Borneo)
  E: { lonlat: [149.5, -33.9], dx: 0, dy: 0 }, // Telstra / Optus, Australia
  F: { lonlat: [174.78, -41.29], dx: -6, dy: 6 }, // Spark NZ
  G: { lonlat: [174.76, -36.85], dx: 6, dy: -4 }, // Vodafone NZ
  H: { lonlat: [121.56, 25.04], dx: 0, dy: 0 }, // Far EasTone, Taiwan
  I: { lonlat: [114.17, 22.3], dx: -4, dy: 0 }, // China Mobile
  J: { lonlat: [139.69, 35.69], dx: 0, dy: 0 }, // Softbank, Japan
  K: { lonlat: [121.03, 14.6], dx: 0, dy: 0 }, // Sun Cellular, Philippines
  L: { lonlat: [73.05, 33.68], dx: 0, dy: 0 }, // Pakistan
  M: { lonlat: [96.15, 19.76], dx: 0, dy: 0 }, // Myanmar
  N: { lonlat: [89.64, 27.47], dx: 0, dy: 0 }, // Bhutan
  O: { lonlat: [80.77, 7.87], dx: 0, dy: 0 }, // Sri Lanka
  P: { lonlat: [101.69, 3.14], dx: -16, dy: 0 }, // Maxis, Kuala Lumpur
};
// Dot-matrix land for the animated atlas: a hex-ish lattice of dots inside the land, split into
// vertical bands so the site can reveal it left to right.
const landGeo = feature(world, world.objects.land);
const BANDS = 16;
const chunks = Array.from({ length: BANDS }, () => []);
for (let r = 0; 8 + r * 10 < H - 4; r++) {
  const y = 8 + r * 10;
  for (let c = 0; ; c++) {
    const x = 8 + c * 10 + (r % 2 ? 5 : 0);
    if (x > W - 4) break;
    const ll = projection.invert([x, y]);
    if (ll && Number.isFinite(ll[0]) && geoContains(landGeo, ll)) chunks[Math.min(BANDS - 1, Math.floor(x / (W / BANDS)))].push(`M${x} ${y}h0`);
  }
}
const out = { width: W, height: H, land: path(land), borders: path(borders), pins: {} };
writeFileSync("src/data/apac-dots.json", JSON.stringify(chunks.map((c) => c.join(""))));
for (const [id, p] of Object.entries(pins)) {
  const [x, y] = projection(p.lonlat);
  out.pins[id] = [Math.round((x + p.dx) * 10) / 10, Math.round((y + p.dy) * 10) / 10];
}
writeFileSync("src/data/apac-map.json", JSON.stringify(out));
console.log("land", out.land.length, "borders", out.borders.length, "pins", Object.keys(out.pins).length);
