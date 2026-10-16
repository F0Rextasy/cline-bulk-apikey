# cline-bulk-apikey

**批量创建 Cline API 密钥 (workos bearer) — 9Router 连接器。零依赖。**

## 快速开始

```bash
git clone https://github.com/F0Rextasy/cline-bulk-apikey
cd cline-bulk-apikey

# 检查账户
node src/cli.js auth

# 批量创建 200 个密钥
node src/cli.js create --count 200

# 验证密钥
node src/cli.js verify
```

## 连接到 9Router

```bash
npm install -g 9router && 9router
node src/cli.js connect --keys out/cline-keys.txt
```

## 命令

| 命令 | 说明 |
| --- | --- |
| `auth` | 检查账户和余额 |
| `list` | 列出已有密钥 |
| `create --count 200` | 批量创建密钥 |
| `verify` | 验证密钥 |
| `connect` | 注册到 9Router |

## License

[MIT](../LICENSE) © 2026 cline-bulk-apikey contributors