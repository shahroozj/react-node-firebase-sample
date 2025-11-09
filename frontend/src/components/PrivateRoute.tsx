import { Navigate } from "react-router-dom";
import { type User } from "firebase/auth";
import { type JSX} from "react";

export default function PrivateRoute({
                                         user,
                                         children,
                                     }: {
    user: User | null;
    children: JSX.Element;
}) {
    if (!user) return <Navigate to="/login" replace />;
    return children;
}
