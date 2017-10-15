# QTGATE iOPN client and server - Open Source
[![Build Status](https://travis-ci.org/QTGate/QTGate-Desktop-Client.svg?branch=master)](https://travis-ci.org/QTGate/QTGate-Desktop-Client)
[![Gitter](https://img.shields.io/badge/chat-on%20gitter-blue.svg)](https://gitter.im/QTGate/Lobby)

## Description 概要

This is QTGATE iOPN module include server and client
iOPN is a new anonymity network technolgy from QTGATE Systems Canada Inc, 
it use HTTP protocol to make a virtual tunnel that disguise the traffic looks like normal HTTP protocol, exchanges packets between clients and servers. 

Client soft support proxy server. [QTGATE](https://www.qtgate.com).

這是iOPN客戶端和服務器端源程序
iOPN是加拿大QTGATE系統公司開發的一種匿名通讯手段，它可以通过HTTP协议建立一个虚拟的专用通道，直接连接客户端和代理服务器，使用混淆流量技術建立一个私密的网络安全环境。

iOPNの端末とサーバ通信用モジュールです.  
iOPNとは、カナダQTGATEシステム株式会社開発した匿名通信技術です。HTTPプロトコルを使用して、ネットワークトラフィックをノーマルHTTP通信に偽装して、秘密な通信環境を手に入れます。

![http protocol](/resources/vpn.email11.jpg?raw=true)

## INSTALL

npm i qtgate_at_opn

## SETUP

setup.js

## server

npm run server

## client

npm run client

## Notice 注意事項 

This version support http & https proxy only
當前版本只對應 http 和 https proxy
このパージョンは　http と https proxy　しか対応していますので、ご注意してください。

## License 版權 

Copyright (c) QTGate Systems Inc. All rights reserved.

Licensed under the [MIT](LICENSE) License.

The MIT License (MIT)
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.