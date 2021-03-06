var cdb = require('cartodb.js');

/**
 *  Service loader view
 *
 *  - It will be on charge to make token and oauth petitions
 *
 */

module.exports = cdb.core.View.extend({

  events: {
    'click .js-connect': '_checkToken'
  },

  initialize: function() {
    this.token = this.options.token;
    this.service = this.options.service;
    this.template = cdb.templates.getTemplate('new_common/views/create/listing/import_types/service_loader');
    this._initBinds();
    this._checkVisibility();
  },

  render: function() {
    this.$el.html(
      this.template({
        state: this.model.get('state')
      })
    );
    return this;
  },

  _initBinds: function() {
    this.model.bind('change:state', this.render, this);
    this.model.bind('change:state', this._checkVisibility, this);
  },

  _checkToken: function() {
    var self = this;
    this.model.set('state', 'token');

    var self = this;
    this.token.fetch({
      success: function(r) {
        if (!r.get('oauth_valid')) {
          self._getOauthURL();
        }
      },
      error: function(e) {
        self._getOauthURL();
      }
    });
  },

  _checkVisibility: function() {
    var state = this.model.get('state');
    if (state !== 'list' && state !== 'selected') {
      this.show();
    } else {
      this.hide();
    }
  },

  _getOauthURL: function() {
    this.model.set('state', 'oauth');
    this.service.set({ url: '' }, { silent: true });
    this.service.fetch();
  }

})