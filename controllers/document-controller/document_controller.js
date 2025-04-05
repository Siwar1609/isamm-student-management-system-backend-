import Document from "../../models/document-models/document_model.js"; 
import mongoose from "mongoose";


export const uploadFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded." });
    }

    const { uploadedBy, type } = req.body;
    if (!uploadedBy || !type) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const savedFiles = await Promise.all(
      req.files.map(async (file) => {
        const newDocument = new Document({
          type,
          url: `/uploads/${file.filename}`, 
          uploadedBy, 
        });
        return await newDocument.save();
      })
    );

    res.status(201).json({ message: "Files uploaded successfully!", files: savedFiles });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

