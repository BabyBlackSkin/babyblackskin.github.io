import{_ as e}from"./chunks/1.CTHG9NdY.js";import{_ as o}from"./chunks/1.CXNc0Lpv.js";import{_ as a,c as i,o as t,a2 as c}from"./chunks/framework.DniMO-iw.js";const g=JSON.parse('{"title":"Netty","description":"","frontmatter":{},"headers":[],"relativePath":"article/middleware/netty/1_Index.md","filePath":"article/middleware/netty/1_Index.md"}'),l={name:"article/middleware/netty/1_Index.md"},d=c('<h1 id="netty" tabindex="-1">Netty <a class="header-anchor" href="#netty" aria-label="Permalink to &quot;Netty&quot;">​</a></h1><h2 id="简介" tabindex="-1">简介 <a class="header-anchor" href="#简介" aria-label="Permalink to &quot;简介&quot;">​</a></h2><p>Netty是一个提供异步事件驱动的网络应用程序框架，用以快速开发高性能、高可靠的网络服务器和客户端程序。 Netty简化了网络程序的开发，属于BIO、NIO、AIO的演变中的产物，属于一种NIO框架。例如：RocketMQ，dubbo等底层通信都是采用的Netty。</p><h2 id="特点" tabindex="-1">特点 <a class="header-anchor" href="#特点" aria-label="Permalink to &quot;特点&quot;">​</a></h2><ul><li>统一的 API，支持多种传输类型，阻塞和非阻塞的。</li><li>简单而强大的线程模型。</li><li>自带编解码器解决 TCP 粘包/拆包问题。</li><li>自带各种协议栈。</li><li>真正的无连接数据包套接字支持。</li><li>安全性不错，有完整的 SSL/TLS 以及 StartTLS 支持。</li><li>社区活跃</li><li>成熟稳定，经历了大型项目的使用和考验，而且很多开源项目都使用到了 Netty 比如我们经常接触的 Dubbo、RocketMQ</li><li>.......</li></ul><h2 id="概念" tabindex="-1">概念 <a class="header-anchor" href="#概念" aria-label="Permalink to &quot;概念&quot;">​</a></h2><p><strong>同步</strong> 客户端调用一个功能时，在没有得到功能的结果之前，需要一直等待，直到功能返回结果后，在往下执行</p><p><strong>异步</strong> 客户端调用一个功能时, 不需要等待功能的返回结果。可以直接执行其他的操作。被调用的功能拿到结果后，在通知客户端。</p><p><strong>同步与异步</strong>都是消息的通信机制<code>synchronous/asynchronous communication</code>。同步就是再发起调用请求时，在没有获得到结果前， 会一直等待，直到获取结果，才继续往下执行。<strong>调用者主动等待结果</strong>。异步就是发起调用请求后，直接往下执行，不用等待，由被调用者后， 调用者在进行结果的处理</p><p><strong>阻塞</strong> 一个线程进行<code>I/O</code>操作（读取文件）时，如果所需要的数据或者资源不可用，操作系统会将这个线程挂起， 直到资源可用，在被挂起的期间，线程无法做其他的事情</p><p><strong>非阻塞</strong> 一个线程进行<code>I/O</code>操作（读取文件）时，如果所需要的数据或者资源不可用，会立即返回结果，告知不可用。</p><p><strong>阻塞和非阻塞</strong></p><ul><li>同步阻塞<code>BIO[BlockingIO]</code>:当用户发起<code>IO</code>操作后，必须等待<code>IO</code>操作完成，才能继续往下执行。</li><li>同步非阻塞<code>NIO[Non-BlockingIO]</code>:当用户发起<code>IO</code>操作后，无需等待<code>IO</code>操作完成，可以做其他的事情，但是必须不断地轮训<code>IO</code>操作是否完成。</li><li>异步阻塞<code>IO[IO Multiplexing]</code>:当用户发起<code>IO</code>操作后，无需等待<code>IO</code>操作完成。当<code>IO</code>操作完成后内核会通知应用程序，阻塞是因为需要调用<code>select</code>函数，<code>select</code>本身是阻塞的。</li><li>异步非阻塞<code>AIO[AsynchronousIO]</code>: 当用户发起<code>IO</code>操作后，无需等待<code>IO</code>操作完成。当<code>IO</code>操作完成后内核会通知应用程序，这个是应用程序只需对数据进行处理即可。</li></ul><h2 id="i-o模型" tabindex="-1">I/O模型 <a class="header-anchor" href="#i-o模型" aria-label="Permalink to &quot;I/O模型&quot;">​</a></h2><h3 id="bio-阻塞i-o" tabindex="-1"><a href="./2_BIO.html">BIO （阻塞I/O）</a> <a class="header-anchor" href="#bio-阻塞i-o" aria-label="Permalink to &quot;[BIO （阻塞I/O）](2_BIO.md)&quot;">​</a></h3><p>BIO 全称Block-IO 是一种同步且阻塞的通信模式。是一个比较传统的通信方式，模式简单，使用方便。但并发处理能力低，通信耗时，依赖网速。 每当有一个客户端创建连接，就会创建一个线程，来处理这个客户端的请求。进行数据读写，业务操作。 当有大量客户端请求进来时，会创建多个线程，浪费系统资源，每个系统的线程数是有限的。且没有数据可读时，是阻塞的</p><p><img src="'+e+'" alt="img.png"></p><h3 id="nio-同步非阻塞i-o" tabindex="-1"><a href="./3_NIO.html">NIO（同步非阻塞I/O）</a> <a class="header-anchor" href="#nio-同步非阻塞i-o" aria-label="Permalink to &quot;[NIO（同步非阻塞I/O）](3_NIO.md)&quot;">​</a></h3><ul><li>Java NIO，全程 Non-Block IO ，是Java SE 1.4版以后，针对网络传输效能优化的新功能。是一种非阻塞同步的通信模式， 存放于<code>java.nio</code>包及其子包下。</li><li><code>NIO</code>三大核心：<code>Channel（通道）</code>,<code>Buffer（缓冲区）</code>，<code>Selector（选择器）</code>。</li><li>NIO 与原来的 I/O 有同样的作用和目的, 他们之间最重要的区别是数据打包和传输的方式。原来的 I/O 以流的方式处理数据，而 NIO 以块的方式处理数据。</li><li>面向流的 I/O 系统一次一个字节地处理数据。一个输入流产生一个字节的数据，一个输出流消费一个字节的数据。</li><li>面向块的 I/O 系统以块的形式处理数据。每一个操作都在一步中产生或者消费一个数据块。按块处理数据比按(流式的)字节处理数据要快得多。但是面向块的 I/O - 缺少一些面向流的 I/O 所具有的优雅性和简单性。</li></ul><p><img src="'+o+'" alt="img.png"></p><h3 id="aio-异步非阻塞i-o-nio-2" tabindex="-1">AIO（异步非阻塞I/O，NIO.2） <a class="header-anchor" href="#aio-异步非阻塞i-o-nio-2" aria-label="Permalink to &quot;AIO（异步非阻塞I/O，NIO.2）&quot;">​</a></h3><ul><li>Java AIO，全程 Asynchronous IO，是异步非阻塞的IO。是<code>Java 7</code>引入的一种新特性，作为原始的<code>Java NIO（Non-blocking I/O）</code>的扩展。 在NIO的基础上引入了新的异步通道的概念，并提供了异步文件通道和异步套接字通道的实现。</li><li>AIO允许应用程序以异步方式发起I/O操作，并通过事件或回调机制来通知操作完成， 在AIO中，发起I/O操作后，程序可以继续执行其他任务，而无需等待I/O操作完成。当I/O完成时，操作系统会通过事件（如完成处理器）或回调通知应用程序。 由于减少了线程上下文切换和等待时间，AIO在某些场景下可以提供更好的性能，特别是对于长连接和少量数据的交互</li></ul>',22),r=[d];function n(I,O,s,h,_,p){return t(),i("div",null,r)}const b=a(l,[["render",n]]);export{g as __pageData,b as default};
