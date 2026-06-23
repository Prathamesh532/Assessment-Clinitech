process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:55433/careview_test";
process.env.JWT_SECRET = "test-secret-that-is-long-enough-for-validation";
process.env.CLIENT_ORIGIN = "http://localhost:5173";
process.env.CLIENT_ORIGINS = "http://localhost:5173,http://127.0.0.1:5173";
