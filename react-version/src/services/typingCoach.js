import { firebaseAIReady, getFirebaseServices } from '../firebase.js';
import { buildTypingCoachPrompt } from '../utils/typingCoachPrompt.js';

export async function requestTypingCoachFeedback(metrics) {
  if (!firebaseAIReady) {
    throw new Error('AI Coach ko secure rakhne ke liye Firebase App Check setup chahiye.');
  }
  const { app } = await getFirebaseServices();
  const aiSdk = await import('firebase/ai');
  const ai = aiSdk.getAI(app, { backend: new aiSdk.GoogleAIBackend() });
  const model = aiSdk.getGenerativeModel(ai, {
    model: import.meta.env.VITE_GEMINI_MODEL || 'gemini-3.8-flash',
    generationConfig: { temperature: 0.3, maxOutputTokens: 180 },
  });
  const response = await model.generateContent(buildTypingCoachPrompt(metrics));
  return response.response.text().trim();
}
