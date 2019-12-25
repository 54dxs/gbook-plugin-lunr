var lunr = require('lunr');
var Entities = require('html-entities').AllHtmlEntities;

var Html = new Entities();

var searchIndex;
// 使用Gbook提供的“this”上下文调用
function getSearchIndex(context) {
    if (!searchIndex) {
        // 创建搜索索引
        var ignoreSpecialCharacters = context.config.get('pluginsConfig.lunr.ignoreSpecialCharacters') || context.config.get('lunr.ignoreSpecialCharacters');
        searchIndex = lunr(function () {
            this.ref('url');

            this.field('title', { boost: 10 });
            this.field('keywords', { boost: 15 });
            this.field('body');

            if (!ignoreSpecialCharacters) {
                // 不要修剪非文字字符（允许搜索，如“C++”）
                this.pipeline.remove(lunr.trimmer);
            }
        });
    }
    return searchIndex;
}

// Lunr参考文件Map
var documentsStore = {};

var searchIndexEnabled = true;
var indexSize = 0;

module.exports = {
    book: {
        assets: './assets',
        js: [
            'lunr.min.js', 'search-lunr.js'
        ]
    },

    hooks: {
        // 为每页编制索引
        'page': function(page) {
            if (this.output.name != 'website' || !searchIndexEnabled || page.search === false) {
                return page;
            }

            var text, maxIndexSize;
            maxIndexSize = this.config.get('pluginsConfig.lunr.maxIndexSize') || this.config.get('lunr.maxIndexSize');

            this.log.debug.ln('index page', page.path);

            text = page.content;
            // 解码HTML
            text = Html.decode(text);
            // 删除HTML标记
            text = text.replace(/(<([^>]+)>)/ig, '');

            indexSize = indexSize + text.length;
            if (indexSize > maxIndexSize) {
                this.log.warn.ln('搜索索引太大，索引现在禁用');
                searchIndexEnabled = false;
                return page;
            }

            var keywords = [];
            if (page.search) {
                keywords = page.search.keywords || [];
            }

            // 添加到索引
            var doc = {
                url: this.output.toURL(page.path),
                title: page.title,
                summary: page.description,
                keywords: keywords.join(' '),
                body: text
            };

            documentsStore[doc.url] = doc;
            getSearchIndex(this).add(doc);

            return page;
        },

        // 将索引写入磁盘
        'finish': function() {
            if (this.output.name != 'website') return;

            this.log.debug.ln('编写搜索索引');
            return this.output.writeFile('search_index.json', JSON.stringify({
                index: getSearchIndex(this),
                store: documentsStore
            }));
        }
    }
};

