import{_ as e,c as o,o as a,a2 as t}from"./chunks/framework.DniMO-iw.js";const u=JSON.parse('{"title":"Reactor模型","description":"","frontmatter":{},"headers":[],"relativePath":"article/concurrent/threading_model/Reactor.md","filePath":"article/concurrent/threading_model/Reactor.md"}'),r={name:"article/concurrent/threading_model/Reactor.md"},c=t('<h1 id="reactor模型" tabindex="-1">Reactor模型 <a class="header-anchor" href="#reactor模型" aria-label="Permalink to &quot;Reactor模型&quot;">​</a></h1><h2 id="前言" tabindex="-1">前言 <a class="header-anchor" href="#前言" aria-label="Permalink to &quot;前言&quot;">​</a></h2><p>在网络IO设计中，有两种高性能模型：<code>Reactor</code>模型和<code>Proactor</code>模型。 <code>Reactor</code>基于同步IO模式，<code>Proactor</code>基于异步IO模式。</p><p><code>Netty</code>网络框架，<code>Redis</code>等中间件中都有使用到<code>Reactor</code>模型。</p><p>Reactor模型的主要分类有：</p><ul><li>单Reactor单线程模型；</li><li>单Reactor多线程模型；</li><li>主从Reactor多线程模型。</li></ul><h2 id="设计模式" tabindex="-1">设计模式 <a class="header-anchor" href="#设计模式" aria-label="Permalink to &quot;设计模式&quot;">​</a></h2><p>Reactor是一个基于事件驱动的设计模式，它将网络IO事件和应用逻辑分离，主要角色如下<br><strong>Handle（事件）</strong> Reactor整体是基于Handle驱动的，可以类比为BIO的Socket，NIO的Socket管道。比如当<code>Socket</code>管道有连接建立，或者有数据可读时，就视为事件发生。</p><p><strong>EventHandler（事件处理器）</strong></p>',9),d=[c];function n(i,l,s,_,h,p){return a(),o("div",null,d)}const m=e(r,[["render",n]]);export{u as __pageData,m as default};
