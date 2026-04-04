# Fut.Map

[English README](./README.md)

Fut.Map 是一个基于 Next.js 构建的足球地图演示项目。它从一个强调氛围感的落地页开始，进入 3D 地球视图展示国家队，再切换到 2D 世界地图展示联赛与俱乐部的地理分布。

当前仓库主要面向 demo 展示，核心能力包括：

- 3D 地球视图展示重点国家队
- 2D 地图展示俱乐部队徽、联赛标志与地理位置
- 点击球队后按需刷新侧边栏信息
- 使用本地快照缓存，尽量降低 API 消耗并提升演示稳定性

## Demo 说明

- 当前默认赛季是 `2024`。
- 这是刻意设计：这个项目默认按 API-Football 免费档去跑，免费档在这里更稳定的是往年赛季数据。
- 如果你使用的是付费 API-Football 套餐，只需要把 `API_FOOTBALL_LATEST_SEASON` 改成你的套餐可访问的最新赛季，现有的导入和刷新链路就会按那个赛季去请求。
- 俱乐部基础数据在本地开发时会写入本地 snapshot；部署到 Vercel 且配置了 `BLOB_READ_WRITE_TOKEN` 后，会写入 Vercel Blob 持久化保存。
- 点击球队徽标时，如果额度允许，服务端会尝试同步最近赛况、下一场比赛、教练、荣誉和最近一场阵容。
- 如果球队已经改名、解散、暂时不在 provider 覆盖范围内，或当天额度耗尽，界面会回退到缓存/历史档案，而不是直接空白。

## 技术栈

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Mapbox GL
- Three.js
- API-Football

## 本地运行

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

先复制示例文件：

```bash
cp .env.local.example .env.local
```

然后填写这些变量：

- `NEXT_PUBLIC_MAPBOX_TOKEN`
- `NEXT_PUBLIC_TIANDITU_KEY`
- `API_FOOTBALL_KEY`
- `API_FOOTBALL_BASE_URL`
- `API_FOOTBALL_LATEST_SEASON`
- `BLOB_READ_WRITE_TOKEN`，用于 Vercel 线上持久化 snapshot

推荐值：

- 免费 API-Football：`API_FOOTBALL_LATEST_SEASON=2024`
- 付费 API-Football：把 `API_FOOTBALL_LATEST_SEASON` 设成你的套餐能访问的最新赛季，比如 `2025` 或 `2026`

### 3. 启动项目

```bash
npm run dev
```

默认访问 [http://localhost:3000](http://localhost:3000)。

## 可用脚本

```bash
npm run dev
npm run build
npm run build:verify
npm run start
npm run test
```

## 目录结构

```text
app/                 Next.js App Router 页面和 API 路由
components/          地球、平面地图、侧边栏、落地页组件
data/                mock 数据与足球快照缓存
lib/                 足球数据管线、fallback 逻辑与工具函数
public/              纹理、地图资源、徽标、字体等静态文件
scripts/             一次性导入与修复脚本
```

## 数据流说明

### 首次加载

- 页面优先读取本地足球快照
- 3D 地球读取国家队相关数据
- 2D 地图读取俱乐部位置、联赛 id 和队徽地址

### 点击球队徽标

- 前端调用 `POST /api/football/refresh/[teamId]`
- 服务端尽量解析对应的 provider team id
- 然后再请求：
  - 最近比赛
  - 下一场比赛
  - 教练
  - 荣誉
  - 最近一场阵容

### 批量导入联赛

仓库里还提供了一个批量导入接口：

- `POST /api/football/import`

它用于按联赛把俱乐部基础身份数据增量写入本地快照，而不是在首屏就为所有球队强制拉取完整实时详情。

### 首次部署后为什么球队列表可能是空的

首次部署时，项目会先从 fallback 数据启动。大规模联赛球队列表并不会直接跟着源码一起打包，而是需要部署完成后再导入到 snapshot 存储里。

所以如果你部署后没有执行导入，线上通常只会有：

- 国家队 fallback 数据
- 少量精选俱乐部
- 还没有大规模联赛球队快照

部署完成后，可以调用下面的接口导入球队：

- `POST /api/football/bootstrap?mode=bundesliga`
- `POST /api/football/bootstrap?mode=priority`
- `POST /api/football/bootstrap?mode=all`

例如：

```bash
curl -X POST https://your-domain/api/football/bootstrap?mode=priority
```

如果你想手动导入某几个联赛，也可以直接调用：

```bash
curl -X POST https://your-domain/api/football/import \
  -H "Content-Type: application/json" \
  -d '{
    "leagues": [
      { "country": "England", "tier": 1, "leagueId": 39, "leagueName": "Premier League", "season": 2024 }
    ]
  }'
```

在 Vercel 上，只要配置了 `BLOB_READ_WRITE_TOKEN`，这些导入结果就会持久保存，不会因为重新部署或冷启动丢掉。

## 当前限制

- 免费 API 同时受“日额度”和“每分钟限流”限制。
- 当前项目默认把免费档赛季固定为 `2024`。如果要调用最新赛季，需要付费 API 套餐，并把 `API_FOOTBALL_LATEST_SEASON` 设成对应赛季。
- 某些联赛如果没有确认过真实 logo 来源，就不会显示联赛标志。
- 部分低级别联赛或已解散球队，可能只会展示缓存/历史档案。
- 当前球队与联赛图标混合使用了 provider 外链、Wikimedia 资源和本地静态资源。
