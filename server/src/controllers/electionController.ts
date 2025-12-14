import { Request, Response } from 'express';
import Election from '../models/Election';
import Candidate from '../models/Candidate';

// @desc    Get public election results
// @route   GET /api/election/results
// @access  Public
export const getPublicElectionResults = async (req: Request, res: Response) => {
    try {
        const election = await Election.findOne();

        if (!election || !election.resultsPublished) {
            return res.status(403).json({ message: 'Results not published yet' });
        }

        const candidates = await Candidate.find();

        // Calculate total votes
        const totalVotes = candidates.reduce((acc, curr) => acc + (curr.voteCount || 0), 0);

        const results = candidates.map(candidate => ({
            name: candidate.name,
            party: candidate.party,
            votes: candidate.voteCount,
            color: 'hsl(var(--primary))', // Frontend can map colors
            imageUrl: candidate.imageUrl
        }));

        res.json({
            publishedAt: election.publishedAt,
            totalVotes,
            winner: results.sort((a, b) => b.votes - a.votes)[0],
            results: results.sort((a, b) => b.votes - a.votes)
        });

    } catch (error) {
        console.error('Error fetching public results:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get election configuration (Public)
// @route   GET /api/election
// @access  Public
export const getElectionConfig = async (req: Request, res: Response) => {
    try {
        // Find the single election document, or create if it doesn't exist
        let election = await Election.findOne();

        if (!election) {
            return res.status(404).json({ message: 'Election not configured' });
        }

        res.json(election);
    } catch (error) {
        console.error('Error fetching election config:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update election configuration
// @route   PUT /api/admin/election
// @access  Private/Admin
export const updateElectionConfig = async (req: Request, res: Response) => {
    try {
        const { title, description, startDate, endDate } = req.body;

        if (new Date(startDate) >= new Date(endDate)) {
            return res.status(400).json({ message: 'End date must be after start date' });
        }

        let election = await Election.findOne();

        if (election) {
            election.title = title || election.title;
            election.description = description || election.description;
            election.startDate = startDate || election.startDate;
            election.endDate = endDate || election.endDate;

            const updatedElection = await election.save();
            res.json(updatedElection);
        } else {
            // Should not happen usually as GET creates it, but safe to handle
            const newElection = await Election.create({
                title,
                description,
                startDate,
                endDate
            });
            res.json(newElection);
        }

    } catch (error) {
        console.error('Error updating election config:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
// @desc    Toggle election results publishing
// @route   PUT /api/admin/election/publish
// @access  Private/Admin
export const togglePublishResults = async (req: Request, res: Response) => {
    try {
        const { publish } = req.body; // true or false
        let election = await Election.findOne();

        if (!election) {
            return res.status(404).json({ message: 'Election not found' });
        }

        election.resultsPublished = publish;
        if (publish) {
            election.publishedAt = new Date();
        } else {
            election.publishedAt = undefined;
        }

        await election.save();
        res.json({
            message: `Results ${publish ? 'published' : 'unpublished'} successfully`,
            resultsPublished: election.resultsPublished,
            publishedAt: election.publishedAt
        });

    } catch (error) {
        console.error('Error toggling publish state:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
