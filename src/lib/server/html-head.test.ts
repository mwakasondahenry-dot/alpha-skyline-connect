import { describe, expect, it } from "vitest";
import { headRewriter, lowerModulePreloads, withLowPriorityPreloads } from "./html-head";

const enc = new TextEncoder();
const dec = new TextDecoder();

async function through(chunks: string[]): Promise<string> {
  const stream = new ReadableStream<Uint8Array>({
    start(c) {
      for (const s of chunks) c.enqueue(enc.encode(s));
      c.close();
    },
  }).pipeThrough(headRewriter());
  let out = "";
  const reader = stream.getReader();
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    out += dec.decode(value, { stream: true });
  }
  return out + dec.decode();
}

describe("lowerModulePreloads", () => {
  it("marks every modulepreload low priority and leaves other links alone", () => {
    const html =
      '<link rel="stylesheet" href="/a.css"/><link rel="modulepreload" href="/x.js"/><link rel="modulepreload" href="/y.js"/>';
    expect(dec.decode(lowerModulePreloads(enc.encode(html)))).toBe(
      '<link rel="stylesheet" href="/a.css"/><link rel="modulepreload" fetchpriority="low" href="/x.js"/><link rel="modulepreload" fetchpriority="low" href="/y.js"/>',
    );
  });

  it("returns the same bytes when there is nothing to change", () => {
    const bytes = enc.encode("<p>hi</p>");
    expect(lowerModulePreloads(bytes)).toBe(bytes);
  });
});

describe("headRewriter", () => {
  it("rewrites only the head, even when the tag and a multi-byte character straddle chunks", async () => {
    const out = await through([
      '<!doctype html><html><head><link rel="module',
      'preload" href="/x.js"/></head><body><p>Dar es Sal',
      "aam — Kundu",
      'chi</p><link rel="modulepreload" href="/body.js"/></body></html>',
    ]);
    expect(out).toBe(
      '<!doctype html><html><head><link rel="modulepreload" fetchpriority="low" href="/x.js"/></head><body><p>Dar es Salaam — Kunduchi</p><link rel="modulepreload" href="/body.js"/></body></html>',
    );
  });

  it("passes a document with no head through unchanged", async () => {
    expect(await through(["<p>oops</p>"])).toBe("<p>oops</p>");
  });
});

describe("withLowPriorityPreloads", () => {
  it("leaves non-HTML responses untouched", async () => {
    const res = new Response('{"a":1}', { headers: { "content-type": "application/json" } });
    expect(withLowPriorityPreloads(res)).toBe(res);
  });

  it("rewrites an HTML response and keeps its status and headers", async () => {
    const res = new Response('<head><link rel="modulepreload" href="/x.js"/></head>', {
      status: 404,
      headers: { "content-type": "text/html; charset=utf-8", "x-test": "1" },
    });
    const out = withLowPriorityPreloads(res);
    expect(out.status).toBe(404);
    expect(out.headers.get("x-test")).toBe("1");
    expect(await out.text()).toBe(
      '<head><link rel="modulepreload" fetchpriority="low" href="/x.js"/></head>',
    );
  });
});
