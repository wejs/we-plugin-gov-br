/**
 * Plugin.js file, set configs, routes, hooks and events here
 *
 * see http://wejs.org/docs/we/extend.plugin
 */
var brasil = require('brasil');
var brValid = brasil.validacoes;

module.exports = function loadPlugin(projectPath, Plugin) {
  var plugin = new Plugin(__dirname);
  // set plugin configs
  // plugin.setConfigs({
  // });
  // ser plugin routes
  // plugin.setRoutes({
  // });


  // campos de cfp e passaporte
  plugin.hooks.on('we:models:before:instance', function (we, done) {

    if (!we.gov) we.gov = {};
    we.gov.br = brasil;

    we.db.modelsConfigs.user.definition.brasileiro = {
      type: we.db.Sequelize.BOOLEAN,
      defaultValue: true,
      validate: {
        requerCpfOrPassport: function requerCpfOrPassport(val) {
          if (val && !this.getDataValue('cpf')) {
            // se for brasileiro, deve ter um cpf
            throw new Error('user.cpf.required');
          } else if(!val && !this.getDataValue('passaporte')) {
            // se não for brasileiro deve ter um passaporte
            throw new Error('user.passaporte.required');
          }
        }
      }
    }
    // o usuário deve preencher o CPF ou o Passaporte de acordo com a flag que diz se ele é brasileiro ou não

    // setando o campo de cpf
    we.db.modelsConfigs.user.definition.cpf = {
      type: we.db.Sequelize.STRING(11),
      unique: true,
      set: function onSetCPF(val) {
        // remove a mascara de cpf ao setar o valor
        this.setDataValue('cpf', brasil.formatacoes.removerMascara(val) );
      },
      validate: {
        cpfIsValid: function cpfIsValid(val) {
          if (val && !brValid.eCpf(val)) throw new Error('user.cpf.invalid');
        }
      }
    }

    we.db.modelsConfigs.user.definition.passaporte = {
      type: we.db.Sequelize.STRING,
      unique: true,
      validate: {}
    }


    done();
  });

  return plugin;
};