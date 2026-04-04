# Fut.Map

[English README](./README.md)

Fut.Map 是一个基于 Next.js 构建的足球地图演示项目。它从一个强调氛围感的落地页开始，进入 3D 地球视图展示国家队，再切换到 2D 世界地图展示联赛与俱乐部的地理分布。

当前仓库主要面向 demo 展示，核心能力包括：

- 3D 地球视图展示重点国家队
- 2D 地图展示俱乐部队徽、联赛标志与地理位置
- 点击球队后按需刷新侧边栏信息
- 使用本地快照缓存，尽量降低 API 消耗并提升演示稳定性

## Demo 说明

- 当前 demo 主要展示 `2024` 年联赛数据，这是基于 API-Football 免费额度做的取舍。
- 俱乐部基础数据会按联赛分批导入，并缓存在 [data/cache/football-snapshot.json](/Users/a1234/Documents/Playground/data/cache/football-snapshot.json)。
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

## 当前限制

- 免费 API 同时受“日额度”和“每分钟限流”限制。
- 某些联赛如果没有确认过真实 logo 来源，就不会显示联赛标志。
- 部分低级别联赛或已解散球队，可能只会展示缓存/历史档案。
- 当前球队与联赛图标混合使用了 provider 外链、Wikimedia 资源和本地静态资源。