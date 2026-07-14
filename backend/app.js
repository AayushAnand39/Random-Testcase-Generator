const express = require('express');
const app = express();
const cors = require('cors');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const { finished } = require("stream/promises");
const archiver = require('archiver');
const {spawn} = require('child_process');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get('/',(req,res)=>{
    res.send('Hello world')
})

const PORT = process.env.PORT || 3000;

function compile(source, exe) {
    return new Promise((resolve, reject) => {
        console.log("Compiling:", source);

        const compiler = spawn("g++", [
            source,
            "-std=c++20",
            "-O2",
            "-o",
            exe
        ]);

        let output = "";

        compiler.stdout.on("data", d => {
            output += d.toString();
            console.log("STDOUT:", d.toString());
        });

        compiler.stderr.on("data", d => {
            output += d.toString();
            console.log("STDERR:", d.toString());
        });

        compiler.on("spawn", () => {
            console.log("Compiler spawned successfully");
        });

        compiler.on("error", err => {
            console.log("Spawn error:", err);
            reject(err);
        });

        const timer = setTimeout(() => {
            console.log("Compilation timeout");
            compiler.kill("SIGKILL");
            reject(new Error("Compilation timed out."));
        }, 30000);

        compiler.on("close", code => {
            clearTimeout(timer);
            console.log("Compiler exited with", code);

            if (code === 0)
                resolve();
            else
                reject(new Error(output));
        });
    });
}

function runGenerator(exe, outputFile) {
    return new Promise((resolve, reject) => {
        console.log("Starting generator:", exe);
        const child = spawn(exe);
        child.on("spawn", () => {
            console.log("Generator spawned successfully");
        });
        const output = fs.createWriteStream(outputFile);
        let stderr = "";
        const timer = setTimeout(() => {
            console.log("Generator timed out!");
            console.log("stderr:", stderr);
            child.kill("SIGKILL");
            reject(new Error("Generator timed out."));
        }, 30000);
        child.stderr.on("data", data => {
            stderr += data.toString();
            console.log("Generator stderr:", data.toString());
        });
        child.on("error", err => {
            clearTimeout(timer);
            console.log("Generator process error:", err);
            reject(err);
        });
        output.on("error", err => {
            clearTimeout(timer);
            console.log("Output stream error:", err);
            reject(err);
        });
        child.stdout.pipe(output);
        child.on("close", async (code) => {
            clearTimeout(timer);
            console.log("Generator exited with code:", code);
            try {
                await finished(output);
                console.log("Output file written successfully");
                if (code === 0)
                    resolve();
                else
                    reject(new Error(stderr || `Generator exited with code ${code}`));

            } catch (err) {
                reject(err);
            }
        });
    });
}

function runSolution(exe, inputFile, outputFile) {
    return new Promise((resolve, reject) => {
        console.log("Starting solution:", exe);
        console.log("Input file:", inputFile);
        console.log("Output file:", outputFile);
        const child = spawn(exe);
        child.on("spawn", () => {
            console.log("Solution spawned successfully");
        });
        const input = fs.createReadStream(inputFile);
        const output = fs.createWriteStream(outputFile);
        let stderr = "";
        const timer = setTimeout(() => {
            console.log("Solution timed out!");
            console.log("stderr:", stderr);
            child.kill("SIGKILL");
            reject(new Error("Solution timed out."));
        }, 30000);
        input.on("error", err => {
            console.log("Input stream error:", err);
            clearTimeout(timer);
            reject(err);
        });
        output.on("error", err => {
            console.log("Output stream error:", err);
            clearTimeout(timer);
            reject(err);
        });
        child.stderr.on("data", data => {
            stderr += data.toString();
            console.log("Solution stderr:", data.toString());
        });
        child.on("error", err => {
            console.log("Solution process error:", err);
            clearTimeout(timer);
            reject(err);
        });
        input.pipe(child.stdin);
        child.stdout.pipe(output);
        child.on("close", async (code) => {
            clearTimeout(timer);
            console.log("Solution exited with code:", code);
            try {
                await finished(output);
                console.log("Output file written successfully");
                if (code === 0)
                    resolve();
                else
                    reject(new Error(stderr || `Solution exited with code ${code}`));

            } catch (err) {
                console.log("Finished(output) error:", err);
                reject(err);
            }
        });
    });
}

function zipWorkspace(workspace) {
    return new Promise((resolve, reject) => {
        const zipPath = path.join(workspace, "testcases.zip");
        const output = fs.createWriteStream(zipPath);
        console.log(typeof archiver);
        console.log(archiver);
        const archive = archiver("zip", {
            zlib: { level: 9 }
        });
        output.on("close", () => {
            resolve(zipPath);
        });
        archive.on("error", reject);
        archive.pipe(output);
        // Add both folders
        archive.directory(path.join(workspace, "inputs"), "inputs");
        archive.directory(path.join(workspace, "outputs"), "outputs");
        archive.finalize();
    });

}

app.post('/generate-test-cases',async (req,res)=>{
    const { generatorCode, actualCode, numberOfTestFiles } = req.body;
    if (!generatorCode || !actualCode) {
        return res.status(400).json({
            success: false,
            error: "Generator code and actual code are required."
        });
    }
    if (
        typeof generatorCode !== "string" ||
        typeof actualCode !== "string"
    ) {
        return res.status(400).json({
            success: false,
            error: "Invalid code."
        });
    }
    if (generatorCode.length > 100000) {
        return res.status(400).json({
            success: false,
            error: "Generator code too large."
        });
    }
    if (actualCode.length > 100000) {
        return res.status(400).json({
            success: false,
            error: "Solution code too large."
        });
    }
    if (
        !Number.isInteger(numberOfTestFiles) ||
        numberOfTestFiles < 1 ||
        numberOfTestFiles > 100
    ) {
        return res.status(400).json({
            success: false,
            error: "numberOfTestFiles must be between 1 and 100."
        });
    }
    const workspace = path.join(__dirname, "temp", Date.now().toString());
    const inputFolder = path.join(workspace, "inputs");
    const outputFolder = path.join(workspace, "outputs");
    try {
        await fsp.mkdir(inputFolder, { recursive: true });
        await fsp.mkdir(outputFolder, { recursive: true });
        const generatorPath = path.join(workspace, "gen.cpp");
        const actualPath = path.join(workspace, "actual.cpp");
        await fsp.writeFile(generatorPath, generatorCode);
        await fsp.writeFile(actualPath, actualCode);
        const generatorExe = path.join(workspace, "gen");
        const actualExe = path.join(workspace, "actual");
        // compile only once
        await compile(generatorPath, generatorExe);
        await compile(actualPath, actualExe);
        for (let i = 1; i <= numberOfTestFiles; i++) {
            console.log("Start testcase", i);
            const inputFile = path.join(inputFolder, `input${i}.txt`);
            const outputFile = path.join(outputFolder, `output${i}.txt`);
            await runGenerator(generatorExe, inputFile);
            console.log("Generator finished", i);
            await runSolution(
                actualExe,
                inputFile,
                outputFile
            );
            console.log("Solution finished", i);
        }
        const zipPath = await zipWorkspace(workspace);
        res.download(zipPath, "testcases.zip");
    } catch (err) {
        console.error(err);
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                error: err.message
            });
        }
    } finally {
        try {
            await fsp.rm(workspace, {
                recursive: true,
                force: true
            });
        } catch (e) {
            console.error(e);
        }
    }
})

app.listen(PORT, () => {
    console.log('Server is running on port 3000');
})
