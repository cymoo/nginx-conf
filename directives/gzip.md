# gzip 指令介绍

The ngx_http_gzip_module module is a filter that compresses responses using the “gzip” method. This often helps to reduce the size of transmitted data by half or even more.

## gzip on | off (off)

* Enables or disables gzipping of responses.

## gzip_comp_level level (1)

* Sets a gzip compression level of a response. Acceptable values are in the range from 1 to 9.

## gzip_min_length length (20)

* Sets the minimum length of a response that will be gzipped. The length is determined only from the “Content-Length” response header field.

## gzip_proxied off | expired | no-cache | no-store | private | no_last_modified | no_etag | auth | any ... (off)

* Enables or disables gzipping of responses for proxied requests depending on the request and response.
* The fact that the request is proxied is determined by the presence of the “Via” request header field.
* off: 禁用压缩
* any: 被代理的所有响应均被压缩
* 其他参数见 <http://nginx.org/en/docs/http/ngx_http_gzip_module.html#gzip_proxied>

## gzip_types mime-type (text/html)

* Enables gzipping of responses for the specified MIME types in addition to “text/html”.
* The special value “*” matches any MIME type.
* Responses with the “text/html” type are always compressed.
