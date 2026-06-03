const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const User = require("../models/User");
const Ticket = require("../models/Ticket");
const Comment = require("../models/Comment");
const jwt = require("jsonwebtoken");

// Mock external services to prevent network calls and dependencies during testing
jest.mock("../services/geminiService", () => ({
  analyzeTicket: jest.fn().mockResolvedValue({
    category: "technical",
    priority: "high",
    summary: "Mocked AI Summary",
    suggestion: "Mocked AI Suggested Action Steps",
  }),
}));

jest.mock("../services/cloudinaryService", () => ({
  uploadToCloudinary: jest.fn().mockResolvedValue("http://res.cloudinary.com/mock/image.png"),
  isCloudinaryConfigured: false,
}));

beforeAll(async () => {
  process.env.JWT_SECRET = "test_jwt_secret_key_for_supportsphere_ai";
  const mongoUri = "mongodb://127.0.0.1:27017/support_sphere_test";
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  if (mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
  }
  await mongoose.connection.close();
});

describe("Tickets API Endpoints", () => {
  let verifiedUser, otherUser, supportAgent;
  let verifiedToken, otherToken, supportToken;

  beforeEach(async () => {
    await User.deleteMany({});
    await Ticket.deleteMany({});
    await Comment.deleteMany({});

    // Create test users representing different ranks in RBAC matrix
    verifiedUser = await User.create({
      name: "Verified User",
      email: "user@domain.com",
      password: "Password123!",
      role: "📁 verified_user",
      isVerified: true,
    });
    verifiedToken = jwt.sign({ userId: verifiedUser._id, role: verifiedUser.role, email: verifiedUser.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

    otherUser = await User.create({
      name: "Other User",
      email: "other@domain.com",
      password: "Password123!",
      role: "📁 verified_user",
      isVerified: true,
    });
    otherToken = jwt.sign({ userId: otherUser._id, role: otherUser.role, email: otherUser.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

    supportAgent = await User.create({
      name: "Support Agent",
      email: "agent@domain.com",
      password: "Password123!",
      role: "⚙️ support_agent",
      isVerified: true,
    });
    supportToken = jwt.sign({ userId: supportAgent._id, role: supportAgent.role, email: supportAgent.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
  });

  describe("POST /api/tickets", () => {
    it("should allow verified users to create tickets (with AI prediction mapping)", async () => {
      const res = await request(app)
        .post("/api/tickets")
        .set("Authorization", `Bearer ${verifiedToken}`)
        .send({
          title: "My wifi is not working in hostel block C",
          description: "Cannot connect since morning, it keeps authenticating.",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe("My wifi is not working in hostel block C");
      expect(res.body.data.category).toBe("technical"); // AI prediction mapped
      expect(res.body.data.priority).toBe("high"); // AI prediction mapped
      expect(res.body.data.aiSummary).toBe("Mocked AI Summary");
    });
  });

  describe("GET /api/tickets", () => {
    beforeEach(async () => {
      // Seed tickets
      await Ticket.create({
        title: "User Ticket 1",
        description: "Desc 1",
        category: "hostel",
        priority: "low",
        createdBy: verifiedUser._id,
      });

      await Ticket.create({
        title: "User Ticket 2",
        description: "Desc 2",
        category: "academic",
        priority: "medium",
        createdBy: otherUser._id,
      });
    });

    it("should restrict standard users to viewing only their own tickets", async () => {
      const res = await request(app)
        .get("/api/tickets")
        .set("Authorization", `Bearer ${verifiedToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tickets).toHaveLength(1);
      expect(res.body.data.tickets[0].title).toBe("User Ticket 1");
    });

    it("should allow support agents to view all tickets in the system", async () => {
      const res = await request(app)
        .get("/api/tickets")
        .set("Authorization", `Bearer ${supportToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tickets).toHaveLength(2);
    });
  });

  describe("PUT /api/tickets/:id", () => {
    let ticket;

    beforeEach(async () => {
      ticket = await Ticket.create({
        title: "Test Ticket",
        description: "Need help",
        createdBy: verifiedUser._id,
        status: "pending",
      });
    });

    it("should allow creator to update status to resolved or closed", async () => {
      const res = await request(app)
        .put(`/api/tickets/${ticket._id}`)
        .set("Authorization", `Bearer ${verifiedToken}`)
        .send({ status: "resolved" });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("resolved");
      expect(res.body.data.resolvedAt).toBeDefined();
    });

    it("should reject creator attempting to change status to pending or in_progress", async () => {
      // Set ticket to resolved first
      ticket.status = "resolved";
      await ticket.save();

      const res = await request(app)
        .put(`/api/tickets/${ticket._id}`)
        .set("Authorization", `Bearer ${verifiedToken}`)
        .send({ status: "pending" });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should allow support agents to update status to in_progress or pending", async () => {
      const res = await request(app)
        .put(`/api/tickets/${ticket._id}`)
        .set("Authorization", `Bearer ${supportToken}`)
        .send({ status: "in_progress" });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("in_progress");
    });
  });

  describe("POST /api/tickets/:id/collaborators", () => {
    let ticket;

    beforeEach(async () => {
      ticket = await Ticket.create({
        title: "Collaborative Ticket",
        description: "Let us solve this",
        createdBy: verifiedUser._id,
      });
    });

    it("should allow creator to add a collaborator via email address", async () => {
      const res = await request(app)
        .post(`/api/tickets/${ticket._id}/collaborators`)
        .set("Authorization", `Bearer ${verifiedToken}`)
        .send({ email: otherUser.email });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.collaborators).toHaveLength(1);
      expect(res.body.data.collaborators[0].email).toBe(otherUser.email);
    });

    it("should allow the collaborator to view the ticket details and add comments", async () => {
      // Add otherUser as collaborator
      ticket.collaborators.push(otherUser._id);
      await ticket.save();

      // Verify collaborator can retrieve details
      const detailRes = await request(app)
        .get(`/api/tickets/${ticket._id}`)
        .set("Authorization", `Bearer ${otherToken}`);

      expect(detailRes.status).toBe(200);
      expect(detailRes.body.data.title).toBe("Collaborative Ticket");

      // Verify collaborator can add comments
      const commentRes = await request(app)
        .post(`/api/tickets/${ticket._id}/comments`)
        .set("Authorization", `Bearer ${otherToken}`)
        .send({ message: "I am collaborating on this!" });

      expect(commentRes.status).toBe(201);
      expect(commentRes.body.success).toBe(true);
      expect(commentRes.body.data.message).toBe("I am collaborating on this!");
    });
  });
});
