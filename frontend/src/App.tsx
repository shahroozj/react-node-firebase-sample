import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "./firebase";
import Login from "./Login";

interface Note {
    id: string;
    text: string;
    userId: string;
}

const API_URL = "http://localhost:4000";

function App(){

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false)
    const [notes, setNotes] = useState<Note[]>([])
    const [error, setError] = useState("")
    const [newNoteText, setNewNoteText] = useState("")
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => setUser(user));
        return () => unsub();
    }, []);

    const fetchNotes = async () => {
        if (!user) {
            return;
        }
        try {
            setLoading(true);
            const token = await user.getIdToken();
            const res = await fetch(`${API_URL}/api/notes`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setNotes(data);
        } catch (err) {
            console.error(err);
            setError("Failed to load notes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, [user]);

    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newNoteText.trim()) return;

        try {
            setSaving(true);
            const token = await user.getIdToken();
            setError("");
            const res = await fetch(`${API_URL}/api/notes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ text: newNoteText }),
            });

            if (!res.ok) {
                throw new Error("Failed to add note");
            }

            const newNote: Note = await res.json();
            setNotes((prev) => [...prev, newNote]);
            setNewNoteText("");
        } catch (e){
            console.error(e);
            setError("Failed to add note");
        } finally {
            setSaving(false);
        }
    }

    const handleDeleteNote = async (id:string) =>{
        if (!user) return;

        try {
            const token = await user.getIdToken();
            await fetch(`${API_URL}/api/notes/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotes((prev) => prev.filter((n) => n.id !== id));
        } catch (err) {
            console.error(err);
            setError("Failed to delete note");
        }
    }

    if (!user) return <Login onLogin={setUser} />;

    return (
        <div style={{maxWidth: 600, margin: "40px auto", fontFamily: "sans-serif"}}>
            <h1>Notes for {user.email}</h1>
            <button onClick={() => signOut(auth)}>Logout</button>

            <form onSubmit={handleAddNote} style={{marginBottom: 20}}>
                <input
                    type="text"
                    placeholder="Write a note..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    style={{padding: 8, width: "70%", marginRight: 8}}
                />
                <button type="submit" disabled={saving || !newNoteText.trim()}>
                    {saving ? "Saving..." : "Add Note"}
                </button>
            </form>

            {error && <p style={{color: "red"}}>{error}</p>}

            {loading ? (
                <p>Loading notes...</p>
            ) : notes.length === 0 ? (
                <p>No notes yet. Add one!</p>
            ) : (
                <ul style={{listStyle: "none", padding: 0}}>
                    {notes.map((note) => (
                        <li
                            key={note.id}
                            style={{
                                padding: "8px 12px",
                                border: "1px solid #ccc",
                                borderRadius: 4,
                                marginBottom: 8,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <span>{note.text}</span>
                            <button onClick={() => handleDeleteNote(note.id)}>Delete</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default App;