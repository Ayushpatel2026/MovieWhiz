import express, { Request, Response } from "express";
import { MovieIDManager } from "../controllers/MovieIDManager";
import { Input, ForumResponse, RequestMoreInformation } from "../types/types";

const router = express.Router();
const movieIDManager = new MovieIDManager();

const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

/*
  Endpoint to handle identification requests.
  Endpoint URL: http://{baseURL}}/api/identify/movie
  Method: POST

  Example Request Body:
  {
    "text": "A movie about a young wizard who goes to a magical school.",
    "form": {
      "genre": ["fantasy", "adventure"],
      "director": "Chris Columbus",
      "year": 2001,
      "actors": ["Daniel Radcliffe", "Emma Watson"],
      "characters": ["Harry Potter", "Hermione Granger"],
      "setting": ["Hogwarts"]
    },
    "audio": "base64-audio-string"
  }
*/
router.post(
  "/movie",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      const { text, form } = req.body;
      const file = req.file;
    
      // Prepare inputs array
      const inputs: Input[] = [];
      if (text) inputs.push({ type: "text", data: text });
      if (form) inputs.push({ type: "form", data: form });
      if (file) inputs.push({ type: "audio", data: file });

      if (inputs.length === 0) {
        return res.status(400).json({
          status: "error",
          message: "At least one input type is required",
        });
      }

      const result = await movieIDManager.handleIdentificationRequest(inputs);

      // Handle different response types
      if ("movieName" in result) {
        // This is a ForumResponse
        const forumResponse = result as ForumResponse;
        res.json({
          status: "success",
          ...forumResponse});
      } else {
        // This is a RequestMoreInformation response
        const requestMoreInfo = result as RequestMoreInformation;
        res.status(206).json({
          status: "partial",
          ...requestMoreInfo,
        });
      }
    } catch (error) {
      console.error("Identification error:", error);
      res.status(500).json({
        status: "error",
        message:
          error instanceof Error ? error.message : "Identification failed",
      });
    }
  }
);

module.exports = router;
