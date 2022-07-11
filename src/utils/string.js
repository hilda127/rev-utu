export function naturalCompare(s1, s2) {
  return s1.localeCompare(s2, undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

export function reverse(str) {
  return str.split("").reverse().join("");
}

export function decrypt(str) {
  return reverse(str.substring(4));
}
