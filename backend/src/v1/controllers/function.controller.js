const functionService = require('../services/function-sql.service');
const { SucessReponse, CreatedResponse } = require('../cores/sucess.response');

const getAllFunctions = async (req, res, next) => {
  const targetData = await functionService.getAllFunctions(req.query);
  new SucessReponse({
    metaData: targetData
  }).send(res)
};
module.exports = {
  getAllFunctions,

}