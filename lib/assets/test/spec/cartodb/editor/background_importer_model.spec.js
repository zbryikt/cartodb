var BackgroundImporterModel = require('../../../../javascripts/cartodb/editor/background_importer_model');
var ImportCollection = require('../../../../javascripts/cartodb/new_common/background_importer/imports_collection');

describe('editor/background_importer_model', function() {
  beforeEach(function() {
    this.user = new cdb.admin.User({
      username: 'pepe',
      base_url: 'http://pepe.cartodb.com'
    });
    this.collection = new ImportCollection(undefined, {
      user: this.user
    });

    this.vis = new cdb.admin.Visualization({
      name: 'my-map'
    });

    this.model = new BackgroundImporterModel({}, {
      vis: this.vis,
      user: this.user,
      collection: this.collection
    });
  });

  describe('when an imports model changes state', function() {
    beforeEach(function() {
      this.collection.reset({});
      this.importsModel = this.collection.at(0);

      // "all is good" is defined like this, was extracted from background importer view at some point
      this.importsModel.imp.set({
        tables_created_count: 1,
        service_name: 'other',
        table_name: 'foobar'
      });

      spyOn(this.vis.map, 'addCartodbLayerFromTable');
    });

    it('should do nothing if import did not complete successfully', function() {
      this.importsModel.set('state', 'fail');
      expect(this.vis.map.addCartodbLayerFromTable).not.toHaveBeenCalled();
    });

    describe('when import is completed', function() {
      beforeEach(function() {
        this.importsModel.set('state', 'complete');
        this.args = this.vis.map.addCartodbLayerFromTable.calls.argsFor(0);
      });

      it('should add the imported dataset as a new layer', function() {
        expect(this.vis.map.addCartodbLayerFromTable).toHaveBeenCalled();
      });

      it('should created layer for current user and vis', function() {
        expect(this.args[0]).toEqual('foobar');
        expect(this.args[1]).toEqual('pepe');
        expect(this.args[2].vis).toEqual(this.vis);
      });

      describe('when layer is created successfully', function() {
        beforeEach(function() {
          spyOn(this.vis.map.layers, 'saveLayers');
          this.args[2].success();
        });

        it('should save layers', function() {
          expect(this.vis.map.layers.saveLayers).toHaveBeenCalled();
        });

        it('should remove the model from the collection', function() {
          expect(this.collection.length).toEqual(0);
        });
      });

      describe('when layer could not be create for whatever reason', function() {
        beforeEach(function() {
          spyOn(this.vis.map.layers, 'saveLayers');
          this.args[2].error();
        });

        it('should not tried to save layers', function() {
          expect(this.vis.map.layers.saveLayers).not.toHaveBeenCalled();
        });

        it('should remove the model from the collection', function() {
          expect(this.collection.length).toEqual(0);
        });
      });
    });
  });
});