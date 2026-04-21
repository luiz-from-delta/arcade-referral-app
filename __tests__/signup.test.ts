jest.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn().mockResolvedValue({
    set: jest.fn(),
  }),
}));

import { POST } from "@/app/api/auth/signup/route";
import { db } from "@/lib/db";

const mockDb = db as unknown as {
  user: { findUnique: jest.Mock; create: jest.Mock };
};

function makeRequest(body: object) {
  return new Request("http://localhost/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/signup", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 400 when email is missing", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Email is required");
  });

  it("returns 409 when email is already registered", async () => {
    mockDb.user.findUnique.mockResolvedValueOnce({ id: "existing" });

    const res = await POST(makeRequest({ email: "alice@example.com" }));
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toBe("Email already registered");
  });

  it("creates a user without referredBy when no ref is provided", async () => {
    mockDb.user.findUnique.mockResolvedValueOnce(null);
    mockDb.user.create.mockResolvedValueOnce({
      id: "user-1",
      email: "alice@example.com",
      referralCode: "xxxxxxx0",
    });

    const res = await POST(makeRequest({ email: "alice@example.com" }));
    expect(res.status).toBe(200);
    expect(mockDb.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ referredBy: null }),
      })
    );
  });

  it("creates a user without referredBy when ref does not match any user", async () => {
    mockDb.user.findUnique
      .mockResolvedValueOnce(null)  // duplicate check
      .mockResolvedValueOnce(null); // referrer lookup
    mockDb.user.create.mockResolvedValueOnce({
      id: "user-1",
      email: "alice@example.com",
      referralCode: "xxxxxxx1",
    });

    const res = await POST(makeRequest({ email: "alice@example.com", ref: "unknown" }));
    expect(res.status).toBe(200);
    expect(mockDb.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ referredBy: null }),
      })
    );
  });

  it("sets referredBy when a valid ref is provided", async () => {
    mockDb.user.findUnique
      .mockResolvedValueOnce(null)                                    // duplicate check
      .mockResolvedValueOnce({ referralCode: "referrerCode" });       // referrer lookup
    mockDb.user.create.mockResolvedValueOnce({
      id: "user-1",
      email: "alice@example.com",
      referralCode: "xxxxxxx2",
    });

    const res = await POST(makeRequest({ email: "alice@example.com", ref: "referrerCode" }));
    expect(res.status).toBe(200);
    expect(mockDb.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ referredBy: "referrerCode" }),
      })
    );
  });

  it("normalizes email to lowercase before saving", async () => {
    mockDb.user.findUnique.mockResolvedValueOnce(null);
    mockDb.user.create.mockResolvedValueOnce({
      id: "user-1",
      email: "alice@example.com",
      referralCode: "xxxxxxx3",
    });

    await POST(makeRequest({ email: "  Alice@Example.COM  " }));
    expect(mockDb.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ email: "alice@example.com" }),
      })
    );
  });
});
