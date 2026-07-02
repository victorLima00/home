function assertPromotionSourcePort(source) {
  if (!source || typeof source !== 'object') {
    throw new Error('PromotionSourcePort invalido: fonte ausente');
  }

  if (typeof source.name !== 'string' || source.name.trim().length === 0) {
    throw new Error('PromotionSourcePort invalido: campo "name" obrigatorio');
  }

  if (typeof source.search !== 'function') {
    throw new Error('PromotionSourcePort invalido: funcao "search" obrigatoria');
  }
}

module.exports = {
  assertPromotionSourcePort
};
