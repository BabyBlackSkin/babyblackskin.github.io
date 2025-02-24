import{_ as n,c as a,o as s,a2 as e}from"./chunks/framework.DniMO-iw.js";const b=JSON.parse('{"title":"synchronized","description":"","frontmatter":{},"headers":[],"relativePath":"article/java/synchronized.md","filePath":"article/java/synchronized.md"}'),i={name:"article/java/synchronized.md"},t=e(`<h1 id="synchronized" tabindex="-1">synchronized <a class="header-anchor" href="#synchronized" aria-label="Permalink to &quot;synchronized&quot;">​</a></h1><h2 id="原理" tabindex="-1">原理 <a class="header-anchor" href="#原理" aria-label="Permalink to &quot;原理&quot;">​</a></h2><ul><li>synchronized作用于「方法」或者「代码块」，保证被修饰的代码在同一时间只能被一个线程访问。</li><li>synchronized修饰代码块时，JVM采用「monitorenter、monitorexit」两个指令来实现同步</li><li>synchronized修饰同步方法时，JVM采用「ACC_SYNCHRONIZED」标记符来实现同步</li><li>monitorenter、monitorexit或者ACC_SYNCHRONIZED都是「基于Monitor实现」的</li><li>实例对象里有对象头，对象头里面有Mark Word，Mark Word指针指向了「monitor」</li><li>Monitor其实是一种「同步工具」，也可以说是一种「同步机制」。</li><li>在Java虚拟机（HotSpot）中，Monitor是由「ObjectMonitor实现」的。ObjectMonitor体现出Monitor的工作原理</li></ul><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>ObjectMonitor() {</span></span>
<span class="line"><span>    _header       = NULL;</span></span>
<span class="line"><span>    _count        = 0; // 记录线程获取锁的次数</span></span>
<span class="line"><span>    _waiters      = 0,</span></span>
<span class="line"><span>    _recursions   = 0;  //锁的重入次数</span></span>
<span class="line"><span>    _object       = NULL;</span></span>
<span class="line"><span>    _owner        = NULL;  // 指向持有ObjectMonitor对象的线程</span></span>
<span class="line"><span>    _WaitSet      = NULL;  // 处于wait状态的线程，会被加入到_WaitSet</span></span>
<span class="line"><span>    _WaitSetLock  = 0 ;</span></span>
<span class="line"><span>    _Responsible  = NULL ;</span></span>
<span class="line"><span>    _succ         = NULL ;</span></span>
<span class="line"><span>    _cxq          = NULL ;</span></span>
<span class="line"><span>    FreeNext      = NULL ;</span></span>
<span class="line"><span>    _EntryList    = NULL ;  // 处于等待锁block状态的线程，会被加入到该列表</span></span>
<span class="line"><span>    _SpinFreq     = 0 ;</span></span>
<span class="line"><span>    _SpinClock    = 0 ;</span></span>
<span class="line"><span>    OwnerIsThread = 0 ;</span></span>
<span class="line"><span>  }</span></span></code></pre></div><blockquote><p>ObjectMonitor的几个关键属性 _count、_recursions、_owner、_WaitSet、 _EntryList 体现了monitor的工作原理</p></blockquote><h2 id="锁优化" tabindex="-1">锁优化 <a class="header-anchor" href="#锁优化" aria-label="Permalink to &quot;锁优化&quot;">​</a></h2><h4 id="" tabindex="-1"><a class="header-anchor" href="#" aria-label="Permalink to &quot;&quot;">​</a></h4>`,7),o=[t];function p(l,r,c,d,_,h){return s(),a("div",null,o)}const m=n(i,[["render",p]]);export{b as __pageData,m as default};
