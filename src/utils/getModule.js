import axios from "axios";

const BASE_URL =
  " https://finnish-platform-thong-truongs-projects.vercel.app/api";

export const fetchModuleData = async (level, moduleName, moduleNumber) => {
  try {
    // Xác định các phần cần fetch dựa trên moduleNumber
    let partsToFetch = [];
    switch (moduleNumber) {
      case 1:
        partsToFetch = ["part1a", "part1b"];
        break;
      case 2:
        partsToFetch = ["part2a", "part2b"];
        break;
      case 3:
        partsToFetch = ["part3a", "part3b", "part3c"];
        break;
      case 4:
        partsToFetch = ["part4a", "part4b", "part4c"];
        break;
      default:
        throw new Error(`Invalid module number: ${moduleNumber}`);
    }

    // Gọi API cho các phần tương ứng
    const responses = await Promise.all(
      partsToFetch.map((part) =>
        axios.get(
          `${BASE_URL}/studying/${level.toUpperCase()}/${moduleName}/module${moduleNumber}/${part}`,
        ),
      ),
    );

    // Tạo object kết quả với các phần tương ứng
    const result = {};
    partsToFetch.forEach((part, index) => {
      result[part] = responses[index]?.data?.result?.[part] || {};
    });

    return result;
  } catch (error) {
    console.error("Error fetching module data:", error);
    throw error;
  }
};

export const evaluateTranslation = async (finnishSentence, userTranslation) => {
  try {
    const response = await axios.post(`${BASE_URL}/evaluate`, {
      finnishSentence,
      userTranslation,
    });
    return response.data;
  } catch (error) {
    console.error("Error evaluating translation:", error);
    throw error;
  }
};
