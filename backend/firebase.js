const admin = require("firebase-admin");
const serviceAccount = require("../firebase-credential/react-notes-sample-firebase-adminsdk.json"); // update path if different

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const verifyAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Missing token" });

    const token = authHeader.split(" ")[1];
    try {
        const decoded = await admin.auth().verifyIdToken(token);
        req.user = decoded;
        console.log("decoded=" , decoded)
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid token" });
    }
};

module.exports = {
    db,
    verifyAuth
};