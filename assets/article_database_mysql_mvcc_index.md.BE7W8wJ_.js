import{_ as t,c as d,o as s,a2 as i}from"./chunks/framework.DniMO-iw.js";const a="/assets/img.5fGEB5qV.png",e="/assets/img_1.D4Uo7A_I.png",n="/assets/img_2.BZEBdHuc.png",o="/assets/img_3.DntIeTm8.png",l="/assets/img_4.CeLd8dWy.png",D=JSON.parse('{"title":"MVCC","description":"","frontmatter":{},"headers":[],"relativePath":"article/database/mysql/mvcc/index.md","filePath":"article/database/mysql/mvcc/index.md"}'),h={name:"article/database/mysql/mvcc/index.md"},p=i('<h1 id="mvcc" tabindex="-1">MVCC <a class="header-anchor" href="#mvcc" aria-label="Permalink to &quot;MVCC&quot;">​</a></h1><p>简单说，MVCC是一种多版本并发控制机制。 通过维护多个版本的记录，来减少锁的争用，在保证数据一致性的同时，提高系统性能，实现了高并发的数据访问， 对数据进行多版本处理，并通过事务的可见性来保证事务能看到自己应该看到的数据版本。MVCC 最大的好处是读不加锁，读写不冲突。 在 <code>OLTP (On-Line Transaction Processing)</code>应用中，读写不冲突很重要，几乎所有 <code>RDBMS</code> 都支持 <code>MVCC</code>。</p><h2 id="基本概念" tabindex="-1">基本概念 <a class="header-anchor" href="#基本概念" aria-label="Permalink to &quot;基本概念&quot;">​</a></h2><h3 id="隔离级别" tabindex="-1">隔离级别 <a class="header-anchor" href="#隔离级别" aria-label="Permalink to &quot;隔离级别&quot;">​</a></h3><table><thead><tr><th><strong>隔离级别</strong></th><th><strong>脏读（Dirty Read）</strong></th><th><strong>不可重复读（NonRepeatable Read）</strong></th><th><strong>幻读（Phantom Read）</strong></th></tr></thead><tbody><tr><td>未提交读（Read uncommitted）</td><td>可能</td><td>可能</td><td>可能</td></tr><tr><td>已提交读（Read committed）</td><td>不可能</td><td>可能</td><td>可能</td></tr><tr><td>可重复读（Repeatable read）</td><td>不可能</td><td>不可能</td><td>可能</td></tr><tr><td>可串行化（Serializable ）</td><td>不可能</td><td>不可能</td><td>不可能</td></tr></tbody></table><ol><li>未提交读(Read Uncommitted)：允许脏读，也就是可能读取到其他会话中未提交事务修改的数据</li><li>提交读(Read Committed)：只能读取到已经提交的数据。Oracle等多数数据库默认都是该级别 (不重复读)</li><li>可重复读(Repeated Read)：可重复读。在同一个事务内的查询都是事务开始时刻一致的，InnoDB默认级别。在SQL标准中，该隔离级别消除了不可重复读，但是还存在幻象读。特点有Gap锁（间隙锁）</li><li>串行读(Serializable)：完全串行化的读，每次读都需要获得表级共享锁，读写相互都会阻塞</li></ol><h3 id="脏读、不可重复度、幻读" tabindex="-1">脏读、不可重复度、幻读 <a class="header-anchor" href="#脏读、不可重复度、幻读" aria-label="Permalink to &quot;脏读、不可重复度、幻读&quot;">​</a></h3><ol><li>脏读：一个事务正在对一条记录做修改，在这个事务完成并提交前，这条记录的数据就处于不一致状态。</li><li>不可重复读：一个事务按相同查询条件前后两次读取，读出的数据不一致（修改、删除）。</li><li>幻读：一个事务内按相同的查询条件重新查询数据，却发现其他事务插入了满足其查询条件的新数据。</li></ol><h2 id="简单理解的下mvcc的实现机制" tabindex="-1">简单理解的下MVCC的实现机制 <a class="header-anchor" href="#简单理解的下mvcc的实现机制" aria-label="Permalink to &quot;简单理解的下MVCC的实现机制&quot;">​</a></h2><p>MVCC是通过保存数据在某个时间点的快照来实现的，不同存储引擎的MVCC实现是不同的，典型的有乐观锁并发控制和悲观锁并发控制</p><p>在<code>innoDB</code>中，是通过在每行记录后面保存两个隐藏的列来实现。这两列分别保存了这个行的创建时间和行的删除时间，注意：这里的时间并不是真实的时间，而是系统的版本号（事务ID），每创建一个新的事物 系统版本号就会自动递增，事务开始时，取当前系统版号作为它的<code>ID</code></p><p>在<code>RR</code>隔离级别下的MVCC操作</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>CREATE TABLE `bank_account` (</span></span>\n<span class="line"><span>id int primary key auto_increment,</span></span>\n<span class="line"><span>`name` varchar(255) COLLATE utf8_bin DEFAULT NULL,</span></span>\n<span class="line"><span>`amount` int(11) DEFAULT NULL</span></span>\n<span class="line"><span>) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;</span></span>\n<span class="line"><span></span></span>\n<span class="line"><span>INSERT INTO `study`.`bank_account`(`name`,`amount`) VALUES (&#39;张三&#39;, 300);</span></span>\n<span class="line"><span>INSERT INTO `study`.`bank_account`(`name`,`amount`) VALUES (&#39;李四&#39;, 300);</span></span></code></pre></div><h3 id="select操作" tabindex="-1">SELECT操作 <a class="header-anchor" href="#select操作" aria-label="Permalink to &quot;SELECT操作&quot;">​</a></h3><p><code>InnoDB</code>会根据两个条件查找每行记录</p><ol><li>行的创建时间（创建的事务ID）早于当前事务号。确保事务读取的行要么是在事务开始前已经存在，要么是事务自身插入或者修改的</li><li>行的删除时间（删除的事务ID）要么未定义，要么大于当前事务号。确保读取到的行要么事务开始前未删除</li></ol><table><thead><tr><th>id</th><th>name</th><th>amount</th><th>创建时间（事务ID）</th><th>删除时间（事务ID）</th></tr></thead><tbody><tr><td>1</td><td>张三</td><td>300</td><td>1</td><td>UNDEFINED</td></tr><tr><td>2</td><td>李四</td><td>300</td><td>1</td><td>UNDEFINED</td></tr></tbody></table><h3 id="insert操作" tabindex="-1">INSERT操作 <a class="header-anchor" href="#insert操作" aria-label="Permalink to &quot;INSERT操作&quot;">​</a></h3><p>会将当前事务号保存到创建行的创建时间中 假设下面是2个事务的执行日志，分别为：<code>事务(2)</code>，<code>事务(3)</code></p><table><thead><tr><th>时刻</th><th>事务(2)</th><th>事务(3)</th></tr></thead><tbody><tr><td>时刻1</td><td>START TRANSACTION;</td><td></td></tr><tr><td>时刻2</td><td></td><td>START TRANSACTION;</td></tr><tr><td>时刻3</td><td></td><td>INSERT INTO study.bank_account(name, amount) VALUES (&#39;王五&#39;, 300);</td></tr><tr><td>时刻4</td><td>SELECT * FROM bank_account;</td><td></td></tr></tbody></table><p>执行完后，得到表如下</p><table><thead><tr><th>id</th><th>name</th><th>amount</th><th>创建时间（事务ID）</th><th>删除时间（事务ID）</th></tr></thead><tbody><tr><td>1</td><td>张三</td><td>300</td><td>1</td><td>UNDEFINED</td></tr><tr><td>2</td><td>李四</td><td>300</td><td>1</td><td>UNDEFINED</td></tr><tr><td>3</td><td>王五</td><td>300</td><td>3</td><td>UNDEFINED</td></tr></tbody></table><p>在<code>事务(2)</code>执行 <code>SELECT</code>操作时，由于<code>王五</code>所在行的创建时间为<code>3</code>大于当前事务号，所以对于<code>事务(2)</code>来说，是不可见的，<code>事务(2)</code>查询出的表如下：</p><table><thead><tr><th>id</th><th>name</th><th>创建时间（事务ID）</th><th>删除时间（事务ID）</th></tr></thead><tbody><tr><td>1</td><td>张三</td><td>1</td><td>UNDEFINED</td></tr><tr><td>2</td><td>李四</td><td>1</td><td>UNDEFINED</td></tr></tbody></table><h3 id="delete操作" tabindex="-1">DELETE操作 <a class="header-anchor" href="#delete操作" aria-label="Permalink to &quot;DELETE操作&quot;">​</a></h3><p>会为被删除的行保存当前事务号作为删除时间 假设下面是2个事务的执行日志，分别为：<code>事务(4)</code>，<code>事务(5)</code></p><table><thead><tr><th>时刻</th><th>事务(4)</th><th>事务(5)</th></tr></thead><tbody><tr><td>时刻1</td><td>START TRANSACTION;</td><td></td></tr><tr><td>时刻2</td><td></td><td>START TRANSACTION;</td></tr><tr><td>时刻3</td><td></td><td>DELETE FROM study.bank_account WHERE id = 3;</td></tr><tr><td>时刻4</td><td>SELECT * FROM bank_account;</td><td></td></tr></tbody></table><p>执行完后，得到表如下</p><table><thead><tr><th>id</th><th>name</th><th>创建时间（事务ID）</th><th>删除时间（事务ID）</th></tr></thead><tbody><tr><td>1</td><td>张三</td><td>1</td><td>UNDEFINED</td></tr><tr><td>2</td><td>李四</td><td>1</td><td>UNDEFINED</td></tr><tr><td>3</td><td>王五</td><td>3</td><td>5</td></tr></tbody></table><p>在<code>事务(4)</code>执行 <code>SELECT</code>操作时，由于<code>id</code>为<code>3</code>所在行的删除时间为<code>5</code>大于当前事务号，所以对于<code>事务(4)</code>来说，是可见的，<code>事务(4)</code>查询出的表如下：</p><table><thead><tr><th>id</th><th>name</th><th>创建时间（事务ID）</th><th>删除时间（事务ID）</th></tr></thead><tbody><tr><td>1</td><td>张三</td><td>1</td><td>UNDEFINED</td></tr><tr><td>2</td><td>李四</td><td>1</td><td>UNDEFINED</td></tr><tr><td>3</td><td>王五</td><td>3</td><td>5</td></tr></tbody></table><h3 id="update操作" tabindex="-1">UPDATE操作 <a class="header-anchor" href="#update操作" aria-label="Permalink to &quot;UPDATE操作&quot;">​</a></h3><p>实际会创建一条新的行，并将事务号作为其创建时间，同时将事务号存到行的删除时间 假设下面是2个事务的执行日志，分别为：<code>事务(6)</code>，<code>事务(7)</code></p><table><thead><tr><th>时刻</th><th>事务(2)</th><th>事务(4)</th></tr></thead><tbody><tr><td>时刻1</td><td>START TRANSACTION;</td><td></td></tr><tr><td>时刻2</td><td></td><td>START TRANSACTION;</td></tr><tr><td>时刻3</td><td></td><td>UPDATE study.bank_account SET name =&#39;李四儿&#39; WHERE id = 2;</td></tr><tr><td>时刻4</td><td>SELECT * FROM bank_account;</td><td></td></tr></tbody></table><p>执行完后，得到表如下</p><table><thead><tr><th>id</th><th>name</th><th>创建时间（事务ID）</th><th>删除时间（事务ID）</th></tr></thead><tbody><tr><td>1</td><td>张三</td><td>1</td><td>UNDEFINED</td></tr><tr><td>2</td><td>李四</td><td>1</td><td>7</td></tr><tr><td>2</td><td>李四儿</td><td>7</td><td>UNDEFINED</td></tr></tbody></table><p>在<code>事务(6)</code>执行 <code>SELECT</code>操作时，<br><code>李四</code>所在行的删除时间为<code>7</code>大于当前事务号，且创建时间为<code>1</code>小于当前事务号，所以对于<code>事务(6)</code>来说，是可见的，<br><code>李四儿</code>创建时间为<code>7</code>大于当前事务号，所以对于<code>事务(6)</code>来说，是不可见的，</p><p><code>事务(6)</code>查询出的表如下：</p><table><thead><tr><th>id</th><th>name</th><th>创建时间（事务ID）</th><th>删除时间（事务ID）</th></tr></thead><tbody><tr><td>1</td><td>张三</td><td>1</td><td>UNDEFINED</td></tr><tr><td>2</td><td>李四</td><td>1</td><td>7</td></tr></tbody></table><h2 id="innodb事务日志" tabindex="-1">InnoDB事务日志 <a class="header-anchor" href="#innodb事务日志" aria-label="Permalink to &quot;InnoDB事务日志&quot;">​</a></h2><p>事务的隔离性是通过锁实现的，事务原子性，持久性则是通过事务日志实现的。在<code>MySQL</code>中，事务日志分为两类 <code>Redo Log</code>重做日志、<code>Undo Log</code>回滚日志。 <code>Redo Log</code>是保证事务的持久性，<code>Undo Log</code>是保证事务的原子性 MVVC也是基于Undo log 多版本链条 + ReadView机制来实现的</p><ul><li>undo log 多版本链： 每一次对数据库的修改，都会在 undo log 日志中记录当前修改记录的事务号及修改前数据状态的存储地址（即 ROLL_PTR），以便在必要的时候可以回滚到老的数据版本。一个读事务查询到当前记录，而最新的事务还未提交。根据原子性，读事务看不到最新数据，但可以去回滚段中找到老版本的数据，这样就生成了多个版本。</li><li>ReadView 机制： 在多版链的基础上，控制事务读取的可见性。（主要区别是：RC 和 RR）RC 级别的事务： 可见性比较高，它可以看到已提交的事务的所有修改。RR 级别的事务： 一个读事务中，不管其他事务对这些数据做了什么修改，以及是否提交，只要自己不提交，查询的数据结果就不会变。</li><li>RC读提交：每一条读操作语句都会获取一次 ReadView，每次更新之后，都会获取数据库中最新的事务提交状态，也就可以看到最新提交的事务了，即每条语句执行都会更新其可见性视图。</li><li>RR可重复读：开启事务时不会获取 ReadView，只有发起第一个快照读时才会获取 ReadView。如果使用当前读，都会获取新的 ReadView，也能看到更新的数据。(<code>SELECT ... FOR UPDATE，SELECT LOCK IN SHARE MODE</code>)</li></ul><h3 id="undo-log" tabindex="-1">Undo Log <a class="header-anchor" href="#undo-log" aria-label="Permalink to &quot;Undo Log&quot;">​</a></h3><h4 id="undo-log的原子性" tabindex="-1">Undo Log的原子性 <a class="header-anchor" href="#undo-log的原子性" aria-label="Permalink to &quot;Undo Log的原子性&quot;">​</a></h4><p>如果事务中的SQL执行到一半出现错误，需要把前面已经执行过的SQL撤销以达到原子性的目的，这个过程称之为“回滚”。所以<code>Undo Log</code>也叫做回滚日志</p><p>在<code>Undo Log</code>中记录了数据在每个操作前的状态，这些记录包括旧的数据值和事务ID。 每当我们对一条数据做改动时（<code>INSERT</code>、<code>UPDATE</code>、<code>DELETE</code>）,会将回滚时所需的东西记下来。</p><ul><li><code>Insert</code>：至少需要将主键记录下来，回滚后，只需根据主键删除记录即可。对于事务中的每个<code>INSERT</code>语句，在事务回滚时<code>InnoDB</code>都会完成一个<code>DELETE</code>操作</li><li><code>DELETE</code>：至少要把这条数据记录下来，回滚时，再将记录重新插入。对于事务中每个<code>DELETE</code>语句，在事务回滚都会完成一个<code>INDERT</code>操作</li><li><code>UPDATE</code>：至少要把这条数据的旧值和新值都记录下来。回滚后，再将记录更新为旧值。对于事务中的<code>UPDATE</code>语句，在事务回滚时，都会完成一个反向的<code>UPDATE</code>操作</li></ul><p><code>Undo Log</code>通过保存旧版本的数据，使得<code>InnoDB</code>可以在并发事务中提供<code>RC</code>和<code>RR</code>的隔离级别</p><blockquote><p><code>Undo Log</code>主要保证事务的原子性，通过记录修改前的状态，以提供回滚的滚能，其次是提供<code>MVCC</code>的快照读</p></blockquote><h4 id="undo-log的存储格式" tabindex="-1">Undo Log的存储格式 <a class="header-anchor" href="#undo-log的存储格式" aria-label="Permalink to &quot;Undo Log的存储格式&quot;">​</a></h4><p><code>Redo Log</code>属于物理日志，即记录了数据库页的物理修改操作，比如页上的哪些字节被更改，具体到物流结构上。 <code>Undo Log</code>属于逻辑日志，即记录了从逻辑角度如何撤销已经发生的变更记录。第一步第二部该如何做等等，通常包含了反向操作所需要的数据</p><blockquote><p>两者共同保障了<code>MySQL</code>中事务处理的ACID特性</p></blockquote><p>在<code>InnoDB</code>中，所有的表都会有三个隐藏的列，分别是：<code>DB_ROW_ID</code>，<code>DB_TRX_ID</code>，<code>DB_ROLL_PTR</code>。</p><ul><li>DB_ROW_ID：聚集索引。如果数据表没有主键，<code>InnoDB</code>会创建一个DB_ROW_ID作为聚集索引。</li><li>DB_TRX_ID：数据行版本号，也叫事务ID。用于记录修改或者创建这条记录的事务ID。（记录数据行是那个事务修改的，哪个事务创建的）</li><li>DB_ROLL_PTR：删除行版本号，也叫回滚指针。指向<code>Undo Log</code>中这条记录的上一个版本。（记录数据行是哪个事务删除的）</li></ul><p>事务ID与回滚指针和<code>Undo Log</code>日志密切相关。 在<code>InnoDB</code>中，<code>Undo Log</code>分为<code>Insert Undo Log</code>和<code>Update Undo Log</code>两种类型。删除操作就是借助<code>Update Undo Log</code>来完成的</p><h4 id="insert类型的undo-log" tabindex="-1">Insert类型的Undo Log <a class="header-anchor" href="#insert类型的undo-log" aria-label="Permalink to &quot;Insert类型的Undo Log&quot;">​</a></h4><div class="language-shell vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">INSERT</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> INTO</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> `</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">study</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">`</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">.</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bank_account</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">name</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> `</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">amount</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) VALUES (</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">&#39;张三&#39;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">,</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 300</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span></code></pre></div><p>当开启事务后，执行的<code>Insert</code>语句都会以<code>Insert</code>类型的<code>Undo Log</code>记录在<code>Undo Log</code>日志中， 本次事务插入的所有数据行的版本号（<code>DB_TRX_ID</code>）都为当前事务的ID <img src="'+a+'" alt="img.png"></p><div style="height:60px;"></div><h4 id="delete类型的undo-log" tabindex="-1">Delete类型的Undo Log <a class="header-anchor" href="#delete类型的undo-log" aria-label="Permalink to &quot;Delete类型的Undo Log&quot;">​</a></h4><div class="language-shell vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">DELETE</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> FROM</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> bank_account</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> WHERE</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> id</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> =</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span></code></pre></div><p>当开启事务后，<code>InnoDB</code>对于<code>DELETE</code>语句的流程如下：</p><ol><li>将被删除的行以<code>UPDATE</code>类型的<code>Undo Log</code>记录到<code>Undo Log</code>日志中</li><li>将该行的事务ID设置为当前事务ID，回滚指针设置为被删除前的事务ID</li><li>将删除标记设置为1，表示该条记录已经被删除</li><li>更改表空间 <img src="'+e+'" alt="img_1.png"></li></ol><div style="height:60px;"></div><h4 id="update类型的undo-log" tabindex="-1">Update类型的Undo Log <a class="header-anchor" href="#update类型的undo-log" aria-label="Permalink to &quot;Update类型的Undo Log&quot;">​</a></h4><div class="language-shell vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">UPDATE</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> bank_account</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> SET</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  amount</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> =</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 500</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> WHERE</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> id</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> =</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span></code></pre></div><p>当开启事务后,<code>InnoDB</code>对于<code>Update</code>的流程为：</p><ol><li>将被修改的行以<code>Update</code>类型的<code>Undo Log</code> 记录到<code>Undo Log</code>日志中</li><li>将该行的事务ID设置为当前事务ID，回滚指针设置之前记录的事务ID</li><li>更改表空间 <img src="'+n+'" alt="img_2.png"></li></ol><p>当某个数据行被修改多次时，<code>Undo Log</code>将通过数据的事务ID和回滚指针形成一个非常好的修改链路</p><p><img src="'+o+'" alt="img_3.png"></p><div style="height:60px;"></div><h4 id="undo-log工作原理" tabindex="-1">Undo Log工作原理 <a class="header-anchor" href="#undo-log工作原理" aria-label="Permalink to &quot;Undo Log工作原理&quot;">​</a></h4><p><code>InnoDB</code>在<code>MySQL</code>启动时，会在内存中构建一个<code>BufferPool</code>，这个缓冲池主要存放两类东西，一是数据相关的缓存，如索引，锁、表数据等， 另一类则是各种日志的缓冲，如<code>Undo Log</code>、<code>Redo Log</code>...等。当写一条<code>SQL</code>时，<code>MySQL</code>并不会直接往磁盘中的<code>IDB</code>文件写数据，而是先修改 内存中的<code>BufferPool</code>，这样性能就能得到极大的提升。</p><p><code>Undo Log Buffer</code>。当写一条<code>SQL</code>时，不会执行往磁盘的<code>xx.ibdata</code>文件中的<code>Undo Log</code>写数据， 而是会写入<code>undo_log_buffer</code>缓冲区。如果工作线程直接去写磁盘太影响效率了，写进缓冲区后，由后台线程刷磁盘</p><h5 id="undo-log-完整工作原理" tabindex="-1">Undo Log 完整工作原理 <a class="header-anchor" href="#undo-log-完整工作原理" aria-label="Permalink to &quot;Undo Log 完整工作原理&quot;">​</a></h5><p>操作表时，会将表数据从磁盘（<code>.idb</code>）加载到内存中（<code>buffer</code>）。对表的<code>UPDATE/DELETE</code>等操作<code>InnoDB</code>都会事先将 修改前的数据备份到<code>Undo Buffer</code>中，这样当事务回滚时，可以根据<code>Undo BUffer</code>中的内容进行回滚。同时<code>Undo Buffer</code>还提供了 数据的快照读，在事务未提交前，<code>Undo Log</code>可以作为并发读写时的快照读，来保证事务的可重复读。</p><p><img src="'+l+`" alt="img_4.png"></p><h4 id="undo-log参数" tabindex="-1">Undo Log参数 <a class="header-anchor" href="#undo-log参数" aria-label="Permalink to &quot;Undo Log参数&quot;">​</a></h4><p><code>InnoDb</code>对<code>Undo Log</code>的管理采用段的方式，也就是回滚段（<code>Rollback segment</code>）。每个回滚段记录了1024个<code>Undo Log Segment</code>， 每个事务只会使用一个回滚段，当一个事务开始的时候，会制定一个回滚段，在事务中，数据被修改了，原始的数据会被复制到回滚段</p><div class="language-shell vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">mysql&gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">   show</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> variables</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> like</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;%innodb_undo%&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">+-------------------------+-------+</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Variable_name</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">           |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Value</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">+-------------------------+-------+</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> innodb_undo_directory</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">   |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> .</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">     |</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> innodb_undo_logs</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 128</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">   |</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> innodb_undo_tablespaces</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 0</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">     |</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">+-------------------------+-------+</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">3</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> rows</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> in</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> set</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (0.01 </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">sec</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span></code></pre></div><ul><li>innodb_undo_directory : <code>Undo Log</code>日志的存储目录。默认为<code>./</code></li><li>innodb_undo_logs：在<code>MySQL 5.6</code>版本后，可以通过此参数自定义多少个<code>rollback segment</code>，默认：128</li><li>innodb_undo_tablespaces：指定<code>Undo Log</code>平均分配到多少个表空间文件中，默认为0，即全部写入一个文件。不建议 修改为非0值</li></ul><h4 id="purge线程" tabindex="-1">Purge线程 <a class="header-anchor" href="#purge线程" aria-label="Permalink to &quot;Purge线程&quot;">​</a></h4><p>前面有说，事务提交后，<code>Undo Log</code>日志不会立马删除，因为存在并发访问，其他事物很可能用到该数据。直接移除会导致其他事物读不到数据。 在<code>MySQL</code>内部，由<code>Purge</code>线程 对于废弃的<code>Undo Log</code>日志，以及 磁盘表中被标记为删除的记录 进行删除，释放空间。</p><ul><li>针对于<code>INSERT Undo log</code>，因为<code>Insert</code>操作记录，只对事务本身可见，其他事物不可见，因此<code>Insert undo log</code>在事务提交后，直接删除</li><li><code>Update Undo Log</code>，由于<code>MVCC</code>机制，不能在事务提交后，直接删除，而是在提交时，放入<code>Undo Log</code>链表，再由<code>Purge</code>进行删除</li></ul><div class="language-shell vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">mysql&gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> show</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> variables</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> like</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;%purge%&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">+----------------------------+-------+</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Variable_name</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">              |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Value</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">+----------------------------+-------+</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> gtid_purged</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                |</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">       |</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> innodb_max_purge_lag</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">       |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 0</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">     |</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> innodb_max_purge_lag_delay</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 0</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">     |</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> innodb_purge_batch_size</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 300</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">   |</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> innodb_purge_threads</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">       |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> 1</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">     |</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> relay_log_purge</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ON</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    |</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">+----------------------------+-------+</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">6</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> rows</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> in</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> set</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (0.02 </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">sec</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span></code></pre></div><ul><li>innodb_max_purge_lag：当<code>InnoDB</code>压力过大时，<code>Purge</code>线程可能不会工作，此时是否需要延缓<code>DML</code>的操作。<code>innodb_max_purge_lag</code>控制<code>Undo Log</code>的数量，如果大于该值，就会延缓<code>DML</code>的操作，默认为0，不延缓</li><li>innodb_max_purge_lag_delay：表示当<code>innodb_max_purge_lag</code>的<code>delay</code>的时间太大时，将<code>delay</code>设置为该参数，防止<code>Purge</code>线程操作缓慢导致其他线程长期处于等待状态。默认为0</li><li>innodb_purge_batch_size：每次<code>Purge</code>操作需要清理的<code>Undo Log oage</code>的数量</li><li>innodb_purge_threads：<code>Purge</code>线程的数量。默认为4，最大32</li></ul>`,86),c=[p];function r(k,g,F,E,y,u){return s(),d("div",null,c)}const C=t(h,[["render",r]]);export{D as __pageData,C as default};
