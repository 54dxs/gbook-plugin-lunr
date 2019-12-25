# lunr

该插件提供了[搜索](https://github.com/54dxs/gbook-plugin-search)插件的后端。

该插件是默认插件。

### 禁用此插件

这是默认插件，可以使用以下 `book.json` 配置禁用它：

```js
{
    "plugins": ["-lunr"]
}
```

### 局限性

Lunr不能为一本巨大的书编制索引，默认情况下，索引大小限制为 ~100ko

您可以通过设置配置来更改此限制 `maxIndexSize`：

```js
{
    "pluginsConfig": {
        "lunr": {
            "maxIndexSize": 200000
        }
    }
}
```

### 向页面添加关键字

您可以为任何页面指定显式关键字。搜索这些关键字时，页面在结果中的排名会更高。

```md
---
search:
    keywords: ['keyword1', 'keyword2', 'etc.']

---

# My Page

This page will rank better if we search for 'keyword1'.
```

### 禁用页面索引

您可以通过向页面添加YAML标头来禁用特定页面的索引编制：

```md
---
search: false
---

# My Page

This page is not indexed in Lunr.
```

### 忽略特殊字符

默认情况下，将考虑特殊字符，以允许特殊搜索，例如 "C++" 或 "#word"。如果您的文字基本上是英文散文，则可以禁用此 `ignoreSpecialCharacters` 选项，并带有以下选项：

```js
{
    "pluginsConfig": {
        "lunr": {
            "ignoreSpecialCharacters": true
        }
    }
}
```
