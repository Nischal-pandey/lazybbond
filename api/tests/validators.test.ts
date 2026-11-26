import assert from "node:assert/strict";
import test from "node:test";
import {
  communitySchema,
  messageSchema,
  planSchema,
  privacySchema,
  registrationSchema,
} from "../src/validators.ts";

test("registration normalizes email and display-name whitespace", () => {
  const result = registrationSchema.parse({
    email: "  PERSON@example.com ",
    displayName: "  Plan maker ",
    password: "a secure passphrase",
  });

  assert.equal(result.email, "person@example.com");
  assert.equal(result.displayName, "Plan maker");
});

test("registration rejects passwords shorter than twelve characters", () => {
  assert.throws(() => registrationSchema.parse({
    email: "person@example.com",
    displayName: "Plan maker",
    password: "short",
  }));
});

test("plan validation converts dates and supplies public visibility", () => {
  const startsAt = new Date(Date.now() + 60 * 60 * 1000);
  const expiresAt = new Date(startsAt.getTime() + 60 * 60 * 1000);
  const result = planSchema.parse({
    title: "Coffee after work",
    description: "Meet for a relaxed coffee near the square.",
    category: "Coffee",
    startsAt: startsAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    maxParticipants: 5,
    approximateArea: "Central district",
  });

  assert.ok(result.startsAt instanceof Date);
  assert.equal(result.visibility, "PUBLIC");
});

test("plan validation rejects expired starts and participant overflow", () => {
  const past = new Date(Date.now() - 60 * 60 * 1000);
  const later = new Date(Date.now() + 60 * 60 * 1000);
  const input = {
    title: "Coffee after work",
    description: "Meet for a relaxed coffee near the square.",
    category: "Coffee",
    startsAt: past.toISOString(),
    expiresAt: later.toISOString(),
    maxParticipants: 5,
    approximateArea: "Central district",
  };
  assert.throws(() => planSchema.parse(input));
  assert.throws(() => planSchema.parse({
    ...input,
    startsAt: later.toISOString(),
    expiresAt: new Date(later.getTime() + 60 * 60 * 1000).toISOString(),
    maxParticipants: 51,
  }));
});

test("privacy updates must change at least one setting", () => {
  assert.throws(() => privacySchema.parse({}));
  assert.deepEqual(privacySchema.parse({ discoverable: false }), { discoverable: false });
});

test("community and message validators trim input and enforce content limits", () => {
  const community = communitySchema.parse({
    name: "  Good Food Club ",
    description: " A group for people who love discovering places to eat. ",
    category: "Food",
  });
  assert.equal(community.name, "Good Food Club");
  assert.equal(community.isPublic, true);
  assert.equal(messageSchema.parse({ body: "  Sounds good! " }).body, "Sounds good!");
  assert.throws(() => messageSchema.parse({ body: "  " }));
});
