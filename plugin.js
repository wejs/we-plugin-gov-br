/**
 * Plugin do we.js com recursos para projetos brasileiros
 *
 * see http://wejs.org/docs/we/extend.plugin
 */

const brasil = require('./lib/index.js').brasil;

module.exports = function loadPlugin(projectPath, Plugin) {
  const plugin = new Plugin(__dirname);
  // campos de cfp e passaporte
  plugin.hooks.on('we:models:before:instance', function (we, done) {

    if (!we.gov) we.gov = {};
    we.gov.br = brasil;

    // o usuário deve preencher o CPF ou o Passaporte de acordo com a flag que diz se ele é brasileiro ou não

    // setando o campo de cpf
    we.db.modelsConfigs.user.definition.cpf = {
      type: we.db.Sequelize.STRING(11),
      unique: true,
      formFieldType: 'gov-br/cpf',
      set(val) {
        if (val) {
          // remove a mascara de cpf ao setar o valor
          this.setDataValue('cpf', brasil.removeMask(val));
        } else {
          this.setDataValue('cpf', null);
        }
      },
      validate: {
        cpfIsValid(val) {
          if (val && !brasil.CPF.isValid(val)) throw new Error('user.cpf.invalid');
        }
      }
    }

    we.db.modelsConfigs.user.definition.passaporte = {
      type: we.db.Sequelize.STRING,
      unique: true,
      validate: {},
      formFieldType: 'gov-br/passaporte',
      set(val) {
        if (val) {
          this.setDataValue('passaporte', val);
        } else {
          this.setDataValue('passaporte', null);
        }
      }
    }

    we.db.modelsConfigs.user.definition.estrangeiro = {
      type: we.db.Sequelize.BOOLEAN,
      defaultValue: false,
      formFieldType: 'gov-br/brasileiro-seletor',
      set(val) {
        if (!val) this.setDataValue('estrangeiro', null);
        if ( Number(val) )
          this.setDataValue('estrangeiro', Number(val) );
        this.setDataValue('estrangeiro', null);
      },
      validate: {
        requerCpfOrPassport(val) {
          if (!val || !we.utils._.trim(val)) {
            if (!this.getDataValue('cpf')) {
              // se for brasileiro, deve ter um cpf
              throw new Error('user.cpf.required');
            }
          } else {
            if (!this.getDataValue('passaporte') ) {
              // se não for brasileiro deve ter um passaporte
              throw new Error('user.passaporte.required');
            }
          }
        }
      }
    }
    // cep field
    we.db.modelsConfigs.user.definition.cep = {
      type: we.db.Sequelize.STRING(8),
      formFieldType: 'gov-br/cep',
      set(val) {
        // remove a mascara do campo
        this.setDataValue('cep', brasil.removeMask(val));
      },
      validate: {
        cepValidation(val) {
          if (val && we.utils._.trim(val) && !brasil.CEP.isValid(val)) {
            throw new Error('user.cep.invalid');
          }
        }
      }
    }

    done();
  });

  plugin.events.on('we:after:load:forms', function (we) {
    // extend core register form
    if (we.form.forms.register.fields.cep !== null)
      we.form.forms.register.fields.cep = {
        type: 'gov-br/cep'
      }

    if (we.form.forms.register.fields.cpf !== null)
      we.form.forms.register.fields.cpf = {
        type: 'gov-br/cpf'
      }

    if (we.form.forms.register.fields.passaporte !== null)
      we.form.forms.register.fields.passaporte = {
        type: 'gov-br/passaporte'
      }

    if (we.form.forms.register.fields.estrangeiro !== null)
      we.form.forms.register.fields.estrangeiro = {
        type: 'gov-br/brasileiro-seletor',
        defaultValue: false
      }

   });

  return plugin;
};