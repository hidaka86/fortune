# MYOURISCOPE アナリティクスと自律改善ループ

最終更新: 2026-07-10

## 1. 計測しているもの(GA4: G-PQC4DKWZ78)

**方針: 個人情報(生年月日・名前・自由入力テキスト)は一切送らない。** 送るのは行動の種類と、結果の分類(ランク・スプレッド名など)だけ。

| イベント | 発火タイミング | パラメータ |
|---|---|---|
| `page_view` | 画面切り替えごと(SPA仮想ページビュー) | `page_title`(画面ごとに変える→GA4標準の pageTitle で画面別集計可能)、`view_name`、`page_path` |
| `today_observed` | **今日の占いの結果を初めて見た瞬間(1日1回)** — 継続のコア指標 | `rank`(大吉〜休)、`score`、`streak`(連続日数) |
| `daily_card_drawn` | 今日の一枚を引いた | `card`(札名)、`reversed` |
| `tarot_reading` | スプレッド儀式完了 | `spread`、`genre`、`cards`、`deep_shuffle`、`wind_day` |
| `reading` | 各鑑定の実行 | `kind`(integrated/western/eastern/aisho)、`theme` 等 |
| `register` | 生年月日の登録 | `via`(today/mypage) |
| `share_copy` | シェアテキストのコピー成功 | — |
| `journal_memo` / `journal_reflection` | 託宣の書き残し / 3日後の振り返り記入 | — |

> パラメータ別の集計(例: rank別のtoday_observed数)をGA4のUIやAPIで行うには、GA4管理画面 → カスタム定義 → カスタムディメンションに `rank` `spread` `via` `view_name` `kind` を「イベントスコープ」で登録する(各1分・そのうち集計に反映)。登録しなくてもイベント回数・ユーザー数は集計できる。

## 2. データの引き出し方

- **人間向け**: GA4のUI(analytics.google.com)。
- **エージェント向け**: `scripts/ga-report.mjs`(依存ゼロ・Node 18+)。

```bash
GA4_PROPERTY_ID=... GA4_SA_KEY=... node scripts/ga-report.mjs          # 7日 vs 前7日
node scripts/ga-report.mjs --days 28                                   # 期間変更
node scripts/ga-report.mjs --json                                      # 生データ(分析用)
```

## 3. APIアクセスのセットアップ(1回だけ・約10分)

1. **サービスアカウント作成**: [Google Cloud Console](https://console.cloud.google.com/) → プロジェクト作成(なければ)→「APIとサービス」→「Google Analytics Data API」を有効化 →「IAMと管理 → サービスアカウント」→ 作成(役割は不要)→「キー」タブ → JSONキーを作成しダウンロード。
2. **GA4に閲覧権限を付与**: GA4 管理 → プロパティのアクセス管理 → サービスアカウントのメールアドレス(`xxx@yyy.iam.gserviceaccount.com`)を**閲覧者**で追加。
3. **Claude Code環境に登録**: Claude Code on the Web の環境設定(Environment)の環境変数に以下を追加:
   - `GA4_PROPERTY_ID` = プロパティID(管理 → プロパティ設定に表示される数字)
   - `GA4_SA_KEY` = JSONキーの中身を **base64エンコードした文字列**(`base64 -w0 key.json`)

## 4. 週次・自律改善ループの運用ルール

毎週1回、エージェントが以下を実行する(Routineによる自動起動):

1. `scripts/ga-report.mjs` で直近7日 vs 前7日のデータを取得。
2. **North Star: 「観測率」(today_observed人数 ÷ アクティブユーザー)と DAU/WAU(粘着度)**。補助指標: streak分布、画面別離脱、シェア率、ジャーナル定着率。
3. データから仮説を1つに絞り、**小さな改善を1つだけ**実装(同時に複数変えると効果が切り分けられない)。
4. 変更は必ず**ブランチ+Pull Request**で提案し、レポート(数字・仮説・変更内容・翌週の確認指標)をPR本文に書く。mainへの直接pushはしない。
5. 翌週のループで前回の変更の効果を必ず検証してから、次の一手に進む。

**ガードレール(PRODUCT.md の思想を上書きしない)**:
- 断定しない・脅さない・買わせない。FOMO演出や不安を煽る施策は数字が良くても採らない。
- 「1日1回」「ネタバレしない」「データは端末の中だけ」の3原則は改善の対象外(壊さない)。
- 数字が動かない週は「動かなかった」という学びをレポートに残す(無理に変更を作らない)。
