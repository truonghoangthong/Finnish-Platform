import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api", 
  timeout: 10000,
});

export default api;

export const fetchLessonIntro = async (level, lesson) => {
  try {
    const response = await api.get(`/learning/${level}/${lesson}`);
    return response.data.result;
  } catch (error) {
    console.error("Failed to fetch lesson intro:", error);
    return null;
  }
};
