import mongoose from 'mongoose';
import Subject from '../models/subject-models/subject_model.js';
import AcademicYear from '../models/academic_year_models/academic-year-model.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Connect to MongoDB
mongoose.connect(process.env.DATABASE_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const cleanSubjects = async () => {
  try {
    console.log('Starting database cleanup...');
    
    // Get current academic year
    const currentYear = await AcademicYear.findOne({ current: true });
    if (!currentYear) {
      console.error('No current academic year found!');
      process.exit(1);
    }
    
    console.log(`Current academic year: ${currentYear._id}`);
    
    // Get all subjects
    const allSubjects = await Subject.find({});
    console.log(`Found ${allSubjects.length} total subjects`);
    
    // Group subjects by title, level, and semester (our uniqueness criteria)
    const uniqueSubjectsMap = new Map();
    
    for (const subject of allSubjects) {
      const key = `${subject.title}-${subject.level}-${subject.semester}`;
      
      if (!uniqueSubjectsMap.has(key)) {
        uniqueSubjectsMap.set(key, subject);
      }
    }
    
    console.log(`Found ${uniqueSubjectsMap.size} unique subjects`);
    
    // Delete all subjects first
    await Subject.deleteMany({});
    console.log('Deleted all existing subjects');
    
    // Save unique subjects with current academic year
    let count = 0;
    for (const subject of uniqueSubjectsMap.values()) {
      const newSubject = new Subject({
        title: subject.title,
        description: subject.description,
        level: subject.level,
        semester: subject.semester,
        chapId: subject.chapId,
        skillId: subject.skillId,
        Assesment_Id: subject.Assesment_Id,
        published: true,
        propositionValidated: true,
        academicYearId: currentYear._id,
        curriculumId: subject.curriculumId,
        studentId: subject.studentId || [],
        teacherId: subject.teacherId || [],
      });
      
      await newSubject.save();
      count++;
      
      if (count % 10 === 0) {
        console.log(`Saved ${count}/${uniqueSubjectsMap.size} subjects`);
      }
    }
    
    console.log(`Successfully saved ${count} unique subjects with current academic year ID`);
    console.log('Database cleanup completed successfully!');
    
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the cleanup function
cleanSubjects();