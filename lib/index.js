/**
 * npm module file
 */

module.exports = {
  brasil: {
    CPF: require('cpf'),
    removeMask(v) {
      if (!v || !String(v)) return;
      return String(v).replace(/\D/g, '');
    },
    CEP: {
      isValid(v) {
        if (!v) return false;

        const numericCEP = String(v).replace(/\D/g, '');

        if (!numericCEP || numericCEP.length != 8 ) {
          return false;
        }

        return true;
      }
    }
  }
};