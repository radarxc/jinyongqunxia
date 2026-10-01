# @tianshu/platform

浏览器适配层：存储、输入、音频与 CoreHost。不得包含玩法判断；外部完成时序不得改变规则结果。CoreHost 默认 Worker、可回退主线程，消息只能是可序列化的命令、结果和快照。存储实现归 ENG-01，本任务只定义端口。
