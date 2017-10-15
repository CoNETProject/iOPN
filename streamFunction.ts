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

import * as Stream from 'stream'
import HttpHeader from './httpProxy'
import * as Compress from './compress'

export class blockRequestData extends Stream.Transform {
    private temp = Buffer.allocUnsafe ( 0 )
    private startTime = new Date().getTime ()
    private timeOut = null
    private first = true
    private last: Buffer = null
    private DecryptStream: Compress.decryptStream 
    constructor ( private allowedAddress: boolean, timeout: number ) {
        super ()
        if ( timeout ) {
            this.timeOut = setTimeout (() => {
                this.unpipe ()
            }, timeout )
        }
    }

    public _transform ( chunk: Buffer, encode, cb ) {

        this.temp = Buffer.concat ([ this.temp, chunk ])
        const httpHeader = new HttpHeader ( this.temp )

        if ( httpHeader._parts.length < 2 ) {
            return cb ()
        }
            
        //      have not http format request
        if ( ! httpHeader.isHttpRequest ) {
            
            console.log ('*************** SKIP nuformat data **********************')
            console.log ( httpHeader.buffer.toString ('utf8'))
            console.log ('****************** this.last *******************')
            console.log ( this.last.toString ('utf8'))
            httpHeader._parts.shift ()
            this.temp = Buffer.from ( httpHeader._parts.join ('\r\n\r\n'), 'utf8' )
            console.log ('****************** next Buffer *******************')
            console.log ( this.temp.toString ('utf8'))
            console.log ('*************************************')
            return this._transform ( Buffer.allocUnsafe(0), encode, cb )
        }

        if ( ! this.allowedAddress ) {
            console.log (`! this.allowedAddress `)
            return cb ( new Error ('404'))
        }

        if (! httpHeader.isGet && ! httpHeader.isPost ) {
            console.log ('unknow httpHeader')
            console.log ('************* unknow httpHeader   **********')
            console.log ( httpHeader._parts[0] )
            console.log ('***************************************')
            httpHeader._parts.shift ()
            this.temp = Buffer.from ( httpHeader._parts.join ( '\r\n\r\n' ), 'utf8' )
            return this._transform ( Buffer.allocUnsafe(0), encode, cb )
        }

        if ( this.timeOut ) {
            clearTimeout ( this.timeOut )
            this.timeOut = null
        }

        if ( httpHeader.isGet ) {
            const ret = Buffer.from ( httpHeader.Url.path.substr (1), 'base64' )
            this.last = Buffer.from ( httpHeader._parts[0] + `\r\n\r\n`, 'utf8' )
            httpHeader._parts.shift ()

            this.temp = Buffer.from ( httpHeader._parts.join ('\r\n\r\n'), 'utf8' )
            this.push ( ret )

            return this._transform ( Buffer.allocUnsafe(0), encode, cb )
        }

        if ( httpHeader._parts.length < 3 ) {
            return cb ()
        }
        
        const ret = Buffer.from ( httpHeader.PostBody, 'base64' )

        if ( !ret ) {     
            console.log ('***************** POST get data ERROR ********************')
            console.log ( this.last.toString ('utf8'))
            console.log ('*************************************')
            console.log ( httpHeader.buffer.toString ('utf8'))
            console.log ('****************** new Buffer *******************')
            
            httpHeader._parts.shift ()
            httpHeader._parts.shift ()

            this.temp = Buffer.from ( httpHeader._parts.join ( '\r\n\r\n' ), 'utf8' )
            return this._transform ( Buffer.allocUnsafe(0), encode, cb )
        }
        this.push ( ret )
        httpHeader._parts.shift ()
        httpHeader._parts.shift ()

        this.temp = Buffer.from ( httpHeader._parts.join ('\r\n\r\n'), 'utf8' )
        return this._transform ( Buffer.allocUnsafe(0), encode, cb )
    }
}
