const geminiService = require('./geminiService');
const Task = require('../models/Task');

/**
 * Agent Workflow Engine
 * Responsible for reasoning, planning, and executing multi-step AI workflows.
 * Simulates "Gemini Act" by logging specific UI/Action steps.
 */
class WorkflowService {
    async executeAgentWorkflow(command, documentText = "", history = []) {
        console.log(`\n🤖 Agent Input Received: "${command}"`);

        const logs = [];
        const addLog = (message, status = 'success') => {
            logs.push({ message, status, timestamp: new Date() });
            console.log(`[LOG]: ${message}`);
        };

        try {
            addLog("Analyzing natural language command with Gemini 2.5 Flash...");

            // Step 1 & 2: Intent Detection
            const intentPrompt = `
        Analyze the following user command and identify all high-level intents.
        Command: "${command}"
        Possible intents: ["summarize_document", "generate_tasks", "plan_schedule", "draft_email", "general_chat"]
        
        Return ONLY a JSON object in this format:
        { "intents": ["intent1", "intent2"] }
      `;

            const analysisResponse = await geminiService.invokeGemini(intentPrompt, "You are an Intent Detection Agent.");
            let intents = ["general_chat"];

            try {
                const parsed = JSON.parse(analysisResponse.match(/\{.*\}/s)?.[0] || analysisResponse);
                intents = parsed.intents || intents;
            } catch (e) {
                if (command.toLowerCase().includes("summarize")) intents.push("summarize_document");
                if (command.toLowerCase().includes("task")) intents.push("generate_tasks");
            }

            addLog(`Reasoning complete. Identified intents: ${intents.join(', ')}`);

            // Step 3: Task Planning
            const executionPlan = intents.map((intent, index) => ({
                step: index + 1,
                action: intent
            })).filter(step => step.action !== "general_chat" || intents.length === 1);

            addLog(`Generated multi-step execution plan with ${executionPlan.length} actions.`);

            // Step 4: Execute Steps
            let finalResult = {
                reply: "",
                summary: null,
                tasks: [],
                emailDraft: null,
                workflowExecuted: intents,
                logs: logs // Pass simulation logs back to UI
            };

            for (const step of executionPlan) {
                try {
                    addLog(`Executing workflow step ${step.step}: ${step.action.replace('_', ' ')}...`);

                    // Simulating "Gemini Act" UI workflow steps
                    if (step.action === 'summarize_document') {
                        addLog("Parsing document segments & calculating multimodal embeddings...");
                        const textToSummarize = documentText || command;
                        finalResult.summary = await geminiService.summarizeDocument(textToSummarize);
                        finalResult.reply += `\n\n📄 **Summary:**\n${finalResult.summary}`;
                        addLog("Summary generated successfully.");
                    }

                    if (step.action === 'generate_tasks') {
                        addLog("Scanning content for actionable items (Gemini Reasoning)...");
                        const textForTasks = documentText || command;
                        const extractedTasks = await geminiService.generateTasks(textForTasks);

                        addLog(`Identified ${extractedTasks.length} potential tasks. Syncing with MongoDB...`);
                        for (const t of extractedTasks) {
                            try {
                                const savedTask = await Task.create({
                                    title: t.title,
                                    description: t.description || "Synthesized by Gemini Copilot",
                                    status: 'pending'
                                });
                                finalResult.tasks.push(savedTask);
                            } catch (taskError) {
                                addLog(`Failed to save task: ${t.title}`, 'warn');
                            }
                        }
                        finalResult.reply += `\n\n✅ Tasks extracted and added to your strategy pipeline.`;
                        addLog("Strategy pipeline updated.");
                    }

                    if (step.action === 'draft_email') {
                        addLog("Synthesizing professional email draft...");
                        const draftPrompt = `Draft a professional email based on this context: ${documentText || command}`;
                        finalResult.emailDraft = await geminiService.generateResponse(draftPrompt);
                        finalResult.reply += `\n\n📧 **Email Draft:**\n${finalResult.emailDraft}`;
                        addLog("Email draft synthesized.");
                    }

                    if (step.action === 'plan_schedule') {
                        addLog("Optimizing schedule for maximum productivity...");
                        const schedulePrompt = `Create a structured schedule based on this: ${command}`;
                        const schedule = await geminiService.generateResponse(schedulePrompt);
                        finalResult.reply += `\n\n📅 **Planned Schedule:**\n${schedule}`;
                        addLog("Schedule optimization complete.");
                    }

                    if (step.action === 'general_chat' && intents.length === 1) {
                        finalResult.reply = await geminiService.generateResponse(command, history);
                    }
                } catch (stepError) {
                    addLog(`Step ${step.action} failed: ${stepError.message}`, 'warn');
                    console.error(`Error in workflow step ${step.action}:`, stepError);
                    finalResult.reply += `\n\n⚠️ (Partial failure) Could not complete ${step.action.replace('_', ' ')}.`;
                }
            }

            addLog("Agentic workflow execution finished successfully.", 'success');
            return finalResult;

        } catch (error) {
            addLog(`Workflow failed: ${error.message}`, 'error');
            console.error("❌ Agent Workflow Error:", error);
            throw error;
        }
    }
}

module.exports = new WorkflowService();
