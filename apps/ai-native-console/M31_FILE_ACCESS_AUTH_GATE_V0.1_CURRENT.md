# M31 · 授权接通实施门禁 V0.1（方案，尚未部署文件打开能力）

日期：2026-10-08

## 当前事实

- Staging Console 已有两类入口：受限 Runtime `rtk_` 凭据及仅预发共享只读模式；Runtime 已有 `GET /api/runtime/me`，验证实际 `identityId` 与 `workspace:read/project:read` 权限。
- Runtime `aigc_asset_versions.content_locator_json` 已保存版本定位元数据；`aigc_asset_libraries.permission_policy_json / rights_policy_json` 已保存资产复用/权利约束。
- Runtime `knowledge_documents` 已保存 `external_file_id, library_file_id, file_provider, current_version_id, content_fingerprint` 等索引元数据。项目绑定由 `/projects/:id/knowledge-bindings` 返回。
- **索引、文件ID和聊天中的连接器授权都不是 Railway Runtime 的文件内容读取授权。** 当前不存在完整的服务端 provider resolver + 鉴权下载链路。不得把定位元数据伪装为在线文件。

## 两级权限

1. 平台访问：登录的真实 principal，`tenantId`、`workspaceId` 与 `project:read`（写操作独立检查 `project:write`）。
2. 文件访问：依照文件来源与身份上下文，校验项目/资产版本归属、共享库复用策略、素材 rights & usage scope、provider OAuth/服务凭据可访问性、版本指纹；失败拒绝。

## Provider 接通边界

| 文件来源 | 可行方案 | 不可假设 |
| --- | --- | --- |
| ChatGPT Library | 保留 `library_file_id` 作为源证据；同步经授权的实际文件内容到后端可读取的存储后再绑定已验 SHA/version | ChatGPT 聊天文件访问能力不自动成为 Railway API |
| Google Drive | 后端独立 OAuth 连接，用户在官方授权页面授予按需只读作用域；后端存加密令牌，基于 fileId/version 提取并审计 | ChatGPT 中的 Drive 插件连接不自动授权私有 Runtime  |
| S3 兼容对象存储/R2 | 后端最小权限服务凭据、以 `tenantId/workspaceId/projectId` 隔离 key prefix；签发短效签名 URL 或由后端限流代理 | 公网永久 URL，客户端对象存储密钥 |

## 最小只读 API 合同（待实现）

- `GET /api/runtime/projects/:projectId/assets/:assetId/versions/:versionId/access`：先验证 project:read + library policy + rights + version belong to asset + provider readiness；只返回允许的文件元数据和短期访问结果或明确的阻塞码。
- `GET /api/runtime/projects/:projectId/knowledge-documents/:documentId/access`：先验证项目知识源 binding 和文档所属源，再通过该 provider 的授权适配器读取。
- 下载/预览必须限制目标域名与存储 key，无用户提供的任意 URL 转发；禁止泄露 OAuth token、Runtime bearer 与永久存储签名。
- 授权读取、拒绝、版本不匹配记录 `actor / projectId / objectId / provider / result / occurredAt` 审计；任何 rights 未通过不得降级为另一源绕过。

## Gate 验收

- 允许：有 `project:read` 的用户在真实 Staging 文件对象上打开目标版本，校验文件内容哈希与当前版本，访问写审计。
- 拒绝：未登录、跨 workspace/tenant、Viewer 无效凭据、错误 assetVersion/asset、权利限制、provider token 失效均返回 401/403/404/409，绝不提供链接。
- 撤销：撤销 Runtime 权限或 provider 授权后再次请求必须拒绝（短效 URL 不应允许长期剩余访问）。
- 有授权且无文件：显示“文件未接入/引用缺失”，不可自动伪造文件。
- 文件打开验收与浏览器单纯显示资产 ID 完全分开，不得合并 PASS。

## 当前决定

**仅明确实施方案；文件授权集成尚未实现，不属于本次获批准的 M31 V0.5 页面部署。**
**推荐迭代顺序：** 先采用后端可管理的 S3 兼容存储打通只读文件访问 + Runtime RBAC/审计；文字文档的 Google Drive OAuth 作为第二个 adapter。历史 ChatGPT Library 内容以事件驱动补录原文件、指纹与权利状态，不临时泄漏数据。生产仍 HOLD。
