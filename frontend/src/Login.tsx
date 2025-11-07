import { useState } from "react";
import { auth } from "./firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "firebase/auth";

interface Props {
    onLogin: (user: any) => void;
}

export default function Login({ onLogin }: Props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSignup, setIsSignup] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            let userCredential;
            if (isSignup) {
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
            } else {
                userCredential = await signInWithEmailAndPassword(auth, email, password);
            }
            onLogin(userCredential.user);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: "60px auto", textAlign: "center" }}>
            <h2>{isSignup ? "Sign Up" : "Login"}</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ display: "block", margin: "10px auto", padding: "8px", width: "90%" }}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ display: "block", margin: "10px auto", padding: "8px", width: "90%" }}
                />
                <button type="submit" style={{ padding: "8px 16px", marginTop: 10 }}>
                    {isSignup ? "Sign Up" : "Login"}
                </button>
            </form>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <p>
                {isSignup ? "Already have an account?" : "Need an account?"}{" "}
                <button
                    type="button"
                    onClick={() => setIsSignup(!isSignup)}
                    style={{ border: "none", color: "blue", background: "none", cursor: "pointer" }}
                >
                    {isSignup ? "Login" : "Sign Up"}
                </button>
            </p>
        </div>
    );
}
