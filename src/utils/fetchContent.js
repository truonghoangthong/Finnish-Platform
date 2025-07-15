import axios from 'axios';

const getApiPath = (currentPath) => {
  const pathParts = currentPath.split('/');
  const level = pathParts[pathParts.indexOf('course') + 1] || 'a1';
  const moduleName = currentPath.includes('lesson-2') ? 'another_module' : 'the_break_room';
  return { level, moduleName };
};

export const fetchModuleData = async (currentPath, moduleNumber) => {
  try {
    const { level, moduleName } = getApiPath(currentPath);
    const parts = [`part${moduleNumber}a`, `part${moduleNumber}b`, `part${moduleNumber}c`];
    
    const result = {};
    
    for (const part of parts) {
      const url = `http://localhost:3000/api/studying/${level.toUpperCase()}/${moduleName}/module${moduleNumber}/${part}`;
      console.log(`Fetching data from: ${url}`); // Log URL
      
      const response = await axios.get(url);
      
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      console.log(`API response for ${part}:`, response.data); // Log response data
      
      result[part] = Object.entries(response.data.result[part])
        .filter(([key]) => key.startsWith('question'))
        .map(([key, question]) => {
          const [left, right] = question.script.split('/').map(s => s.trim());
          return { 
            pairId: key, 
            left, 
            right, 
            audioBase64: question.audioBase64 
          };
        });
    }
    
    return result;
  } catch (err) {
    console.error('Failed to load data:', err);
    throw err;
  }
};