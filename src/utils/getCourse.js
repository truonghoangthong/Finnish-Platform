import axios from "axios";

const BASE_URL = "http://localhost:3000/api";

export const fetchLessons = async (level = "A1") => {
  try {
    const response = await axios.get(`${BASE_URL}/learning/${level}`);
    return response.data.result.map((item, index) => ({
      id: index + 1,
      lessonName: item.lessonName,
      fullTitle: `Lesson ${index + 1} – ${formatTitle(item.lessonName)}`,
      shortTitle: formatTitle(item.lessonName),
      description: item.description,
      image: item.imageLink,
      skills: {
        vocabulary: { status: 0 },
        listening: { status: 0 },
        writing: { status: 0 },
        reading: { status: 0 },
      },
    }));
  } catch (error) {
    console.error("Failed to fetch lessons:", error.message);
    throw error;
  }
};

export const fetchProgress = async (userId, level = "A1", lessons) => {
  try {
    return await Promise.all(
      lessons.map(async (lesson) => {
        const res = await axios.get(
          `${BASE_URL}/progress/${userId}/${level}/${lesson.lessonName}`
        );
        const p = res.data.result[lesson.lessonName];
        return {
          ...lesson,
          skills: {
            vocabulary: { status: parseProgress(p?.module1) },
            listening: { status: parseProgress(p?.module2) },
            writing: { status: parseProgress(p?.module3) },
            reading: { status: parseProgress(p?.module4) },
          },
        };
      })
    );
  } catch (error) {
    console.error("Failed to fetch progress:", error.message);
    throw error;
  }
};

const formatTitle = (str) =>
  str
    .replace(/_/g, " ")
    .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());

const parseProgress = (val) => {
  if (!val) return 0;
  const percent = parseInt(val);
  return isNaN(percent) ? 0 : percent;
};