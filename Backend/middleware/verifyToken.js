import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
    // 1. token from header
    const authHeader = req.headers.authorization;

    if (authHeader) {
        // Token format: "Bearer <token_string>"
        const token = authHeader.split(" ")[1];

        // 2. Token verify 
        jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
            if (err) {
                return res.status(403).json({ success: false, message: "Token is not valid!" });
            }

            // 3. Payload se User ID nikaal kar request object mein daal do
            // Ab ye req.user pure controller mein kahin bhi use ho sakta hai
            req.user = payload; 
            
            next(); // Agle step (Controller) par jao
        });
    } else {
        return res.status(401).json({ success: false, message: "You are not authenticated!" });
    }
};
export default verifyToken;