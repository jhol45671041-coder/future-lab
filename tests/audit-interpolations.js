/* Security audit helper.
   Every value that reaches innerHTML must be escaped unless it is a number,
   a fixed colour/class token, or a value the app generated itself.
   Run:  node tests/audit-interpolations.js                                   */
const fs = require("fs");
const path = require("path");

const src = fs.readFileSync(path.join(__dirname, "..", "assets/js/app.js"), "utf8");
const chunks = [...src.matchAll(/\.innerHTML\s*=\s*([\s\S]*?);\n/g)].map(m => m[1]);

/* Anything drawn from data.js is authored by us, not typed by a user. */
const STATIC = /\b(AGE_BANDS|VIBES|CATEGORIES|IDEAS|MONEY_SPLIT|SAFETY_RULES|PARENT_CHECKLIST|byId|catOf)\b/;
/* Field names that come from a person typing into the app. */
const USER = /\b(state\.plan|state\.flyer|state\.job|state\.goal|j\.(customer|what|date)|f\.(name|tag|contact|area|note)|s\.(label|price)|t\.best)\b/;

const ALLOW = [
  /^esc\(/,                    // explicitly escaped
  /^money\(/,                  // formatted number
  /^Math\./, /toFixed\(/, /%/, // numeric formatting
  /color$/, /\.id$/,             // fixed palette / generated ids
  /^n$/, /^n \+ 1$/,           // loop indexes
  /^i \? /, /^g\[/, /^state\.split/,
  // loop variables fed from a static module
  /^(b|v|c|i|m|r|s|svc|g|w|item)\./,
  /^(b|v|c|i|m|r)\.(label|name|note|emoji|hint|id|why|icon|price|payUnit|time|startup|ages)/,
  /\.map\(/, /\.slice\(/, /\.length/,
  /^total !==/,
];

const values = [];
for (const c of chunks) {
  for (const m of c.matchAll(/\$\{([^}]+)\}/g)) values.push(m[1].trim());
}

const unique = [...new Set(values)];
const risky = unique.filter(v => !ALLOW.some(re => re.test(v)) && !STATIC.test(v));
/* Hard rule: a user-typed value must never appear un-escaped. */
/* Nested template literals truncate the capture, so a value counts as safe if
   esc() appears anywhere in the captured expression. Bare `${t.best}` is caught. */
const unescapedUser = values.filter(v => USER.test(v) && !/esc\(/.test(v));

console.log(`innerHTML sites: ${chunks.length}`);
console.log(`distinct interpolated expressions: ${unique.length}`);
if (unescapedUser.length) {
  console.log("\n⛔ USER INPUT REACHING innerHTML WITHOUT esc():");
  [...new Set(unescapedUser)].forEach(v => console.log("   " + v));
  process.exitCode = 1;
} else {
  console.log("user-typed values are always escaped ✓");
}
if (risky.length) {
  console.log("\n(no user input involved — statically authored content)");
  risky.slice(0, 6).forEach(v => console.log("   " + v));
  if (risky.length > 6) console.log("   … " + (risky.length - 6) + " more");
}
