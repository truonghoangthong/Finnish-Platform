import {openai} from '../config/openRouter-config.js';

const evaluateTranslation = async (finnishSentence, userTranslation) => {
  const SYSTEM_PROMPT = `You are a language tutor. Evaluate a Finnish sentence and its learner's English translation, focusing strictly on grammar and vocabulary. Provide detailed feedback for grammar and vocabulary, each explaining specific strengths and errors. Conclude with a single overall feedback summarizing the evaluation. Do not offer additional help, paraphrases, or suggestions beyond the feedback. Do not include numerical scores. Format the response as a JSON object with the following structure:

{ "grammar_feedback": "Detailed explanation of grammar strengths and errors.", "vocabulary_feedback": "Detailed explanation of vocabulary strengths and errors.", "overall_feedback": "Concise summary of the overall evaluation.", "encouragement": "1-2 concise sentences providing encouragement or advice." }

If no sentence is provided, use a sample Finnish sentence and its English translation. Ensure the response adheres strictly to the specified JSON format.`;
  const userContent = `Please evaluate the following:\n- Finnish sentence:'${finnishSentence}'\n- Learner's English translation: '${userTranslation}'`;
  try {
    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-chat-v3-0324:free",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent }
      ],
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Evaluation failed:", error);
    throw error;
  }
};

export { evaluateTranslation };