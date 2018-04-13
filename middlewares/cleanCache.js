const { clearHash } = require('../services/cache');

module.exports = async (req, res, next) => {
  await next();    // come back after handler is done

  clearHash(req.user.id);
}
