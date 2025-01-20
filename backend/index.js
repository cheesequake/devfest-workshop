import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import multer from "multer";
import { getDocument } from "pdfjs-dist";

const app = express();
dotenv.config();

const storage = multer.memoryStorage();
const upload = multer({ storage });

let pdfText = "";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const PORT = 5000;

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
}));

app.use(express.json());

app.post("/upload-pdf", upload.single("pdf"), async (req, res) => {
  try {
      if (!req.file) {
          return res.status(400).json({ error: "No file uploaded" });
      }
      console.log("Received file: ", req.file.buffer);

      const uint8Array = new Uint8Array(req.file.buffer);
      const loadingTask = getDocument({ data: uint8Array });
      const pdf = await loadingTask.promise;
      let textContent = "";

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const content = await page.getTextContent();
          const strings = content.items.map(item => item.str);
          textContent += strings.join(" ") + "\n";
      }

      pdfText = textContent;
      console.log("Extracted PDF text length: ", pdfText.length);

      return res.status(200).json({ message: "PDF uploaded and text extracted." });
  } catch (error) {
      console.error("Error while uploading PDF: ", error.message);
      return res.status(500).json({ error: "Something went wrong while parsing the PDF." });
  }
});

app.post("/ask", async (req, res) => {
  try {
    const { message } = req.body;

    // 1. Validation
    if (!pdfText) {
      return res.status(400).json({ error: "No PDF text found. Please upload a PDF first." });
    }
    if (!message) {
      return res.status(400).json({ error: "No message provided." });
    }

    // 2. Construct the prompt
    const prompt = `You are a helpful assistant. You have the following PDF content:
      ${pdfText}
      Given the above PDF content, answer the user's question as accurately as possible.
      User: ${message}
      Assistant:`;

    // 3. Use the Gemini SDK to generate response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const botReply = response.text();

    return res.status(200).json({ sender: 'bot', message: botReply });

  } catch (error) {
    console.error("Error while chatting with Gemini:", error);

    let errorMessage = "Something went wrong while communicating with Gemini.";
    let statusCode = 500;

    if (error.response) {
      const status = error.response.status;
      switch (status) {
        case 429:
          errorMessage = "You've exceeded your usage quota. Please try again later.";
          statusCode = 429;
          break;
        case 401:
          errorMessage = "Unauthorized access. Please check your API key.";
          statusCode = 401;
          break;
        case 500:
          errorMessage = "Gemini server error. Please try again later.";
          statusCode = 500;
          break;
        default:
          errorMessage = "An unexpected error occurred. Please try again.";
          statusCode = status;
      }
    }

    return res.status(statusCode).json({ error: errorMessage });
  }
});


app.listen(PORT, () => {
    console.log("Server listening on port 5000");
})