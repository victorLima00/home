const { createPromocoesComposition } = require('../composition/promocoes.composition');

const { buscarPromocoesUseCase } = createPromocoesComposition();

async function buscarPromocoes(itemName, notes) {
  return buscarPromocoesUseCase.execute({ itemName, notes });
}

module.exports = {
  buscarPromocoes
};
