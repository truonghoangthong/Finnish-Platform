import api from "./api";

/**
 * Gửi tiến độ học (progress) của học viên lên server
 *
 * @param {string} userId - ID người dùng
 * @param {string} level - Ví dụ: "A1"
 * @param {string} lesson - Ví dụ: "the_break_room"
 * @param {string} module - Ví dụ: "module2"
 * @param {number|string} progress - Tiến độ: 25, 50, 75, 100
 */
export const updateProgress = async (
  userId,
  level,
  lesson,
  module,
  progress,
) => {
  try {
    const response = await api.post("/api/progress", {
      userId,
      level,
      lesson,
      module,
      progress: String(progress),
    });
    return response.data;
  } catch (error) {
    console.error("❌ Failed to update progress:", error);
    throw error;
  }
};
