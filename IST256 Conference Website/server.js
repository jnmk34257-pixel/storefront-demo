import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'src', 'data', 'submissions.json');

const readSubmissions = () => {
    if (!fs.existsSync(DATA_FILE)) {
        return [];
    }
    const data = fs.readFileSync(DATA_FILE);
    return JSON.parse(data);
}

const writeSubmissions = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

//GET: Retrieve all submissions
app.get('/api/submissions', (req, res) => {
    try { 
        const submissions = readSubmissions();
        res.status(200).json(submissions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read submissions' });
    }
});

//POST: create new submission
app.post('/api/submissions', (req, res) => {
    try { 
        const submissions = readSubmissions();
        const newSubmission = {
            id: `ORD-${Date.now()}`,
            ...req.body,
            status: 'pending'
        };
        submissions.push(newSubmission);
        writeSubmissions(submissions);
        res.status(201).json(newSubmission);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create submission' });
    }
});

//PUT: update submission status
app.put('/api/submissions/:id', (req, res) => {
    try {
        const { id } = req.params;
        const {status} = req.body;
        const submissions = readSubmissions();
        const index = submissions.findIndex(sub => sub.id === id);
        if (index === -1) {
            return res.status(404).json({ error: 'Submission not found' });
        }
        submissions[index].status = status;
        writeSubmissions(submissions);
        res.status(200).json(submissions[index]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update submission' });
    }
});

const PORT = 5000; 
app.listen(PORT, () => {
    console.log(`Node backend is running on http://localhost:${PORT}`);
});