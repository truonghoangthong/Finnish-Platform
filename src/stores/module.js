import { create } from 'zustand';
import { fetchModuleData, evaluateTranslation } from '../utils/getModule';

export const useModuleStore = create((set, get) => ({
  moduleData: null,
  loading: true,
  error: null,
  currentAudio: null,
  activeAudio: null,
  
  translations: {},  // part4b
  answers: {},       // part4c
  feedbackModal: {
    show: false,
    part4b: [],
    part4c: []
  },
  checkingAnswers: false,

  fetchModuleData: async (level, moduleName, moduleNumber) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchModuleData(level, moduleName, moduleNumber);
      set({ moduleData: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  setCurrentAudio: (audio) => set({ currentAudio: audio }),
  setActiveAudio: (audio) => set({ activeAudio: audio }),

  setTranslation: (id, value) => set((state) => ({
    translations: { ...state.translations, [id]: value }
  })),

  setAnswer: (id, isTrue) => set((state) => ({
    answers: { ...state.answers, [id]: isTrue }
  })),

  checkAnswers: async () => {
    const { moduleData, translations, answers } = get();
    set({ checkingAnswers: true });
    
    try {
      const part4cResults = moduleData.part4c.questions?.map(item => ({
        question: item.text,
        userAnswer: answers[item.id],
        correctAnswer: item.answer,
        isCorrect: answers[item.id] === item.answer
      })) || [];

      const part4bEvaluations = await Promise.all(
        moduleData.part4b.questions?.map(async (item) => {
          try {
            const response = await evaluateTranslation(
              item.text,
              translations[item.id] || ''
            );
            return {
              question: item.text,
              userTranslation: translations[item.id] || '',
              feedback: response.feedback
            };
          } catch (error) {
            return {
              question: item.text,
              userTranslation: translations[item.id] || '',
              feedback: `Error evaluating translation: ${error.message}`
            };
          }
        }) || []
      );

      set({
        feedbackModal: {
          show: true,
          part4b: part4bEvaluations,
          part4c: part4cResults
        },
        checkingAnswers: false
      });
    } catch (error) {
      console.error("Error checking answers:", error);
      set({ checkingAnswers: false });
    }
  },

  closeFeedbackModal: () => set({
    feedbackModal: {
      show: false,
      part4b: [],
      part4c: []
    }
  })
}));