const OpenAI = require("openai");

const client = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: process.env.GEMINI_BASE_URL
});

const MODEL = process.env.GEMINI_MODEL;

function stripCodeFences(text) {
    return text
        .replace(/^```json\s*/i, "")
        .replace(/^```cpp\s*/i, "")
        .replace(/^```c\+\+\s*/i, "")
        .replace(/^```/i, "")
        .replace(/```$/i, "")
        .trim();
}

async function analyzeProblem({ actualCode, constraints, ragContext = "" }) {
    const prompt = `
        You are analyzing a competitive programming problem.

        Given:
        1. The accepted solution code
        2. The constraints

        Return ONLY valid JSON with this schema:
        {
        "input_format": "string",
        "important_constraints": ["string"],
        "edge_cases": ["string"],
        "generation_strategy": ["string"],
        "notes": "string"
        }

        Actual code:
        ${actualCode}

        Constraints:
        ${constraints}

        Relevant similar problems / templates:
        ${ragContext}
        `;

    const res = await client.chat.completions.create({
        model: MODEL,
        messages: [
        { role: "system", content: "Return only JSON." },
        { role: "user", content: prompt }
        ],
        temperature: 0.2
    });

    return JSON.parse(stripCodeFences(res.choices[0].message.content));
}

async function generateGeneratorCode({ actualCode, constraints, analysis, ragContext = "" }) {
    const prompt = `
        You are a senior competitive programming engineer.

        Write a complete, compilable C++20 generator.cpp.

        Rules:
        - Output ONLY code
        - Use mt19937
        - Generate valid input only
        - Respect the constraints exactly
        - Include edge cases and random cases
        - Do not explain anything

        Actual code:
        ${actualCode}

        Constraints:
        ${constraints}

        Analysis:
        ${JSON.stringify(analysis, null, 2)}

        Relevant similar problems / templates:
        ${ragContext}
        `;

    const res = await client.chat.completions.create({
        model: MODEL,
        messages: [
        { role: "system", content: "You return only complete C++ code." },
        { role: "user", content: prompt }
        ],
        temperature: 0.4
    });

    return stripCodeFences(res.choices[0].message.content);
}

async function regenerateGeneratorCode({
    currentCode,
    feedback,
    actualCode,
    constraints,
    analysis,
    ragContext = ""
    }) {
    const prompt = `
        Fix and improve the generator code.

        User feedback:
        ${feedback}

        Current code:
        ${currentCode}

        Actual code:
        ${actualCode}

        Constraints:
        ${constraints}

        Analysis:
        ${JSON.stringify(analysis, null, 2)}

        Relevant similar problems / templates:
        ${ragContext}

        Rules:
        - Return ONLY complete compilable C++20 code
        - Keep valid input generation
        - Apply the feedback properly
        `;

    const res = await client.chat.completions.create({
        model: MODEL,
        messages: [
        { role: "system", content: "You return only complete C++ code." },
        { role: "user", content: prompt }
        ],
        temperature: 0.2
    });

    return stripCodeFences(res.choices[0].message.content);
}

async function fixGeneratorCode({
    currentCode,
    compilerError,
    actualCode,
    constraints,
    analysis,
    ragContext = ""
}) {
    const prompt = `
        Fix this C++ generator code.

        Compiler/runtime error:
        ${compilerError}

        Current code:
        ${currentCode}

        Actual code:
        ${actualCode}

        Constraints:
        ${constraints}

        Analysis:
        ${JSON.stringify(analysis, null, 2)}

        Relevant similar problems / templates:
        ${ragContext}

        Rules:
        - Return ONLY complete compilable C++20 code
        - Fix only what is necessary
        - Keep the same purpose
        `;

    const res = await client.chat.completions.create({
        model: MODEL,
        messages: [
        { role: "system", content: "You return only complete C++ code." },
        { role: "user", content: prompt }
        ],
        temperature: 0.2
    });

    return stripCodeFences(res.choices[0].message.content);
}

module.exports = {
    analyzeProblem,
    generateGeneratorCode,
    regenerateGeneratorCode,
    fixGeneratorCode
};