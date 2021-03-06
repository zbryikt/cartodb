var PasswordPrivacyOption = require('../../../../../../javascripts/cartodb/new_dashboard/dialogs/change_privacy/password_option_model');
var cdbAdmin = require('cdb.admin');
var sharedForOptionModel = require('./shared_for_option_model');
var _ = require('underscore');

describe('new_dashboard/dialogs/change_privacy/password_option_model', function() {
  beforeEach(function() {
    this.model = new PasswordPrivacyOption();
    this.model.set('password', 'foobar');
  });

  sharedForOptionModel.call(this, {
    expectedSaveAttrs: {
      privacy: 'new-privacy-value',
      password: 'foobar'
    }
  });

  it('should have a fake password set initially', function() {
    this.model = new PasswordPrivacyOption();
    expect(this.model.get('password')).toEqual(PasswordPrivacyOption.DEFAULT_FAKE_PASSWORD);
  });

  describe('when selected', function() {
    beforeEach(function() {
      this.model = new PasswordPrivacyOption();
      this.model.set('selected', true);
    });

    it('should reset the password (so the placeholder in the UI is displayed)', function() {
      expect(this.model.get('password')).toEqual('');
    });
  });

  describe('.canSave' , function() {
    describe('given option is enabled and has a password string set', function() {
      beforeEach(function() {
        this.model.set({
          disabled: false,
          password: 'f'
        })
      });

      it('should return true', function() {
        expect(this.model.canSave()).toBeTruthy();
      });
    });

    describe('given option is disabled or has no password set', function() {
      beforeEach(function() {
        this.model.set({
          disabled: true,
          password: undefined
        });
      });

      it('should return false', function() {
        expect(this.model.canSave()).toBeFalsy();

        // still missing pwd
        this.model.set({ disabled: false });
        expect(this.model.canSave()).toBeFalsy();
        this.model.set({ disabled: false, password: '' });
        expect(this.model.canSave()).toBeFalsy();
      });
    });
  });

  describe('.saveToVis', function() {
    describe('given password has not changed', function() {
      beforeEach(function() {
        this.model = new PasswordPrivacyOption({});
        this.vis = jasmine.createSpyObj('cdb.admin.Vis', ['save']);
        this.model.saveToVis(this.vis);
      });

      it('should not send a password value on save', function() {
        var attrKeys = _.keys(this.vis.save.calls.argsFor(0)[0]);
        expect(attrKeys).not.toContain('password');
      });
    });
  });
});
