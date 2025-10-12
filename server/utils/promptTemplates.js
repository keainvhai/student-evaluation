// utils/promptTemplates.js
module.exports = {
  courseDescription: (title) => `
Write a course description for a university course titled "${title}".
Limit your response to within 50 words in one short paragraph.
`,

  //   peerEvaluation: (evaluateeName, context) => `
  // You are an academic writing assistant.
  // Write a short, constructive peer evaluation for teammate "${evaluateeName}".
  // Focus on collaboration, responsibility, and communication.
  // ${context ? `Context: ${context}` : ""}
  // Keep it within 3–4 sentences.
  // `,

  // ✅ 当信息不足时，引导用户补充要点
  peerEvaluationClarify: (evaluateeName) => `
I don't have enough information to write feedback for "${evaluateeName}".
Please provide short notes for each item below:
1) Role / Tasks they handled
2) Concrete contributions (what/when/impact)
3) Collaboration & communication examples
4) Strengths
5) Areas to improve (1–2)
6) Overall score (1–5)
I will not fabricate details.
`,

  // ✅ 当用户提供了足够信息后，再生成完整反馈
  peerEvaluationV2: (evaluateeName, details = {}, context = "") => `
You are an academic writing assistant. Write a short, constructive peer evaluation.
Never invent or exaggerate information; only use the facts below.

Teammate: "${evaluateeName}"

Facts provided:
- Role/Tasks: ${details.role || "-"}
- Contributions: ${details.contributions || "-"}
- Collaboration & Communication: ${details.collab || "-"}
- Strengths: ${details.strengths || "-"}
- Areas to improve: ${details.improvements || "-"}
- Score (1–5): ${details.score || "-"}

Additional notes: ${context || "-"}

Write 3–5 sentences that are specific, respectful, and actionable.
If there is no data, say "I need more context to provide helpful feedback."
`,

  //   discussionReply: (post) => `
  // Write a short, empathetic, relevant reply to this discussion post:
  // "${post}"
  // `,
};
