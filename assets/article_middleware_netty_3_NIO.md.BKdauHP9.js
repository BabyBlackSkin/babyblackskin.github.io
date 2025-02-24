import{_ as n}from"./chunks/1.CXNc0Lpv.js";import{_ as a,c as e,o as s,a2 as p}from"./chunks/framework.DniMO-iw.js";const c="/assets/2.BajqAbFJ.png",m=JSON.parse('{"title":"Java NIO","description":"","frontmatter":{},"headers":[],"relativePath":"article/middleware/netty/3_NIO.md","filePath":"article/middleware/netty/3_NIO.md"}'),l={name:"article/middleware/netty/3_NIO.md"},o=p('<h1 id="java-nio" tabindex="-1">Java NIO <a class="header-anchor" href="#java-nio" aria-label="Permalink to &quot;Java NIO&quot;">​</a></h1><h2 id="基本介绍" tabindex="-1">基本介绍 <a class="header-anchor" href="#基本介绍" aria-label="Permalink to &quot;基本介绍&quot;">​</a></h2><p><code>NIO</code> 是<code>Java 1.4</code>中引入的，一种同步非阻塞的<code>I/O</code>模型。存放于<code>java.nio</code>包及其子包下。<code>NIO</code>三大核心：<code>Channel（通道）</code>, <code>Buffer（缓冲区）</code>，<code>Selector（选择器）</code>。</p><p>不同于<code>BIO</code>，以流式的方式顺序的从<code>stream</code>中读取一个或多个字节，</p><p><code>NIO</code>是面向缓冲区的编程，数据写入缓冲区，只能从<code>channel</code>中读取数据到<code>buffer</code>，或者将数据从<code>buffer</code>中写入到<code>channel</code>。</p><p><img src="'+n+`" alt="img.png"></p><h2 id="核心组件" tabindex="-1">核心组件 <a class="header-anchor" href="#核心组件" aria-label="Permalink to &quot;核心组件&quot;">​</a></h2><p><strong>Channel</strong></p><p>在<code>NIO</code>中的所有IO操作都是从一个Channel开始， Channel 可以看作是 Netty 的网络操作抽象类，对应于 JDK 底层的 Socket，每个Channel都会对应一个Buffer； 数据总是从缓冲区写入通道，并从通道读取到缓冲区。使用 Channel(通道)和 Buffer(缓冲区)传输数据，所有数据都是通过 Buffer(缓冲区)处理的。</p><p><strong>Buffer</strong></p><p>是一个内存块 ， 底层有一个数组，包含了3个属性， 其中position和limit的含义取决于是读还是写</p><ul><li><code>capacity</code>：容量，表示缓冲区可以容纳的数据量，如果<code>buffer</code>满了。需要将<code>buffer</code>清空才能继续写入数据</li><li><code>position</code>：当将数据写入<code>buffer</code>时，<code>position</code>会向后移动，移动到下一个可插入数据的位置。最大值为<code>capacity - 1</code>。</li><li>当将<code>buffer</code>切换为读模式时，<code>position</code>会重置为0，当从<code>buffer</code>中读数据时，<code>position</code>代表下一个可读数据的位置</li><li><code>limit</code>：当往<code>buffer</code>中写入数据时，代表最多能写多少数据。此时<code>limit</code>等于<code>capacity</code>。当切换为读模式时，代表最多能读多少数据，此时<code>limit</code>会被设置为<code>position</code>。</li></ul><p><strong>Selector</strong></p><p>Selector 对应一个线程， 一个线程对应多个Channel；因此一个线程可以同时处理多个Channel的事件， 程序切换到哪个Channel，是由事件（Event）决定的，Selector 会根据不同的事件，在各个 Channel 上切换；</p><h2 id="案例" tabindex="-1">案例 <a class="header-anchor" href="#案例" aria-label="Permalink to &quot;案例&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span></span></span>
<span class="line"><span>public class NIO {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    public static void main(String[] args) throws IOException {</span></span>
<span class="line"><span>        // 创建通道</span></span>
<span class="line"><span>        ServerSocketChannel serverSocketChannel = ServerSocketChannel.open();</span></span>
<span class="line"><span>        // 切换非阻塞</span></span>
<span class="line"><span>        serverSocketChannel.configureBlocking(false);</span></span>
<span class="line"><span>        // 绑定端口 8880，监听</span></span>
<span class="line"><span>        serverSocketChannel.socket().bind(new InetSocketAddress(8880));</span></span>
<span class="line"><span>        // 创建Selector对象</span></span>
<span class="line"><span>        Selector selector = Selector.open();</span></span>
<span class="line"><span>        // 将通道注册到Selector上，并指定监听的事件</span></span>
<span class="line"><span>        serverSocketChannel.register(selector, SelectionKey.OP_ACCEPT);</span></span>
<span class="line"><span>        System.out.println(&quot;ServerSocketChannel已注册到Selector上&quot;);</span></span>
<span class="line"><span>        // 轮询获取事件</span></span>
<span class="line"><span>        while (true) {</span></span>
<span class="line"><span>            // 等待事件</span></span>
<span class="line"><span>            if (selector.select(1000) == 0) {</span></span>
<span class="line"><span>                System.out.println(&quot;等待1秒，没有客户端连接&quot;);</span></span>
<span class="line"><span>                continue;</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>            // 获取当前选择器注册的监听事件</span></span>
<span class="line"><span>            Set&lt;SelectionKey&gt; selectededKeys = selector.selectedKeys();</span></span>
<span class="line"><span>            Iterator&lt;SelectionKey&gt; keyIterator = selectededKeys.iterator();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>            while (keyIterator.hasNext()) {</span></span>
<span class="line"><span>                // 获取事件</span></span>
<span class="line"><span>                SelectionKey key = keyIterator.next();</span></span>
<span class="line"><span>                // 如果新的连接，就注册一个通道到选择器上</span></span>
<span class="line"><span>                if (key.isAcceptable()) {</span></span>
<span class="line"><span>                    System.out.println(&quot;客户端连接成功&quot;);</span></span>
<span class="line"><span>                    // 如果是OP_ACCEPT事件，证明有新的客户端连接，为该客户端创建一个SocketChannel</span></span>
<span class="line"><span>                    SocketChannel socketChannel = serverSocketChannel.accept();</span></span>
<span class="line"><span>                    socketChannel.configureBlocking(false);</span></span>
<span class="line"><span>                    // 将SocketChannel注册到selector上，事件类型是OP_READ，并绑定一个缓冲区</span></span>
<span class="line"><span>                    socketChannel.register(selector, SelectionKey.OP_READ, ByteBuffer.allocate(1024));</span></span>
<span class="line"><span>                }</span></span>
<span class="line"><span>                if (key.isReadable()) {</span></span>
<span class="line"><span>                    // 如果是OP_READ事件，通过selectedKey 反向获取 SocketChannel</span></span>
<span class="line"><span>                    SocketChannel channel = (SocketChannel) key.channel();</span></span>
<span class="line"><span>                    // 获取该channel绑定的buffer，并读取</span></span>
<span class="line"><span>                    ByteBuffer buffer = (ByteBuffer) key.attachment();</span></span>
<span class="line"><span>                    channel.read(buffer);</span></span>
<span class="line"><span>                    System.out.printf(&quot;从客户端读取的数据是: %s,\\n&quot;, new String(buffer.array()));</span></span>
<span class="line"><span>                }</span></span>
<span class="line"><span>                // 移除selectedKey,防止重复操作</span></span>
<span class="line"><span>                keyIterator.remove();</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }    </span></span>
<span class="line"><span>}</span></span></code></pre></div><p>打开CMD，输入<code>telnet 127.0.0.1 8880</code>，按下<code>Ctrl</code>+<code>]</code>，即可输入<code>send</code>命令发送消息 <img src="`+c+'" alt="img.png"></p>',17),t=[o];function i(r,d,h,f,u,S){return s(),e("div",null,t)}const C=a(l,[["render",i]]);export{m as __pageData,C as default};
