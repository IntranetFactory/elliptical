import _ from 'lodash'
import {handleString} from '../input-option'
import {Phrase} from 'lacona-phrase'

export default class Value extends Phrase {
  static getDefaultProps() {
    return {
      join: false,
      fuzzy: 'all'
    }
  }

  *_handleParse(input, options) {
    // if this has a category use that, else the last category on the stack
    let category = this.props.category
    if (_.isUndefined(category)) {
      const stackEntry = _.findLast(input.stack, entry => !_.isUndefined(entry.category))
      category = stackEntry ? stackEntry.category : null
    }

    const handleStringOptions = {
      join: this.props.join,
      fuzzy: this.props.fuzzy,
      category: category
    }

    let successes = 0

    for (let suggestion of this.props.compute(input.text)) {
      let success = false

      const newInput = handleString(input, suggestion.text, handleStringOptions)
      if (newInput !== null) {
        yield _.assign({}, newInput, {
          result: suggestion.value,
          callbacks: newInput.callbacks.concat(() => success = true)
        })
      }

      if (success) successes++
      if (this.props.limit && this.props.limit <= successes) break
    }
  }
}