const WebTorrent = require('webtorrent-hybrid')
const client = new WebTorrent()
const path = require('path')

const opts = {
    announce: ['ws://lufo.ml:8000'],
    path: path.join(__dirname, '/downloads')
}

function download() {
    client.add(tFile, opts, function (torrent) {
        console.log(torrent.announce)
        torrent.on('done', function () {
            console.log('torrent download finished')
        })
    })
}
