const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 4000;

// Middleware
app.use(cors());          // allow frontend to call this API
app.use(express.json());  // parse JSON request body

// Temporary in-memory "database"
let notes = [
    { id: 1, text: "First note from the server" },
    { id: 2, text: "You can add new notes from the React app" },
];

// Routes
app.get("/", (req, res) => {
    res.send("Backend is running ✅");
});

// Get all notes
app.get("/api/notes", (req, res) => {
    res.json(notes);
});

// Add a new note
app.post("/api/notes", (req, res) => {
    const { text } = req.body;

    if (!text || text.trim() === "") {
        return res.status(400).json({ error: "Text is required" });
    }

    const newNote = {
        id: uuidv4(),
        text: text.trim(),
    };

    notes.push(newNote);

    console.log("newNote is added" , newNote)

    res.status(201).json(newNote);
});

// Delete a note
app.delete("/api/notes/:id", (req, res) => {
    const id = Number(req.params.id);
    notes = notes.filter((note) => note.id !== id);
    res.status(204).send();
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
