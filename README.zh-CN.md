# Fut.Map

[English README](./README.md)

线上预览：[https://fm.eiddie.top](https://fm.eiddie.top)

Fut.Map 是一个基于 Next.js 的足球地图演示项目。它从一个强调氛围感的落地页开始，进入 3D 地球视图展示国家队，再切换到 2D 世界地图查看俱乐部分布。

当前公开仓库主要聚焦于上面这条线上预览所对应的主版本体验。如果你想尝试别的国际地图服务或自行做海外版本，可以基于这个仓库自由探索。

## 预览说明

- 当前线上站点是演示预览，不是实时生产数据服务。
- 3D 地球里的飞线是模拟效果。
- 默认赛季固定为 `2024`，因为这个项目在 API-Football 免费档下，`2024` 是相对更稳定的演示方案。
- 也因此，默认 demo 并不是真正的实时数据展示。
- 如果你自行部署并使用付费 API-Football 套餐，可以把 `API_FOOTBALL_LATEST_SEASON` 改成套餐支持的最新赛季，并复用现有导入和刷新链路，做到接近实时或实时的数据展示。

## 技术栈

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Mapbox GL
- Three.js
- API-Football

## 本地开发

1. 安装依赖

```bash
npm install
```

2. 复制环境变量示例

```bash
cp .env.local.example .env.local
```

3. 填写必需变量

- `NEXT_PUBLIC_MAPBOX_TOKEN`
- `NEXT_PUBLIC_TIANDITU_KEY`
- `API_FOOTBALL_KEY`
- `API_FOOTBALL_BASE_URL`
- `API_FOOTBALL_LATEST_SEASON`

可选变量：

- `BLOB_READ_WRITE_TOKEN`，用于在 Vercel 上持久化保存 snapshot

推荐默认值：

- API-Football 免费档：`API_FOOTBALL_LATEST_SEASON=2024`
- API-Football 付费档：把 `API_FOOTBALL_LATEST_SEASON` 设成你套餐可访问的最新赛季，比如 `2025` 或 `2026`

4. 启动项目

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

## 数据说明

- 页面会先读取缓存的足球 snapshot，再按需刷新。
- 点击球队徽标后，在额度允许时会触发服务端同步最近比赛、下一场比赛、教练、荣誉和最近阵容。
- 如果球队已经改名、解散、暂时不在 provider 覆盖范围内，或者当天免费额度已经耗尽，界面会回退到缓存/历史档案，而不是直接空白。
- 首次部署后，如果还没有把联赛数据导入 snapshot 存储，2D 地图里的俱乐部列表可能不会完整出现。

## 当前限制

- 免费 API 同时受日额度和速率限制影响。
- 某些联赛可能仍然缺少已确认来源的联赛 logo。
- 部分低级别联赛或已解散球队，可能只展示缓存/历史档案。
- 当前球队和联赛图标仍混合使用 provider 外链、Wikimedia 资源和本地静态资源。
