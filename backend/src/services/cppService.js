const { spawn } = require("child_process");

function compileCpp(source, exe) {
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

            if (code === 0) resolve();
            else reject(new Error(output || `Compilation failed with code ${code}`));
        });
    });
}

module.exports = { compileCpp };