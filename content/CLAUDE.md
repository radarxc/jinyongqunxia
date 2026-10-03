# content 协作约定

schema 即文档；新增内容先查稳定 ID，禁止重复定义。`_drafts/` 不进生产发现器。正式文件 UTF-8、LF、单一 YAML document，不用 anchor、隐式日期或重复键；提交前运行 `pnpm content:validate` 与 `pnpm check`。

Ink 放在 `story/**/<storyId>.ink`，并配同名 `.inkmeta.yaml`；`#ts:` 只用构建器白名单。
M1 Ink 动作使用 `quest/advance`、`battle/start`、`flag/set`、`party/giveItem`、
`party/takeItem`、`world/openEntrance`、`tutorial/mark`、`story/requestTransmission`、
`ui/openAllocation`、`ui/showTitleCard`、`save/autosave`、`dialogue/speaker`。
参数必须是 `key=value` 标量；未知、重复、多余、缺失或值域错误均阻断构建。
发布前运行 `pnpm content:build`，不得手改 `.cache/content-build/` 或 `dist/content/`。
