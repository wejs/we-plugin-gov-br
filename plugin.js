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
  // plugin.setConfigs({});
  // ser plugin routes
  // plugin.setRoutes({});

  plugin.setTemplates({
    // helper para esconder ou exibir os campos de cpf ou passaporte
    'forms/gov-br/brasileiro-seletor': __dirname + '/server/templates/forms/gov-br/brasileiro-seletor.hbs',
    'forms/gov-br/cpf': __dirname + '/server/templates/forms/gov-br/cpf.hbs',
    'forms/gov-br/passaporte': __dirname + '/server/templates/forms/gov-br/passaporte.hbs',
    'forms/gov-br/cep': __dirname + '/server/templates/forms/gov-br/cep.hbs'
  });

  // campos de cfp e passaporte
  plugin.hooks.on('we:models:before:instance', function (we, done) {

    if (!we.gov) we.gov = {};
    we.gov.br = brasil;

    // o usuário deve preencher o CPF ou o Passaporte de acordo com a flag que diz se ele é brasileiro ou não

    // setando o campo de cpf
    we.db.modelsConfigs.user.definition.cpf = {
      type: we.db.Sequelize.STRING(11),
      unique: true,
      set: function onSetCPF(val) {
        // remove a mascara de cpf ao setar o valor
        this.setDataValue('cpf', brasil.formatacoes.removerMascara(val));
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

    we.db.modelsConfigs.user.definition.estrangeiro = {
      type: we.db.Sequelize.BOOLEAN,
      defaultValue: false,
      validate: {
        requerCpfOrPassport: function requerCpfOrPassport(val) {
          if (!val && !this.getDataValue('cpf')) {
            // se for brasileiro, deve ter um cpf
            throw new Error('user.cpf.required');
          } else if(val && !this.getDataValue('passaporte')) {
            // se não for brasileiro deve ter um passaporte
            throw new Error('user.passaporte.required');
          }
        }
      }
    }
    // cep field
    we.db.modelsConfigs.user.definition.cep = {
      type: we.db.Sequelize.STRING(8),
      set: function onSetCep(val) {
        // remove a mascara do campo
        this.setDataValue('cep', brasil.formatacoes.removerMascara(val));
      },
      validate: {
        cepValidation: function cepValidation(val) {
          if (!brValid.eCep(val)) throw new Error('user.cep.invalid');
        }
      }
    }

    done();
  });

  plugin.events.on('we:after:load:forms', function (we) {
    // extend core register form
    we.form.forms.register.fields.cpf = {
      type: 'gov-br/cpf'
    }
    we.form.forms.register.fields.passaporte = {
      type: 'gov-br/passaporte'
    }
    we.form.forms.register.fields.estrangeiro = {
      type: 'gov-br/brasileiro-seletor',
      defaultValue: false
    }

   we.form.forms.register.fields.cep = {
      type: 'gov-br/cep'
    }
   });

  return plugin;
};