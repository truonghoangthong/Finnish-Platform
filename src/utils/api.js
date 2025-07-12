// src/utils/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api", 
  timeout: 10000,
});

export default api;

// ✅ Gọi thông tin mô tả bài học
export const fetchLessonIntro = async (level, lesson) => {
  try {
    const response = await api.get(`/learning/${level}/${lesson}`);
    return response.data.result;
  } catch (error) {
    console.error("Failed to fetch lesson intro:", error);
    return null;
  }
};

// ✅ Gửi tiến độ học (progress) cho từng module
export const updateProgress = async ({ userId, level, lesson, module, progress }) => {
  try {
    const response = await api.post('/progress', {
      userId,
      level,
      lesson,
      module,
      progress
    });
    return response.data;
  } catch (error) {
    console.error("❌ Failed to update progress:", error);
    return null;
  }
};
