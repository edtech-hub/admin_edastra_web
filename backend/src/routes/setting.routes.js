const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const { getSettings, upsertSetting, deleteSetting } = require('../controllers/setting.controller');

router.use(auth, adminOnly);
router.get('/', getSettings);
router.put('/', upsertSetting);
router.delete('/:id', deleteSetting);

module.exports = router;
