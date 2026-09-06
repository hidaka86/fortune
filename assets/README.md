# 素材の配置場所(月光ミスティック)

このフォルダに画像を置くだけで、CSS(`css/style.css` 末尾の `--asset-*` トークン)が自動で参照します。
未配置のあいだは、SVG/CSSで生成したフォールバック(星空・装飾線・月相・記号)が表示されます。

| # | 配置パス | 用途 | 参照元 |
|---|---|---|---|
| 01 | `assets/bg/01-background-texture.jpg` | 全ページ共通背景(`.bg-wash`) | `--asset-bg-texture` |
| 02 | `assets/bg/02-hero-visual.jpg` | トップのヒーロー(Ken Burns / 視差) | `--asset-hero`(未配置時は `assets/site/hero_bg.webp`) |
| 03 | `assets/divination/03-horoscope-wheel.jpg` | ホロスコープ結果の天球儀(SVG出生図の下に敷く) | `--asset-horoscope-wheel` |
| 04 | `assets/divination/04-tarot-back.jpg` | タロットの裏面 | `--asset-tarot-back`(未配置時は `images/tarot/tarot_back.webp`) |
| 05 | `assets/divination/05-tarot-moon.jpg` | タロット表面の見本(月)。本番の絵札は `images/tarot/` の78枚を使用 | (参考) |
| 06 | `assets/divination/06-five-elements.png` | 四柱推命「五行のバランス」の下地 | `--asset-five-elements` |
| 07 | `assets/icons/07-moon-phases.jpg` + `assets/icons/moon/moon-0..7.png`(切り出し済) | 月相(ヒーロー・フッター・観測演出・スクロール誘導)。画像がなければ `moonSVG()` に自動フォールバック | `.moon-img` |
| 08 | `assets/icons/08-astro-glyphs.jpg` + `assets/icons/glyphs/{sun..pluto, aries..capricorn}.png`(切り出し済・水瓶座と魚座は未収録) | 天体一覧・相性の星座・五つの観測カード。画像がなければUnicode記号に自動フォールバック | `.glyph-img` |
| 09 | `assets/ornaments/09-decorative-frames.jpg` + `divider-top/bottom.png`, `corner-tl/tr/bl/br.png`(切り出し済) | 見出し下のディバイダー、鑑定結果・入力パネルの四隅 | `--asset-divider` `--asset-corner-*` |

推奨:背景・ヒーローは 1920px幅・JPEG品質70前後(300KB以下)。PNGは透過が必要なもののみ。

切り出し素材は紺地を透過に変換したPNG(明度→アルファ)。元シートは参考用にJPEGで残しています。
