function wait(delay) {
  return new Promise((resolve) => setTimeout(resolve, delay));
}

export async function fetchWithRetries(url, delay, amount, fetchOptions = {}) {
  for (let i = 0; i < amount; i++) {
    const res = await fetch(url, fetchOptions);
    if (res.ok) {
      return res;
    }
    await wait(delay);
  }
}
