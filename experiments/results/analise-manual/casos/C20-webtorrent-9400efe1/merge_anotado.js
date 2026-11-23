module.exports = Torrent

var addrToIPPort = require('addr-to-ip-port') // browser exclude
var createTorrent = require('create-torrent')
var debug = require('debug')('webtorrent:torrent')
var Discovery = require('torrent-discovery')
var EventEmitter = require('events').EventEmitter
var inherits = require('inherits')
var parallel = require('run-parallel')
var parseTorrent = require('parse-torrent')
var reemit = require('re-emitter')
var Swarm = require('bittorrent-swarm') // `webtorrent-swarm` in browser
var uniq = require('uniq')
var ut_metadata = require('ut_metadata')
var ut_pex = require('ut_pex') // browser exclude

var RarityMap = require('./rarity-map')
var Server = require('./server') // browser exclude
var Storage = require('./storage')

var MAX_BLOCK_LENGTH = 128 * 1024
var PIECE_TIMEOUT = 30000
var CHOKE_TIMEOUT = 5000
var SPEED_THRESHOLD = 3 * Storage.BLOCK_LENGTH

var PIPELINE_MIN_DURATION = 0.5
var PIPELINE_MAX_DURATION = 1

var RECHOKE_INTERVAL = 10000 // 10 seconds
var RECHOKE_OPTIMISTIC_DURATION = 2 // 30 seconds

function noop () {}

inherits(Torrent, EventEmitter)

/**
 * A torrent
 *
 * @param {string|Buffer|Object} torrentId
 * @param {Object} opts
 */
function Torrent (torrentId, opts) {
  var self = this
  EventEmitter.call(self)
  if (!debug.enabled) self.setMaxListeners(0)
  debug('new torrent')

  self.opts = opts
  self.client = opts.client

  self.hotswapEnabled = ('hotswap' in opts ? opts.hotswap : true)
  self.verify = opts.verify

  self.chokeTimeout = opts.chokeTimeout || CHOKE_TIMEOUT
  self.pieceTimeout = opts.pieceTimeout || PIECE_TIMEOUT
  self.strategy = opts.strategy || 'sequential'

  self._rechokeNumSlots = (opts.uploads === false || opts.uploads === 0)
    ? 0
    : (+opts.uploads || 10)
  self._rechokeOptimisticWire = null
  self._rechokeOptimisticTime = 0
  self._rechokeIntervalId = null

  self.ready = false
  self.destroyed = false
  self.files = []
  self.metadata = null
  self.parsedTorrent = null
  self.storage = null
  self.numBlockedPeers = 0
  self._amInterested = false
  self._selections = []
  self._critical = []
  self._storageImpl = opts.storage || Storage
  this._torrentFileURL = null

  if (torrentId) self._onTorrentId(torrentId)                                                         // [L]
}

// torrent size (in bytes)
Object.defineProperty(Torrent.prototype, 'length', {
  get: function () {
    return (this.parsedTorrent && this.parsedTorrent.length) || 0
  }
})

// time remaining (in milliseconds)
Object.defineProperty(Torrent.prototype, 'timeRemaining', {
  get: function () {
    if (this.swarm.downloadSpeed() === 0) return Infinity
    else return ((this.length - this.downloaded) / this.swarm.downloadSpeed()) * 1000
  }
})

// percentage complete, represented as a number between 0 and 1
Object.defineProperty(Torrent.prototype, 'progress', {
  get: function () {
    return (this.parsedTorrent && (this.downloaded / this.parsedTorrent.length)) || 0
  }
})

// bytes downloaded (not necessarily verified)
Object.defineProperty(Torrent.prototype, 'downloaded', {
  get: function () {
    return (this.storage && this.storage.downloaded) || 0
  }
})

// bytes uploaded
Object.defineProperty(Torrent.prototype, 'uploaded', {
  get: function () {
    return this.swarm.uploaded
  }
})

// ratio of bytes downloaded to uploaded
Object.defineProperty(Torrent.prototype, 'ratio', {
  get: function () {
    return (this.uploaded && (this.downloaded / this.uploaded)) || 0
  }
})

Object.defineProperty(Torrent.prototype, 'magnetURI', {
  get: function () {
    return parseTorrent.toMagnetURI(this.parsedTorrent)
  }
})

Object.defineProperty(Torrent.prototype, 'torrentFile', {
  get: function () {
    return parseTorrent.toTorrentFile(this.parsedTorrent)
  }
})

Object.defineProperty(Torrent.prototype, 'torrentFileURL', {
  get: function () {
    if (typeof window === 'undefined') throw new Error('browser-only property')
    if (this._torrentFileURL) return this._torrentFileURL
    this._torrentFileURL = window.URL.createObjectURL(
      new window.Blob([ this.torrentFile ], { type: 'application/x-bittorrent' })
    )
    return this._torrentFileURL
  }
})

Torrent.prototype._onTorrentId = function (torrentId) {                                               // [L]
  var self = this                                                                                     // [L]  ◀ #1 DF: produz (L) → R 243  ◀ #2 DF: produz (L) → R 244
  if (self.destroyed) return                                                                          // [L]
  var parsedTorrent = torrentId && torrentId.parsedTorrent                                            // [L]
  if (parsedTorrent) {                                                                                // [L]
    self._onParsedTorrent(parsedTorrent)                                                              // [L]
  } else {                                                                                            // [L]
    parseTorrent.remote(torrentId, function (err, parsedTorrent) {                                    // [L]
      if (self.destroyed) return                                                                      // [L]
      if (err) return self._onError(err)                                                              // [L]
      self._onParsedTorrent(parsedTorrent)                                                            // [L]  ◀ #3 DF: produz (L) → R 243  ◀ #4 DF: produz (L) → R 244
    })                                                                                                // [L]
  }                                                                                                   // [L]
}                                                                                                     // [L]
                                                                                                      // [L]
Torrent.prototype._onParsedTorrent = function (parsedTorrent) {                                       // [L]  ◀ #5 DF: produz (L) → R 243  ◀ #6 DF: produz (L) → R 244
  var self = this                                                                                     // [L]  ◀ #7 DF: produz (L) → R 243  ◀ #8 DF: produz (L) → R 244
  if (self.destroyed) return                                                                          // [L]
  self.parsedTorrent = parsedTorrent                                                                  // [L]  ◀ #9 DF: produz (L) → R 243  ◀ #10 DF: produz (L) → R 244
  self.infoHash = parsedTorrent.infoHash                                                              // [L]
                                                                                                      // [L]
  if (!self.infoHash) {                                                                               // [L]
    return self._onError(new Error('Malformed torrent data: Missing info hash.'))                     // [L]
  }                                                                                                   // [L]
                                                                                                      // [L]
  if (self.parsedTorrent.name) self.name = self.parsedTorrent.name // preliminary name                // [L]
                                                                                                      // [L]
  // Allow specifying trackers via `opts` parameter                                                   // [L]
  if (self.opts.announce) {                                                                           // [L]
    self.parsedTorrent.announce =                                                                     // [L]
      self.parsedTorrent.announce.concat(self.opts.announce)                                          // [L]
  }                                                                                                   // [L]
                                                                                                      // [L]
  // So `webtorrent-hybrid` can force specific trackers to be used                                    // [L]
  if (global.WEBTORRENT_ANNOUNCE) {                                                                   // [L]
    self.parsedTorrent.announce =                                                                     // [L]
      self.parsedTorrent.announce.concat(global.WEBTORRENT_ANNOUNCE)                                  // [L]
  }                                                                                                   // [L]
                                                                                                      // [L]
  // When no trackers specified, use some reasonable defaults                                         // [L]
  if (self.parsedTorrent.announce.length === 0) {                                                     // [L]
    self.parsedTorrent.announce = createTorrent.announceList.map(function (list) {                    // [L]
      return list[0]                                                                                  // [L]
    })                                                                                                // [L]
  }                                                                                                   // [L]
                                                                                                      // [L]
  uniq(self.parsedTorrent.announce)                                                                   // [L]
                                                                                                      // [L]
  // create swarm                                                                                     // [L]
  self.swarm = new Swarm(self.infoHash, self.client.peerId, {                                         // [L]
    handshake: { dht: !!self.client.dht }                                                             // [L]
  })                                                                                                  // [L]
  self.swarm.on('error', self._onError.bind(self))                                                    // [L]
  reemit(self.swarm, self, ['warning'])                                                               // [L]
  self.swarm.on('wire', self._onWire.bind(self))                                                      // [L]
                                                                                                      // [L]
  // update overall client stats                                                                      // [L]
  self.swarm.on('download', self.client.downloadSpeed.bind(self.client))                              // [L]
  self.swarm.on('upload', self.client.uploadSpeed.bind(self.client))                                  // [L]
                                                                                                      // [L]
  // listen for peers (note: in the browser, this is a no-op and callback is called on                // [L]
  // next tick)                                                                                       // [L]
  self.swarm.listen(self.client.torrentPort, self._onSwarmListening.bind(self))                       // [L]
                                                                                                      // [L]
  process.nextTick(function () {                                                                      // [L]
    if (self.destroyed) return                                                                        // [L]
    self.emit('infoHash', self.infoHash)                                                              // [L]
  })                                                                                                  // [L]
}                                                                                                     // [L]
                                                                                                      // [L]
Torrent.prototype._onSwarmListening = function () {
  var self = this
  if (self.destroyed) return

  if (self.swarm.server) self.client.torrentPort = self.swarm.address().port

  // begin discovering peers via the DHT and tracker servers
  self.discovery = new Discovery({
    announce: self.parsedTorrent.announce,
    dht: self.client.dht,
    tracker: self.client.tracker,
    peerId: self.client.peerId,
    port: self.client.torrentPort,
    rtcConfig: self.client._rtcConfig,
    wrtc: self.client._wrtc
  })
  self.discovery.on('error', self._onError.bind(self))
  self.discovery.setTorrent(self.infoHash)
  self.discovery.on('peer', self.addPeer.bind(self))

  // expose discovery events
  reemit(self.discovery, self, ['dhtAnnounce', 'warning'])

  // if full metadata was included in initial torrent id, use it
  if (self.parsedTorrent.info) self._onMetadata(self.parsedTorrent)

  if (self.parsedTorrent.urlList) {                                                                   // [R]  ◀ #1 DF: consome (R) ← L 148  ◀ #3 DF: consome (R) ← L 157  ◀ #5 DF: consome (R) ← L 162  … (+2 conflitos nesta linha)
    self.parsedTorrent.urlList.forEach(self.addWebPeer.bind(self))                                    // [R]  ◀ #2 DF: consome (R) ← L 148  ◀ #4 DF: consome (R) ← L 157  ◀ #6 DF: consome (R) ← L 162  … (+2 conflitos nesta linha)
  }                                                                                                   // [R]
                                                                                                      // [R]
  self.emit('listening', self.client.torrentPort)
}

/**
 * Called when the metadata is received.
 */
Torrent.prototype._onMetadata = function (metadata) {
  var self = this
  if (self.metadata || self.destroyed) return
  debug('got metadata')

  if (metadata && metadata.infoHash) {
    // `metadata` is a parsed torrent (from parse-torrent module)
    self.metadata = parseTorrent.toTorrentFile(metadata)
    self.parsedTorrent = metadata
  } else {
    self.metadata = metadata
    var announce = self.parsedTorrent.announce                                                        // [L]
    try {
      self.parsedTorrent = parseTorrent(self.metadata)
    } catch (err) {
      return self._onError(err)
    }
    self.parsedTorrent.announce = announce                                                            // [L]
  }

  // update preliminary torrent name
  self.name = self.parsedTorrent.name

  // update discovery module with full torrent metadata
  self.discovery.setTorrent(self.parsedTorrent)

  self.rarityMap = new RarityMap(self.swarm, self.parsedTorrent.pieces.length)

  self.storage = new self._storageImpl(self.parsedTorrent, self.opts)
  self.storage.on('piece', self._onStoragePiece.bind(self))
  self.storage.on('file', function (file) {
    self.emit('file', file)
  })

  self._reservations = self.storage.pieces.map(function () {
    return []
  })

  self.storage.on('done', function () {
    if (self.discovery.tracker) self.discovery.tracker.complete()

    debug('torrent ' + self.infoHash + ' done')
    self.emit('done')
  })

  self.storage.on('select', self.select.bind(self))
  self.storage.on('deselect', self.deselect.bind(self))
  self.storage.on('critical', self.critical.bind(self))

  self.storage.files.forEach(function (file) {
    self.files.push(file)
  })

  self.swarm.wires.forEach(function (wire) {
    // If we didn't have the metadata at the time ut_metadata was initialized for this
    // wire, we still want to make it available to the peer in case they request it.
    if (wire.ut_metadata) wire.ut_metadata.setMetadata(self.metadata)

    self._onWireWithMetadata(wire)
  })

  if (self.verify) {
    process.nextTick(function () {
      debug('verifying existing torrent data')
      var numPieces = 0
      var numVerified = 0

      // TODO: move storage verification to storage.js?
      parallel(self.storage.pieces.map(function (piece) {
        return function (cb) {
          self.storage.read(piece.index, function (err, buffer) {
            numPieces += 1
            self.emit('verifying', {
              percentDone: 100 * numPieces / self.storage.pieces.length,
              percentVerified: 100 * numVerified / self.storage.pieces.length
            })

            if (!err && buffer) {
              // TODO: this is a bit hacky; figure out a cleaner way of verifying the buffer
              piece.verify(buffer)
              numVerified += piece.verified
              debug('piece ' + (piece.verified ? 'verified' : 'invalid') + ' ' + piece.index)
            }
            // continue regardless of whether piece verification failed
            cb()
          }, true) // forces override to allow reading from non-verified pieces
        }
      }), self._onStorage.bind(self))
    })
  } else {
    process.nextTick(self._onStorage.bind(self))
  }

  process.nextTick(function () {
    self.emit('metadata')
  })
}

/**
 * Destroy and cleanup this torrent.
 */
Torrent.prototype.destroy = function (cb) {
  var self = this
  if (self.destroyed) return
  self.destroyed = true
  debug('destroy')

  if (self._rechokeIntervalId) {
    clearInterval(self._rechokeIntervalId)
    self._rechokeIntervalId = null
  }

  if (self._torrentFileURL) window.URL.revokeObjectURL(self._torrentFileURL)

  var tasks = []
  if (self.swarm) tasks.push(function (cb) { self.swarm.destroy(cb) })
  if (self.discovery) tasks.push(function (cb) { self.discovery.stop(cb) })
  if (self.storage) tasks.push(function (cb) { self.storage.close(cb) })
  parallel(tasks, cb)
}

/**
 * Add a peer to the swarm
 * @param {string|SimplePeer} peer
 * @return {boolean} true if peer was added, false if peer was blocked
 */
Torrent.prototype.addPeer = function (peer) {
  var self = this
                                                                                                      // [L]
  function addPeer () {                                                                               // [L]
    self.emit('peer', peer)                                                                           // [L]
    self.swarm.addPeer(peer)                                                                          // [L]
  }                                                                                                   // [L]
                                                                                                      // [L]
  // TODO: extract IP address from peer object and check blocklist
  if (typeof peer === 'string' && self.client.blocked &&                                              // [L]
      self.client.blocked.contains(addrToIPPort(peer)[0])) {                                          // [L]
    self.numBlockedPeers += 1
    self.emit('blockedPeer', peer)
    return false
  } else {
    if (self.swarm) addPeer()                                                                         // [L]
    else self.on('listening', addPeer)                                                                // [L]
    return true
  }
}

/**                                                                                                   // [R]
 * Add a web peer to the swarm                                                                        // [R]
 * @param {string} web peer url                                                                       // [R]
 */                                                                                                   // [R]
Torrent.prototype.addWebPeer = function (webPeer) {                                                   // [R]
  var self = this                                                                                     // [R]
  self.emit('webPeer', webPeer)                                                                       // [R]
  self.swarm.addWebPeer(webPeer, self.parsedTorrent)                                                  // [R]
}                                                                                                     // [R]
                                                                                                      // [R]
/**
 * Select a range of pieces to prioritize.
 *
 * @param {number}    start     start piece index (inclusive)
 * @param {number}    end       end piece index (inclusive)
 * @param {number}    priority  priority associated with this selection
 * @param {function}  notify    callback when selection is updated with new data
 */
Torrent.prototype.select = function (start, end, priority, notify) {
  var self = this
  if (start > end || start < 0 || end >= self.storage.pieces.length) {
    throw new Error('invalid selection ', start, ':', end)
  }
  priority = Number(priority) || 0

  debug('select %s-%s (priority %s)', start, end, priority)

  self._selections.push({
    from: start,
    to: end,
    offset: 0,
    priority: priority,
    notify: notify || noop
  })

  self._selections.sort(function (a, b) {
    return b.priority - a.priority
  })

  self._updateSelections()
}

/**
 * Deprioritizes a range of previously selected pieces.
 *
 * @param {number}  start     start piece index (inclusive)
 * @param {number}  end       end piece index (inclusive)
 * @param {number}  priority  priority associated with the selection
 */
Torrent.prototype.deselect = function (start, end, priority) {
  var self = this
  priority = Number(priority) || 0
  debug('deselect %s-%s (priority %s)', start, end, priority)

  for (var i = 0; i < self._selections.length; ++i) {
    var s = self._selections[i]
    if (s.from === start && s.to === end && s.priority === priority) {
      self._selections.splice(i--, 1)
      break
    }
  }

  self._updateSelections()
}

/**
 * Marks a range of pieces as critical priority to be downloaded ASAP.
 *
 * @param {number}  start  start piece index (inclusive)
 * @param {number}  end    end piece index (inclusive)
 */
Torrent.prototype.critical = function (start, end) {
  var self = this
  debug('critical %s-%s', start, end)

  for (var i = start; i <= end; ++i) {
    self._critical[i] = true
  }

  self._updateSelections()
}

Torrent.prototype._onWire = function (wire, addr) {
  var self = this

  debug('got wire (%s)', addr || 'Unknown')

  if (addr) {
    // Sometimes RTCPeerConnection.getStats() doesn't return an ip:port for peers
    var parts = addrToIPPort(addr)
    wire.remoteAddress = parts[0]
    wire.remotePort = parts[1]
  }

  // If peer supports DHT, send PORT message to report DHT listening port                             // [L]
  if (wire.peerExtensions.dht && self.client.dht && self.client.dht.listening) {                      // [L]
                                                                                                      // [L]
    // When peer sends PORT, add them to the routing table                                            // [L]
    wire.on('port', function (port) {                                                                 // [L]
      if (!wire.remoteAddress) {                                                                      // [L]
        debug('ignoring port from peer with no address')                                              // [L]
        return                                                                                        // [L]
      }                                                                                               // [L]
      debug('port: %s (from %s)', port, wire.remoteAddress + ':' + wire.remotePort)                   // [L]
      self.client.dht.addNode(wire.remoteAddress + ':' + port)                                        // [L]
    })                                                                                                // [L]
                                                                                                      // [L]
    wire.port(self.client.dht.address().port)                                                         // [L]
  }                                                                                                   // [L]
                                                                                                      // [L]
  wire.on('timeout', function () {                                                                    // [L]
    debug('wire timeout (%s)', addr)                                                                  // [L]
    // TODO: this might be destroying wires too eagerly                                               // [L]
    wire.destroy()                                                                                    // [L]
  })                                                                                                  // [L]
                                                                                                      // [L]
  // Timeout for piece requests to this peer                                                          // [L]
  wire.setTimeout(self.pieceTimeout, true)                                                            // [L]
                                                                                                      // [L]
  // Send KEEP-ALIVE (every 60s) so peers will not disconnect the wire                                // [L]
  wire.setKeepAlive(true)                                                                             // [L]
                                                                                                      // [L]
  // use ut_metadata extension
  wire.use(ut_metadata(self.metadata))

  if (!self.metadata) {
    wire.ut_metadata.on('metadata', function (metadata) {
      debug('got metadata via ut_metadata')
      self._onMetadata(metadata)
    })
    wire.ut_metadata.fetch()
  }

  // use ut_pex extension
  if (typeof ut_pex === 'function') {
    wire.use(ut_pex())

    // wire.ut_pex.start() // TODO two-way communication
    wire.ut_pex.on('peer', function (peer) {
      debug('ut_pex: got peer: %s (from %s)', peer, addr)
      self.addPeer(peer)
    })

    wire.ut_pex.on('dropped', function (peer) {
      // the remote peer believes a given peer has been dropped from the swarm.
      // if we're not currently connected to it, then remove it from the swarm's queue.
      debug('ut_pex: dropped peer: %s (from %s)', peer, addr)
      var peerObj = self.swarm._peers[peer]
      if (!peerObj || !peerObj.conn) self.swarm.removePeer(peer)
    })
  }

  // Hook to allow user-defined `bittorrent-protocol extensions                                       // [L]
  // More info: https://github.com/feross/bittorrent-protocol#extension-api                           // [L]
  self.emit('wire', wire)                                                                             // [L]

  if (self.metadata) {
    self._onWireWithMetadata(wire)
  }
}

Torrent.prototype._onWireWithMetadata = function (wire) {
  var self = this
  var timeoutId = null
  var timeoutMs = self.chokeTimeout

  function onChokeTimeout () {
    if (self.destroyed || wire.destroyed) return

    if (self.swarm.numQueued > 2 * (self.swarm.numConns - self.swarm.numPeers) &&
      wire.amInterested) {
      wire.destroy()
    } else {
      timeoutId = setTimeout(onChokeTimeout, timeoutMs)
      if (timeoutId.unref) timeoutId.unref()
    }
  }

  var i = 0
  function updateSeedStatus () {
    if (wire.peerPieces.length !== self.storage.pieces.length) return
    for (; i < self.storage.pieces.length; ++i) {
      if (!wire.peerPieces.get(i)) return
    }
    wire.isSeeder = true
    wire.choke() // always choke seeders
  }

  wire.on('bitfield', function () {
    updateSeedStatus()
    self._update()
  })

  wire.on('have', function () {
    updateSeedStatus()
    self._update()
  })

  wire.once('interested', function () {
    wire.unchoke()
  })

  wire.on('close', function () {
    clearTimeout(timeoutId)
  })

  wire.on('choke', function () {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(onChokeTimeout, timeoutMs)
    if (timeoutId.unref) timeoutId.unref()
  })

  wire.on('unchoke', function () {
    clearTimeout(timeoutId)
    self._update()
  })

  wire.on('request', function (index, offset, length, cb) {
    // Disconnect from peers that request more than 128KB, per spec
    if (length > MAX_BLOCK_LENGTH) {
      debug(
        'got invalid block size request %s (from %s)',
        length, wire.remoteAddress + ':' + wire.remotePort
      )
      return wire.destroy()
    }

    self.storage.readBlock(index, offset, length, cb)
  })

  wire.bitfield(self.storage.bitfield) // always send bitfield (required)
  wire.interested() // always start out interested

  timeoutId = setTimeout(onChokeTimeout, timeoutMs)
  if (timeoutId.unref) timeoutId.unref()

  wire.isSeeder = false
  updateSeedStatus()
}

/**
 * Called when the metadata, swarm, and underlying storage are all fully initialized.
 */
Torrent.prototype._onStorage = function () {
  var self = this
  if (self.destroyed) return
  debug('on storage')

  // allow writes to storage only after initial piece verification is finished
  self.storage.readonly = false

  // start off selecting the entire torrent with low priority
  self.select(0, self.storage.pieces.length - 1, false)

  self._rechokeIntervalId = setInterval(self._rechoke.bind(self), RECHOKE_INTERVAL)
  if (self._rechokeIntervalId.unref) self._rechokeIntervalId.unref()

  process.nextTick(function () {
    self.ready = true
    self.emit('ready')
  })
}

/**
 * When a piece is fully downloaded, notify all peers with a HAVE message.
 * @param {Piece} piece
 */
Torrent.prototype._onStoragePiece = function (piece) {
  var self = this
  debug('piece done %s', piece.index)
  self._reservations[piece.index] = null

  self.swarm.wires.forEach(function (wire) {
    wire.have(piece.index)
  })

  self._gcSelections()
}

/**
 * Called on selection changes.
 */
Torrent.prototype._updateSelections = function () {
  var self = this
  if (!self.swarm || self.destroyed) return
  if (!self.metadata) return self.once('metadata', self._updateSelections.bind(self))

  process.nextTick(self._gcSelections.bind(self))
  self._updateInterest()
  self._update()
}

/**
 * Garbage collect selections with respect to the storage's current state.
 */
Torrent.prototype._gcSelections = function () {
  var self = this

  for (var i = 0; i < self._selections.length; i++) {
    var s = self._selections[i]
    var oldOffset = s.offset

    // check for newly downloaded pieces in selection
    while (self.storage.bitfield.get(s.from + s.offset) && s.from + s.offset < s.to) {
      s.offset++
    }

    if (oldOffset !== s.offset) s.notify()
    if (s.to !== s.from + s.offset) continue
    if (!self.storage.bitfield.get(s.from + s.offset)) continue

    // remove fully downloaded selection
    self._selections.splice(i--, 1) // decrement i to offset splice
    s.notify() // TODO: this may notify twice in a row. is this a problem?
    self._updateInterest()
  }

  if (!self._selections.length) self.emit('idle')
}

/**
 * Update interested status for all peers.
 */
Torrent.prototype._updateInterest = function () {
  var self = this

  var prev = self._amInterested
  self._amInterested = !!self._selections.length

  self.swarm.wires.forEach(function (wire) {
    // TODO: only call wire.interested if the wire has at least one piece we need
    if (self._amInterested) wire.interested()
    else wire.uninterested()
  })

  if (prev === self._amInterested) return
  if (self._amInterested) self.emit('interested')
  else self.emit('uninterested')
}

/**
 * Heartbeat to update all peers and their requests.
 */
Torrent.prototype._update = function () {
  var self = this
  if (self.destroyed) return

  // update wires in random order for better request distribution
  randomizedForEach(self.swarm.wires, self._updateWire.bind(self))
}

/**
 * Attempts to update a peer's requests
 */
Torrent.prototype._updateWire = function (wire) {
  var self = this

  if (wire.peerChoking) return
  if (!wire.downloaded) return validateWire()

  var minOutstandingRequests = getPipelineLength(wire, PIPELINE_MIN_DURATION)
  if (wire.requests.length >= minOutstandingRequests) return
  var maxOutstandingRequests = getPipelineLength(wire, PIPELINE_MAX_DURATION)

  trySelectWire(false) || trySelectWire(true)

  function genPieceFilterFunc (start, end, tried, rank) {
    return function (i) {
      return i >= start && i <= end && !(i in tried) && wire.peerPieces.get(i) && (!rank || rank(i))
    }
  }

  // TODO: Do we need both validateWire and trySelectWire?
  function validateWire () {
    if (wire.requests.length) return

    for (var i = self._selections.length; i--;) {
      var next = self._selections[i]

      var piece
      if (self.strategy === 'rarest') {
        var start = next.from + next.offset
        var end = next.to
        var len = end - start + 1
        var tried = {}
        var tries = 0
        var filter = genPieceFilterFunc(start, end, tried)

        while (tries < len) {
          piece = self.rarityMap.getRarestPiece(filter)
          if (piece < 0) break
          if (self._request(wire, piece, false)) return
          tried[piece] = true
          tries += 1
        }
      } else {
        for (piece = next.to; piece >= next.from + next.offset; --piece) {
          if (!wire.peerPieces.get(piece)) continue
          if (self._request(wire, piece, false)) return
        }
      }
    }

    // TODO: wire failed to validate as useful; should we close it?
  }

  function speedRanker () {
    var speed = wire.downloadSpeed() || 1
    if (speed > SPEED_THRESHOLD) return function () { return true }

    var secs = Math.max(1, wire.requests.length) * Storage.BLOCK_LENGTH / speed
    var tries = 10
    var ptr = 0

    return function (index) {
      if (!tries || self.storage.bitfield.get(index)) return true

      var piece = self.storage.pieces[index]
      var missing = piece.blocks.length - piece.blocksWritten

      for (; ptr < self.swarm.wires.length; ptr++) {
        var otherWire = self.swarm.wires[ptr]
        var otherSpeed = otherWire.downloadSpeed()

        if (otherSpeed < SPEED_THRESHOLD) continue
        if (otherSpeed <= speed) continue
        if (!otherWire.peerPieces.get(index)) continue
        if ((missing -= otherSpeed * secs) > 0) continue

        tries--
        return false
      }

      return true
    }
  }

  function shufflePriority (i) {
    var last = i
    for (var j = i; j < self._selections.length && self._selections[j].priority; j++) {
      last = j
    }
    var tmp = self._selections[i]
    self._selections[i] = self._selections[last]
    self._selections[last] = tmp
  }

  function trySelectWire (hotswap) {
    if (wire.requests.length >= maxOutstandingRequests) return true
    var rank = speedRanker()

    for (var i = 0; i < self._selections.length; i++) {
      var next = self._selections[i]

      var piece
      if (self.strategy === 'rarest') {
        var start = next.from + next.offset
        var end = next.to
        var len = end - start + 1
        var tried = {}
        var tries = 0
        var filter = genPieceFilterFunc(start, end, tried, rank)

        while (tries < len) {
          piece = self.rarityMap.getRarestPiece(filter)
          if (piece < 0) break

          // request all non-reserved blocks in this piece
          while (self._request(wire, piece, self._critical[piece] || hotswap)) {}

          if (wire.requests.length < maxOutstandingRequests) {
            tried[piece] = true
            tries++
            continue
          }

          if (next.priority) shufflePriority(i)
          return true
        }
      } else {
        for (piece = next.from + next.offset; piece <= next.to; piece++) {
          if (!wire.peerPieces.get(piece) || !rank(piece)) continue

          // request all non-reserved blocks in piece
          while (self._request(wire, piece, self._critical[piece] || hotswap)) {}

          if (wire.requests.length < maxOutstandingRequests) continue

          if (next.priority) shufflePriority(i)
          return true
        }
      }
    }

    return false
  }
}

/**
 * Called periodically to update the choked status of all peers, handling optimistic
 * unchoking as described in BEP3.
 */
Torrent.prototype._rechoke = function () {
  var self = this

  if (self._rechokeOptimisticTime > 0) self._rechokeOptimisticTime -= 1
  else self._rechokeOptimisticWire = null

  var peers = []

  self.swarm.wires.forEach(function (wire) {
    if (!wire.isSeeder && wire !== self._rechokeOptimisticWire) {
      peers.push({
        wire: wire,
        downloadSpeed: wire.downloadSpeed(),
        uploadSpeed: wire.uploadSpeed(),
        salt: Math.random(),
        isChoked: true
      })
    }
  })

  peers.sort(rechokeSort)

  var unchokeInterested = 0
  var i = 0
  for (; i < peers.length && unchokeInterested < self._rechokeNumSlots; ++i) {
    peers[i].isChoked = false
    if (peers[i].wire.peerInterested) unchokeInterested += 1
  }

  // Optimistically unchoke a peer
  if (!self._rechokeOptimisticWire && i < peers.length && self._rechokeNumSlots) {
    var candidates = peers.slice(i).filter(function (peer) { return peer.wire.peerInterested })
    var optimistic = candidates[randomInt(candidates.length)]

    if (optimistic) {
      optimistic.isChoked = false
      self._rechokeOptimisticWire = optimistic.wire
      self._rechokeOptimisticTime = RECHOKE_OPTIMISTIC_DURATION
    }
  }

  // Unchoke best peers
  peers.forEach(function (peer) {
    if (peer.wire.amChoking !== peer.isChoked) {
      if (peer.isChoked) peer.wire.choke()
      else peer.wire.unchoke()
    }
  })

  function rechokeSort (peerA, peerB) {
    // Prefer higher download speed
    if (peerA.downloadSpeed !== peerB.downloadSpeed) {
      return peerB.downloadSpeed - peerA.downloadSpeed
    }

    // Prefer higher upload speed
    if (peerA.uploadSpeed !== peerB.uploadSpeed) {
      return peerB.uploadSpeed - peerA.uploadSpeed
    }

    // Prefer unchoked
    if (peerA.wire.amChoking !== peerB.wire.amChoking) {
      return peerA.wire.amChoking ? 1 : -1
    }

    // Random order
    return peerA.salt - peerB.salt
  }
}

/**
 * Attempts to cancel a slow block request from another wire such that the
 * given wire may effectively swap out the request for one of its own.
 */
Torrent.prototype._hotswap = function (wire, index) {
  var self = this
  if (!self.hotswapEnabled) return false

  var speed = wire.downloadSpeed()
  if (speed < Storage.BLOCK_LENGTH) return false
  if (!self._reservations[index]) return false

  var r = self._reservations[index]
  if (!r) {
    return false
  }

  var minSpeed = Infinity
  var minWire

  var i
  for (i = 0; i < r.length; i++) {
    var otherWire = r[i]
    if (!otherWire || otherWire === wire) continue

    var otherSpeed = otherWire.downloadSpeed()
    if (otherSpeed >= SPEED_THRESHOLD) continue
    if (2 * otherSpeed > speed || otherSpeed > minSpeed) continue

    minWire = otherWire
    minSpeed = otherSpeed
  }

  if (!minWire) return false

  for (i = 0; i < r.length; i++) {
    if (r[i] === minWire) r[i] = null
  }

  for (i = 0; i < minWire.requests.length; i++) {
    var req = minWire.requests[i]
    if (req.piece !== index) continue

    self.storage.cancelBlock(index, req.offset)
  }

  self.emit('hotswap', minWire, wire, index)
  return true
}

/**
 * Attempts to request a block from the given wire.
 */
Torrent.prototype._request = function (wire, index, hotswap) {
  var self = this
  var numRequests = wire.requests.length

  if (self.storage.bitfield.get(index)) return false
  var maxOutstandingRequests = getPipelineLength(wire, PIPELINE_MAX_DURATION)
  if (numRequests >= maxOutstandingRequests) return false

  var endGame = (wire.requests.length === 0 && self.storage.numMissing < 30)
  var block = self.storage.reserveBlock(index, endGame)

  if (!block && !endGame && hotswap && self._hotswap(wire, index)) {
    block = self.storage.reserveBlock(index, false)
  }
  if (!block) return false

  var r = self._reservations[index]
  if (!r) {
    r = self._reservations[index] = []
  }
  var i = r.indexOf(null)
  if (i === -1) i = r.length
  r[i] = wire

  function gotPiece (err, buffer) {
    if (!self.ready) {
      self.once('ready', function () {
        gotPiece(err, buffer)
      })
      return
    }

    if (r[i] === wire) r[i] = null

    if (err) {
      debug(
        'error getting piece %s (offset: %s length: %s) from %s: %s',
        index, block.offset, block.length, wire.remoteAddress + ':' + wire.remotePort,
        err.message
      )
      self.storage.cancelBlock(index, block.offset)
      process.nextTick(self._update.bind(self))
      return false
    } else {
      debug(
        'got piece %s (offset: %s length: %s) from %s',
        index, block.offset, block.length, wire.remoteAddress + ':' + wire.remotePort
      )
      self.storage.writeBlock(index, block.offset, buffer, function (err) {
        if (err) {
          debug('error writing block')
          self.storage.cancelBlock(index, block.offset)
        }

        process.nextTick(self._update.bind(self))
      })
    }
  }

  wire.request(index, block.offset, block.length, gotPiece)

  return true
}

Torrent.prototype.createServer = function (opts) {
  var self = this
  if (typeof Server === 'function' /* browser exclude */) {
    return new Server(self, opts)
  }
}

Torrent.prototype._onError = function (err) {
  var self = this
  debug('torrent error: %s', err.message || err)
  self.emit('error', err)
  self.destroy()
}

function getPipelineLength (wire, duration) {
  return Math.ceil(2 + duration * wire.downloadSpeed() / Storage.BLOCK_LENGTH)
}

/**
 * Returns a random integer in [0,high)
 */
function randomInt (high) {
  return Math.random() * high | 0
}

/**
 * TODO: use random-iterate module for this
 * Iterates through the given array in a random order, calling the given
 * callback for each element.
 */
function randomizedForEach (array, cb) {
  var indices = array.map(function (value, index) { return index })

  for (var i = indices.length - 1; i > 0; --i) {
    var j = randomInt(i + 1)
    var tmp = indices[i]
    indices[i] = indices[j]
    indices[j] = tmp
  }

  indices.forEach(function (index) {
    cb(array[index], index, array)
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Legenda (merge_anotado.js; a numeração das linhas é a mesma do merge.js e do README):
//   [L] / [R]   linha alterada por aquele lado        [L=R]  igual nos dois lados (o mapa conta como L)
//   ◀ #n        papel da linha no conflito n do README.md; "herdou" = a linha não foi alterada por aquele
//               lado e pegou a branch da chamada indicada (regra interprocedural da análise)
