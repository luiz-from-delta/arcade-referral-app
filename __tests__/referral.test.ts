import { generateReferralCode } from "@/lib/referral";

jest.mock("@/lib/db", () => ({
  db: {
    user: {
      findUniqueOrThrow: jest.fn(),
      count: jest.fn(),
    },
  },
}));

import { getMetrics } from "@/lib/referral";
import { db } from "@/lib/db";

const mockDb = db as unknown as {
  user: {
    findUniqueOrThrow: jest.Mock;
    count: jest.Mock;
  };
};

describe("generateReferralCode", () => {
  it("returns an 8-character string", () => {
    const code = generateReferralCode();
    expect(code).toHaveLength(8);
  });

  it("returns a different code on each call", () => {
    expect(generateReferralCode()).not.toBe(generateReferralCode());
  });
});

describe("getMetrics", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns zero rate when no invites have been sent", async () => {
    mockDb.user.findUniqueOrThrow.mockResolvedValue({
      id: "user-1",
      referralCode: "abc12345",
      invitesSent: 0,
    });
    mockDb.user.count.mockResolvedValue(2);

    const metrics = await getMetrics("user-1");

    expect(metrics.invitesSent).toBe(0);
    expect(metrics.conversions).toBe(2);
    expect(metrics.rate).toBe(0);
  });

  it("computes conversion rate correctly", async () => {
    mockDb.user.findUniqueOrThrow.mockResolvedValue({
      id: "user-1",
      referralCode: "abc12345",
      invitesSent: 10,
    });
    mockDb.user.count.mockResolvedValue(4);

    const metrics = await getMetrics("user-1");

    expect(metrics.invitesSent).toBe(10);
    expect(metrics.conversions).toBe(4);
    expect(metrics.rate).toBeCloseTo(0.4);
  });

  it("returns 100% rate when all invites converted", async () => {
    mockDb.user.findUniqueOrThrow.mockResolvedValue({
      id: "user-1",
      referralCode: "abc12345",
      invitesSent: 5,
    });
    mockDb.user.count.mockResolvedValue(5);

    const metrics = await getMetrics("user-1");

    expect(metrics.rate).toBe(1);
  });

  it("queries conversions using the user referral code", async () => {
    mockDb.user.findUniqueOrThrow.mockResolvedValue({
      id: "user-1",
      referralCode: "abc12345",
      invitesSent: 1,
    });
    mockDb.user.count.mockResolvedValue(1);

    await getMetrics("user-1");

    expect(mockDb.user.count).toHaveBeenCalledWith({
      where: { referredBy: "abc12345" },
    });
  });
});
