interface IinputData extends imapConnect {

    clientFolder: string
    serverFolder: string
    randomPassword: string
    uuid: string
}
interface imapConnect {
    imapServer: string
    imapUserName: string
    imapUserPassword: string
    imapPortNumber: string
    imapSsl: boolean
    imapIgnoreCertificate: boolean
}
interface VE_IPptpStream {
    type?: string;
    buffer: string;
    host: string;
    port: number;
    cmd: number;
    ATYP: number;
    uuid?: string;
    length?:number;
    randomBuffer?: Buffer
    ssl: boolean
}

interface dnsAddress {
	address: string
	family: number
	expire: Date
	connect: Date []
}
interface domainData {
	dns: dnsAddress[]
	expire: number
}