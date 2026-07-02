const { createBuscarPromocoesUseCase } = require('../../packages/application/promocoes');
const { zoomSource } = require('../adapters/promotion-sources/zoom-source');
const { kabumSource } = require('../adapters/promotion-sources/kabum-source');

function createPromocoesComposition() {
  const buscarPromocoesUseCase = createBuscarPromocoesUseCase({
    sources: [zoomSource, kabumSource]
  });

  return {
    buscarPromocoesUseCase
  };
}

module.exports = {
  createPromocoesComposition
};
