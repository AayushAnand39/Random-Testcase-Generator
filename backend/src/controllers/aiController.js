const fs = require("fs/promises");
const path = require("path");

const {
    analyzeProblem,
    generateGeneratorCode,
    regenerateGeneratorCode,
    fixGeneratorCode
} = require("../services/llmService");

const { compileCpp } = require("../services/cppService");

function makeJobDir() {
    return path.join(__dirname, "..", "temp", `ai_${Date.now()}`);
}

async function analyze(req, res) {
    try {
        const { actualCode, constraints } = req.body;

        if (!actualCode || !constraints) {
            return res.status(400).json({
                success: false,
                error: "actualCode and constraints are required"
            });
        }

        const ragContext = ""
        const analysis = await analyzeProblem({ actualCode, constraints, ragContext });

        return res.json({
            success: true,
            analysis
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
}

async function generateGenerator(req, res) {
    try {
        const { actualCode, constraints } = req.body;

        if (!actualCode || !constraints) {
            return res.status(400).json({
                success: false,
                error: "actualCode and constraints are required"
            });
        }

        const ragContext = ""
        const analysis = await analyzeProblem({ actualCode, constraints, ragContext });

        let generatorCode = await generateGeneratorCode({
            actualCode,
            constraints,
            analysis,
            ragContext
        });

        const jobDir = makeJobDir();
        await fs.mkdir(jobDir, { recursive: true });

        const cppPath = path.join(jobDir, "generator.cpp");
        const exePath = path.join(jobDir, process.platform === "win32" ? "generator.exe" : "generator.out");

        await fs.writeFile(cppPath, generatorCode, "utf8");

        let compiled = false;
        let lastError = "";

        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                await compileCpp(cppPath, exePath);
                compiled = true;
                break;
            } catch (err) {
                lastError = err.message;
                generatorCode = await fixGeneratorCode({
                    currentCode: generatorCode,
                    compilerError: lastError,
                    actualCode,
                    constraints,
                    analysis,
                    ragContext
                });
                await fs.writeFile(cppPath, generatorCode, "utf8");
            } finally {
                if (jobDir) {
                    try {
                        await fs.rm(jobDir, { recursive: true, force: true });
                    } catch (cleanupErr) {
                        console.error("AI temp cleanup failed:", cleanupErr);
                    }
                }
            }
        }

        if (!compiled) {
            return res.status(500).json({
                success: false,
                error: "Generator compilation failed",
                compilerError: lastError,
                analysis
            });
        }

        return res.json({
            success: true,
            analysis,
            generatorCode,
            jobDir
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
}

async function regenerateGenerator(req, res) {
    try {
        const { currentCode, feedback, actualCode, constraints, analysis } = req.body;

        if (!currentCode || !feedback || !actualCode || !constraints || !analysis) {
            return res.status(400).json({
                success: false,
                error: "currentCode, feedback, actualCode, constraints and analysis are required"
            });
        }

        const ragContext = "";
        const generatorCode = await regenerateGeneratorCode({
            currentCode,
            feedback,
            actualCode,
            constraints,
            analysis,
            ragContext
        });

        return res.json({
            success: true,
            generatorCode
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
}

module.exports = {
  analyze,
  generateGenerator,
  regenerateGenerator
};