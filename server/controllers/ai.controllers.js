import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = 'llama-3.3-70b-versatile';

export const generateRequest = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const systemPrompt = `You are an expert API assistant. Your job is to convert natural language descriptions into structured HTTP requests.
Return ONLY valid JSON that matches this schema:
{
  "method": "GET" | "POST" | "PUT" | "DELETE",
  "url": "full url if provided, else path",
  "headers": [ {"key": "header-name", "value": "header-value"} ],
  "body": "JSON string for body if applicable, else empty string"
}
Do not include any markdown formatting, comments, or explanations outside the JSON  block.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      model: MODEL,
      response_format: { type: "json_object" },
    });

    const responseContent = chatCompletion.choices[0]?.message?.content || '{}';
    const parsedData = JSON.parse(responseContent);

    res.json(parsedData);
  } catch (error) {
    console.error('Groq generateRequest error:', error);
    res.status(500).json({ error: 'Failed to generate request' });
  }
};

export const debugError = async (req, res) => {
  try {
    const { requestDetails, errorResponse } = req.body;
    
    const prompt = `Analyze this failed API request and provide a clear, concise explanation of what went wrong and how to fix it.
    
Request details:
${JSON.stringify(requestDetails, null, 2)}

Error response:
${JSON.stringify(errorResponse, null, 2)}

Format your response in Markdown. Keep it brief and actionable.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'user', content: prompt }
      ],
      model: MODEL,
    });

    res.json({ explanation: chatCompletion.choices[0]?.message?.content });
  } catch (error) {
    console.error('Groq debugError error:', error);
    res.status(500).json({ error: 'Failed to debug error' });
  }
};

export const generateTypes = async (req, res) => {
  try {
    const { responseBody } = req.body;
    
    const prompt = `Convert the following JSON response into a set of TypeScript interfaces. Provide ONLY the TypeScript code, do not use markdown codeblocks.

JSON Response:
${JSON.stringify(responseBody, null, 2)}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'user', content: prompt }
      ],
      model: MODEL,
    });

    let types = chatCompletion.choices[0]?.message?.content || '';
    if (types.startsWith('\`\`\`typescript')) types = types.replace(/\`\`\`typescript/g, '');
    if (types.startsWith('\`\`\`')) types = types.replace(/\`\`\`/g, '');
    types = types.replace(/\`\`\`$/g, '');

    res.json({ types: types.trim() });
  } catch (error) {
    console.error('Groq generateTypes error:', error);
    res.status(500).json({ error: 'Failed to generate types' });
  }
};

export const generateDocs = async (req, res) => {
  try {
    const { collectionName, requests } = req.body;
    
    const prompt = `Generate a comprehensive Markdown API documentation for the collection named "${collectionName}". 
Here are the requests saved in this collection:
${JSON.stringify(requests, null, 2)}

Format the documentation cleanly with a Title, Overview, and a section for each endpoint including its Method, URL, expected Headers, Request Body, and a description.
Provide ONLY the Markdown content.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'user', content: prompt }
      ],
      model: MODEL,
    });

    res.json({ docs: chatCompletion.choices[0]?.message?.content });
  } catch (error) {
    console.error('Groq generateDocs error:', error);
    res.status(500).json({ error: 'Failed to generate documentation' });
  }
};

export const analyzeResponse = async (req, res) => {
  try {
    const { requestDetails, responseBody, contentType } = req.body;

    const bodyStr = typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody, null, 2);

    const prompt = `You are a senior developer and QA engineer. Analyze the following API response and identify:
1. **Bugs or errors** in the response (e.g. unexpected nulls, wrong types, missing required fields)
2. **Security issues** (e.g. exposed sensitive data, missing auth headers, CORS issues)
3. **Performance concerns** (e.g. bloated payload, unnecessary data)
4. **HTML issues** (if content type is HTML): broken tags, missing meta tags, accessibility issues, JS errors, missing alt attributes
5. **Suggestions** for improvement

Request Details:
${JSON.stringify(requestDetails, null, 2)}

Content-Type: ${contentType}

Response Body (first 4000 chars):
${bodyStr.substring(0, 4000)}

Format your analysis with clear numbered sections and emoji icons. Be specific and actionable. If there are no issues, say so clearly.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: MODEL,
    });

    res.json({ analysis: chatCompletion.choices[0]?.message?.content });
  } catch (error) {
    console.error('Groq analyzeResponse error:', error);
    res.status(500).json({ error: 'Failed to analyze response' });
  }
};