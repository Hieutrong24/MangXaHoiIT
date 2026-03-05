function normalize(s) {
  return String(s || "").replace(/\r\n/g, "\n").trimEnd();
}
function equals(a, b) {
  return normalize(a) === normalize(b);
}
module.exports = { normalize, equals };
