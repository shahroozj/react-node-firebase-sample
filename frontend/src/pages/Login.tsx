import { useState } from "react";
import { auth } from "../firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSignup, setIsSignup] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("")
        setLoading(true);

        try {
            if (isSignup) {
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            navigate("/notes");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 p-6">
            <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
                    {isSignup ? "Create Account" : "Welcome to Notes"}
                </h2>
                <p className="text-center text-gray-500 mb-8">
                    {isSignup ? "Sign up to get started" : "Log in to continue"}
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-gray-700 text-sm mb-2" htmlFor="email">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label
                            className="block text-gray-700 text-sm mb-2"
                            htmlFor="password"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && <p className="text-red-500 text-center text-sm">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 text-white font-semibold rounded-lg transition-all bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90"
                    >
                        {loading
                            ? "Please wait..."
                            : isSignup
                                ? "Sign Up"
                                : "Login"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    {isSignup ? "Already have an account?" : "Don’t have an account?"}{" "}
                    <button
                        type="button"
                        onClick={() => setIsSignup(!isSignup)}
                        className="text-blue-500 hover:text-blue-600 font-semibold transition-colors"
                    >
                        {isSignup ? "Login" : "Sign Up"}
                    </button>
                </div>
            </div>
        </div>
    );
}
