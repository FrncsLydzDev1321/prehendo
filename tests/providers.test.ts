import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { AIUnavailableError, chatJSON, type Provider } from "@/lib/ai/providers";

const p = (name: string): Provider => ({ name, model: `${name}-model`, url: `https://${name}.test`, apiKey: "k", jsonMode: false });
const reply = (content: string) => new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status: 200 });

afterEach(() => vi.unstubAllGlobals());

describe("chatJSON", () => {
  const schema = z.object({ message: z.string() });

  it("falls back to the next provider when the first fails", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("overloaded", { status: 503 }))
      .mockResolvedValueOnce(reply('```json\n{"message":"hi"}\n```'));
    vi.stubGlobal("fetch", fetchMock);

    const r = await chatJSON([p("a"), p("b")], [{ role: "user", content: "x" }], schema);
    expect(r.data.message).toBe("hi");
    expect(r.provider.name).toBe("b");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("rejects malformed output and throws when every provider fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(reply('{"wrong": true}')));
    await expect(chatJSON([p("a")], [{ role: "user", content: "x" }], schema)).rejects.toBeInstanceOf(AIUnavailableError);
  });
});
