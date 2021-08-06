const client = new WebTorrent({
    tracker: true,
    dht: false,
    lsd: false,
    webSeeds: false
})
const infoHash = window.location.pathname.split('/')[2]

let body = document.body
let output = document.getElementById('output')
let progressBar = document.getElementById('progressBar')
let numPeers = document.getElementById('numPeers')
let downloaded = document.getElementById('downloaded')
let total = document.getElementById('total')
let remain = document.getElementById('remaining')
let uploadSpeed = document.getElementById('uploadSpeed')
let downloadSpeed = document.getElementById('downloadSpeed')

function download(infoHash) {
    // Download the torrent

    client.add(window.location.origin + '/torrent/' + infoHash, function (torrent) {
        console.log(torrent.announce)
        // Torrents can contain many files. Let's use the .mp4 file
        let file = torrent.files.find(function (file) {
            console.log(file)
            return file.name.endsWith('.mp4')
        })

        // Stream the file in the browser
        file.appendTo(output)

        // Trigger statistics refresh
        torrent.on('done', onDone)
        setInterval(onProgress, 500)
        onProgress()

        // Statistics
        function onProgress () {
            // Peers
            numPeers.innerHTML = torrent.numPeers + (torrent.numPeers === 1 ? ' peer' : ' peers')

            // Progress
            let percent = Math.round(torrent.progress * 100 * 100) / 100
            progressBar.style.width = percent + '%'
            downloaded.innerHTML = prettyBytes(torrent.downloaded)
            total.innerHTML = prettyBytes(torrent.length)

            // Remaining time
            let remaining
            if (torrent.done) {
                remaining = 'Done.'
            } else {
                remaining = moment.duration(torrent.timeRemaining / 1000, 'seconds').humanize()
                remaining = remaining[0].toUpperCase() + remaining.substring(1) + ' remaining.'
            }
            remain.innerHTML = remaining

            // Speed rates
            downloadSpeed.innerHTML = prettyBytes(torrent.downloadSpeed) + '/s'
            uploadSpeed.innerHTML = prettyBytes(torrent.uploadSpeed) + '/s'
        }
        function onDone () {
            body.className += ' is-seed'
            onProgress()
        }
    })
}

// Human readable bytes util
function prettyBytes(num) {
    let exponent, unit, neg = num < 0, units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    if (neg) num = -num
    if (num < 1) return (neg ? '-' : '') + num + ' B'
    exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1)
    num = Number((num / Math.pow(1000, exponent)).toFixed(2))
    unit = units[exponent]
    return (neg ? '-' : '') + num + ' ' + unit
}

download(infoHash)
