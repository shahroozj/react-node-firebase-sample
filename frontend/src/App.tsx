import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "./firebase";
import Login from "./pages/Login";
import Notes from "./pages/Notes";
import PrivateRoute from "./components/PrivateRoute";

export default function App() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    if (loading) return <p>Loading...</p>;

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                    path="/notes"
                    element={
                        <PrivateRoute user={user}>
                            <Notes user={user!} />
                        </PrivateRoute>
                    }
                />
                <Route path="*" element={<Login />} />
            </Routes>
        </Router>
    );
}
