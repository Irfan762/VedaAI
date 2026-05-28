import { Router } from 'express';
import {
  createAssessment,
  getAllAssessments,
  getAssessmentById,
  regenerateAssessment,
  deleteAssessment
} from '../controllers/assessment';

const router = Router();

router.post('/', createAssessment);
router.get('/', getAllAssessments);
router.get('/:id', getAssessmentById);
router.post('/:id/regenerate', regenerateAssessment);
router.delete('/:id', deleteAssessment);

export default router;

