import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import admin from "firebase-admin";
import crypto from "crypto";
import fs from "fs";

// Helper to get Firebase Admin instance
let _db: admin.firestore.Firestore | null = null;
const getDb = () => {
  if (!_db) {
    try {
      const configPath = path.join(process.cwd(), "firebase-applet-config.json");
      if (fs.existsSync(configPath)) {
        const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        if (!admin.apps.length) {
          admin.initializeApp({
            projectId: firebaseConfig.projectId,
          });
        }
        _db = admin.firestore(firebaseConfig.firestoreDatabaseId);
      } else {
        console.warn("firebase-applet-config.json not found. Backend features may be disabled.");
      }
    } catch (error) {
      console.error("Failed to initialize Firebase Admin:", error);
    }
  }
  return _db;
};

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);


  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", env: process.env.NODE_ENV || 'development' });
  });

  // Gemini AI Proxy Route
    app.post("/api/ai/chat", async (req, res) => {
    const { messages, systemInstruction } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      return;
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: systemInstruction 
      });

      const history = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const lastMessage = messages[messages.length - 1].content;

      const chat = model.startChat({ history });
      const result = await chat.sendMessage(lastMessage);
      const response = await result.response;
      
      res.json({ text: response.text() });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to generate AI response";
      console.error("AI Proxy Error:", error);
      res.status(500).json({ error: errorMessage });
    }
  });

  // --- Invite Code System ---

  // Simple in-memory rate limiter for join attempts
  // Key: userId:ip or just userId
  const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();

  const checkRateLimit = (userId: string) => {
    const attempt = failedAttempts.get(userId);
    if (!attempt) return true;
    
    // 10 minutes window
    const windowMs = 10 * 60 * 1000;
    if (Date.now() - attempt.lastAttempt > windowMs) {
      failedAttempts.delete(userId);
      return true;
    }
    
    return attempt.count < 5;
  };

  const trackFailedAttempt = (userId: string) => {
    const attempt = failedAttempts.get(userId) || { count: 0, lastAttempt: 0 };
    attempt.count += 1;
    attempt.lastAttempt = Date.now();
    failedAttempts.set(userId, attempt);
  };

  // Helper to generate secure invite code
  const generateInviteCode = (): string => {
    // 5 random numbers
    const numbers = Array.from({ length: 5 }, () => crypto.randomInt(0, 10)).join('');
    // 1 random uppercase alphabet
    const char = String.fromCharCode(crypto.randomInt(65, 91)); // A-Z
    return `${numbers}${char}`;
  };

  // Middleware to verify Auth Token
  const authenticate = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authentication required." });
    }
    const token = authHeader.split(" ")[1];
    try {
      getDb(); // Ensure admin is initialized
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      next();
    } catch (error) {
      return res.status(401).json({ error: "Invalid or expired token." });
    }
  };

  // API: Generate Invite Code
  app.post("/api/invites/generate", authenticate, async (req: any, res: any) => {
    const { teamId } = req.body;
    const userId = req.user.uid;

    if (!teamId) return res.status(400).json({ error: "Team ID is required." });

    try {
      const db = getDb();
      if (!db) return res.status(500).json({ error: "Database not available." });

      // Collision prevention
      let code = "";
      let isUnique = false;
      let attempts = 0;
      
      while (!isUnique && attempts < 10) {
        code = generateInviteCode();
        const doc = await db.collection("invites").doc(code).get();
        if (!doc.exists) isUnique = true;
        attempts++;
      }

      if (!isUnique) {
        return res.status(500).json({ error: "Code collision detected. Regenerating..." });
      }

      const invite = {
        code,
        teamId,
        createdBy: userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours
        uses: 0,
        maxUses: 10,
        active: true
      };

      await db.collection("invites").doc(code).set(invite);
      res.json({ code });
    } catch (error) {
      console.error("Generate Invite Error:", error);
      res.status(500).json({ error: "Failed to generate invite code." });
    }
  });

  // API: Join Team via Invite Code
  app.post("/api/invites/join", authenticate, async (req: any, res: any) => {
    const { code } = req.body;
    const userId = req.user.uid;

    if (!code) return res.status(400).json({ error: "Invite code is required." });

    // Sanitize input
    const sanitizedCode = code.trim().toUpperCase().slice(0, 6);

    // Rate limiting check
    if (!checkRateLimit(userId)) {
      return res.status(429).json({ error: "Too many attempts. Try again later." });
    }

    // Strict regex validation
    if (!/^\d{5}[A-Z]$/.test(sanitizedCode)) {
      trackFailedAttempt(userId);
      return res.status(400).json({ error: "Invite code format is invalid." });
    }

    try {
      const db = getDb();
      if (!db) return res.status(500).json({ error: "Database not available." });
      
      const inviteRef = db.collection("invites").doc(sanitizedCode);
      const inviteDoc = await inviteRef.get();

      if (!inviteDoc.exists) {
        trackFailedAttempt(userId);
        return res.status(404).json({ error: "Invite code does not exist." });
      }

      const inviteData = inviteDoc.data()!;

      // Expiry Check
      const expiresAt = inviteData.expiresAt.toDate();
      if (Date.now() > expiresAt.getTime()) {
        await inviteRef.update({ active: false });
        trackFailedAttempt(userId);
        return res.status(410).json({ error: "This invite code has expired." });
      }

      // Active Check
      if (!inviteData.active) {
        trackFailedAttempt(userId);
        return res.status(410).json({ error: "This invite has been revoked." });
      }

      // Max Uses Check
      if (inviteData.uses >= inviteData.maxUses) {
        await inviteRef.update({ active: false });
        trackFailedAttempt(userId);
        return res.status(410).json({ error: "This invite code is no longer available." });
      }

      // Team Existence Check
      const teamRef = db.collection("teams").doc(inviteData.teamId);
      const teamDoc = await teamRef.get();
      if (!teamDoc.exists) {
        trackFailedAttempt(userId);
        return res.status(404).json({ error: "Workspace no longer exists." });
      }

      // Already Member Check
      const memberRef = teamRef.collection("members").doc(userId);
      const memberDoc = await memberRef.get();
      if (memberDoc.exists) {
        return res.status(409).json({ error: "You are already part of this workspace." });
      }

      // Perform Join (Atomic Transaction)
      await db.runTransaction(async (transaction) => {
        // Increment uses
        transaction.update(inviteRef, { 
          uses: admin.firestore.FieldValue.increment(1) 
        });

        // Add member
        transaction.set(memberRef, {
          team_id: inviteData.teamId,
          user_id: userId,
          role: "member",
          joined_at: admin.firestore.FieldValue.serverTimestamp()
        });

        // Hybrid architecture: Update membership array for fast filtering
        transaction.update(teamRef, {
          members: admin.firestore.FieldValue.arrayUnion(userId)
        });
      });

      // Clear failed attempts on success
      failedAttempts.delete(userId);

      res.json({ success: true, teamId: inviteData.teamId, teamName: teamDoc.data()?.name });
    } catch (error) {
      console.error("Join Team Error:", error);
      res.status(500).json({ error: "Missing or insufficient permissions." });
    }
  });

  // Vite middleware for development
  const isProduction = process.env.NODE_ENV === "production";
  if (!isProduction) {

    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");

    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  }).on("error", (err) => {
    console.error("Server failed to start:", err);
  });

}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
