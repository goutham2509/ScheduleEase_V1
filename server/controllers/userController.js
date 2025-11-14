export const getMe = async (req, res) => {
  res.json({
    id: "tempUserId",
    name: "Test User",
    email: "test@example.com",
    role: "student"
  });
};
