import { create } from 'zustand';
import { fetchCourses, fetchProgress } from '../utils/getCourse';
const userId = "yugioh123";

export const useCourseStore = create((set) => ({
  lessons: [],
  activeLessonId: parseInt(localStorage.getItem("activeLessonTab")) || 1,
  activeSkill: localStorage.getItem("activeSkillTab") || "vocabulary",
  readyToStartSkill: null,
  error: null,
  loading: true,

  setActiveLessonId: (id) => {
    localStorage.setItem("activeLessonTab", id);
    set({ activeLessonId: id });
  },

  setActiveSkill: (skill) => {
    localStorage.setItem("activeSkillTab", skill);
    set({ activeSkill: skill });
  },

  setReadyToStartSkill: (skill) => set({ readyToStartSkill: skill }),

  fetchInitialData: async () => {
    try {
      const lessonsData = await fetchCourses();
      const updatedLessons = await fetchProgress(userId, "A1", lessonsData);
      set({ lessons: updatedLessons, loading: false });
    } catch (error) {
      set({ error: "Could not load lessons from backend.", loading: false });
    }
  },
}));