const { onRequest } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");


admin.initializeApp();
const db = getFirestore();

const app = express();
app.use(cors());
app.use(express.json());

// Middleware: verify Firebase Auth token
async function verifyAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Missing token" });

    const token = authHeader.split(" ")[1];
    try {
        req.user = await admin.auth().verifyIdToken(token);
        next();
    } catch {
        res.status(401).json({ error: "Invalid token" });
    }
}

app.get("/", (req, res) => {
    res.send("Backend is running ✅");
});

// Routes
app.get("/notes", verifyAuth, async (req, res) => {
    const userId = req.user.uid;
    const snapshot = await db.collection("notes").where("userId", "==", userId).get();
    const notes = snapshot.docs.map((doc) => doc.data());
    res.json(notes);
});

app.post("/notes", verifyAuth, async (req, res) => {
    const { text } = req.body;
    const userId = req.user.uid;
    const newNote = { id: uuidv4(), text, userId, createdAt: new Date().toISOString() };
    await db.collection("notes").doc(newNote.id).set(newNote);
    res.status(201).json(newNote);
});

app.delete("/notes/:id", verifyAuth, async (req, res) => {
    const id = req.params.id;
    const userId = req.user.uid;
    const doc = await db.collection("notes").doc(id).get();
    if (!doc.exists || doc.data().userId !== userId)
        return res.status(403).json({ error: "Not authorized" });

    await db.collection("notes").doc(id).delete();
    res.status(204).send();
});

// Export as a Cloud Function
exports.api = onRequest({ region: "australia-southeast1" }, app);
