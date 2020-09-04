import { Lightning } from 'wpe-lightning-sdk'
import Config from './config.js'
import * as player from '@/services/player/'
import { channelsServiceInit, getCurrentProgram, getChannel } from '@/services/ChannelsService'
import { ChannelNumber } from './channelnumber.js'
import theme from '@/themes/default'

export default class NumberInput extends Lightning.Component {

  static _template() {
    return {}
  }

  _construct() {
    this.timer = null
  }

  _init() {
    this.patch({
      InputBox: {
        rect: true,
        x: Config.POPUP_X,
        y: Config.POPUP_Y,
        w: Config.POPUP_WIDTH,
        h: Config.POPUP_HEIGHT,
        color: theme.colors.accent,
        Ch: {
          x: Config.NUM_TXT_X,
          y: Config.NUM_TXT_Y,
          text: { text: '', fontSize: Config.DEFAULT_FONT_SIZE ,textColor: theme.colors.white}
        }
      }
    })
  }

  async tune(entry) {
    await player.playQAM(entry)
  }

  getNumberInputX(Str) {
    return (Config.POPUP_WIDTH / 2) - (Config.FONT_METRICS_WIDTH * Str.length)
  }

  putNumber(value) {
    if (ChannelNumber.displayNumber.length > 1) {
      return
    }

    ChannelNumber.displayNumber = ChannelNumber.displayNumber + '' + value;
    this.tag('InputBox').childList._refs.Ch.text = ChannelNumber.displayNumber
    this.tag('InputBox').childList._refs.Ch.x = this.getNumberInputX(ChannelNumber.displayNumber)
    function timerevt(ref) {
      let channelNum = Number(ChannelNumber.displayNumber) - 1
      if (channelNum >= 0) {
        ChannelNumber.currentIndex = channelNum
        if (channelNum <= 20) {
          let t = getChannel(channelNum);
          ref.tune(t);
        }
      }
      ref.alpha = 0;
      ref.tag('InputBox').childList._refs.Ch.text = ''
      ChannelNumber.displayNumber = ''
      ref.signal('select', { item: "" })

    }

    if (this.timer) {
      clearTimeout(this.timer)
    }
    this.timer = setTimeout(timerevt, Config.DISPLAY_TIME, this)
  }


  _handleBack() {
    if (this.timer) {
      clearTimeout(this.timer)
    }
    this.signal('select', { item: { label: 'NumberInput', evt: this.argument.evt } })
  }
}
