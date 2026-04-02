import express from 'express';
import * as db from '../db.js';

const router = express.Router();

// ==================== PRESENTATIONS ====================
// GET /presentation-api?userId=123
router.get('/presentation-api', async (req, res) => {
    try {
        const userId = req.query.userId;
        if (!userId) {
            return res.status(400).json({ message: 'userId is required' });
        }

        const result = await db.query(
            'SELECT id, title, topic, template_id, language, slide_count, presentation_type, created_at, updated_at FROM presentations WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error('Presentation GET error:', err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
});

// GET /presentation-api/:id
router.get('/presentation-api/:id', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM presentations WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Presentation not found' });
        }
        
        const presentation = result.rows[0];
        // Parse JSONB fields if needed
        presentation.slides = typeof presentation.slides === 'string' 
            ? JSON.parse(presentation.slides) 
            : presentation.slides;
        
        res.json(presentation);
    } catch (err) {
        console.error('Presentation GET error:', err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
});

// POST /presentation-api
router.post('/presentation-api', async (req, res) => {
    try {
        const { userId, title, topic, templateId, language, slideCount, slides, presentationType, ktp } = req.body;
        if (!userId || !title || !templateId || !slides) {
            return res.status(400).json({ message: 'userId, title, templateId and slides are required' });
        }

        const result = await db.query(
            'INSERT INTO presentations (user_id, title, topic, template_id, language, slide_count, slides, presentation_type, ktp) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [userId, title, topic || null, templateId, language || 'kk', slideCount || slides.length, JSON.stringify(slides), presentationType || null, ktp || null]
        );

        const presentation = result.rows[0];
        presentation.slides = typeof presentation.slides === 'string' 
            ? JSON.parse(presentation.slides) 
            : presentation.slides;

        res.status(201).json(presentation);
    } catch (err) {
        console.error('Presentation POST error:', err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
});

// PUT /presentation-api/:id
router.put('/presentation-api/:id', async (req, res) => {
    try {
        const { title, topic, templateId, language, slideCount, slides, presentationType, ktp } = req.body;
        
        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (title !== undefined) {
            updates.push(`title = $${paramIndex++}`);
            values.push(title);
        }
        if (topic !== undefined) {
            updates.push(`topic = $${paramIndex++}`);
            values.push(topic);
        }
        if (templateId !== undefined) {
            updates.push(`template_id = $${paramIndex++}`);
            values.push(templateId);
        }
        if (language !== undefined) {
            updates.push(`language = $${paramIndex++}`);
            values.push(language);
        }
        if (slideCount !== undefined) {
            updates.push(`slide_count = $${paramIndex++}`);
            values.push(slideCount);
        }
        if (slides !== undefined) {
            updates.push(`slides = $${paramIndex++}`);
            values.push(JSON.stringify(slides));
        }
        if (presentationType !== undefined) {
            updates.push(`presentation_type = $${paramIndex++}`);
            values.push(presentationType);
        }
        if (ktp !== undefined) {
            updates.push(`ktp = $${paramIndex++}`);
            values.push(ktp);
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        updates.push(`updated_at = NOW()`);
        values.push(req.params.id);

        const result = await db.query(
            `UPDATE presentations SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
            values
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Presentation not found' });
        }

        const presentation = result.rows[0];
        presentation.slides = typeof presentation.slides === 'string' 
            ? JSON.parse(presentation.slides) 
            : presentation.slides;

        res.json(presentation);
    } catch (err) {
        console.error('Presentation PUT error:', err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
});

// DELETE /presentation-api/:id
router.delete('/presentation-api/:id', async (req, res) => {
    try {
        const result = await db.query('DELETE FROM presentations WHERE id = $1 RETURNING id', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Presentation not found' });
        }
        res.json({ message: 'Presentation deleted', id: result.rows[0].id });
    } catch (err) {
        console.error('Presentation DELETE error:', err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
});

export default router;
