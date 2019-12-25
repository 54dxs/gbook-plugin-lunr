require([
    'gbook',
    'jquery'
], function(gbook, $) {
    // 定义全局搜索引擎
    function LunrSearchEngine() {
        this.index = null;
        this.store = {};
        this.name = 'LunrSearchEngine';
    }

    // 通过获取搜索索引初始化lunr
    LunrSearchEngine.prototype.init = function() {
        var that = this;
        var d = $.Deferred();

        $.getJSON(gbook.state.basePath+'/search_index.json')
        .then(function(data) {
            // eslint-disable-next-line no-undef
            that.index = lunr.Index.load(data.index);
            that.store = data.store;
            d.resolve();
        });

        return d.promise();
    };

    // 搜索术语并返回结果
    LunrSearchEngine.prototype.search = function(q, offset, length) {
        var that = this;
        var results = [];

        if (this.index) {
            results = $.map(this.index.search(q), function(result) {
                var doc = that.store[result.ref];

                return {
                    title: doc.title,
                    url: doc.url,
                    body: doc.summary || doc.body
                };
            });
        }

        return $.Deferred().resolve({
            query: q,
            results: results.slice(0, length),
            count: results.length
        }).promise();
    };

    // Set gbook research
    gbook.events.bind('start', function(e, config) {
        var engine = gbook.search.getEngine();
        if (!engine) {
            gbook.search.setEngine(LunrSearchEngine, config);
        }
    });
});
