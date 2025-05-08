import { authenticateToken, isAdmin } from "./authMiddleware";

export { authenticateToken, isAdmin };

// For backward compatibility with code using the old interface
export const authMiddleware = authenticateToken;

// Adding default export to prevent module resolution issues
export default {};
