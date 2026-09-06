# 素材の配置場所(月光ミスティック)

## 画像素材(ラスター)

| # | 配置パス | 用途 | 参照元 |
|---|---|---|---|
| 00 | `assets/reference/00-master-ui-kit.jpg` | 世界観の基準(参考・画面では未使用) | — |
| 01 | `assets/bg/01-background-texture.jpg` | 全ページ共通背景(`.bg-wash`) | `--asset-bg-texture` |
| 02 | `assets/bg/02-hero-visual.jpg` | トップのヒーロー(Ken Burns / 視差) | `--asset-hero`(未配置時は `assets/site/hero_bg.webp`) |
| 03 | `assets/divination/03-horoscope-wheel.jpg` | ホロスコープ結果の天球儀(SVG出生図の下に敷く) | `--asset-horoscope-wheel` |
| 04 | `assets/divination/04-tarot-back.jpg` | タロットの裏面 | `--asset-tarot-back`(未配置時は `images/tarot/tarot_back.webp`) |
| 05 | `assets/divination/05-tarot-moon.jpg` | タロット表面の見本(月)。本番の絵札は `images/tarot/` の78枚 | (参考) |
| 06 | `assets/divination/06-five-elements.jpg` | 五行の参考画像(画面では下記SVGを使用) | (参考) |
| 07 | `assets/icons/07-moon-phases.jpg` | 月相の参考画像 | (参考) |
| 08 | `assets/icons/08-astro-glyphs.jpg` | 占星術記号の参考画像 | (参考) |
| 09 | `assets/ornaments/09-decorative-frames.jpg` | 装飾フレームの参考画像 | (参考) |

推奨:背景・ヒーローは 1920px幅・JPEG品質70前後(300KB以下)。

## SVG素材(素材06〜09はすべてオリジナルSVG)

定義の単一ソースは `js/icons.js`(`MysticIcons`)。`node scripts/build-icons.mjs` で以下の単体ファイルを再生成します。
画面では `mysticIcon(type, { size, glow, animate, label })` でインライン描画し、色は親要素の `color`(currentColor)で制御します。
一覧は `/icons-preview.html`(noindex)で確認できます。

| 種類 | 配置パス | 件数 | viewBox |
|---|---|---|---|
| 五行 | `assets/divination/06-five-elements/{wood,fire,earth,metal,water}.svg` | 5 | 0 0 100 100 |
| 月相 | `assets/icons/07-moon-phases/{new-moon … waning-crescent}.svg` | 8 | 0 0 64 64 |
| 天体 | `assets/icons/08-astro-glyphs/planets/{sun … pluto}.svg` | 10 | 0 0 48 48 |
| 星座 | `assets/icons/08-astro-glyphs/zodiac/{aries … pisces}.svg` | 12 | 0 0 48 48 |
| 角飾り | `assets/ornaments/09-decorative-frames/corners/corner-*.svg` | 4 | 0 0 80 80 |
| 区切り | `assets/ornaments/09-decorative-frames/dividers/divider-{star,moon,dots}.svg` | 3 | 0 0 400 40 |
| フレーム | `assets/ornaments/09-decorative-frames/frames/frame-{card,modal}.svg` | 2 | 400x260 / 400x300 |

使用箇所: 月相=ヒーロー・フッター・観測演出・スクロール誘導 / 天体=出生図チャート・天体一覧 / 星座=出生図の12サイン・相性診断 /
五行=五行バランスの五角形(相生=金の実線・相剋=紫の破線)/ 角飾り=鑑定結果・入力パネル・招待状・記事 / 区切り=見出し下・セクション間。
