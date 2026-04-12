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

// Input Validation Helper
const validateSubmission = (body) => {
    const errors = [];
 
    // Name: required, letters/spaces/hyphens/apostrophes, 2–50 chars
    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
        errors.push('Name is required.');
    } else if (!/^[A-Za-z\-\s']{2,50}$/.test(body.name.trim())) {
        errors.push('Name must be 2–50 characters and contain only letters, spaces, hyphens, or apostrophes.');
    }
 
    // Email: required, valid format
    if (!body.email || typeof body.email !== 'string' || body.email.trim() === '') {
        errors.push('Email is required.');
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(body.email.trim())) {
        errors.push('A valid email address is required.');
    }
 
    // Participation type: must be one of the allowed values
    const allowedTypes = ['in-person', 'virtual', 'vip'];
    if (!body.participationType || !allowedTypes.includes(body.participationType)) {
        errors.push(`Participation type must be one of: ${allowedTypes.join(', ')}.`);
    }
 
    // Scheduled events: required, must be a non-empty array
    if (!body.scheduledEvents || !Array.isArray(body.scheduledEvents) || body.scheduledEvents.length === 0) {
        errors.push('At least one scheduled event is required.');
    }
 
    // Submission time: required, must be a valid ISO date string
    if (!body.submissionTime || isNaN(Date.parse(body.submissionTime))) {
        errors.push('A valid submissionTime (ISO date string) is required.');
    }
 
    return errors;
};


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
        const validationErrors = validateSubmission(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({ errors: validationErrors });
        }
 
        const submissions = readSubmissions();
        const newSubmission = {
            id: `ORD-${Date.now()}`,
            name: req.body.name.trim(),
            email: req.body.email.trim(),
            participationType: req.body.participationType,
            specialRequests: req.body.specialRequests?.trim() || '',
            scheduledEvents: req.body.scheduledEvents,
            submissionTime: req.body.submissionTime,
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

        const allowedStatuses = ['pending', 'approved', 'declined'];
        if (!status || !allowedStatuses.includes(status)) {
            return res.status(400).json({ error: `Status must be one of: ${allowedStatuses.join(', ')}.` });
        }

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