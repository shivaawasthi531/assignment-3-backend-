const express = require('express');
const controller = require('../controllers/productController');
const validateId = require('../middleware/validateId');

const router = express.Router();

router.get('/low-stock', controller.getLowStock);
router.get('/summary', controller.getCategorySummary);

router.route('/')
  .get(controller.getProducts)
  .post(controller.createProduct);

router.route('/:id')
  .get(validateId, controller.getProductById)
  .put(validateId, controller.updateProduct)
  .delete(validateId, controller.deleteProduct);

router.patch('/:id/stock', validateId, controller.adjustStock);

module.exports = router;
