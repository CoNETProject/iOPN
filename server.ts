/*!
 * Copyright 2017 Vpn.Email network security technology Canada Inc. All Rights Reserved.
 *
 * Vpn.Email network technolog Canada Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as Net from 'net'
import * as Http from 'http'
import * as Dns from 'dns'
import * as fs from 'fs'
import * as Crypto from 'crypto'
import * as Async from 'async'
import * as Stream from 'stream'
import * as cluster from 'cluster'

import * as HttpProxy from './httpProxy'
import * as Compress from './compress'
import * as StreamFun from './streamFunction'
import * as setup from './setup'

const MaxAllowedTimeOut = 1000 * 60 * 5

const otherRespon = ( body: string| Buffer, _status: number ) => {
	const Ranges = ( _status === 200 ) ? 'Accept-Ranges: bytes\r\n' : ''
	const Content = ( _status === 200 ) ? `Content-Type: text/plain; charset=utf-8\r\n` : 'Content-Type: text/html\r\n'
	const headers = `Server: nginx/1.6.2\r\n`
					+ `Date: ${ new Date ().toUTCString()}\r\n`
					+ Content
					+ `Content-Length: ${ body.length }\r\n`
					+ `Connection: keep-alive\r\n`
					+ `Vary: Accept-Encoding\r\n`
					//+ `Transfer-Encoding: chunked\r\n`
					+ '\r\n'

	const status = _status === 200 ? 'HTTP/1.1 200 OK\r\n' : 'HTTP/1.1 404 Not Found\r\n'
	return status + headers + body
}

const return404 = () => {
	const kkk = '<html>\r\n<head><title>404 Not Found</title></head>\r\n<body bgcolor="white">\r\n<center><h1>404 Not Found</h1></center>\r\n<hr><center>nginx/1.6.2</center>\r\n</body>\r\n</html>\r\n'
	return otherRespon ( Buffer.from ( kkk ), 404 )
}

const dnsLookup = ( hostName: string, CallBack ) => {
	console.log (`on dnsLookup: hostName = [${ hostName }]`)
	return Dns.lookup ( hostName, { all: true }, ( err, data ) => {
		if ( err )
			return CallBack ( err )
		const _buf = Buffer.from ( JSON.stringify ( data ))
		return CallBack ( null, _buf )
	})
}

class listen extends Stream.Transform {
	constructor ( private headString: string ) { super ()}
	public _transform ( chunk: Buffer, encode, cb ) {

		console.log ( this.headString )
		console.log ( chunk.toString ('hex'))
		console.log ( this.headString )
		return cb ( null, chunk )
	}
}

export class ssModeV1 {
	private logFileName = `qtgate_httpServer`
    private serverNet: Net.Server = null

	constructor ( private password, private port: number ) {

        this.serverNet = Net.createServer ( socket => {

            const _remoteAddress = socket.remoteAddress
            const remoteAddress = _remoteAddress.split ( ':' ).length > 2 ? _remoteAddress.split ( ':' )[3] : _remoteAddress

			const id = `[${ remoteAddress }]:[${ socket.remotePort }]`
			this.serverNet.getConnections (( err, count ) => {
				if ( err )
					return console.log (`serverNet.getConnections ERROR: `, err )
				return console.log (`new ssMode connect [${ id }] opened connect=[${ count }]`)
			})
		

            const streamFunBlock = new StreamFun.blockRequestData ( true, MaxAllowedTimeOut )
            
            const streamDecrypt = new Compress.SdecryptStream ( password )

            const streamEncrypt = new Compress.SencryptStream ( password, 500, null, () => {

            	const firstConnect = new FirstConnect ( socket, streamEncrypt )

                firstConnect.once ( 'error', err => {
                    console.log ( `firstConnect.on ERROR:`, err.message )
                    return socket.end ( return404 ())
				})
				
				socket.pipe ( streamFunBlock ).pipe ( streamDecrypt ).pipe ( firstConnect )
				
            })
            
            streamFunBlock.once ( 'error', err => {
                console.log ( `streamFunBlock.on ERROR:`, err.message )
                if ( /404/.test ( err.message)) 
                    return socket.end ( return404 ())
                return socket.end ()
            })

            socket.once ( 'end', () => {
				console.log (` socket.once`)
                return this.serverNet.getConnections (( err, count ) => {
                    console.log ( id, 'socket.on END! connected = ', count )
                })
                
            })

            socket.once ( 'unpipe', src => {
				console.log (`socket.once unpipe!`)
                return socket.end ()
            })

            socket.once ( 'error', err => {
				console.log (`socket.on ERROR!`)
                return socket.end ()
                
            })

        })
        
        this.serverNet.on ( 'error', err => {
			
            return console.log ( 'ssModeV1 serverNet.on error:' + err.message )
        })

        this.serverNet.listen ( port, null, 512, () => {
            const log = `SS mode start up listening on [${ port }]`
            return console.log ( log )
        })
	}
}

class FirstConnect extends Stream.Writable {
	private socket: Net.Socket = null
	constructor ( private clientSocket: Net.Socket, private encrypt: Compress.SencryptStream ) { super ()}
    
	public _write ( chunk: Buffer, encode, cb ) {
		if ( ! this.socket ) {
			const _data = chunk.toString ()
			try {
				const data = JSON.parse ( _data )
				console.log ( data )
				if ( data.hostName && data.hostName.length ) {

					return dnsLookup ( data.hostName, ( err, data ) => {
						if ( err ) {
							return cb ( err )
						}

						this.encrypt.pipe ( this.clientSocket )
						this.encrypt.end ( data )
					})
				}
				if ( data.uuid ) {

					return this.socket = Net.connect ({ port: data.port, host: data.host }, () => {
						this.socket.on ( 'error', err => {
							console.log ( 'FirstConnect socket on error!', err.message )
							this.end ()
						})
						this.socket.pipe ( this.encrypt ).pipe ( this.clientSocket )
						
						this.socket.write ( Buffer.from ( data.buffer, 'base64' ))
						return cb ()
					})
					
				}
				
				return cb ( new Error ( 'unknow connect!' ))
			} catch ( e ) {
				console.log (`FirstConnect JSON.parse [${ _data }]catch error:` , e )
				return cb ( e )
			}
		}

		if ( this.socket.writable ) {
			this.socket.write ( chunk )
			return cb ()
		}

		return cb ( new Error ( 'FirstConnect socket.writable=false' ))
	}
}

const server = new ssModeV1 ( setup.randomPassword, setup.gatewayPort )