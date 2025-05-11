import { auth, isAdmin } from "./auth";

export { auth, isAdmin };

// For backward compatibility with code using the old interfaces
export const authenticateToken = auth;
export const authMiddleware = auth;

// Adding default export to prevent module resolution issues
export default {};
