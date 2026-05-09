# src/lib/ 目录

工具库与业务逻辑封装。

## 文件说明

| 文件 | 说明 |
|------|------|
| db.ts | Prisma Client 单例实例 |
| api.ts | 前端 API 请求封装 |
| github.ts | GitHub Search API 调用封装 |
| llm.ts | LLM 通用客户端（OpenAI SDK 兼容模式） |
| webpush.ts | Web Push 发送封装 |
| cron.ts | 定时任务逻辑（node-cron） |
| trending.ts | Trending 服务层逻辑 |
| recommend.ts | 推荐算法实现 |
