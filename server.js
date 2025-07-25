const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// MongoDB connection
try {
    mongoose.connect('mongodb+srv://codexade:adarsh@cluster0.kqusni.mongodb.net/student-quiz', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
     
    
} catch (error) {
    console.log('its fuckend up' + error);
    
}


// Quiz Result Schema
const quizResultSchema = new mongoose.Schema({
    studentName: String,
    subject: String,
    chapter: String,
    score: Number,
    totalQuestions: Number,
    answers: Array,
    correctAnswers: Array,
    questions: Array,
    completedAt: { type: Date, default: Date.now }
});

const QuizResult = mongoose.model('QuizResult', quizResultSchema);

// Subject and Chapter data
const subjectsData = {
    Physics: [
        "Electric Charges and Fields",
        "Electrostatic Potential and Capacitance",
        "Current Electricity",
        "Moving Charges and Magnetism",
        "Magnetism and Matter",
        "Electromagnetic Induction",
        "Alternating Current",
        "Electromagnetic Waves",
        "Ray Optics and Optical Instruments",
        "Wave Optics",
        "Dual Nature of Radiation and Matter",
        "Atoms",
        "Nuclei",
        "Semiconductor Electronics"
    ],
    Chemistry: [
        "The Solid State",
        "Solutions",
        "Electrochemistry",
        "Chemical Kinetics",
        "Surface Chemistry",
        "General Principles and Processes of Isolation of Elements",
        "The p-Block Elements",
        "The d-and f-Block Elements",
        "Coordination Compounds",
        "Haloalkanes and Haloarenes",
        "Alcohols, Phenols and Ethers",
        "Aldehydes, Ketones and Carboxylic Acids",
        "Amines",
        "Biomolecules",
        "Polymers",
        "Chemistry in Everyday Life"
    ],
    Mathematics: [
        "Relations and Functions",
        "Inverse Trigonometric Functions",
        "Matrices",
        "Determinants",
        "Continuity and Differentiability",
        "Application of Derivatives",
        "Integrals",
        "Application of Integrals",
        "Differential Equations",
        "Vector Algebra",
        "Three Dimensional Geometry",
        "Linear Programming",
        "Probability"
    ]
};

// Sample questions for different chapters
const getQuestionsForChapter = (subject, chapter) => {
    // This is a sample - you can expand this with actual questions
    const questions = [
        {
            question: `What is the fundamental concept in ${chapter}?`,
            options: ["Option A", "Option B", "Option C", "Option D"],
            correct: "A"
        },
        {
            question: `Which formula is used in ${chapter}?`,
            options: ["Formula A", "Formula B", "Formula C", "Formula D"],
            correct: "B"
        },
        {
            question: `What is the application of ${chapter}?`,
            options: ["Application A", "Application B", "Application C", "Application D"],
            correct: "A"
        },
        {
            question: `Which scientist contributed to ${chapter}?`,
            options: ["Scientist A", "Scientist B", "Scientist C", "Scientist D"],
            correct: "B"
        },
        {
            question: `What is the key principle in ${chapter}?`,
            options: ["Principle A", "Principle B", "Principle C", "Principle D"],
            correct: "A"
        }
    ];
    return questions;
};

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'landing.html'));
});

app.get('/subjects/:studentName', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'subjects.html'));
});

app.get('/quiz/:studentName/:subject/:chapter', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'quiz.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/dpp/:resultId', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dpp.html'));
});

// API to get subjects and chapters
app.get('/api/subjects', (req, res) => {
    res.json(subjectsData);
});

// API to get questions for a chapter
app.get('/api/questions/:subject/:chapter', (req, res) => {
    const { subject, chapter } = req.params;
    const questions = getQuestionsForChapter(subject, chapter);
    res.json(questions);
});

// API to submit quiz
app.post('/api/submit-quiz', async (req, res) => {
    try {
        const { studentName, subject, chapter, answers } = req.body;
        
        const questions = getQuestionsForChapter(subject, chapter);
        const correctAnswers = questions.map(q => q.correct);
        
        let score = 0;
        answers.forEach((answer, index) => {
            if (answer === correctAnswers[index]) {
                score++;
            }
        });

        const quizResult = new QuizResult({
            studentName,
            subject,
            chapter,
            score,
            totalQuestions: correctAnswers.length,
            answers,
            correctAnswers,
            questions
        });

        await quizResult.save();
        
        res.json({ 
            success: true, 
            score: score, 
            total: correctAnswers.length,
            resultId: quizResult._id
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// API to get all results
app.get('/api/results', async (req, res) => {
    try {
        const results = await QuizResult.find().sort({ completedAt: -1 });
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API to get results by student and subject
app.get('/api/results/:studentName/:subject', async (req, res) => {
    try {
        const { studentName, subject } = req.params;
        const results = await QuizResult.find({ studentName, subject }).sort({ completedAt: -1 });
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API to get specific result for DPP
app.get('/api/result/:resultId', async (req, res) => {
    try {
        const result = await QuizResult.findById(req.params.resultId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add this route to server.js
app.get('/quiz/:resultId', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'quiz.html'));
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});











// Add these routes to your existing server.js

// Stats page routes
app.get('/stats', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'stats.html'));
});

app.get('/student-stats/:studentName', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'student-stats.html'));
});

// API endpoint for student statistics
app.get('/api/student-analytics/:studentName', async (req, res) => {
    try {
        const { studentName } = req.params;
        const results = await QuizResult.find({ studentName }).sort({ completedAt: 1 });
        
        if (results.length === 0) {
            return res.json({
                studentName,
                totalQuizzes: 0,
                averageScore: 0,
                subjectPerformance: {},
                timelineData: [],
                scoreDistribution: {},
                accuracyData: [],
                overallRadar: {}
            });
        }

        // Calculate analytics
        const analytics = {
            studentName,
            totalQuizzes: results.length,
            averageScore: Math.round(results.reduce((sum, r) => sum + (r.score / r.totalQuestions * 100), 0) / results.length),
            
            // Subject-wise performance
            subjectPerformance: results.reduce((acc, result) => {
                if (!acc[result.subject]) acc[result.subject] = { total: 0, correct: 0, count: 0 };
                acc[result.subject].total += result.totalQuestions;
                acc[result.subject].correct += result.score;
                acc[result.subject].count += 1;
                return acc;
            }, {}),
            
            // Timeline data
            timelineData: results.map((result, index) => ({
                quiz: index + 1,
                score: Math.round((result.score / result.totalQuestions) * 100),
                date: result.completedAt,
                subject: result.subject
            })),
            
            // Score distribution
            scoreDistribution: results.reduce((acc, result) => {
                const percentage = Math.round((result.score / result.totalQuestions) * 100);
                const range = percentage >= 90 ? '90-100%' : 
                             percentage >= 80 ? '80-89%' : 
                             percentage >= 70 ? '70-79%' : 
                             percentage >= 60 ? '60-69%' : 'Below 60%';
                acc[range] = (acc[range] || 0) + 1;
                return acc;
            }, {}),
            
            // Accuracy vs attempts data
            accuracyData: Object.entries(results.reduce((acc, result) => {
                if (!acc[result.subject]) acc[result.subject] = { attempts: 0, totalScore: 0, totalQuestions: 0 };
                acc[result.subject].attempts += 1;
                acc[result.subject].totalScore += result.score;
                acc[result.subject].totalQuestions += result.totalQuestions;
                return acc;
            }, {})).map(([subject, data]) => ({
                subject,
                attempts: data.attempts,
                accuracy: Math.round((data.totalScore / data.totalQuestions) * 100)
            })),
            
            // Overall radar data
            overallRadar: {
                Physics: results.filter(r => r.subject === 'Physics').reduce((sum, r) => sum + (r.score / r.totalQuestions * 100), 0) / Math.max(1, results.filter(r => r.subject === 'Physics').length) || 0,
                Chemistry: results.filter(r => r.subject === 'Chemistry').reduce((sum, r) => sum + (r.score / r.totalQuestions * 100), 0) / Math.max(1, results.filter(r => r.subject === 'Chemistry').length) || 0,
                Mathematics: results.filter(r => r.subject === 'Mathematics').reduce((sum, r) => sum + (r.score / r.totalQuestions * 100), 0) / Math.max(1, results.filter(r => r.subject === 'Mathematics').length) || 0
            }
        };

        res.json(analytics);
    } catch (error) {
        console.error('Error fetching student analytics:', error);
        res.status(500).json({ error: error.message });
    }
});

// API endpoint for all students overview
app.get('/api/students-overview', async (req, res) => {
    try {
        const results = await QuizResult.find().sort({ completedAt: -1 });
        const students = [...new Set(results.map(r => r.studentName))];
        
        const overview = students.map(studentName => {
            const studentResults = results.filter(r => r.studentName === studentName);
            const averageScore = studentResults.length > 0 ? 
                Math.round(studentResults.reduce((sum, r) => sum + (r.score / r.totalQuestions * 100), 0) / studentResults.length) : 0;
            
            return {
                studentName,
                totalQuizzes: studentResults.length,
                averageScore,
                lastQuizDate: studentResults.length > 0 ? studentResults[0].completedAt : null,
                subjects: [...new Set(studentResults.map(r => r.subject))]
            };
        });

        res.json(overview);
    } catch (error) {
        console.error('Error fetching students overview:', error);
        res.status(500).json({ error: error.message });
    }
});
