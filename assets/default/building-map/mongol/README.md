# mongol · 蒙古草原建筑候选包

19件地图建筑与邻目录7件贴片供原向静态审图，全部 `candidate`。功能替换、占地来源见 [提示模板§11](../../prompts/building-map.md)；完整清单、来源和验收结果见 [KIT-mongol报告](../../../../tools/agents/reports/KIT-mongol.md)。

## 读取与审图

- [preview.html](preview.html) 展示19建筑、7贴片；可切换明暗背景，观察透明边。它不向服务器上传任何图片。
- `manifest.yaml` 为唯一汇总入口；`manifest-houses.yaml`、`manifest-civic.yaml`、`manifest-root.yaml` 是分批生成记录，不重复加载。
- `meta/<id>.yaml` 保存底面测点、像素锚点、几何误差和处理链；`sources/` / `prompts/` / 生产JSON保留实际调用与源PNG。
- 首轮`normalize-houses.py`、`civic-normalize.py`、`normalize-root.py`及生产JSON保留作历史记录，不重跑覆盖第2轮成品；本轮选择与处理参数见`repair-*-entries.json`及各meta。分批manifest同步最终登记，不重复加载。

## 几何与使用范围

基础格为64×32，`w×h`逻辑底面宽高=`32(w+h)×16(w+h)`。以13×10寺殿为例，目标宽736px、高368px；源底面左右跨度1373px，等比目标系数=`736/1373≈0.536052`。PNG画布832×656包含屋顶高度与留白，不用于反推占地。

锚点从同一底面左右角中点获得，随裁切 / 等比缩放 / 透明扩边变换。隐藏后角仅由平行边推算；圆帐与土面边界是代理，不是文物测绘。渲染时以`project(底面中心)-anchor`确定PNG左上角；换格宽时图与anchor同乘`tile_width/64`，不能按透明画布宽重复缩放。

**第2轮已逐项重出：37个建筑候选，采用14张新成品，5张保留较优旧图。** 辅助端点量测中，轴率通过9/19、宽深比通过15/19、两项同时通过6/19（小毡帐、商铺、客栈、护运货栈、宫殿、佛塔）；小毡帐边缘拟合仍超限，严格投影标记保持false。轴率容差`±0.5±0.03`、比例10%告警线仍按原建议值。
发布级未解决：其余13件至少一项端点告警，守舍宽深比偏差17.90%为本轮建筑最大值；两座城门也未通过几何/净宽校准。TODO§8明确生成图按目视一致审、精确投影交TOWN管线；因此本包已完成candidate登记，但不拉伸、warp或改占地掩盖，不能认定整套无缝release准出。

只交原向PNG；`allowRotation:false`，无GLB，四向、真实高度、碰撞分层、屋顶淡出和整城接缝仍待实测。河埠只作装饰，不开通港口或旅行入口。状态与严格几何记录不能被文件检查器通过所替代。

## 参考资料

访问日期均为2026-09-30，仅文字考据；实际图像输入以manifest的`references`为准。`visual_baseline_refs`仅记录人工目视对照。

- [UNESCO · Traditional craftsmanship of the Mongol Ger](https://ich.unesco.org/en/RL/traditional-craftsmanship-of-the-mongol-ger-and-its-associated-customs-00872)：取木架、白毡、绳索与圆形可拆构造；现代非遗资料不证明全部元代细节。
- [UNESCO · Site of Xanadu](https://whc.unesco.org/en/list/1389/)：取汉式都城、宫殿 / 寺院与游牧营地共存。木土营门、木栅和建筑细部仍为原创设计。
- [DAI · Conservation and restoration of the Great Hall of Karakorum](https://www.dainst.org/forschung/projekte/noslug/4924)：取13世纪大殿属于佛寺、中国式瓦件/屋顶技术与藏式布局影响；不把旧宫殿解释当史实。
- [DAI · Great Hall研究专著摘要](https://publications.dainst.org/books/dai/catalog/book/2052)：已读取摘要所述13–14世纪寺院解释；未用未读全文补造屋顶、彩绘或塔高。
- [Rubin Museum · White Stupa, Attributed to Anige](https://rubinmuseum.org/projecthimalayanart/essays/white-stupa-attributed-to-nepalese-artist-anige/)：取1279元代覆白覆钵体、分层基座和叠轮母题；本包佛塔不复制具名白塔尺度。
- [Pillow · Image module](https://pillow.readthedocs.io/en/stable/reference/Image.html)：核对`crop`、`resize`、RGBA和LANCZOS接口。本机实际Python3.11.0、Pillow12.1.1、PyYAML6.0.3；不声称为最新版本。

## 未决事项与默认值

默认采用13–14世纪匿名地域游戏设计；形制和用途替换均为（原创扩展）。屋顶、门窗、彩画、塔式和古代植物分布待考，未经逐字小说考据；不命名具体现存寺院或历史商号。

元骨架有对应的5类按原表；其余占地复用宋同功能包络，作为地域建议值交`design/22`后续收口。作者确认草原美术风格、佛塔选择及建议占地前，全部保持candidate；无需等待这些事项完成本次素材归档。
