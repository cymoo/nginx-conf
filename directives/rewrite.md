# rewrite 指令介绍

## rewrite regex replacement [flag]

* 之前的 query string 会被附在 replacement 后面，如果要避免这种情况，需要在 replacement 后面加 上 ?
* rewrite的执行顺序详见文档

## if (condition) {...}

* 计算指定的 condition 的值，如果为真，执行定义在大括号中的 rewrite 模块指令，并将 if 指令中的配置指定给请求，if 指令会从上一层配置继承配置
* 计算为空或以"0"开头的字符串，则条件为假
* 使用 = 和 != 比较常量和字符串
* 可使用 ~ ~* 运算符匹配变量和正则
* 可使用 -f -d -e -x 及前面加 ! 来判断文件或目录是否存在

## set variable value

* 为指定变量 variable 设置变量值 value，value 可以包含文本、变量或它们的组合

## last VS break

* 均会立即停止所有当前上下文的 rewrite 模块指令
* last 会用新的 URL 搜寻新的 location；break 不会搜寻新的 location，其直接用这个 URL 来处理请求，这样能避免重复 rewrite
* 尽可能在 server 上下文中使用 last；在 location 上下文中使用 break

## redirect(302) VS permanent(301)

* 终止搜寻，让浏览器重新发起请求；如果 replacement 以 http://，https://，或 $scheme 开头，效果与 redirect相同

## return

* return code：响应内容为 nginx 默认的，比如404，not found；若为444，则直接关闭 TCP 连接
* return code text：响应内容，code不能为重定向的 30x
* return code URL：URL 为 http:// 或 https:// 等绝对URL，code 只能为 30x
* return URL：code 默认为302， URL 同上

## 示例

```nginx.conf
server {
    listen 3456;
    default_type text/plain;
    root /path/to/root;

    if ($http_user_agent !~* webkit) {
        return 403 "you are a robot;
    }

    rewrite ^/foo/(.*) /$1;
    rewrite ^/bar/(.*) /$1 last;
    rewrite ^/fox/(.*) /$1;

    location ~ /capture/(?<path>.+) {
        return 200 "/capture/$path";
    }

    location /audio {
        rewrite ^/audio/foo/(.*) /$1;
        rewrite ^/audio/bar/(.*) /$1 break;
        rewrite ^/audio/bax/(.*) /$1;

        return 200 "audio: $uri; $request_filename";
    }
}
```
