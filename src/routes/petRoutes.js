const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');
const { requireAuth } = require('../middlewares/authMiddleware');

router.post('/matchmaker', petController.matchmakerQuiz);
router.get('/', requireAuth, petController.getMyPets);
router.post('/', requireAuth, petController.createPet);
router.get('/:id', requireAuth, petController.getPetById);
router.put('/:id', requireAuth, petController.updatePet);
router.delete('/:id', requireAuth, petController.deletePet);

module.exports = router;
