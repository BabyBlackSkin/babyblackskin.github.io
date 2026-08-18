import{_ as s,c as n,o as a,a0 as t}from"./chunks/framework.CAoHpFZS.js";const u=JSON.parse('{"title":"Electron 由Sqlite3切换到better_sqlite3的错误问题","description":"","frontmatter":{},"headers":[],"relativePath":"article/electron/better-sqlite3.md","filePath":"article/electron/better-sqlite3.md"}'),p={name:"article/electron/better-sqlite3.md"};function l(i,e,o,d,c,r){return a(),n("div",null,e[0]||(e[0]=[t(`<h1 id="electron-由sqlite3切换到better-sqlite3的错误问题" tabindex="-1">Electron 由Sqlite3切换到better_sqlite3的错误问题 <a class="header-anchor" href="#electron-由sqlite3切换到better-sqlite3的错误问题" aria-label="Permalink to &quot;Electron 由Sqlite3切换到better_sqlite3的错误问题&quot;">​</a></h1><h5 id="错误1" tabindex="-1">错误1 <a class="header-anchor" href="#错误1" aria-label="Permalink to &quot;错误1&quot;">​</a></h5><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Unhandled Rejection at: Promise { &lt;rejected&gt; TypeError: Cannot read properties of undefined (reading &#39;indexOf&#39;)</span></span>
<span class="line"><span>at Function.getFileName (webpack:///./node_modules/.pnpm/bindings@1.5.0/node_modules/bindings/bindings.js?:178:16) </span></span>
<span class="line"><span>at bindings (webpack:///./node_modules/.pnpm/bindings@1.5.0/node_modules/bindings/bindings.js?:82:48) </span></span>
<span class="line"><span>at new Database (webpack:///./node_modules/.pnpm/better-sqlite3@12.4.1/node_modules/better-sqlite3/lib/database.js?:48:153) </span></span>
<span class="line"><span>at Object.SQLiteInit (webpack:///./src/utils/MySQLite.js?:33:10) at createWindow (webpack:///./src/background.js?:73:60) </span></span>
<span class="line"><span>at async App.eval (webpack:///./src/background.js?:107:5) } reason: TypeError: Cannot read properties of undefined (reading &#39;indexOf&#39;) at Function.getFileName (webpack:///./node_modules/.pnpm/bindings@1.5.0/node_modules/bindings/bindings.js?:178:16) </span></span>
<span class="line"><span>at bindings (webpack:///./node_modules/.pnpm/bindings@1.5.0/node_modules/bindings/bindings.js?:82:48) </span></span>
<span class="line"><span>at new Database (webpack:///./node_modules/.pnpm/better-sqlite3@12.4.1/node_modules/better-sqlite3/lib/database.js?:48:153) </span></span>
<span class="line"><span>at Object.SQLiteInit (webpack:///./src/utils/MySQLite.js?:33:10) </span></span>
<span class="line"><span>at createWindow (webpack:///./src/background.js?:73:60) </span></span>
<span class="line"><span>at async App.eval (webpack:///./src/background.js?:107:5)</span></span></code></pre></div><h5 id="原因" tabindex="-1">原因： <a class="header-anchor" href="#原因" aria-label="Permalink to &quot;原因：&quot;">​</a></h5><p>Webpack 打包时破坏了 better-sqlite3 的原生模块加载机制。<code>bettet-sqlite3</code>使用 <code>bindings</code> 来动态加载 <code>.node</code> 原生模块文件，但 webpack 会把 <code>require</code> 替换成自己的逻辑，导致 <code>bindings</code> 拿不到真实路径，于是出现：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>TypeError: Cannot read properties of undefined (reading &#39;indexOf&#39;)</span></span>
<span class="line"><span>at Function.getFileName (bindings.js:178)</span></span></code></pre></div><h5 id="解决方法" tabindex="-1">解决方法 <a class="header-anchor" href="#解决方法" aria-label="Permalink to &quot;解决方法&quot;">​</a></h5><p>在 Electron 主进程中使用 <code>better-sqlite3</code> 时，关闭 webpack 对其打包，保持原生依赖形式。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 在 \`webpack.config.js\`（或 \`electron-builder\` 的配置）</span></span>
<span class="line"><span>externals: {</span></span>
<span class="line"><span>  &#39;better-sqlite3&#39;: &#39;commonjs better-sqlite3&#39;,</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// vite.config.js</span></span>
<span class="line"><span>export default {</span></span>
<span class="line"><span>  build: {</span></span>
<span class="line"><span>    rollupOptions: {</span></span>
<span class="line"><span>      external: [&#39;better-sqlite3&#39;]</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// vue.config.js</span></span>
<span class="line"><span>module.exports = {</span></span>
<span class="line"><span>  pluginOptions: {</span></span>
<span class="line"><span>    // 让 better-sqlite3 不被打包进 asar，以原生形式保留</span></span>
<span class="line"><span>    electronBuilder: {</span></span>
<span class="line"><span>      externals: [&#39;better-sqlite3&#39;],</span></span>
<span class="line"><span>       // 避免 asar 打包后 .node 文件无法加载</span></span>
<span class="line"><span>      builderOptions: {</span></span>
<span class="line"><span>        asarUnpack: [</span></span>
<span class="line"><span>          &#39;node_modules/better-sqlite3&#39;,</span></span>
<span class="line"><span>        ]</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>};</span></span></code></pre></div><h5 id="错误2" tabindex="-1">错误2 <a class="header-anchor" href="#错误2" aria-label="Permalink to &quot;错误2&quot;">​</a></h5><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Unhandled Rejection </span></span>
<span class="line"><span>at: Promise { &lt;rejected&gt; Error: Could not locate the bindings file. Tried: → D:\\Projects\\webstorm\\tools\\node_modules\\.pnpm\\better-sqlite3@12.4.1\\node_modules\\better-sqlite3\\build\\better_sqlite3.node → D:\\Projects\\webstorm\\tools\\node_modules\\.pnpm\\better-sqlite3@12.4.1\\node_modules\\better-sqlite3\\build\\Debug\\better_sqlite3.node → D:\\Projects\\webstorm\\tools\\node_modules\\.pnpm\\better-sqlite3@12.4.1\\node_modules\\better-sqlite3\\build\\Release\\better_sqlite3.node</span></span></code></pre></div><h5 id="原因-1" tabindex="-1">原因 <a class="header-anchor" href="#原因-1" aria-label="Permalink to &quot;原因&quot;">​</a></h5><p>better-sqlite3 找不到它的原生二进制文件（.node 文件）。Electron 使用的 Node 与系统 Node ABI（C++二进制接口）版本不同，better-sqlite3 是一个 原生模块（C++ 编译的 .node 文件），所以必须针对 Electron 的 Node 版本 重新编译。</p><ol><li><p>执行 <code>electron -v</code> 获取版本号</p></li><li><p>重新编译better-sqlite3</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>npx npm rebuild better-sqlite3 --build-from-source --runtime=electron --target=29.0.0 --dist-url=https://electronjs.org/headers</span></span></code></pre></div></li></ol><hr><h5 id="" tabindex="-1"><a class="header-anchor" href="#" aria-label="Permalink to &quot;&quot;">​</a></h5>`,16)]))}const h=s(p,[["render",l]]);export{u as __pageData,h as default};
