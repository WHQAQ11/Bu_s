# CLAUDE.md

本文件为Claude Code (claude.ai/code)在此代码仓库中工作时提供指导。

## 项目概述

**每日一卦 (Bu-frontend)** 是一个基于React的占卜/易经前端应用，采用现代Web技术构建。

### 技术栈
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式系统**: Tailwind CSS 定制设计系统
- **状态管理**: Zustand 带持久化
- **路由系统**: React Router v6
- **HTTP客户端**: Axios
- **部署平台**: Vercel

### 项目结构
```
frontend/
├── src/
│   ├── components/
│   │   ├── Layout.tsx          # 主应用布局容器
│   │   └── ui/                 # UI组件
│   │       ├── ClassicBagua.tsx        # 传统八卦图组件
│   │       ├── DivinationAnimation.tsx # 占卜动画容器
│   │       ├── LiuYaoAnimation.tsx     # 六爻占卜动画
│   │       ├── MeiHuaAnimation.tsx     # 梅花易数动画
│   │       └── TrigramSymbol.tsx       # 单独卦象符号
│   ├── pages/                  # 页面组件
│   │   ├── Home.tsx           # 首页
│   │   ├── Divination.tsx     # 占卜选择页
│   │   ├── DivinationResult.tsx # 占卜结果展示页
│   │   ├── BaguaPage.tsx      # 专用八卦图页面
│   │   ├── AnimationDemo.tsx  # 动画演示页面
│   │   └── auth/              # 认证相关页面
│   ├── services/              # API服务
│   │   └── auth.ts           # 认证服务
│   ├── store/                 # Zustand状态存储
│   │   └── authStore.ts      # 认证状态管理
│   ├── types/                 # TypeScript类型定义
│   │   └── auth.ts           # 认证相关类型
│   └── utils/                 # 工具函数
├── public/                    # 静态资源
└── dist/                      # 构建输出
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

### 类型检查
```bash
# TypeScript编译检查（包含在构建中）
npm run build
```

## 架构与关键模式

### 状态管理
- **Zustand** 配合localStorage持久化认证状态
- 认证存储 (`src/store/authStore.ts`) 处理用户认证、令牌管理和持久化会话
- 使用 `createJSONStorage` 中间件自动同步localStorage

### 路由结构
- 主应用使用嵌套路由配合Layout容器
- 特例：`/bagua` 路由独立渲染，不使用Layout
- 支持认证的路由保护机制

### 组件架构
- **UI组件**: 位于 `src/components/ui/` 用于可复用UI元素
- **页面组件**: 位于 `src/pages/` 的路由级组件
- **布局系统**: 单个Layout组件包装大部分路由（除`/bagua`外）

### 动画系统
- **DivinationAnimation.tsx**: 占卜动画的全屏模态容器
- **LiuYaoAnimation.tsx**: 带铜钱投掷效果的六爻占卜
- **MeiHuaAnimation.tsx**: 基于时间计算的梅花易数占卜
- 动画使用CSS关键帧配合Tailwind自定义动画

### 样式系统
- **Tailwind CSS** 配合广泛的自定义主题扩展
- **自定义色彩方案**: 主蓝紫色调、金色点缀、午夜深色主题
- **自定义动画**: 20+个占卜效果的关键帧动画
- **中文字体**: 针对中文字符优化的字体堆栈

### 认证流程
- 基于JWT的认证配合持久化会话
- AuthService处理API调用和令牌存储
- 应用启动时自动初始化认证
- 带认证状态验证的路由保护

## 关键配置

### 路径别名 (tsconfig.json)
```typescript
"@/*": ["src/*"]
"@/components/*": ["src/components/*"]
"@/pages/*": ["src/pages/*"]
"@/store/*": ["src/store/*"]
"@/services/*": ["src/services/*"]
"@/types/*": ["src/types/*"]
```

### Vite配置
- React插件配合Fast Refresh
- 路径解析别名匹配tsconfig
- 开发服务器运行在3000端口
- 启用源码映射用于调试

### Tailwind配置
- 扩展色彩系统配合神秘主题（主色、金色、午夜色、卦象色彩）
- 占卜效果的自定义动画
- 中文字体优化字体族
- 响应式设计工具

## 开发工作流程

### GitHub协作工作流程原则

**重要原则：所有项目改动都必须遵循以下标准化流程**

#### 1. Issue创建标准
- **标题格式**: `类型(范围): 简短描述` (遵循语义化命名)
- **描述结构**:
  ```
  **目标**
  [清晰的改动目标说明]

  **验收标准**
  - [ ] 具体的验收条件1
  - [ ] 具体的验收条件2
  - [ ] 代码质量要求
  - [ ] 测试要求
  ```

#### 2. 分支管理策略
- **主分支**: `main` (生产环境，Vercel部署源)
- **功能分支**: `类型/issue编号-简短描述`
- **分支命名示例**: `refactor/issue1-standard-yao-symbols`

#### 3. 标准工作流程
1. **创建Issue** → 标准化的标题和描述
2. **创建专用分支** → `git checkout -b 类型/issue编号-简短描述`
3. **制定修改计划** → 详细的技术实施方案
4. **执行代码修改** → 符合Issue验收标准
5. **🆕 本地验证和质量检查** → 启动开发服务器进行实际验证
6. **创建Pull Request** → 关联Issue (`Closes #编号`)
7. **代码审查** → 验证所有验收标准
8. **合并到主分支** → Issue自动关闭

#### 4. Pull Request规范
- **标题**: 与Issue标题保持一致
- **描述**: 包含修改内容和测试结果
- **关联**: 必须使用 `Closes #编号` 关联Issue
- **自动化**: PR合并后对应Issue自动关闭

#### 5. 本地验证和质量检查（🆕 重要步骤）

**原则：前端修改必须经过本地实际验证，确保视觉效果和用户体验达到预期**

##### 5.1 技术验证
- [ ] **编译检查**：`npm run build` 无错误
- [ ] **类型检查**：TypeScript编译通过
- [ ] **代码质量**：ESLint检查通过（如果有配置）
- [ ] **代码格式化**：`npm run format` 格式化代码

##### 5.2 前端视觉验证（核心）
- [ ] **启动开发服务器**：`npm run dev`
- [ ] **功能测试**：修改的功能是否正常工作
- [ ] **视觉检查**：
  - UI组件显示正确
  - 动画效果流畅
  - 响应式设计适配（桌面端、平板、手机）
  - 颜色、字体、布局符合预期
- [ ] **交互测试**：用户交互是否正常
- [ ] **控制台检查**：无JavaScript错误或警告

##### 5.3 特定验证重点

**UI/UX修改：**
- [ ] 组件渲染正确性
- [ ] 动画流畅性和时序
- [ ] 颜色对比度和可访问性
- [ ] 移动端适配
- [ ] 文字可读性

**动画修改：**
- [ ] 动画时序和节奏符合设计
- [ ] 性能影响（60fps检查）
- [ ] 浏览器兼容性测试
- [ ] 动画可中断性
- [ ] 动画状态转换正确

**交互功能修改：**
- [ ] 用户交互响应正确
- [ ] 表单验证功能正常
- [ ] 错误处理和用户反馈
- [ ] 键盘导航支持

##### 5.4 跨浏览器验证
- [ ] **Chrome**：主要测试浏览器
- [ ] **Firefox**：Firefox测试
- [ ] **Safari**：Safari测试（如果可用）
- [ ] **Edge**：Edge测试
- [ ] **移动端浏览器**：iOS Safari、Android Chrome

##### 5.5 验收标准确认
- [ ] 与Issue中的验收标准逐一对比
- [ ] 确认所有功能点都已实现
- [ ] 视觉效果达到预期质量
- [ ] 没有破坏现有功能
- [ ] 性能影响在可接受范围内

#### 6. 代码质量要求
- 运行 `npm run lint` 检查代码质量
- 运行 `npm run build` 确保编译通过
- 手动测试核心功能
- 使用 `npm run format` 格式化代码

### 分支策略
- `main`: 生产分支 (Vercel部署源)
- `类型/issue编号-描述`: 遵循GitHub工作流程的功能/修复分支

### 提交前检查
1. 确保分支基于最新的 `main` 分支
2. 运行 `npm run lint` 检查代码问题
3. 运行 `npm run build` 确保TypeScript编译
4. 手动测试核心功能
5. 使用 `npm run format` 格式化代码

### 部署
- Vercel自动部署 `main` 分支
- PR可使用预览部署
- 构建输出到 `dist/` 目录

## 八卦系统实现

### 八卦类型
- **后天八卦**: 应用中统一使用以保持一致性
- **ClassicBagua.tsx**: 主要八卦图组件
- **TrigramSymbol.tsx**: 单独卦象渲染

### 一致性说明
所有八卦图都使用后天八卦序列，以保持页面间的一致性（首页、八卦页面、占卜页面）。

## 动画系统详情

### 六爻占卜动画
- 3枚铜钱投掷 × 6条爻线 = 总计18次铜钱动画
- 从下到上的渐进式爻线构建
- 变爻（老阳/老阴）配合发光效果
- 时长：约15-20秒

### 梅花易数动画
- 基于时间的计算显示
- 数字处理和公式可视化
- 卦象组合效果
- 时长：约10-15秒

### 动画容器
- 带深色遮罩的全屏模态
- 3秒后显示跳过按钮
- 完成后自动导航到结果页面
- 移动端/桌面端响应式设计

## API集成

### 认证服务
- 登录/注册端点
- JWT令牌管理
- 自动令牌刷新（如果实现）
- 用户资料管理

### API基础URL
在环境变量或AuthService实现中配置（检查 `src/services/auth.ts` 获取当前设置）。

## 测试注意事项

### 手动测试清单
- [ ] 认证流程（登录/登出/注册）
- [ ] 八卦图显示一致性
- [ ] 动画播放和完成
- [ ] 页面间导航
- [ ] 移动端响应式设计
- [ ] 控制台无错误运行

### 动画测试
- 测试六爻和梅花易数两种动画
- 验证跳过功能正常工作
- 检查到结果页面的导航
- 测试动画中断和恢复

## 常见开发任务

### 添加新动画类型
1. 在 `src/components/ui/` 中创建新组件
2. 遵循现有动画模式（LiuYaoAnimation/MeiHuaAnimation）
3. 添加到DivinationAnimation.tsx路由
4. 更新类型和接口

### 新组件样式
- 使用现有的Tailwind自定义色彩（主色、金色、午夜色）
- 遵循神秘/占卜主题指导原则
- 使用Tailwind断点实现响应式设计
- 使用tailwind.config.js中的自定义动画

### 状态管理
- 在 `src/store/` 中创建新的Zustand存储
- 遵循现有authStore模式配合持久化
- 在 `src/types/` 中添加TypeScript类型

## 部署注意事项

### 环境变量
确保为API端点和任何服务密钥配置适当的环境变量。

### 构建过程
```bash
npm run build  # TypeScript编译 + Vite构建
```
输出到 `dist/` 目录，准备Vercel部署。

### Vercel配置
- 构建命令: `npm run build`
- 输出目录: `dist`
- Node版本: 使用最新LTS版本

## 🔧 本地验证最佳实践指南

### 🎯 为什么本地验证如此重要？

**避免的问题：**
- ❌ PR提交后发现视觉效果不理想
- ❌ 动画在不同浏览器中表现不一致
- ❌ 响应式设计在移动端显示异常
- ❌ 交互功能在实际使用中出现问题

**带来的好处：**
- ✅ 提高代码质量和用户体验
- ✅ 减少PR修改次数
- ✅ 确保跨浏览器兼容性
- ✅ 提前发现性能问题

### 📋 验证清单模板（可复制使用）

#### 通用验证清单
```markdown
## 验证报告 - [Issue标题]

### 技术验证
- [x] 编译检查：`npm run build` ✅ 无错误
- [x] 类型检查：TypeScript编译 ✅ 通过
- [x] 代码格式化：`npm run format` ✅ 完成
- [x] 开发服务器：`npm run dev` ✅ 正常启动

### 功能验证
- [ ] 主要功能测试
- [ ] 边界情况测试
- [ ] 错误处理测试
- [ ] 性能影响评估

### 视觉验证
- [ ] UI组件显示正确
- [ ] 动画效果流畅
- [ ] 颜色和字体符合设计
- [ ] 响应式适配正常
- [ ] 移动端体验良好

### 交互验证
- [ ] 用户交互响应正确
- [ ] 表单验证正常
- [ ] 键盘导航支持
- [ ] 无障碍访问支持

### 浏览器兼容性
- [ ] Chrome ✅
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] 移动端浏览器

### 验收标准确认
- [x] Issue验收标准1
- [x] Issue验收标准2
- [ ] 未破坏现有功能
- [ ] 性能影响可接受

### 测试环境
- 操作系统：[Windows/macOS/Linux]
- 浏览器版本：[具体版本]
- 屏幕分辨率：[主要测试分辨率]
```

### 🚀 常见问题和解决方案

#### 1. 动画性能问题
**症状**：动画卡顿、掉帧
**解决方案**：
- 使用Chrome DevTools Performance面板分析
- 检查CSS动画复杂度
- 考虑使用CSS `will-change` 属性
- 优化重绘和回流

#### 2. 响应式布局问题
**症状**：移动端显示异常
**解决方案**：
- 使用Chrome DevTools Device Mode测试
- 检查Tailwind断点设置
- 验证flex和grid布局
- 测试不同屏幕尺寸

#### 3. 跨浏览器兼容性
**症状**：某些浏览器功能异常
**解决方案**：
- 使用Can I Use检查API支持
- 添加polyfill（如果需要）
- 使用CSS前缀
- 测试主流浏览器版本

#### 4. TypeScript类型错误
**症状**：编译时类型错误
**解决方案**：
- 检查类型定义是否正确
- 使用TypeScript严格模式
- 添加必要的类型注解
- 更新依赖包版本

### 📱 验证工具和技巧

#### Chrome DevTools 使用
- **Elements面板**：检查DOM结构和样式
- **Console面板**：查看JavaScript错误
- **Network面板**：检查资源加载
- **Performance面板**：分析性能瓶颈
- **Device Mode**：模拟移动设备

#### 响应式测试
- 使用浏览器开发者工具的设备模式
- 测试常见移动设备尺寸
- 检查触摸交互
- 验证横屏/竖屏切换

#### 性能测试
- 使用Lighthouse评估整体性能
- 检查First Contentful Paint (FCP)
- 监控Time to Interactive (TTI)
- 分析Cumulative Layout Shift (CLS)

### 🔧 验证环境设置

#### 推荐的验证工具
- **浏览器**：Chrome, Firefox, Safari, Edge
- **设备**：桌面端、平板、手机
- **工具**：Chrome DevTools, Lighthouse

#### 开发者工具扩展
- React Developer Tools
- Vue.js devtools
- Tailwind CSS IntelliSense
- Accessibility Insights for Web

### 📈 持续改进建议

1. **建立验证习惯**：每次代码修改后都进行本地验证
2. **记录问题模式**：常见问题和解决方案记录在文档中
3. **自动化测试**：逐步添加自动化测试覆盖
4. **用户反馈**：收集实际用户使用反馈并改进

### ⚠️ 注意事项

- **不要跳过验证步骤**：即使看起来很小的修改也要验证
- **多浏览器测试**：不要只在Chrome中测试
- **移动端优先**：越来越多的用户使用移动设备
- **性能考虑**：美观的同时要注意性能影响

**记住：本地验证的时间投入会大大减少后续修复的时间和成本！**