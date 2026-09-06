# 素材の配置場所(月光ミスティック)

このフォルダに画像を置くだけで、CSS(`css/style.css` 末尾の `--asset-*` トークン)が自動で参照します。
未配置のあいだは、SVG/CSSで生成したフォールバック(星空・装飾線・月相・記号)が表示されます。

| # | 配置パス | 用途 | 参照元 |
|---|---|---|---|
| 01 | `assets/bg/01-background-texture.jpg` | 全ページ共通背景(`.bg-wash`) | `--asset-bg-texture` |
| 02 | `assets/bg/02-hero-visual.jpg` | トップのヒーロー(Ken Burns / 視差) | `--asset-hero`(未配置時は `assets/site/hero_bg.webp`) |
| 03 | `assets/divination/03-horoscope-wheel.jpg` | ホロスコープ結果の天球儀(SVG出生図の下に敷く) | `--asset-horoscope-wheel` |
| 04 | `assets/divination/04-tarot-back.jpg` | タロットの裏面 | `--asset-tarot-back`(未配置時は `images/tarot/tarot_back.webp`) |
| 05 | `assets/divination/05-tarot-moon.png` | タロット表面の見本(月)。本番の絵札は `images/tarot/` の78枚を使用 | (参考) |
| 06 | `assets/divination/06-five-elements.png` | 四柱推命「五行のバランス」の下地 | `--asset-five-elements` |
| 07 | `assets/icons/07-moon-phases.png` | 月相(現在は `js/mystic.js` の `moonSVG()` で生成。個別切り出し後に差し替え可) | — |
| 08 | `assets/icons/08-astro-glyphs.png` | 占星術記号(現在はUnicode記号 ☽☉☿♀♂✦ と12星座記号で代替) | — |
| 09 | `assets/ornaments/09-decorative-frames.png` | 装飾フレーム/ディバイダー(現在はSVGの `--ornament-divider` で代替) | `--asset-frames` |

推奨:背景・ヒーローは 1920px幅・JPEG品質70前後(300KB以下)。PNGは透過が必要なもののみ。
