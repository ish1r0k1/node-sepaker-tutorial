const fs = require('fs')
const lame = require('lame')
const Speaker = require('speaker')
const volume = require('pcm-volume')

const SAMPLE_RATE = 44100
const BIT_DEPTH = 16
const CHANNELS = 2
const BIT_RATE = 128

const STATE = {
  playing: 0,
  paused: 1,
  stopped: 2
}

let currentState = STATE.stopped

const file = process.env.FILE_PATH

if (!file | !/\.mp3$/.test(file)) return

const readable = fs.createReadStream(file)

const decoder = new lame.Decoder({
  // input
  sampleRate: SAMPLE_RATE,
  bitDepth: BIT_DEPTH,
  channels: CHANNELS,

  // output
  bitRate: BIT_RATE,
  outSampleRate: SAMPLE_RATE * CHANNELS,
  mode: lame.STEREO
})

const speaker = new Speaker()
const v = new volume()

const play = () => {
  if (currentState == STATE.playing) {
    return this.stop()
  }

  if (currentState == STATE.paused) {
    return this.resume()
  }

  currentState = STATE.playing

  readable.pipe(decoder).pipe(v).pipe(speaker)

  decoder.on('end', () => console.log('END'))
  decoder.on('finish', () => console.log('FINISH'))
}

const pause = () => {
  if (currentState === STATE.playing) {
    decoder.unpipe()
    currentState = STATE.paused
  }
}

const resume = () => {
  if (currentState === STATE.paused) {
    decoder.pipe(v)
    currentState = STATE.playing
  }
}

const stop = () => {
  if (currentState !== STATE.stopped) {
    decoder.unpipe()
    decoder.end()
    stream = null
    currentState = STATE.stopped
  }
}

const setVolume = vol => {
  v.setVolume(vol)
}

play()
