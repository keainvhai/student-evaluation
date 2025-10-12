// services/aiService.js
const OpenAI = require("openai");
const prompts = require("../utils/promptTemplates");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateAIContent(type, payload) {
  let prompt;
  switch (type) {
    case "course-description":
      prompt = prompts.courseDescription(payload.title);
      break;

    // case "peer-evaluation":
    //   prompt = prompts.peerEvaluation(payload.evaluateeName, payload.context);
    //   break;
    case "peer-evaluation": {
      const { evaluateeName, context, details } = payload || {};

      // ✅ 打印接收到的内容，方便调试
      console.log("🧠 AI Payload:", payload);

      const totalText =
        (context || "").trim().length +
        Object.values(details || {})
          .join(" ")
          .trim().length;

      // 信息不足 → 返回提示清单，不调用模型
      if (!evaluateeName || totalText < 20) {
        return prompts.peerEvaluationClarify(evaluateeName || "your teammate");
      }

      // 信息充足 → 调用 GPT 生成评价
      prompt = prompts.peerEvaluationV2(evaluateeName, details, context);
      break;
    }

    // case "discussion-reply":
    //   prompt = prompts.discussionReply(payload.post);
    //   break;
    default:
      throw new Error(`Unsupported AI type: ${type}`);
  }

  //待补充
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini", // 或 gpt-4-turbo
    messages: [
      { role: "system", content: "You are a helpful academic assistant." },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
  });

  return response.choices[0].message.content.trim();
}

module.exports = { generateAIContent };
