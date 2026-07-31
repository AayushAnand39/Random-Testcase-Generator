import React, { useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, RefreshCw, X, Sparkles, Download } from "lucide-react";
import "../App.css"; // change to "./App.css" if this file lives in src/

export default function AIWorkflowPage() {
  const API_URL = import.meta.env.VITE_BACKEND_URL;

  const [actualCode, setActualCode] = useState("");
  const [constraints, setConstraints] = useState("");
  const [generatorCode, setGeneratorCode] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [numTests, setNumTests] = useState(5);

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [status, setStatus] = useState("");

  const canSubmit = useMemo(() => {
    return actualCode.trim().length > 0 && constraints.trim().length > 0 && !loading;
  }, [actualCode, constraints, loading]);

  const openReviewModal = (code, nextAnalysis) => {
    setGeneratorCode(code);
    setAnalysis(nextAnalysis || null);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!actualCode.trim() || !constraints.trim()) {
      alert("Please provide both actual code and constraints.");
      return;
    }

    setLoading(true);
    setStatus("Generating generator code...");

    try {
      const res = await fetch(`${API_URL}/api/ai/generate-generator`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actualCode, constraints })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate generator code.");

      openReviewModal(data.generatorCode || "", data.analysis || null);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
      setStatus("");
    }
  };

  const handleRegenerate = async () => {
    if (!feedback.trim()) {
      alert("Please enter feedback before regenerating.");
      return;
    }

    setLoading(true);
    setStatus("Regenerating based on feedback...");

    try {
      const res = await fetch(`${API_URL}/api/ai/regenerate-generator`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentCode: generatorCode,
          feedback,
          actualCode,
          constraints,
          analysis
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to regenerate generator code.");

      setGeneratorCode(data.generatorCode || "");
      setShowFeedbackModal(false);
      setShowModal(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
      setStatus("");
    }
  };

  const handleApproveAndZip = async () => {
    setLoading(true);
    setStatus("Generating zip...");

    try {
      const res = await fetch(`${API_URL}/generate-test-cases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generatorCode,
          actualCode,
          numberOfTestFiles: numTests
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Zip generation failed.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "test_cases.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setShowModal(false);
      setShowFeedbackModal(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
      setStatus("");
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatorCode);
      setStatus("Generator code copied.");
      setTimeout(() => setStatus(""), 1500);
    } catch {
      alert("Copy failed.");
    }
  };

  return (
    <div className="ai-page">
      <div className="ai-page-inner">
        <section className="ai-hero">
          <div className="ai-hero-left">
            <div className="ai-badge">
              <Sparkles className="ai-badge-icon" />
              AI Testcase Generator
            </div>
            <h1 className="ai-title">Generate a testcase generator from the accepted solution and constraints.</h1>
            {/* <p className="ai-subtitle">
              Paste the solution, describe constraints, and let Gemini infer the input pattern,
              edge cases, and a complete C++ generator. Review, refine, approve, and export ZIP.
            </p> */}
          </div>

          <div className="ai-hero-right">
            <div className="ai-stat-grid">
              <div className="ai-stat-card">
                <div className="ai-stat-label">Step 1</div>
                <div className="ai-stat-value">Analyze</div>
                <div className="ai-stat-desc">Understand input and constraints</div>
              </div>
              <div className="ai-stat-card">
                <div className="ai-stat-label">Step 2</div>
                <div className="ai-stat-value">Review</div>
                <div className="ai-stat-desc">Check generated generator.cpp</div>
              </div>
              <div className="ai-stat-card">
                <div className="ai-stat-label">Step 3</div>
                <div className="ai-stat-value">Export</div>
                <div className="ai-stat-desc">Create the testcase ZIP</div>
              </div>
            </div>
          </div>
        </section>

        <div className="ai-stepper">
          <div className={`ai-step ${!generatorCode ? "active" : "done"}`}>1 · Input</div>
          <div className={`ai-step ${generatorCode && !showModal ? "active" : ""}`}>2 · Review Generator</div>
          <div className="ai-step">3 · ZIP</div>
        </div>

        {!generatorCode && (
          <section className="ai-stack">
            <div className="editor-card">
              <div className="editor-head">
                <div>
                  <h2>Accepted Solution.cpp</h2>
                  {/* <p>Paste the working solution here.</p> */}
                </div>
                <span>C++</span>
              </div>
              <Editor
                height="58vh"
                defaultLanguage="cpp"
                theme="vs-dark"
                value={actualCode}
                onChange={(v) => setActualCode(v || "")}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  wordWrap: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true
                }}
              />
            </div>

            <div className="editor-card">
              <div className="editor-head">
                <div>
                  <h2>Problem Constraints</h2>
                  {/* <p>Describe limits, ranges, and important conditions.</p> */}
                </div>
                <span>Text</span>
              </div>
              <textarea
                className="plain-textarea"
                placeholder={"Example:\n1 <= n <= 2e5\n0 <= a[i] <= 1e9"}
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
              />
            </div>

            <div className="control-panel">
              <div className="control-grid">
                <div className="control-block">
                  <label>Number of Testcases</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={numTests}
                    onChange={(e) => setNumTests(Number(e.target.value))}
                    className="plain-input"
                  />
                </div>

                <div className="control-block">
                  <label>Generate Generator</label>
                  <button
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className="btn btn-primary full-btn"
                  >
                    <Sparkles className="btn-icon" />
                    {loading ? "Working..." : "Submit"}
                  </button>
                </div>

                <div className="control-block">
                  <label>Status</label>
                  <div className="status-text">
                    {status || "Submit to generate the AI generator code."}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
          >
            <motion.div
              initial={{ scale: 0.96, y: 18 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 18 }}
              className="modal-shell"
            >
              <div className="modal-head">
                <div>
                  <h3>Generated Generator Code</h3>
                  <p>Review the AI-generated generator. Approve to continue, or regenerate with feedback.</p>
                </div>
                <button onClick={() => setShowModal(false)} className="icon-btn">
                  <X className="icon-sm" />
                </button>
              </div>

              <div className="review-grid">
                <div className="editor-card review-editor">
                  <div className="editor-head">
                    <div>
                      <h2>Generator.cpp</h2>
                      <p>Editable preview</p>
                    </div>
                    <span>C++</span>
                  </div>
                  <Editor
                    height="70vh"
                    defaultLanguage="cpp"
                    theme="vs-dark"
                    value={generatorCode}
                    onChange={(v) => setGeneratorCode(v || "")}
                    options={{
                      fontSize: 14,
                      minimap: { enabled: false },
                      wordWrap: "on",
                      scrollBeyondLastLine: false,
                      automaticLayout: true
                    }}
                  />
                </div>

                <div className="side-panel">
                  {analysis && (
                    <div className="info-card">
                      <div className="section-tag">
                        <span>AI Analysis</span>
                      </div>
                      <pre className="analysis-pre">{JSON.stringify(analysis, null, 2)}</pre>
                    </div>
                  )}

                  <div className="info-card">
                    <div className="section-tag">
                      <span>Actions</span>
                    </div>

                    <div className="action-stack">
                      <button onClick={handleCopy} className="btn btn-ghost">
                        <Copy className="btn-icon" />
                        Copy Generator Code
                      </button>

                      <button
                        onClick={() => {
                          setShowModal(false);
                          setShowFeedbackModal(true);
                        }}
                        className="btn btn-warning"
                      >
                        <RefreshCw className="btn-icon" />
                        Regenerate with Feedback
                      </button>

                      <button
                        onClick={handleApproveAndZip}
                        disabled={loading}
                        className="btn btn-success"
                      >
                        <Download className="btn-icon" />
                        {loading ? "Creating Zip..." : "Approve and Generate ZIP"}
                      </button>
                    </div>

                    <p className="helper-text">
                      On approval, this will call your existing <code>/generate-test-cases</code> endpoint using the AI-generated generator.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFeedbackModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
          >
            <motion.div
              initial={{ scale: 0.96, y: 18 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 18 }}
              className="feedback-shell"
            >
              <div className="modal-head">
                <div>
                  <h3>Feedback for Regeneration</h3>
                  <p>Tell the AI what to improve in the generator.</p>
                </div>
                <button onClick={() => setShowFeedbackModal(false)} className="icon-btn">
                  <X className="icon-sm" />
                </button>
              </div>

              <div className="feedback-body">
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={7}
                  className="feedback-textarea"
                  placeholder={
                    "Examples:\n- Add duplicate-heavy tests\n- Include minimum and maximum values\n- Generate sorted and reverse-sorted arrays\n- Add disconnected graphs"
                  }
                />

                <div className="feedback-actions">
                  <button onClick={() => setShowFeedbackModal(false)} className="btn btn-ghost">
                    Cancel
                  </button>

                  <button
                    onClick={handleRegenerate}
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    <RefreshCw className="btn-icon" />
                    {loading ? "Regenerating..." : "Regenerate"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}