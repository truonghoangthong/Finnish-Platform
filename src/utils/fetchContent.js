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
    const urls = parts.map(part => 
      `http://localhost:3000/api/studying/${level.toUpperCase()}/${moduleName}/module${moduleNumber}/${part}`
    );

    const responses = await Promise.all(urls.map(url => fetch(url)));
    const responseData = await Promise.all(responses.map(async (res) => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    }));

    return parts.reduce((acc, part, index) => {
      acc[part] = Object.entries(responseData[index].result[part])
        .filter(([key]) => key.startsWith('question'))
        .map(([key, question]) => {
          const [left, right] = question.script.split('/').map(s => s.trim());
          return { pairId: key, left, right, audioBase64: question.audioBase64 };
        });
      return acc;
    }, {});
  } catch (err) {
    console.error('Failed to load data:', err);
    throw err;
  }
};