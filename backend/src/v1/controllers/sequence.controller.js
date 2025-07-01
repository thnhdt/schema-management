const sequenceService = require('../services/sequence.service');
const { SucessReponse, CreatedResponse } = require('../cores/sucess.response');

const getAllSequence = async (req, res, next) => {
  const targetData = await sequenceService.getAllSequences(req.query);
  new SucessReponse({
    metaData: targetData
  }).send(res)
};
module.exports = {
  getAllSequence,
}