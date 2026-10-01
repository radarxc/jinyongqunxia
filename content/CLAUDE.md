# content 协作约定

schema 即文档；新增内容先查稳定 ID，禁止重复定义。`_drafts/` 不进生产发现器。正式文件 UTF-8、LF、单一 YAML document，不用 anchor、隐式日期或重复键；提交前运行 `pnpm content:validate` 与 `pnpm check`。
