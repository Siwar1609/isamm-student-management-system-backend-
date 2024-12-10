import Chapter from "../../models/subject-models/chapter_model.js";
import chapterValidator from "../../validators/chapter_validator.js";

export const fetchChapter = async (req, res) => {
  try {
    const chapters = await Chapter.find();
    res.status(200).json({ model: chapters, message: "Chapters fetched successfully" });
  } catch (e) {
    res.status(400).json({ error: e.message, message: "Failed to fetch chapters" });
  }
};


export const getChapterById = async (req, res) => {
  try {
    const chapter = await Chapter.findOne({ _id: req.params.id });
    if (!chapter) {
      res.status(404).json({ message: "Chapter not found" });
    } else {
      res.status(200).json({ model: chapter, message: "Chapter found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


export const addChapter = async (req, res) => {
    try {
      const { error } = chapterValidator.validate(req.body);
  
      if (error) {
        return res.status(400).json({
          error: error.details[0].message,
          message: "Invalid data",
        });
      }
  
      const chapter = new Chapter(req.body);
      await chapter.save();
      res.status(201).json({ model: chapter, message: "Chapter added successfully" });
    } catch (error) {
      res.status(400).json({ error: error.message, message: "Failed to add chapter" });
    }
  };

export const updateProgressChapter = async (req, res) => {
    try {
      const { error } = chapterValidator.validate(req.body);
  
      if (error) {
        return res.status(400).json({
          error: error.details[0].message,
          message: "Invalid data",
        });
      }
  
      const chapter = await Chapter.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
      });
      if (!chapter) {
        res.status(404).json({ message: "Chapter not found" });
      } else {
        res.status(200).json({ model: chapter, message: "Chapter updated successfully" });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };


export const deleteChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findByIdAndDelete(req.params.id);
    if (!chapter) {
      res.status(404).json({ message: "Chapter not found" });
    } else {
      res.status(200).json({ model: chapter, message: "Chapter deleted successfully" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
