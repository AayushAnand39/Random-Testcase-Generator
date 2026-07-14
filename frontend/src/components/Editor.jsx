import React from "react";
import Editor from "@monaco-editor/react";
import {useState} from "react";
import {useRef} from "react";

const EditorComponent = ({
    generatorCode,
    setGeneratorCode,
    actualCode,
    setActualCode
}) => {
    const [numTests, setNumTests] = useState(5);
    const [loading,setLoading] = useState(false);

    const sendCode = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                "http://localhost:3000/generate-test-cases",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        generatorCode,
                        actualCode,
                        numberOfTestFiles: numTests,
                    }),
                }
            );
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Something went wrong.");
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "test_cases.zip";
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="container">
            <div className="editor-container">
                <div className="editor-box">
                    <div className="editor-title">
                        Generator Code
                    </div>
                    <Editor
                        height="75vh"
                        defaultLanguage="cpp"
                        value={generatorCode}
                        onChange={setGeneratorCode}
                        theme="vs-dark"
                    />
                </div>
                <div className="editor-box">
                    <div className="editor-title">
                        Actual Solution
                    </div>
                    <Editor
                        height="75vh"
                        defaultLanguage="cpp"
                        value={actualCode}
                        onChange={setActualCode}
                        theme="vs-dark"
                    />
                </div>
            </div>
            <div className="controls">
                <label>Number of Testcases</label>
                <input
                    type="number"
                    value={numTests}
                    min={1}
                    max={100}
                    onChange={(e)=>setNumTests(Number(e.target.value))}
                />
                <button
                    className="generate-btn"
                    disabled={loading}
                    onClick={sendCode}
                >
                    {loading ? "Generating..." : "Generate ZIP"}
                </button>
            </div>
        </div>
    )
}

export default EditorComponent