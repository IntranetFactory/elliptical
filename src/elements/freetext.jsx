/** @jsx createElement */
import {Phrase, createElement} from 'lacona-phrase'
import split from 'smart-split'

function * substrings (input, {splitOn, noSplit}) {
  if (noSplit) {
    yield input
    return
  }

  let inputs = split(input, splitOn)
  for (let i = 0; i < inputs.length; i += 2) {
    yield inputs.slice(0, i + 1).join('')
  }
}

export class Freetext extends Phrase {
  static defaultProps = {
    filter () {
      return true
    },
    splitOn: '',
    consumeAll: false
  };

  * filter (input) {
    for (let stringPart of substrings(input, {splitOn: this.props.splitOn, noSplit: this.props.consumeAll})) {
      if (this.props.filter(stringPart)) {
        yield {
          words: [{text: stringPart, input: true}],
          result: stringPart,
          remaining: input.substring(stringPart.length),
          score: 0.1 + (1 / (stringPart.length + 2))
        }
      }
    }
  }

  describe () {
    return <raw function={this.filter.bind(this)} limit={this.props.limit} />
  }
}
