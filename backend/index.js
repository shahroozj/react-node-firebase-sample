const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const { db, verifyAuth} = require("./firebase")

const app = express();
const PORT = 4000;

// Middleware
app.use(cors());          // allow frontend to call this API
app.use(express.json());  // parse JSON request body

// Temporary in-memory "database"
// let notes = [
//     { id: 1, text: "First note from the server" },
//     { id: 2, text: "You can add new notes from the React app" },
// ];
const notesCollection = db.collection("notes");

// Routes
app.get("/", (req, res) => {
    res.send("Backend is running ✅");
});

// Get all notes
app.get("/api/notes", verifyAuth, async (req, res) => {
    try {
        const userId = req.user.uid;
        const snapshot = await db.collection("notes").where("userId", "==", userId).get();
        const notes = snapshot.docs.map((doc) => doc.data());
        res.json(notes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch notes" });
    }
});

// Add a new note
app.post("/api/notes", verifyAuth, async (req, res) => {
    const { text } = req.body;
    const userId = req.user.uid;

    if (!text || text.trim() === "") {
        return res.status(400).json({ error: "Text is required" });
    }

    const newNote = {
        id: uuidv4(),
        text: text.trim(),
        userId,
        createdAt: new Date().toISOString()
    };

    try {
        await notesCollection.doc(newNote.id).set(newNote);
        res.status(201).json(newNote);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to add note" });
    }
});

// Delete a note
app.delete("/api/notes/:id",async (req, res) => {
    const id = req.params.id;
    const userId = req.user.uid;

    try {
        const doc = await notesCollection.doc(id).get();
        if (!doc.exists || doc.data().userId !== userId) {
            return res.status(403).json({ error: "Not authorized" });
        }

        await notesCollection.doc(id).delete();
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete note" });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
