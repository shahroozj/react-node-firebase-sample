import { useEffect, useState } from "react";
import { signOut, type User } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

interface Note {
    id: string;
    text: string;
    userId: string;
    createdAt: string;
}

const API_URL = "http://127.0.0.1:5001/react-notes-sample/australia-southeast1/api"; // replace if deployed

export default function Notes({ user }: { user: User }) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [newNoteText, setNewNoteText] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const fetchNotes = async () => {
        try {
            setLoading(true);
            const token = await user.getIdToken();
            const res = await fetch(`${API_URL}/notes`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setNotes(data);
        } catch {
            setError("Failed to load notes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, []);

    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNoteText.trim()) return;

        try {
            setSaving(true);
            const token = await user.getIdToken();
            const res = await fetch(`${API_URL}/notes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ text: newNoteText }),
            });
            const newNote = await res.json();
            setNotes((prev) => [...prev, newNote]);
            setNewNoteText("");
        } catch {
            setError("Failed to add note");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteNote = async (id: string) => {
        const token = await user.getIdToken();
        await fetch(`${API_URL}/notes/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });
        setNotes((prev) => prev.filter((n) => n.id !== id));
    };

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 text-gray-800">
            {/* Header */}
            <header className="flex justify-between items-center px-6 py-4 bg-white/10 backdrop-blur-md shadow-md">
                <h1 className="text-2xl font-bold text-white">My Notes 📝</h1>
                <div className="flex items-center gap-4">
                    <span className="text-white hidden sm:block">{user.email}</span>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-sm bg-white text-blue-600 font-semibold rounded-md hover:bg-gray-100 transition"
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* Add Note Form */}
            <section className="max-w-3xl mx-auto mt-8 px-4">
                <form
                    onSubmit={handleAddNote}
                    className="flex gap-2 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg"
                >
                    <input
                        type="text"
                        placeholder="Write a note..."
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        className="flex-grow px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
                    />
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-5 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                    >
                        {saving ? "Saving..." : "Add"}
                    </button>
                </form>

                {error && (
                    <p className="text-red-500 text-center mt-4 font-medium">{error}</p>
                )}
            </section>

            {/* Notes List */}
            <section className="max-w-5xl mx-auto mt-10 px-4">
                {loading ? (
                    <p className="text-center text-white text-lg">Loading notes...</p>
                ) : notes.length === 0 ? (
                    <p className="text-center text-white text-lg">
                        No notes yet. Add one above!
                    </p>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                        {notes.map((note) => (
                            <div
                                key={note.id}
                                className="p-5 bg-white/90 backdrop-blur-md rounded-xl shadow-lg hover:shadow-2xl transition-all duration-200 relative"
                            >
                                <p className="text-gray-800 text-base mb-4 break-words">
                                    {note.text}
                                </p>
                                <button
                                    onClick={() => handleDeleteNote(note.id)}
                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition"
                                    title="Delete note"
                                >
                                    ✕
                                </button>
                                <span className="block text-sm text-gray-400">
                                  {new Date(note.createdAt || "").toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
