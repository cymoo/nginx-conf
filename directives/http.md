# http core 指令介绍

## listen address[:port] [default_server] [backlog=number] [ssl] ... (*.80|:8000)

* 设置 nginx 监听地址，nginx 从这里接受请求
* 在没有定义 listen 指令的情况下，若以 root 权限运行 nginx， 则监听80，否则为8000
* 若携带 default_server 参数，当前虚拟主机将成为指定 address:port 的默认虚拟主机
* 如任何 listen 指令 都没有携带 default_server 参数，那么第一个监听 address:port 的虚拟主机将被作为这个地址的默认虚拟主机

## server_name name ... ("")

* 设置虚拟主机名，详见 <http://nginx.org/en/docs/http/server_names.html>
* 主机名中可以含有 *，以替代名字的开始部分或结尾部分，foo.com *.foo.com 可被 .foo.com替代
* 可定义空主机名，空名可让虚拟主机处理没有 "Host" 请求头的请求，这是该指令默认设置
* 可使用正则，正则中可包含匹配组，如

```nginx.conf
server {
  server_name ~^(www\.)?(?<domain>.+)$;
  location / {
    root /sites/$domain;
  }
}
```

* 通过名字查找虚拟主机时，一个名字可以匹配多个位置，优先级如下：
  1. 确切的名字
  2. 最长的以星号起始的通配符名字
  3. 最长的以星号结尾的通配符名字
  4. 第一个匹配的正则表达式名字

## root path (html)

* 为请求设置根目录
* path 中的值可以包含除 $document_root 和 $realpath_root 以外的变量
* 文件路径的构造仅仅是将 URI 拼在 root 指令的后面，如果需要修改 URI，应该使用 alias 指令

## alias path

* 与 root 基本相同
* 如果在定义了正则的路径中使用了 alias，那么正则中应该含有匹配组，并且 alias 应该引用这些匹配组来组成一个完成的文件路径

```nginx.conf
location ~ ^/users/(.+\.(?:gif|jpe?g|png))$ {
  alias /data/w3/images/$1;
}
```

## try_files file ... uri |=code

* 按指定顺序检查文件是否存在，并且使用第一个找到的文件来处理请求
* 文件路径是根据 root 指令和 alias 指令，将 file 参数拼接而成，如果找不到任何文件，将按最后一个参数指定的 uri 进行内部跳转
* 最后一个参数也可以为 named location 和 code

## location

* 路径匹配在 URI 规范化后进行，即现将 URI 中形为 %XX 的编码字符进行解码，再解析 URI 中的相对路径 . 和 .. 部分，并将多个 / 压缩为一个
* 可使用前缀字符串或正则定义路径
* 匹配优先级
  1. 精确匹配：=
  2. 最大前缀匹配：^~，若有多个，匹配最长的
  3. 正则匹配：~ 或 ~* （不区分大小写），按照在出现的顺序，匹配上某个后即停止，正则可包含匹配组，被后面指令使用
  4. 普通匹配：如 / /foo

## error_page code ... [=[response]] uri

* 为指定错误定义显示的 URI，当前配置级别没有 error_page 指令时，将从上层继承，URI 可包含变量
* 可使用 =response 改变响应状态码，error_page 404 = 200 /empty.gif
* URI 可被发送到被代理服务器处理，code 由被代理服务器决定
* 可直接进行重定向：error_page 404 http://foo.com
* 若无需改变 URI，可将错误处理转到一个转到一个 named location

```nginx.conf
    # 发起一个内部重定向至指定的 URI，client 的请求方法会变为 GET
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;

    # 将 status code 变为200
    error_page 404 =200 /empty.gif;

    # error response 由代理服务器处理，且可能返回不同的 status code
    error_page 404 = /to-proxy;

    # 使用 named location，内部重定向不改变 URL 和 method
    error_page 404 = @fallback;
    location @fallback {
        proxy_pass http://backend;
    }

    # 使用 URL redirect，默认返回302
    # error_page 403 http://example.com/forbidden.html;
    # error_page 404 =301 http://example.com/notfound.html;
```

## types {...} {text/html html; image/gif gif; image/jpeg jpg;}

* 设置文件扩展名和响应的 MIME 类型的映射表

## default_type mime-type (text/plain)

* 设置响应的默认 MIME 类型

## tcp_nodelay on | off (on)

* 开启或关闭 nginx 使用 TCP_NODELAY 选项的功能
* 此选项仅在将连接转为长连接的时候被启动（在 upstream 发送响应到客户端时也被启动）

## postpone_output size (1460)

* 如果可能，发送至客户端的数据将被推迟发送，知道 nginx 需要发送的数据至少有 size 字节
* 设置为0将关闭推迟发送的功能
* 与 tcp_nodelay 的区别？

## tcp_nopush on | off (off)

* 仅在使用 senfile 时才开启
* 将响应头和正文的开始部分一起发送
* 一次性发送整个文件

## etag on | off (on)

* 开启或关闭静态文件自动计算 ETAG 响应头
* 怎么计算的，计算文件内容的hash？

## if_modified_since off | exact | before (exact)

* 指定响应的修改时间和 If-Modified-Since 请求头的比较方法
* off：忽略该请求头；exact：精确匹配；before：响应的修改时间小于等于 If-Modified-Since 请求头指定的时间

## limit_rate rate (0)

* 限制向客户端传送响应的速率限制，单位为 bytes/s，设置为0可关闭限速
* nginx 按连接限速，若某个客户端开启了两个连接，那么客户端的整体速率是这条指令设置值的2倍

## sendfile on | off (off)

* 开启或关闭使用 senfile 调用

## client_max_body_size size (1m)

* 设置允许客户端请求正文的最大长度，请求的长度由 Content-Length 请求头指定
* 若请求的长度超过设定值，nginx 将返回错误 413 (Request Entity Too Large) 到客户端
* 若为0，则 nginx 不会检查请求正文长度

## client_body_buffer_size size (8k|16k)

* 设置读取客户端请求正文的缓冲容量，若请求正文大于缓冲容量，整个正文或者一部分将写入临时文件
* 缓冲大小默认等于两块内存页的大小

## client_header_buffer_size size (1k)

* 设置读取客户端请求头部的缓冲容量
* 对于大多数请求，1k 的缓冲足够，但如果请求含有很大的 cookie等，则 nginx 将按照 large_client_header_buffers 指令分配更大的缓冲来存放

## large_client_header_buffers number size (4 8k)

* 设置读取客户端超大请求的缓冲最大 number 和每块缓冲的 size
* HTTP 请求行的长度不能超过一块缓冲的容量，否则 nginx 返回错误 414 (Request-URI Too Large) 到客户端
* 每个请求头的长度也不能超过一块缓冲的容量，否则 nginx 返回错误 400 (Bad Request) 到客户端
* 缓冲是按需分配

## 变量
