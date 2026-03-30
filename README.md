# TechStack Share

あなたの技術スタックと熟練度をいい感じに共有できるアプリ

**公式:** https://techstack-share.vercel.app

バグ報告や機能リクエストは [Issue](https://github.com/thirdlf03/techstack-share/issues) に投げてください。

## セルフホスト

Vercel等にデプロイして自分でホストできます。

### 環境変数

| 変数名 | 必須 | 説明 |
|---|---|---|
| `GITHUB_PAT` | はい | GitHub Fine-grained Personal Access Token（Issueの作成に使用。スコープ: `Issues: Read and Write`） |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | はい | Cloudflare Turnstile のサイトキー（フォームのbot対策） |
| `TURNSTILE_SECRET_KEY` | はい | Cloudflare Turnstile のシークレットキー |

### セットアップ

```bash
git clone https://github.com/thirdlf03/techstack-share.git
cd techstack-share
pnpm install
pnpm dev
```

#### GitHub PAT の取得

1. https://github.com/settings/tokens?type=beta でFine-grained tokenを作成
2. Repository access でこのリポジトリ（またはfork先）を選択
3. Permissions → **Issues: Read and Write** のみ有効化

#### Cloudflare Turnstile の取得

1. https://dash.cloudflare.com/ → Turnstile → サイトを追加
2. ホスト名にデプロイ先のドメインと `localhost` を設定
3. サイトキーとシークレットキーを取得

## ライセンス

[MIT](./LICENSE)

このプロジェクトが使用するサードパーティライセンスについては [THIRD_PARTY_LICENSES.md](./THIRD_PARTY_LICENSES.md) を参照してください。
