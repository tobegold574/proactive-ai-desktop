# ProactiveAI Desktop

基于 electron-vite + React 的 AI 桌面聊天应用。

## 功能特性

- 🤖 主动对话 - AI 会主动关心你，不只是被动响应
- 🧠 智能记忆 - 记住你的偏好、习惯和重要事项
- 🔒 隐私优先 - 本地存储，数据不经过服务器
- 🎯 分层记忆 - 重要信息自动压缩，高效不丢失关键
- 🎨 现代UI - 基于 React + TailwindCSS 的现代化界面
- 👥 人设模板 - 多种 AI 人设可选
- 🔌 插件扩展（类型与协议已预留，插件市场/运行时加载尚未实现）

## 环境要求

- Node.js >= 20
- npm >= 10

## 开发

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建

```bash
npm run build
```

### 打包

```bash
npm run dist:win    # Windows
npm run dist:mac    # macOS
npm run dist:linux  # Linux
```

## Windows 开发环境配置

### 安装 Node.js

推荐使用 [nvm-windows](https://github.com/coreybutler/nvm-windows) 管理 Node.js 版本：

```powershell
# 安装 Node.js 20 LTS
nvm install 20
nvm use 20
```

### 安装 Git

下载 [Git for Windows](https://git-scm.com/download/win)，安装时选择：
- Use Git from Git Bash only
- Checkout Windows-style, commit Unix-style line endings

### 安装 VS Code (推荐)

下载 [VS Code](https://code.visualstudio.com/)，安装后安装推荐扩展：
- ESLint
- Prettier
- Tailwind CSS IntelliSense

### 配置 Git

```bash
git config --global core.autocrlf true
```

### 克隆项目并开发

```powershell
git clone <your-repo-url>
cd proactive-ai-desktop
npm install
npm run dev
```

## 项目结构

```
proactive-ai-desktop/
├── src/
│   ├── main/              # Electron 主进程
│   │   ├── index.ts       # 主进程入口
│   │   ├── chat-core.ts   # 核心聊天功能
│   │   ├── conversation-store.ts
│   │   ├── message-store.ts
│   │   ├── template-store.ts
│   │   └── config-store.ts
│   ├── preload/           # 预加载脚本
│   │   └── index.ts
│   ├── renderer/          # React 渲染进程
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── api.ts
│   │   ├── components/    # UI 组件
│   │   │   ├── ChatArea/
│   │   │   ├── InputArea/
│   │   │   ├── Settings/
│   │   │   └── Sidebar/
│   │   ├── hooks/         # 自定义 Hooks
│   │   ├── stores/         # Zustand 状态管理
│   │   └── utils/          # 工具函数
│   └── shared/            # 共享类型和配置
│       ├── types.ts
│       ├── config.ts
│       ├── constants.ts
│       └── prompt-templates.ts
├── public/                # 静态资源
├── electron.vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## 配置

首次使用时需要在设置中配置 OpenAI API Key。

## 许可证

MIT
