import express, {Request, Response} from 'express';
import { BlackboardController } from '../controllers/BlackboardController';


const router = express.Router();


const controller = new BlackboardController();

router.post('/identify', async (req : Request, res : Response) => {
  try {
    const { text, form, audio, userId } = req.body;
    
    const result = await controller.movieManager.identifyMovie(
      { text, formData: form, audio },
      userId
    );

    res.json(result);
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Identification failed'
    });
  }
});

module.exports = router;