# CLAUDE.md

本文件为Claude Code (claude.ai/code)在此代码仓库中工作时提供指导。

## 修改原则
- 每次阶段性的功能添加或者修改，都需要先深度思考修改所涉及的代码，以及如何修改，然后列出修改清单.md，接下来列出todolist，然后进行任务的coding修改，每完成一个任务都要及时更新任务状态，便于追踪。当阶段性功能添加或修改后，要以提PR的方式提交到对应github仓库，写清楚描述。

## 项目概述

**每日一卦 (Bu-frontend)** 是一个基于React + Supabase的占卜/易经前端应用，采用现代Web技术构建。

### 技术栈
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式系统**: Tailwind CSS
- **后端服务**: Supabase (数据库 + 认证)
- **状态管理**: Zustand
- **路由系统**: React Router v6
- **HTTP客户端**: Axios + Supabase Client

### 项目结构
```
frontend/
├── src/
│   ├── components/
│   │   ├── Layout.tsx              # 主应用布局容器
│   │   ├── ui/                     # UI组件
│   │   │   ├── ClassicBagua.tsx    # 传统八卦图组件
│   │   │   ├── DivinationAnimation.tsx # 占卜动画容器
│   │   │   ├── LiuYaoAnimation.tsx # 六爻占卜动画
│   │   │   ├── MeiHuaAnimation.tsx # 梅花易数动画
│   │   │   ├── TrigramSymbol.tsx   # 单独卦象符号
│   │   │   └── YaoSymbol.tsx       # 爻符号组件
│   │   └── AuthProvider.tsx        # 认证提供者组件
│   ├── pages/                      # 页面组件
│   │   ├── Home.tsx               # 首页
│   │   ├── Divination.tsx         # 占卜选择页
│   │   ├── DivinationResult.tsx   # 占卜结果展示页
│   │   ├── BaguaPage.tsx          # 专用八卦图页面
│   │   ├── AnimationDemo.tsx      # 动画演示页面
│   │   ├── LoginPage.tsx          # 登录页面
│   │   ├── RegisterPage.tsx       # 注册页面
│   │   ├── Profile.tsx            # 用户资料页
│   │   └── ResultPage.tsx         # 结果页面
│   ├── supabase/                   # Supabase相关
│   │   ├── services/
│   │   │   ├── client.ts          # Supabase客户端配置
│   │   │   ├── auth.ts            # 认证服务
│   │   │   ├── hexagram.ts        # 卦象服务
│   │   │   └── divination.ts      # 占卜服务
│   │   ├── types/                 # Supabase类型定义
│   │   └── components/            # Supabase组件
│   ├── services/                   # API服务
│   │   ├── auth.ts               # 认证服务
│   │   └── divination.ts         # 占卜服务
│   ├── store/                     # Zustand状态存储
│   │   └── authStore.ts          # 认证状态管理
│   ├── types/                     # TypeScript类型定义
│   │   ├── auth.ts               # 认证相关类型
│   │   ├── divination.ts         # 占卜相关类型
│   │   └── supabase.ts           # Supabase类型
│   ├── utils/                     # 工具函数
│   │   └── iChingUtils.ts        # 易经工具函数
│   ├── App.tsx                    # 主应用组件
│   ├── main.tsx                   # 应用入口
│   └── vite-env.d.ts             # Vite类型定义
├── public/                        # 静态资源
└── dist/                          # 构建输出
```

## 开发命令

### 核心开发
```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### 代码质量
```bash
# 运行ESLint检查问题
npm run lint

# 自动修复ESLint问题
npm run lint:fix

# 使用Prettier格式化代码
npm run format
```

## 核心架构

### Supabase集成
- **认证系统**: 使用Supabase Auth处理用户注册/登录
- **数据库**: PostgreSQL存储用户数据和占卜记录
- **实时功能**: 支持实时数据更新
- **文件存储**: 用于存储卦象图片等资源

### 状态管理
- **Zustand** 配合localStorage持久化认证状态
- 认证存储 (`src/store/authStore.ts`) 处理用户认证、令牌管理和持久化会话

### 路由结构
- 主应用使用嵌套路由配合Layout容器
- 特例：`/bagua` 路由独立渲染，不使用Layout
- 支持认证的路由保护机制

### 八卦系统
- **后天八卦**: 应用中统一使用以保持一致性
- **ClassicBagua.tsx**: 主要八卦图组件
- **TrigramSymbol.tsx**: 单独卦象渲染

### 动画系统
- **DivinationAnimation.tsx**: 占卜动画的全屏模态容器
- **LiuYaoAnimation.tsx**: 带铜钱投掷效果的六爻占卜
- **MeiHuaAnimation.tsx**: 基于时间计算的梅花易数占卜

## 环境配置

### Supabase环境变量
需要在`.env`文件中配置：
```
VITE_SUPABASE_URL=你的supabase项目url
VITE_SUPABASE_ANON_KEY=你的supabase匿名密钥
```

### 路径别名 (tsconfig.json)
```typescript
"@/*": ["src/*"]
"@/components/*": ["src/components/*"]
"@/pages/*": ["src/pages/*"]
"@/store/*": ["src/store/*"]
"@/services/*": ["src/services/*"]
"@/types/*": ["src/types/*"]
"@/utils/*": ["src/utils/*"]
```

## 部署

### Vercel配置
- **构建命令**: `npm run build`
- **输出目录**: `dist`
- **Node版本**: 使用最新LTS版本
- **环境变量**: 在Vercel控制台配置Supabase环境变量

### 本地构建
```bash
npm run build  # TypeScript编译 + Vite构建
```

## 开发注意事项

### Supabase最佳实践
- 使用RLS(Row Level Security)保护数据
- 合理使用Supabase Realtime功能
- 定期备份重要数据

### 认证流程
- 基于Supabase Auth的认证系统
- 支持邮箱密码登录/注册
- 自动处理令牌刷新和会话管理

### 代码质量
- 运行 `npm run lint` 检查代码质量
- 运行 `npm run build` 确保TypeScript编译通过
- 使用 `npm run format` 格式化代码
- 本地测试功能正常后再提交

### 八卦一致性
所有八卦图都使用后天八卦序列，以保持页面间的一致性（首页、八卦页面、占卜页面）。

