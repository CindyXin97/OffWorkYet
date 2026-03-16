<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Off Work Yet? (下班了吗)

工作时间追踪器：前端 + Supabase（数据库 + 认证）一体化，无需单独后端。

## 快速开始

### 1. 创建 Supabase 项目

1. 打开 [supabase.com/dashboard](https://supabase.com/dashboard)
2. 点 **New Project**，填项目名和数据库密码
3. 等项目创建完成

### 2. 配置数据库

1. 进入 Supabase Dashboard → **SQL Editor**
2. 复制 `supabase-schema.sql` 的内容并执行
3. 这会创建所有需要的表和安全策略

### 3. 获取 API Keys

1. 进入 **Project Settings → API**
2. 复制：
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

### 4. 本地运行

```bash
# 安装依赖
npm install

# 复制环境变量
cp .env.example .env

# 编辑 .env，填入上面的 URL 和 Key

# 启动
npm run dev
```

浏览器打开 http://localhost:3000

---

## 部署到 Vercel

### 方式 1：Vercel + Supabase 集成（推荐）

1. 在 Vercel 导入 GitHub 仓库
2. 在 Vercel 项目 Settings → Integrations → 添加 Supabase
3. 选择你的 Supabase 项目，会自动注入环境变量
4. 部署即可

### 方式 2：手动配置

1. 在 Vercel 导入 GitHub 仓库
2. 在 Settings → Environment Variables 添加：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. 部署

---

## 技术栈

- **前端**: React + Vite + TypeScript
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **部署**: Vercel

## 数据安全

使用 Supabase Row Level Security (RLS)：
- 用户只能修改自己的数据
- Plaza（广场）可以看到其他用户的日报（匿名展示）
