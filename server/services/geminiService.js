/**
 * Service to integrate Google Gemini AI API
 */

const getFallbackAnalysis = (title, description) => {
  const content = `${title} ${description}`.toLowerCase();
  let category = "other";
  let priority = "medium";
  let suggestion = "Our support staff has been notified and will investigate the issue shortly.";

  if (
    content.includes("wifi") ||
    content.includes("internet") ||
    content.includes("network") ||
    content.includes("router") ||
    content.includes("switch") ||
    content.includes("server") ||
    content.includes("website") ||
    content.includes("pc") ||
    content.includes("computer")
  ) {
    category = "technical";
    priority = "high";
    suggestion = "Check local Ethernet cables, perform a router power cycle, and check the network switch lights. If offline, dispatch an IT hardware technician.";
  } else if (
    content.includes("hostel") ||
    content.includes("room") ||
    content.includes("mess") ||
    content.includes("warden") ||
    content.includes("bed") ||
    content.includes("leak") ||
    content.includes("water") ||
    content.includes("light")
  ) {
    category = "hostel";
    suggestion = "Schedule a physical room maintenance visit. Contact the warden desk or plumbing/electrical supervisor.";
  } else if (
    content.includes("exam") ||
    content.includes("class") ||
    content.includes("course") ||
    content.includes("faculty") ||
    content.includes("grade") ||
    content.includes("academic") ||
    content.includes("syllabus")
  ) {
    category = "academic";
    suggestion = "Reference the academic syllabus, review course registration portals, or consult the department program advisor.";
  } else if (
    content.includes("fees") ||
    content.includes("receipt") ||
    content.includes("document") ||
    content.includes("admission") ||
    content.includes("refund") ||
    content.includes("admin")
  ) {
    category = "administrative";
    suggestion = "Verify document status with the central registry or admin department counter. Retain payment receipts.";
  } else if (
    content.includes("theft") ||
    content.includes("stolen") ||
    content.includes("guard") ||
    content.includes("fight") ||
    content.includes("security") ||
    content.includes("safety") ||
    content.includes("harass")
  ) {
    category = "security";
    priority = "critical";
    suggestion = "Alert the on-duty campus security force, locate nearest CCTV cameras, and notify security supervisors immediately.";
  }

  if (
    content.includes("urgent") ||
    content.includes("emergency") ||
    content.includes("asap") ||
    content.includes("immediately") ||
    content.includes("critical")
  ) {
    priority = "critical";
  } else if (content.includes("broken") || content.includes("fail") || content.includes("down")) {
    priority = "high";
  }

  return {
    category,
    priority,
    summary: title.substring(0, 80),
    suggestion,
  };
};

const analyzeTicket = async (title, description) => {
  const apiKey = process.env.GEMINI_API_KEY;

  // Validate API key config
  if (!apiKey || apiKey === "your_gemini_api_key" || apiKey.includes("placeholder")) {
    console.warn("Gemini API key is not configured. Falling back to local heuristic analysis.");
    return getFallbackAnalysis(title, description);
  }

  try {
    const prompt = `
      You are an expert customer support agent. Analyze the following support ticket:
      Title: "${title}"
      Description: "${description}"

      Analyze and return a JSON object with the following fields:
      1. "category": Must be exactly one of: "technical", "hostel", "academic", "administrative", "security", "other".
      2. "priority": Must be exactly one of: "low", "medium", "high", "critical".
      3. "summary": A concise one-sentence summary of the user's issue (maximum 15 words).
      4. "suggestion": A helpful, professional, step-by-step suggested action or reply that support staff can use to resolve this issue.

      Output ONLY a valid JSON object. Do not include markdown code block backticks (like \`\`\`json).
    `;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    // Call Gemini API using Node's native fetch
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error("Empty candidate response text received from Gemini API");
    }

    const result = JSON.parse(candidateText.trim());

    // Validate fields returned
    const validCategories = ["technical", "hostel", "academic", "administrative", "security", "other"];
    const validPriorities = ["low", "medium", "high", "critical"];

    return {
      category: validCategories.includes(result.category) ? result.category : "other",
      priority: validPriorities.includes(result.priority) ? result.priority : "medium",
      summary: result.summary || title.substring(0, 80),
      suggestion: result.suggestion || "Support staff will review your ticket and reach out shortly.",
    };
  } catch (error) {
    console.error("Gemini API integration failed, applying fallback:", error.message);
    return getFallbackAnalysis(title, description);
  }
};

module.exports = {
  analyzeTicket,
};
