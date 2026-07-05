# Modern CSS Layout

## 特点

- 使用 CSS 自定义属性，方便覆盖修改
- 详解几种常见布局的实现，并提供 DEMO
- 根据场景，合理选中各种布局技术，如 Grid、flexbox 布局等。（在使用之前，请注意你需要兼容的浏览器，如果不兼容请放弃）

## DEMO

- [背景水平铺满，内容水平居中布局](https://marvin1023.github.io/modern-css-layout/demo/full-width.html)
- [sticky 头部布局](https://marvin1023.github.io/modern-css-layout/demo/sticky-header.html)
- [左/右边栏布局 grid 实现](https://marvin1023.github.io/modern-css-layout/demo/aside-grid.html)
- [左/右边栏布局 float 实现](https://marvin1023.github.io/modern-css-layout/demo/aside-float.html)
- [固定头部及边栏布局 grid 实现](https://marvin1023.github.io/modern-css-layout/demo/fixed-header-and-aside-grid.html)
- [固定头部及边栏布局 fixed 实现](https://marvin1023.github.io/modern-css-layout/demo/fixed-header-and-aside.html)
- [多行列表项响应式布局 grid 实现](https://marvin1023.github.io/modern-css-layout/demo/list-multi-lines.html)
- [单行列表项响应式布局 flexbox 实现](https://marvin1023.github.io/modern-css-layout/demo/list-one-line.html)

PS：`ml` 缩写表示 modern layout

## 常见 PC 页面整体布局详解

PS：页面整体布局样式，汇总于该仓库中的 `layout.css` 中。

### 背景水平铺满，内容水平居中布局

这是非常常见一种布局，该布局常见于首页，宣传页等。一般采用两层嵌套结构：一层为背景层实现背景水平铺满；一层为内容层实现内容水平居中。

HTML 结构示意如下：

```html
<div class="bg-wrap">
  <div class="ml-x-center"></div>
</div>
```

`bg-wrap` 表示背景层，用来承载全屏的背景设计，`ml-x-center` 用来实现内容水平居中。如
`.header>.ml-x-center`, `.banner>.ml-x-center`

内容层的 CSS 代码示意如下：

```css
:root {
  --ml-width: var(--reset-ml-width, 1200px); /* 固定宽度与最大宽度的取值 */
}

/* 
* 内容水平居中设计，x 表示水平方向
* 可以使用 width 或 max-width
* width 为固定宽度
* max-width 在大于该宽度时为固定的宽度，当小于该宽度时则为流体宽度
*/
.ml-x-center {
  max-width: var(--ml-width);
  margin-left: auto;
  margin-right: auto;
}

/*
* 最小宽度
* 如果需要实现最小宽度，可以在 ml-x-content 父级元素上加上该 class
*/
.ml-min-width {
  min-width: var(--ml-min-width);
}
```

注意点：

如果不考虑响应式，则可以直接使用 `width` 固定宽度。如果考虑，则使用 `max-width` 为佳。

如果使用 `width`，则还需要注意给背景层设置一个最小宽度，不然会导致小于该宽度时，水平滚动会出现背景层断裂现象。

如果使用 `max-width`，最好还得搭配一个 `min-width` 来限制最小宽度。这个最小宽度的设置既可以设置在背景层，也可以设置在内容层上。

### 最小高度布局

网站内容一般由三部分构成：头部，底部和中间的内容部分。而中间内容部分的多少，就决定了底部的位置。

这里所说的最小高度布局即是当中间内容很少时，加上头部和底部都撑不开一屏高度时的处理。

所以我们一般希望中间内容部分有个最小的高度，这个最小的高度，加上头部和底部正好为一屏。这样就不会出现一屏都不够的情况，影响页面美观性。

这里提供两种方式实现中间内容的最小高度：calc 计算实现，grid 实现。

假设 HTML 结构如下：

```html
<div class="app">
  <header class="header"></header>
  <div class="container"></div>
  <footer class="footer"></footer>
</div>
```

#### calc 计算实现

计算实现的最大缺点就是需要知道头部和底部的高度，然后用来计算。

计算公式大概如下：

网站整体最小高度（100vh） = 头部高度 + 中间内容最小高度 + 底部高度

这样得出中间内容最小高度:

```css
:root {
  --header-height: 60px;
  --footer-height: 120px;
}
.container {
  min-height: calc(100vh - var(--header-height) - var(--footer-height));
}
```

#### grid 实现

grid 实现的话，我们可以轻易使用 `1fr` 来搞定。

```css
.app {
  display: grid;
  min-height: 100vh;
  grid-template-rows: auto 1fr auto; /* header 和 footer 高度都为 auto */
}
```

#### 总结

如果头部和底部的高度都是确定的，建议直接使用 calc 计算，否则使用 grid。

其实在实际场景中，肯定会遇到比较复杂的场景，单一的使用很有可能解决不了，这时候就需要 cacl 与 grid 结合使用。

### 左/右边栏布局

左/右边栏布局一般都基于内容水平居中，然后居中的内容分为边栏部分和主体内容部分。通过变量设置左右变量宽度，然后使用 `grid` 布局，设置主体内容为 `1fr` 的剩余空间。

这样通过控制 `ml-x-center` 的宽度，即可控制主体内容的宽度。

HTML 代码示意如下：

```html
<!-- 左边栏 -->
<div class="ml-x-center ml-aside-left">
  <aside class="aside-left"></aside>
  <main class="main"></main>
</div>

<!-- 右边栏 -->
<div class="ml-x-center ml-aside-right">
  <main class="main"></main>
  <aside class="aside-right"></aside>
</div>

<!-- 左右边栏 -->
<div class="ml-x-center ml-aside-both">
  <aside class="aside-left"></aside>
  <main class="main"></main>
  <aside class="aside-right"></aside>
</div>
```

CSS 代码示意如下：

```css
:root {
  --ml-aside-left-width: var(
    --reset-ml-side-left-width,
    300px
  ); /* 左边栏宽度 */
  --ml-aside-right-width: var(
    --reset-ml-aside-right-width,
    300px
  ); /* 右边栏宽度 */
}

.ml-x-center {
  max-width: var(--ml-width);
  margin-left: auto;
  margin-right: auto;
}

/* 
* 左边栏布局
* 内容宽度为除掉边栏宽度后的剩余容器宽度
*/
.ml-main-with-aside-left {
  display: grid;
  grid-template-columns: var(--ml-aside-left-width) 1fr;
}

/* 
* 右边栏布局
* 内容宽度为除掉边栏宽度后的剩余容器宽度
*/
.ml-main-with-aside-right {
  display: grid;
  grid-template-columns: 1fr var(--ml-aside-right-width);
}

/* 
* 左右边栏布局
* 内容宽度为除掉边栏宽度后的剩余容器宽度
*/
.ml-main-with-aside-both {
  display: grid;
  grid-template-columns: var(--ml-aside-left-width) 1fr var(--ml-aside-left-width);
}
```

### sticky 头部布局

这个比较简单，直接实现，代码示意如下：

```html
<header class="ml-sticky-header"></header>
```

```css
:root {
  --ml-header-height: var(--reset-ml-header-height, 60px);
  --ml-header-z-index: var(--reset-ml-header-z-index, 5000);
}
.ml-sticky-header {
  position: sticky;
  top: 0;
  height: var(--ml-header-height);
  z-index: var(--ml-header-z-index);
}
```

### 固定头部和左边栏布局

这种布局在一些管理后台还是非常常见的。

这里最可能出问题的在内容的滚动，当固定了头部和左边栏，滚动就只能在主体内容中进行，而不能使用默认的滚动条。

Y 轴的滚动条还是比较好实现的，主要是 X 轴的滚动条，我们需要嵌套一层才能实现（由于高度可以根据内容自动伸展，而宽度则是由父容器本身的宽度来决定的，所以为了实现 X 轴的滚动，需要嵌套一层。）。

#### grid 方案实现

HTML 代码示意如下：

```html
<div class="ml-fixed-header-and-aside">
  <header class="ml-header"></header>
  <aside></aside>
  <main class="ml-main">
    <div class="ml-main-inner"></div>
  </main>
</div>
```

CSS 代码示意如下：

```css
:root {
  --ml-min-width: 1200px; /* 最小宽度 */
  --ml-aside-left-width: 300px; /* 左边栏宽度 */
}

/*
* 固定顶部和左边栏布局
* 采用 grid 布局实现
*/

.ml-fixed-header-and-aside {
  display: grid;
  height: 100vh;
  grid-template-rows: var(--ml-header-height) 1fr;
  grid-template-columns: var(--ml-aside-left-width) 1fr;
}

/* header 占满行 */
.ml-fixed-header-and-aside .ml-header {
  grid-column: 1 / 3;
}

/* 实现主体内容 main Y 轴滚动 */
.ml-fixed-header-and-aside .ml-main {
  overflow: auto;
}

/* 实现主体内容 X 轴滚动 */
.ml-fixed-header-and-aside .ml-main-inner {
  min-width: calc(var(--ml-min-width) - var(--ml-aside-left-width));
}
```

#### fixed 方案实现

HTML 代码示意如下：

```html
<!-- 固定头部 -->
<header class="ml-fixed-header"></header>
<!-- 固定边栏 -->
<aside class="ml-fixed-aside"></aside>
<!-- 主体内容 -->
<div class="ml-main-without-header-and-aside">
  <div class="ml-main-inner"></div>
</div>
```

CSS 代码示意如下：

```css
:root {
  --ml-min-width: 1200px; /* 最小宽度 */
  --ml-header-height: 60px; /* header 高度 */
  --ml-header-z-index: 5000; /* header z-index */
  --ml-aside-left-width: 300px; /* 左边栏宽度 */
}

/* 固定头部 */
.ml-fixed-header {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  height: var(--ml-header-height);
  z-index: var(--ml-header-z-index);
}

/* 固定边栏 */
.ml-fixed-aside {
  position: fixed;
  top: var(--ml-header-height);
  bottom: 0;
  left: 0;
  width: var(--ml-aside-left-width);
}

/*
* 设置 margin top 与 left ，空出头部与左边栏的位置
* 设置高度，实现 main 区域的垂直滚动
* 嵌套一层 main-inner，设置最小宽度，实现 main 区域的水平滚动
*/
.ml-main-without-header-and-aside {
  margin-left: var(--ml-aside-left-width);
  margin-top: var(--ml-header-height);
  height: calc(100vh - var(--ml-header-height));
  overflow: auto;
}

.ml-main-without-header-and-aside .ml-main-inner {
  min-width: calc(var(--ml-min-width) - var(--ml-aside-left-width));
}
```

Y 轴滚动，可以通过设置 main 的高度（calc(100vh - var(--ml-header-height))）来实现；而 X 轴滚动，则需要嵌套一层 main-inner，设置最小宽度（calc(var(--ml-min-width) - var(--ml-aside-left-width))）来实现。
