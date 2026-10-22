/**
 * Lets the stylesheet win the line on slow connections.
 *
 * TanStack Start writes a `<link rel="modulepreload">` for every script
 * chunk the page will need, about forty of them, and the browser fetches
 * those at the same priority as the stylesheet. Measured on a throttled
 * 1.6 Mbps phone on 2026-10-22, the 30 KB stylesheet arrived at 1.8 s
 * behind some 200 KB of JavaScript, and the page cannot paint without it.
 *
 * This marks every modulepreload in the head `fetchpriority="low"`. The
 * hints stay, so hydration still starts early, but the stylesheet, the
 * hero photograph and the HTML itself go first.
 *
 * The rewrite works on bytes, not decoded text: the head is buffered until
 * `</head>` is seen, the ASCII tag is replaced within it, and everything
 * after streams through untouched, so a multi-byte character split across
 * chunks can never be damaged.
 */

const HEAD_END = ascii("</head>");
const FROM = ascii('<link rel="modulepreload"');
const TO = ascii('<link rel="modulepreload" fetchpriority="low"');

function ascii(s: string): Uint8Array {
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
}

function indexOf(hay: Uint8Array, needle: Uint8Array, from = 0): number {
  outer: for (let i = from; i <= hay.length - needle.length; i++) {
    for (let j = 0; j < needle.length; j++) if (hay[i + j] !== needle[j]) continue outer;
    return i;
  }
  return -1;
}

function concat(a: Uint8Array, b: Uint8Array): Uint8Array {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

/** Replaces every occurrence of FROM with TO in `bytes`. */
export function lowerModulePreloads(bytes: Uint8Array): Uint8Array {
  const parts: Uint8Array[] = [];
  let pos = 0;
  for (;;) {
    const i = indexOf(bytes, FROM, pos);
    if (i === -1) break;
    parts.push(bytes.subarray(pos, i), TO);
    pos = i + FROM.length;
  }
  if (parts.length === 0) return bytes;
  parts.push(bytes.subarray(pos));
  return parts.reduce(concat, new Uint8Array(0));
}

/**
 * A stream transform that applies lowerModulePreloads to the document head
 * and passes the body through as it arrives.
 */
export function headRewriter(): TransformStream<Uint8Array, Uint8Array<ArrayBuffer>> {
  let head: Uint8Array = new Uint8Array(0);
  let inHead = true;
  /* The stream types want a plain ArrayBuffer-backed view; a subarray of
     one is exactly that, this just says so. */
  const own = (u: Uint8Array): Uint8Array<ArrayBuffer> => u as Uint8Array<ArrayBuffer>;
  return new TransformStream<Uint8Array, Uint8Array<ArrayBuffer>>({
    transform(chunk, controller) {
      if (!inHead) {
        controller.enqueue(own(chunk));
        return;
      }
      head = concat(head, chunk);
      const end = indexOf(head, HEAD_END);
      if (end === -1) return;
      inHead = false;
      controller.enqueue(own(lowerModulePreloads(head.subarray(0, end))));
      controller.enqueue(own(head.subarray(end)));
      head = new Uint8Array(0);
    },
    flush(controller) {
      /* No </head> ever arrived (an error page, say): send what was held. */
      if (head.length) controller.enqueue(own(head));
    },
  });
}

/** Applies the rewrite to an HTML response; any other response is returned as is. */
export function withLowPriorityPreloads(response: Response): Response {
  const type = response.headers.get("content-type") ?? "";
  if (!type.includes("text/html") || !response.body) return response;
  return new Response(response.body.pipeThrough(headRewriter()), {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}
